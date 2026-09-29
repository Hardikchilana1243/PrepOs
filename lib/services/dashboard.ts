// ============================================================================
// PREPOS DASHBOARD AGGREGATION SERVICE
// Single Unified Server-Side Query for Mission-First Dashboard
// ============================================================================

import prisma from '../db';
import { getReadinessScore, PRSComponents } from './readiness-score';
import { getOrCreateDailyMissions, MissionItem } from './daily-mission';
import {
  getCachedUserSolvedCount,
  getCachedUserQuizAttempts,
  getCachedTotalProblemCount,
  getCachedPublishedQuizzes,
  getCachedCompanyHighlights,
} from './dashboard-queries';

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

export interface PrimaryDashboardData {
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
}

export interface PreparationPillarsData {
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

export async function getPrimaryDashboardData(userId: string): Promise<PrimaryDashboardData> {
  const [user, missions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            gradYear: true,
            targetDegree: true,
            targetRoleTier: true,
            preferredLang: true,
            streakDays: true,
          },
        },
      },
    }),
    getOrCreateDailyMissions(userId),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const readiness = await getReadinessScore(userId, {
    streakDays: user.profile?.streakDays ?? 0,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    profile: user.profile,
    readiness,
    todayMissions: missions,
  };
}

export async function getPreparationPillarsData(userId: string): Promise<PreparationPillarsData> {
  const now = new Date();

  const [
    solvedCount,
    totalProblems,
    nextProblemRecord,
    allQuizzes,
    userAttempts,
    companies,
    revisionsDueCount,
    nextRevision,
  ] = await Promise.all([
    getCachedUserSolvedCount(userId),
    getCachedTotalProblemCount(),
    prisma.problem.findFirst({
      where: {
        status: 'PUBLISHED',
        userProgress: {
          none: {
            userId,
            isSolved: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        title: true,
        slug: true,
        difficulty: true,
      },
    }),
    getCachedPublishedQuizzes(),
    getCachedUserQuizAttempts(userId),
    getCachedCompanyHighlights(),
    prisma.revision.count({
      where: {
        userId,
        dueAt: { lte: now },
        completedAt: null,
      },
    }),
    prisma.revision.findFirst({
      where: {
        userId,
        dueAt: { lte: now },
        completedAt: null,
      },
      orderBy: { dueAt: 'asc' },
      select: {
        problem: {
          select: { title: true },
        },
      },
    }),
  ]);

  const dsaProgressPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const attemptedQuizIds = new Set(userAttempts.map((a) => a.quizId));
  const unattemptedQuiz = allQuizzes.find((q) => !attemptedQuizIds.has(q.id)) ?? allQuizzes[0] ?? null;

  const averageQuizScore =
    userAttempts.length > 0
      ? Math.round(userAttempts.reduce((sum, a) => sum + a.scorePct, 0) / userAttempts.length)
      : 0;

  const companyHighlights = companies.map((comp) => ({
    slug: comp.slug,
    name: comp.name,
    logoUrl: comp.logoUrl,
    topPattern: comp.patterns[0]?.patternName ?? 'Arrays & Data Structures',
    problemCount: comp._count.companyProblems,
  }));

  return {
    dsaProgress: {
      solvedCount,
      totalCount: totalProblems,
      progressPct: dsaProgressPct,
      nextProblem: nextProblemRecord,
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
      dueCount: revisionsDueCount,
      nextRevisionTitle: nextRevision?.problem?.title ?? null,
    },
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [primary, pillars] = await Promise.all([
    getPrimaryDashboardData(userId),
    getPreparationPillarsData(userId),
  ]);

  return {
    ...primary,
    ...pillars,
  };
}
