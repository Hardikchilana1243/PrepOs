'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { toggleMissionCompletion } from '@/lib/services/daily-mission';
import {
  recordProblemSolved,
  submitQuizAttempt,
  recordRevisionReview,
  QuizSubmissionResult,
} from '@/lib/services/progress';

export async function toggleMissionAction(missionId: string, isCompleted: boolean) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await toggleMissionCompletion(user.id, missionId, isCompleted);
  revalidatePath('/dashboard');
}

export async function solveProblemAction(problemId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updatedPRS = await recordProblemSolved(user.id, problemId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/dsa');
  revalidatePath('/dashboard/revision');

  return { success: true, updatedPRS };
}

export async function submitQuizAction(
  quizId: string,
  selectedOptions: Record<string, string>,
  durationSec: number = 60
): Promise<QuizSubmissionResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await submitQuizAttempt(user.id, quizId, selectedOptions, durationSec);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/core-cs');

  return result;
}

export async function recordRevisionReviewAction(
  revisionId: string,
  confidence: 'HARD' | 'GOOD' | 'EASY'
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await recordRevisionReview(user.id, revisionId, confidence);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revision');

  return result;
}

export async function updateProfileAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const gradYear = parseInt(formData.get('gradYear')?.toString() || '2025', 10);
  const targetDegree = formData.get('targetDegree')?.toString() || 'B.Tech / B.E. (Computer Science)';
  const targetRoleTier = formData.get('targetRoleTier')?.toString() || 'TIER_1_PRODUCT';
  const preferredLang = formData.get('preferredLang')?.toString() || 'C++';

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      gradYear,
      targetDegree,
      targetRoleTier,
      preferredLang,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');

  return { success: true };
}
