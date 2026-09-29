'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { toggleMissionCompletion } from '@/lib/services/daily-mission';
import {
  recordProblemSolved,
  submitQuizAttempt,
  getQuizAttemptReview,
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

export async function getQuizAttemptReviewAction(
  attemptId: string
): Promise<QuizSubmissionResult | null> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return getQuizAttemptReview(user.id, attemptId);
}

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

export async function updateProfileAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const gradYear = parseInt(formData.get('gradYear')?.toString() || '2026', 10);
  const targetDegree = formData.get('targetDegree')?.toString()?.trim() || 'B.Tech / B.E.';
  const targetRoleTier = formData.get('targetRoleTier')?.toString() || 'PRODUCT_TIER_1';
  const rawLang = formData.get('preferredLang')?.toString() || 'CPP';

  if (isNaN(gradYear) || gradYear < 2023 || gradYear > 2032) {
    return { success: false, error: 'Please select a valid graduation year (2023 - 2032).' };
  }

  const validTiers = ['PRODUCT_TIER_1', 'TECH_TIER_2', 'SERVICE_TIER_3'];
  const sanitizedTier = validTiers.includes(targetRoleTier) ? targetRoleTier : 'PRODUCT_TIER_1';

  // Map possible UI inputs to Prisma Language enum
  let preferredLang: 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT' = 'CPP';
  if (rawLang === 'JAVA' || rawLang === 'Java') preferredLang = 'JAVA';
  else if (rawLang === 'PYTHON' || rawLang === 'Python') preferredLang = 'PYTHON';
  else if (rawLang === 'JAVASCRIPT' || rawLang === 'JavaScript') preferredLang = 'JAVASCRIPT';
  else preferredLang = 'CPP';

  try {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        gradYear,
        targetDegree,
        targetRoleTier: sanitizedTier,
        preferredLang,
        lastActiveAt: new Date(),
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');

    return { success: true };
  } catch (err) {
    console.error('Failed to update profile:', err);
    return { success: false, error: 'Failed to update profile.' };
  }
}

import {
  runProblemCode,
  submitProblemCode,
  getUserProblemSubmissions,
  SupportedLanguage,
  RunCodeResponse,
  SubmitCodeResponse,
} from '@/lib/services/code-execution';

export async function runProblemCodeAction(
  problemId: string,
  language: SupportedLanguage,
  code: string
): Promise<RunCodeResponse> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return runProblemCode(user.id, problemId, language, code);
}

export async function submitProblemCodeAction(
  problemId: string,
  language: SupportedLanguage,
  code: string
): Promise<SubmitCodeResponse> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await submitProblemCode(user.id, problemId, language, code);

  if (result.isSolved) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/dsa');
    revalidatePath('/dashboard/revision');
  }

  return result;
}

export async function toggleBookmarkAction(
  problemId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_problemId: {
        userId: user.id,
        problemId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    revalidatePath('/dashboard/dsa');
    return { success: true, isBookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: {
        userId: user.id,
        problemId,
      },
    });
    revalidatePath('/dashboard/dsa');
    return { success: true, isBookmarked: true };
  }
}

export async function getUserSubmissionsAction(problemId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return getUserProblemSubmissions(user.id, problemId);
}

