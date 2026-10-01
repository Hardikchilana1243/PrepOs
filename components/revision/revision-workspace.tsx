'use client';

// ============================================================================
// PREPOS REVISION WORKSPACE (BACKWARDS COMPATIBILITY WRAPPER)
// Re-exports RevisionSession and wraps old RevisionDetailItem interface
// ============================================================================

export { RevisionSession as RevisionWorkspace } from './revision-session';
export type { RevisionQueueItem as RevisionDetailItem } from '@/lib/services/revision';
