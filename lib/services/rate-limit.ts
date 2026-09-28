// ============================================================================
// PREPOS IN-MEMORY RATE LIMITER
// Protects code execution and submission endpoints from rapid-fire abuse
// ============================================================================

interface RateLimitRecord {
  lastAttempt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks if an action is allowed for a user.
 * @param key Unique key, e.g. `${userId}:${action}`
 * @param minIntervalMs Minimum milliseconds between requests (default: 2000ms)
 * @returns { allowed: boolean, waitSeconds?: number }
 */
export function checkRateLimit(
  key: string,
  minIntervalMs: number = 2000
): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (record) {
    const elapsed = now - record.lastAttempt;
    if (elapsed < minIntervalMs) {
      const remainingMs = minIntervalMs - elapsed;
      return {
        allowed: false,
        waitSeconds: Math.ceil(remainingMs / 1000),
      };
    }
  }

  // Update timestamp
  rateLimitStore.set(key, { lastAttempt: now });

  // Periodic cleanup if store grows large
  if (rateLimitStore.size > 5000) {
    const cutoff = now - 60000;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.lastAttempt < cutoff) {
        rateLimitStore.delete(k);
      }
    }
  }

  return { allowed: true };
}

/**
 * Resets rate limit records (primarily for testing or administrative resets).
 */
export function resetRateLimits() {
  rateLimitStore.clear();
}
