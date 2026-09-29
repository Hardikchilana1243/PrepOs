// ============================================================================
// PREPOS REQUEST-LEVEL MEMOIZATION CACHE
// Request-Scoped Deduplication for Next.js Server Components & Node Contexts
// ============================================================================

import * as React from 'react';

type AnyAsyncFunction = (...args: any[]) => Promise<any>;

/**
 * Creates a request-scoped memoized function.
 * - In Next.js Server Components: Delegates to React.cache for official per-request lifecycle.
 * - In Standalone Node.js (scripts, tests): Uses lightweight short-lived Promise deduplication
 *   that automatically evicts after the event loop tick to prevent memory leaks or cross-user bleed.
 */
export function requestCache<T extends AnyAsyncFunction>(fn: T): T {
  // If native React.cache is available in the environment (Next.js react-server layer)
  if (typeof (React as any).cache === 'function') {
    return (React as any).cache(fn);
  }

  // Fallback for standalone scripts, verification suites, and non-server-component contexts
  const store = new Map<string, Promise<any>>();

  const memoized = ((...args: any[]) => {
    let key: string;
    try {
      key = JSON.stringify(args);
    } catch {
      key = String(args[0]);
    }

    if (!store.has(key)) {
      const promise = Promise.resolve(fn(...args)).finally(() => {
        // Automatically evict key shortly after resolution to guarantee request isolation
        setTimeout(() => store.delete(key), 50);
      });
      store.set(key, promise);
    }

    return store.get(key);
  }) as T;

  return memoized;
}
