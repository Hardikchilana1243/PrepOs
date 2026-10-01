'use server';

// ============================================================================
// PREPOS REVISION SERVER ACTIONS
// Authenticated actions for SM-2 review logging, bookmarking, and queue updates
// ============================================================================

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import { recordRevisionReview, toggleProblemBookmark } from '@/lib/services/revision';

export async function recordRevisionReviewAction(
  revisionId: string,
  confidence: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await recordRevisionReview(user.id, revisionId, confidence);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revision');
  revalidatePath('/dashboard/profile');

  return result;
}

export async function toggleRevisionBookmarkAction(problemId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await toggleProblemBookmark(user.id, problemId);
  revalidatePath('/dashboard/revision');
  revalidatePath('/dashboard/dsa');

  return result;
}
