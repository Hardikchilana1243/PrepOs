// ============================================================================
// PREPOS SHARED DATE UTILITIES
// Standardized UTC Normalization & Date Formatting
// ============================================================================

/**
 * Normalizes any Date (or default now) to midnight UTC (00:00:00.000).
 * Guarantees idempotent calendar-day groupings across timezones.
 */
export function normalizeUtcMidnight(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Formats a Date or ISO string into a human-readable placement timestamp.
 * e.g. "Oct 14, 02:30 PM"
 */
export function formatDisplayDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a duration in seconds to a human-readable "MM:SS" or "Xm Ys".
 */
export function formatDurationSec(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
