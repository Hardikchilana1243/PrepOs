// ============================================================================
// PREPOS PLACEMENT READINESS SCORE (PRS) SERVICE — V1
// Authoritative Server-Side Calculation & History Tracking
// ============================================================================

import prisma from '../db';

export interface PRSComponents {
  totalScore: number;
  dsaScore: number;
  coreCsScore: number;
  oaScore: number;
  consistencyScore: number;
  prsVersion: string;
  isBaselineOnly: boolean;
}

const TOTAL_SEEDED_PROBLEMS = 20;

/**
 * Calculates and persists the Placement Readiness Score (PRS v1) for a user.
 * Derived solely from verified database activity:
 * - DSA Component: 40% (Solved problems out of 20)
 * - Core CS Component: 30% (Average quiz attempt scores)
 * - OA Component: 15% (Company OA attempt scores, fallback to baseline if 0)
 * - Consistency Component: 15% (Profile streak days up to 14 days)
 */
export async function calculatePRS(userId: string): Promise<PRSComponents> {
  const [profile, solvedCount, quizAttempts, oaAttempts] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userProgress.count({
      where: {
        userId,
        isSolved: true,
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      select: { scorePct: true },
    }),
    prisma.oAAttempt.findMany({
      where: { userId },
      select: { score: true, totalQuestions: true },
    }),
  ]);

  // 1. DSA Component (0 - 100%)
  const dsaRatio = Math.min(1.0, solvedCount / TOTAL_SEEDED_PROBLEMS);
  const dsaScore = Math.round(dsaRatio * 100);

  // 2. Core CS Component (0 - 100%)
  let coreCsScore = 0;
  if (quizAttempts.length > 0) {
    const sumPct = quizAttempts.reduce((acc, q) => acc + q.scorePct, 0);
    coreCsScore = Math.round(sumPct / quizAttempts.length);
  }

  // 3. OA Component (0 - 100%)
  let oaScore = 0;
  if (oaAttempts.length > 0) {
    const totalPossible = oaAttempts.reduce((acc, oa) => acc + oa.totalQuestions, 0);
    const totalEarned = oaAttempts.reduce((acc, oa) => acc + oa.score, 0);
    oaScore = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  }

  // 4. Consistency Component (0 - 100%, 14 days target)
  const streakDays = profile?.streakDays ?? 0;
  const consistencyScore = Math.min(100, Math.round((streakDays / 14) * 100));

  // Determine if student is in baseline state (no official solves or quizzes yet)
  const isBaselineOnly = solvedCount === 0 && quizAttempts.length === 0 && oaAttempts.length === 0;

  let totalScore: number;
  if (isBaselineOnly) {
    // Initial established baseline score for a newly onboarded student
    totalScore = 20;
  } else {
    // Standard PRS v1 Weighted Formula:
    // DSA 40% + Core CS 30% + OA 15% + Consistency 15%
    const weighted =
      dsaScore * 0.40 +
      coreCsScore * 0.30 +
      (oaScore > 0 ? oaScore : 20) * 0.15 +
      Math.max(10, consistencyScore) * 0.15;
    totalScore = Math.min(100, Math.max(10, Math.round(weighted)));
  }

  // Persist current score in ReadinessScore table
  await prisma.readinessScore.upsert({
    where: { userId },
    update: {
      totalScore,
      dsaScore,
      coreCsScore,
      oaScore,
      updatedAt: new Date(),
    },
    create: {
      userId,
      totalScore,
      dsaScore,
      coreCsScore,
      oaScore,
    },
  });

  // Persist history entry
  await prisma.readinessScoreHistory.create({
    data: {
      userId,
      score: totalScore,
    },
  });

  return {
    totalScore,
    dsaScore,
    coreCsScore,
    oaScore,
    consistencyScore,
    prsVersion: 'v1',
    isBaselineOnly,
  };
}

/**
 * Retrieves the current ReadinessScore or calculates it if missing.
 */
export async function getReadinessScore(userId: string): Promise<PRSComponents> {
  const existing = await prisma.readinessScore.findUnique({
    where: { userId },
  });

  if (!existing) {
    return calculatePRS(userId);
  }

  const [solvedCount, quizCount, profile] = await Promise.all([
    prisma.userProgress.count({ where: { userId, isSolved: true } }),
    prisma.quizAttempt.count({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const streakDays = profile?.streakDays ?? 0;
  const consistencyScore = Math.min(100, Math.round((streakDays / 14) * 100));
  const isBaselineOnly = solvedCount === 0 && quizCount === 0;

  return {
    totalScore: existing.totalScore,
    dsaScore: existing.dsaScore,
    coreCsScore: existing.coreCsScore,
    oaScore: existing.oaScore,
    consistencyScore,
    prsVersion: 'v1',
    isBaselineOnly,
  };
}
