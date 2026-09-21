'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { calculatePRS } from '@/lib/services/readiness-score';
import { getOrCreateDailyMissions } from '@/lib/services/daily-mission';

export interface OnboardingPayload {
  gradYear: number;
  targetDegree: string;
  targetRoleTier: string;
  preferredLang: 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT';
  diagnosticAnswers?: Record<string, string>;
}

export async function completeOnboardingAction(payload: OnboardingPayload) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  // Validate fields
  if (!payload.gradYear || payload.gradYear < 2023 || payload.gradYear > 2032) {
    throw new Error('Please select a valid graduation year (2023 - 2032).');
  }
  if (!payload.targetDegree || !payload.targetRoleTier || !payload.preferredLang) {
    throw new Error('All profile fields are required.');
  }

  try {
    // 1. Persist or Update Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        gradYear: payload.gradYear,
        targetDegree: payload.targetDegree,
        targetRoleTier: payload.targetRoleTier,
        preferredLang: payload.preferredLang,
        lastActiveAt: new Date(),
      },
      create: {
        userId: user.id,
        gradYear: payload.gradYear,
        targetDegree: payload.targetDegree,
        targetRoleTier: payload.targetRoleTier,
        preferredLang: payload.preferredLang,
        streakDays: 1,
      },
    });

    // 2. Initialize PRS v1 score and history
    await calculatePRS(user.id);

    // 3. Pre-generate today's mission set
    await getOrCreateDailyMissions(user.id);
  } catch (err) {
    console.error('Failed to complete onboarding:', err);
    throw new Error('Failed to save your profile. Please try again.');
  }

  redirect('/dashboard');
}
