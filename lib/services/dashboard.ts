// ============================================================================
// PREPOS DASHBOARD AGGREGATION SERVICE
// Single Unified Server-Side Query for Mission-First Dashboard
// ============================================================================

import prisma from '../db';
import { getReadinessScore, PRSComponents } from './readiness-score';
import { getOrCreateDailyMissions, MissionItem } from './daily-mission';

export interface DashboardData {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  profile: {
    gradYear: number;
    targetDegree: string;
    targetRoleTier: string;
    preferredLang: string;
    streakDays: number;
  } | null;
  readiness: PRSComponents;
  todayMissions: MissionItem[];
  dsaProgress: {
    solvedCount: number;
    totalCount: number;
    progressPct: number;
    nextProblem: {
      title: string;
      slug: string;
      difficulty: string;
    } | null;
  };
  coreCsProgress: {
    totalQuizzes: number;
    attemptedCount: number;
    averageScore: number;
    nextQuiz: {
      title: string;
      slug: string;
      subjectTitle: string;
    } | null;
  };
  companyHighlights: {
    slug: string;
    name: string;
    logoUrl: string | null;
    topPattern: string;
    problemCount: number;
  }[];
  revisionSummary: {
    dueCount: number;
    nextRevisionTitle: string | null;
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [user, readiness, missions, solvedProgress, totalProblems, allQuizzes, userAttempts, companies, revisionsDue] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      getReadinessScore(userId),
      getOrCreateDailyMissions(userId),
      prisma.userProgress.findMany({
        where: { userId, isSolved: true },
        select: { problemId: true },
      }),
      prisma.problem.count(),
      prisma.coreCSQuiz.findMany({
        include: { subject: true },
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        select: { quizId: true, scorePct: true },
      }),
      prisma.company.findMany({
        take: 4,
        include: {
          patterns: { take: 1, orderBy: { frequencyPct: 'desc' } },
          companyProblems: true,
        },
      }),
      prisma.revision.findMany({
        where: {
          userId,
          dueAt: { lte: new Date() },
          completedAt: null,
        },
        include: { problem: true },
        take: 1,
      }),
    ]);

  if (!user) {
    throw new Error('User not found');
  }

  // 1. DSA Progress Stats
  const solvedCount = solvedProgress.length;
  const solvedIds = solvedProgress.map((p) => p.problemId);
  const nextProblemRecord = await prisma.problem.findFirst({
    where: {
      id: { notIn: solvedIds },
      status: 'PUBLISHED',
    },
    orderBy: { createdAt: 'asc' },
  });

  const dsaProgressPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // 2. Core CS Progress Stats
  const attemptedQuizIds = new Set(userAttempts.map((a) => a.quizId));
  const unattemptedQuiz = allQuizzes.find((q) => !attemptedQuizIds.has(q.id)) ?? allQuizzes[0] ?? null;

  const averageQuizScore =
    userAttempts.length > 0
      ? Math.round(userAttempts.reduce((sum, a) => sum + a.scorePct, 0) / userAttempts.length)
      : 0;

  // 3. Company Highlights
  const companyHighlights = companies.map((comp) => ({
    slug: comp.slug,
    name: comp.name,
    logoUrl: comp.logoUrl,
    topPattern: comp.patterns[0]?.patternName ?? 'Arrays & Data Structures',
    problemCount: comp.companyProblems.length,
  }));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    profile: user.profile
      ? {
          gradYear: user.profile.gradYear,
          targetDegree: user.profile.targetDegree,
          targetRoleTier: user.profile.targetRoleTier,
          preferredLang: user.profile.preferredLang,
          streakDays: user.profile.streakDays,
        }
      : null,
    readiness,
    todayMissions: missions,
    dsaProgress: {
      solvedCount,
      totalCount: totalProblems,
      progressPct: dsaProgressPct,
      nextProblem: nextProblemRecord
        ? {
            title: nextProblemRecord.title,
            slug: nextProblemRecord.slug,
            difficulty: nextProblemRecord.difficulty,
          }
        : null,
    },
    coreCsProgress: {
      totalQuizzes: allQuizzes.length,
      attemptedCount: attemptedQuizIds.size,
      averageScore: averageQuizScore,
      nextQuiz: unattemptedQuiz
        ? {
            title: unattemptedQuiz.title,
            slug: unattemptedQuiz.slug,
            subjectTitle: unattemptedQuiz.subject.title,
          }
        : null,
    },
    companyHighlights,
    revisionSummary: {
      dueCount: revisionsDue.length,
      nextRevisionTitle: revisionsDue[0]?.problem?.title ?? null,
    },
  };
}
