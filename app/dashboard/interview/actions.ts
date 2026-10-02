'use server';

// ============================================================================
// PREPOS INTERVIEW PRACTICE SERVER ACTIONS
// Scoped to Authenticated Candidate & Authoritative Revalidations
// ============================================================================

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { toggleProblemBookmark } from '@/lib/services/revision';
import { addProblemToRevisionQueue } from '@/lib/services/interview';

export async function toggleInterviewBookmarkAction(problemId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await toggleProblemBookmark(user.id, problemId);
  revalidatePath('/dashboard/interview');
  revalidatePath('/dashboard/revision');
  revalidatePath('/dashboard/dsa');

  return result;
}

export async function recordInterviewSessionAction(
  problemId: string,
  durationSec: number,
  notes?: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true, title: true, slug: true },
  });

  if (!problem) {
    throw new Error('Problem not found');
  }

  await prisma.progressEvent.create({
    data: {
      userId: user.id,
      eventType: 'INTERVIEW_PRACTICE_COMPLETED',
      metadata: JSON.stringify({
        problemId: problem.id,
        problemTitle: problem.title,
        problemSlug: problem.slug,
        durationSec,
        notes: notes ? notes.slice(0, 1000) : undefined,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/dashboard/interview');
  revalidatePath('/dashboard/readiness');

  return { success: true };
}

export async function addMistakeToRevisionAction(problemId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await addProblemToRevisionQueue(user.id, problemId);

  revalidatePath('/dashboard/interview');
  revalidatePath('/dashboard/revision');

  return { success: true };
}
