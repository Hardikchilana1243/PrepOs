// ============================================================================
// PREPOS REQUEST-CACHED DASHBOARD & READINESS QUERIES
// Request-Scoped Deduplication for Zero-Overhead Server Rendering
// ============================================================================

import prisma from '../db';
import { requestCache } from '../utils/cache';

/**
 * Returns the count of problems solved by a user.
 * Deduplicated per request to prevent redundant queries between PRS and Pillars.
 */
export const getCachedUserSolvedCount = requestCache(async (userId: string): Promise<number> => {
  return prisma.userProgress.count({
    where: { userId, isSolved: true },
  });
});

/**
 * Returns a user's quiz attempts.
 * Deduplicated per request to prevent redundant queries between PRS and Pillars.
 */
export const getCachedUserQuizAttempts = requestCache(async (userId: string) => {
  return prisma.quizAttempt.findMany({
    where: { userId },
    select: { quizId: true, scorePct: true },
  });
});

/**
 * Returns total published problems count.
 * Deduplicated per request across dashboard components.
 */
export const getCachedTotalProblemCount = requestCache(async (): Promise<number> => {
  const count = await prisma.problem.count({
    where: { status: 'PUBLISHED' },
  });
  return count > 0 ? count : 20;
});

/**
 * Returns all published Core CS quizzes ordered by orderIndex.
 * Deduplicated per request.
 */
export const getCachedPublishedQuizzes = requestCache(async () => {
  return prisma.coreCSQuiz.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      subject: {
        select: { title: true },
      },
    },
  });
});

/**
 * Returns top 4 company highlights for dashboard preparation pillars.
 * Deduplicated per request.
 */
export const getCachedCompanyHighlights = requestCache(async () => {
  return prisma.company.findMany({
    take: 4,
    orderBy: { name: 'asc' },
    select: {
      slug: true,
      name: true,
      logoUrl: true,
      patterns: {
        take: 1,
        orderBy: { frequencyPct: 'desc' },
        select: { patternName: true },
      },
      _count: {
        select: { companyProblems: true },
      },
    },
  });
});
