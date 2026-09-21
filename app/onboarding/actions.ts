'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { calculatePRS } from '@/lib/services/readiness-score';
import { getOrCreateDailyMissions } from '@/lib/services/daily-mission';

export type SupportedLanguage = 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT';

export interface OnboardingPayload {
  gradYear: number;
  targetDegree: string;
  targetRoleTier: string;
  preferredLang: SupportedLanguage;
  diagnosticAnswers?: Record<string, string>;
}

export interface OnboardingResult {
  success: boolean;
  error?: string;
}

export async function completeOnboardingAction(payload: OnboardingPayload): Promise<OnboardingResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in to continue.' };
  }

  // Validate graduation year
  if (!payload.gradYear || payload.gradYear < 2023 || payload.gradYear > 2032) {
    return { success: false, error: 'Please select a valid graduation year (2023 - 2032).' };
  }

  // Validate target degree
  if (!payload.targetDegree || !payload.targetDegree.trim()) {
    return { success: false, error: 'Target degree is required.' };
  }

  // Validate target role tier
  const validTiers = ['PRODUCT_TIER_1', 'TECH_TIER_2', 'SERVICE_TIER_3'];
  if (!validTiers.includes(payload.targetRoleTier)) {
    return { success: false, error: 'Please select a valid target company tier.' };
  }

  // Validate preferred language enum
  const validLanguages: SupportedLanguage[] = ['CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT'];
  if (!validLanguages.includes(payload.preferredLang)) {
    return { success: false, error: 'Please select a valid preferred coding language.' };
  }

  try {
    // 1. Persist Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        gradYear: payload.gradYear,
        targetDegree: payload.targetDegree.trim(),
        targetRoleTier: payload.targetRoleTier,
        preferredLang: payload.preferredLang,
        lastActiveAt: new Date(),
      },
      create: {
        userId: user.id,
        gradYear: payload.gradYear,
        targetDegree: payload.targetDegree.trim(),
        targetRoleTier: payload.targetRoleTier,
        preferredLang: payload.preferredLang,
        streakDays: 1,
      },
    });

    // 2. Initialize PRS v1 score and history
    await calculatePRS(user.id);

    // 3. Pre-generate today's mission set
    await getOrCreateDailyMissions(user.id);

    return { success: true };
  } catch (err) {
    console.error('Failed to complete onboarding:', err);
    return { success: false, error: 'Failed to save your profile. Please try again.' };
  }
}
