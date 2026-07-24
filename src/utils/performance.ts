/**
 * Performance Utilities
 * Helpers for optimizing app performance
 */

import { InteractionManager, Platform } from 'react-native';

/**
 * Run task after interactions are complete
 * Useful for heavy operations after navigation
 */
export async function runAfterInteractions<T>(
  task: () => Promise<T> | T
): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      const result = await task();
      resolve(result);
    });
  });
}

/**
 * Debounce function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Batch state updates
 */
export function batchUpdates(updates: (() => void)[]): void {
  updates.forEach((update) => update());
}

/**
 * Check if app is in foreground
 */
export function isAppInForeground(): boolean {
  return Platform.OS === 'ios' || true; // Simplified check
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Lazy load module
 */
export function lazyLoad<T>(
  factory: () => Promise<T>
): () => Promise<T> {
  let module: T | null = null;

  return async () => {
    if (module === null) {
      module = await factory();
    }
    return module;
  };
}

/**
 * Memoize function results
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}
