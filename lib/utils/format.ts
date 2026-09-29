// ============================================================================
// PREPOS SHARED FORMATTING UTILITIES
// Standardized Labels, Difficulty & Language Helpers
// ============================================================================

export type SupportedLanguage = 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  CPP: 'C++ (GCC 13)',
  JAVA: 'Java (OpenJDK 17)',
  PYTHON: 'Python (3.11)',
  JAVASCRIPT: 'JavaScript (Node 20)',
};

export const LANGUAGE_MONACO_MODES: Record<SupportedLanguage, string> = {
  CPP: 'cpp',
  JAVA: 'java',
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
};

export function formatLanguageLabel(lang: string): string {
  const upper = lang.toUpperCase() as SupportedLanguage;
  return LANGUAGE_LABELS[upper] || lang;
}

export function formatLanguageMonacoMode(lang: string): string {
  const upper = lang.toUpperCase() as SupportedLanguage;
  return LANGUAGE_MONACO_MODES[upper] || 'plaintext';
}

export function formatDifficulty(difficulty: string): {
  label: string;
  badgeClass: string;
} {
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return {
        label: 'Easy',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'MEDIUM':
      return {
        label: 'Medium',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'HARD':
      return {
        label: 'Hard',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    default:
      return {
        label: difficulty,
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
}

/**
 * Safely computes percentage, clamped between 0 and 100.
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}
