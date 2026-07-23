/**
 * Connection Hook
 * Manages SSE connection state and event handling
 */

import { useEffect, useCallback, useRef } from 'react';
import { getSSEClient } from '../network/sse-client';
import { useAppStore } from '../store';
import { storage } from '../storage/mmkv';
import type { ServerEvent, ConnectionState } from '../network/types';

export function useConnection() {
  const {
    connectionState,
    setConnectionState,
    activeSessionId,
    addMessage,
    updateMessage,
    updateMessagePart,
    updateSession,
    removeSession,
    addPendingPermission,
    addPendingQuestion,
    setStreamingMessageId,
    setStreamingContent,
    appendStreamingContent,
  } = useAppStore();

  const sseClient = useRef(getSSEClient());

  // Handle SSE events
  const handleEvent = useCallback(
    (event: ServerEvent) => {
      switch (event.type) {
        // ── Session Events ──
        case 'session.created':
          useAppStore.getState().addSession(event.properties);
          break;

        case 'session.updated':
          updateSession(event.properties.id, event.properties);
          break;

        case 'session.deleted':
          removeSession(event.properties.id);
          break;

        // ── Message Events ──
        case 'message.created':
          addMessage(event.properties.sessionID, event.properties);
          break;

        case 'message.updated':
          updateMessage(event.properties.sessionID, event.properties.id, event.properties);
          break;

        case 'message.part.updated':
          const { messageID, part, sessionID } = event.properties;
          updateMessagePart(sessionID, messageID, part);

          // Update streaming content
          if (part.type === 'text') {
            appendStreamingContent(part.text);
          }
          break;

        case 'message.part.deleted':
          // Handle part deletion if needed
          break;

        // ── Permission Events ──
        case 'permission.requested':
          addPendingPermission(event.properties);
          break;

        case 'permission.updated':
          // Handle permission update
          break;

        // ── Question Events ──
        case 'question.asked':
          addPendingQuestion(event.properties);
          break;

        case 'question.answered':
          // Handle question answered
          break;

        // ── File Events ──
        case 'file.changed':
          // Handle file change if needed
          break;

        // ── Todo Events ──
        case 'todo.updated':
          // Handle todo update if needed
          break;

        // ── Error Events ──
        case 'error':
          console.error('[SSE] Server error:', event.properties.message);
          break;

        default:
          break;
      }
    },
    [
      addMessage,
      updateMessage,
      updateMessagePart,
      updateSession,
      removeSession,
      addPendingPermission,
      addPendingQuestion,
      appendStreamingContent,
    ]
  );

  // Handle connection state changes
  const handleStateChange = useCallback(
    (state: ConnectionState) => {
      setConnectionState(state);
    },
    [setConnectionState]
  );

  // Connect to SSE
  const connect = useCallback(
    (sessionId?: string) => {
      const profile = storage.getActiveProfile();
      if (!profile) return;

      sseClient.current.onEvent(handleEvent);
      sseClient.current.onStateChange(handleStateChange);
      sseClient.current.connect(sessionId, profile.url);
    },
    [handleEvent, handleStateChange]
  );

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    sseClient.current.disconnect();
  }, []);

  // Switch session subscription
  const switchSession = useCallback(
    (sessionId: string | null) => {
      sseClient.current.switchSession(sessionId);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sseClient.current.disconnect();
    };
  }, []);

  // Auto-connect when profile changes
  useEffect(() => {
    const profile = storage.getActiveProfile();
    if (profile) {
      connect(activeSessionId || undefined);
    }
  }, [connect, activeSessionId]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    switchSession,
  };
}
