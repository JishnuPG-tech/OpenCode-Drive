/**
 * SSE Client for OpenCode
 * Handles Server-Sent Events streaming with reconnection
 */

import { storage } from '../storage/mmkv';
import { API_ENDPOINTS } from './endpoints';
import type { ServerEvent, ConnectionState } from './types';

type ConnectionStateListener = (state: ConnectionState) => void;
type EventListener = (event: ServerEvent) => void;

interface SSEClientOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  heartbeatInterval?: number;
  healthTimeout?: number;
}

export class SSEClient {
  private state: ConnectionState = 'disconnected';
  private retryCount = 0;
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;
  private heartbeatMs: number;
  private healthTimeout: number;

  private stateListeners: Set<ConnectionStateListener> = new Set();
  private eventListeners: Set<EventListener> = new Set();

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;
  private sseBuffer = '';

  private activeSessionId: string | null = null;
  private baseUrl: string = '';

  constructor(options?: SSEClientOptions) {
    this.maxRetries = options?.maxRetries ?? Infinity;
    this.baseDelay = options?.baseDelay ?? 1000;
    this.maxDelay = options?.maxDelay ?? 30000;
    this.heartbeatMs = options?.heartbeatInterval ?? 15000;
    this.healthTimeout = options?.healthTimeout ?? 5000;
  }

  // ── State Management ──

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  // ── Listeners ──

  onStateChange(listener: ConnectionStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private setState(newState: ConnectionState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateListeners.forEach((fn) => fn(newState));
  }

  private emitEvent(event: ServerEvent) {
    this.eventListeners.forEach((fn) => fn(event));
  }

  // ── Connection ──

  async connect(sessionId?: string, baseUrl?: string) {
    if (this.state === 'connected' || this.state === 'connecting') return;

    this.activeSessionId = sessionId ?? null;
    this.baseUrl = baseUrl || this.baseUrl;
    this.setState('connecting');

    try {
      await this.checkHealth();
      this.retryCount = 0;
      this.setState('connected');
      this.startHeartbeat();
      this.connectSSE();
    } catch {
      this.setState('error');
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.stopHeartbeat();
    this.stopReconnect();
    this.abortController?.abort();
    this.abortController = null;
    this.sseBuffer = '';
    this.retryCount = 0;
    this.setState('disconnected');
  }

  // ── Health Check ──

  private async checkHealth(): Promise<void> {
    const profile = storage.getActiveProfile();
    if (!profile) throw new Error('No active server profile');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.healthTimeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth headers
      switch (profile.authType) {
        case 'basic':
          headers['Authorization'] = `Basic ${btoa(profile.authValue)}`;
          break;
        case 'bearer':
          headers['Authorization'] = `Bearer ${profile.authValue}`;
          break;
        case 'apikey':
          headers['X-API-Key'] = profile.authValue;
          break;
      }

      const response = await Promise.race([
        fetch(`${this.baseUrl}${API_ENDPOINTS.HEALTH}`, {
          headers,
          signal: controller.signal,
        }),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () =>
            reject(new Error('Health check timeout'))
          );
        }),
      ]);

      clearTimeout(timeout);

      const data = await response.json();
      if (!data.healthy) {
        throw new Error('Server reports unhealthy');
      }
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  // ── Heartbeat ──

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.checkHealth();
        // If we were in error state, recover
        if (this.state === 'error') {
          this.retryCount = 0;
          this.setState('connected');
          this.connectSSE();
        }
      } catch {
        if (this.state === 'connected') {
          this.setState('error');
          this.scheduleReconnect();
        }
      }
    }, this.heartbeatMs);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ── SSE Connection ──

  private connectSSE() {
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.sseBuffer = '';

    const doConnect = async () => {
      try {
        const profile = storage.getActiveProfile();
        if (!profile) throw new Error('No active server profile');

        const headers: Record<string, string> = {
          Accept: 'text/event-stream',
        };

        // Add auth headers
        switch (profile.authType) {
          case 'basic':
            headers['Authorization'] = `Basic ${btoa(profile.authValue)}`;
            break;
          case 'bearer':
            headers['Authorization'] = `Bearer ${profile.authValue}`;
            break;
          case 'apikey':
            headers['X-API-Key'] = profile.authValue;
            break;
        }

        const sseUrl = this.activeSessionId
          ? `${this.baseUrl}${API_ENDPOINTS.SSE_SESSION(this.activeSessionId)}`
          : `${this.baseUrl}${API_ENDPOINTS.SSE_GLOBAL}`;

        const response = await fetch(sseUrl, {
          headers,
          signal: this.abortController?.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable stream');

        const decoder = new TextDecoder();

        while (true) {
          if (this.abortController?.signal.aborted) break;

          const { done, value } = await reader.read();
          if (done) break;

          this.sseBuffer += decoder.decode(value, { stream: true });
          const { events, remaining } = this.parseSSELines(this.sseBuffer);
          this.sseBuffer = remaining;

          for (const event of events) {
            this.emitEvent(event);
          }
        }

        // SSE ended normally - try reconnect
        if (this.state === 'connected') {
          this.setState('error');
          this.scheduleReconnect();
        }
      } catch (err) {
        if (
          this.abortController?.signal.aborted ||
          this.state === 'disconnected'
        ) {
          return;
        }

        console.warn('[SSEClient] SSE error:', err);
        if (this.state === 'connected') {
          this.setState('error');
          this.scheduleReconnect();
        }
      }
    };

    doConnect();
  }

  // ── SSE Parsing ──

  private parseSSELines(buffer: string): { events: ServerEvent[]; remaining: string } {
    const events: ServerEvent[] = [];
    const lines = buffer.split('\n');
    const remaining = lines.pop() || '';

    let eventType = '';
    let eventData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        eventData = line.slice(6);
      } else if (line === '') {
        if (eventType && eventData) {
          try {
            events.push(JSON.parse(eventData) as ServerEvent);
          } catch {
            // skip malformed
          }
        }
        eventType = '';
        eventData = '';
      }
    }

    return { events, remaining };
  }

  // ── Reconnect with Exponential Backoff ──

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      this.setState('disconnected');
      return;
    }

    this.setState('reconnecting');

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.retryCount),
      this.maxDelay
    );
    this.retryCount++;

    this.reconnectTimer = setTimeout(() => {
      this.connectSSE();
      // Also check health
      this.checkHealth()
        .then(() => {
          this.retryCount = 0;
          this.setState('connected');
        })
        .catch(() => {
          // Will retry again
        });
    }, delay);
  }

  private stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ── Switch Session Subscription ──

  switchSession(sessionId: string | null) {
    if (this.activeSessionId === sessionId) return;
    this.activeSessionId = sessionId;
    if (this.state === 'connected') {
      this.connectSSE();
    }
  }
}

// Singleton instance
let instance: SSEClient | null = null;

export function getSSEClient(options?: SSEClientOptions): SSEClient {
  if (!instance) {
    instance = new SSEClient(options);
  }
  return instance;
}
