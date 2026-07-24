/**
 * Cache Utility
 * In-memory cache with TTL support
 */

import type { Session, Model, Provider, OpenCodeConfig } from '../network/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 300000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton instances
export const apiCache = new CacheManager(50);
export const imageCache = new CacheManager(100);

// Cache keys
export const CACHE_KEYS = {
  SESSIONS: 'sessions',
  MODELS: 'models',
  PROVIDERS: 'providers',
  CONFIG: 'config',
  HEALTH: 'health',
} as const;

// Helper functions
export function getCachedSessions() {
  return apiCache.get(CACHE_KEYS.SESSIONS) as Session[] | null;
}

export function setCachedSessions(sessions: Session[]) {
  apiCache.set(CACHE_KEYS.SESSIONS, sessions, 60000); // 1 minute
}

export function getCachedModels() {
  return apiCache.get(CACHE_KEYS.MODELS) as Model[] | null;
}

export function setCachedModels(models: Model[]) {
  apiCache.set(CACHE_KEYS.MODELS, models, 300000); // 5 minutes
}

export function getCachedProviders() {
  return apiCache.get(CACHE_KEYS.PROVIDERS) as Provider[] | null;
}

export function setCachedProviders(providers: Provider[]) {
  apiCache.set(CACHE_KEYS.PROVIDERS, providers, 300000); // 5 minutes
}

export function getCachedConfig() {
  return apiCache.get(CACHE_KEYS.CONFIG) as OpenCodeConfig | null;
}

export function setCachedConfig(config: OpenCodeConfig) {
  apiCache.set(CACHE_KEYS.CONFIG, config, 60000); // 1 minute
}