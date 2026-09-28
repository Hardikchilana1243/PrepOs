// ============================================================================
// PREPOS DSA ROADMAP & CURRICULUM SERVICE
// Real Database Aggregations for 14-Module Curriculum & User Activity States
// ============================================================================

import prisma from '../db';

export type ProblemStatus = 'SOLVED' | 'ATTEMPTED' | 'BOOKMARKED' | 'UNSOLVED';

export interface RoadmapProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  status: ProblemStatus;
  isSolved: boolean;
  isAttempted: boolean;
  isBookmarked: boolean;
  expectedTimeComplexity: string | null;
  expectedSpaceComplexity: string | null;
  companies: string[];
  acceptedCount: number;
  submittedCount: number;
}

export interface RoadmapTopicItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  totalProblems: number;
  solvedProblems: number;
  progressPct: number;
  isCompleted: boolean;
  problems: RoadmapProblemItem[];
}

export interface RoadmapModuleItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  totalProblems: number;
  solvedProblems: number;
  progressPct: number;
  isCompleted: boolean;
  topics: RoadmapTopicItem[];
}

export interface DifficultyStats {
  total: number;
  solved: number;
  progressPct: number;
}

export interface DSARoadmapData {
  totalProblems: number;
  solvedProblems: number;
  overallProgressPct: number;
  difficultyDistribution: {
    EASY: DifficultyStats;
    MEDIUM: DifficultyStats;
    HARD: DifficultyStats;
  };
  totalModules: number;
  completedModules: number;
  modules: RoadmapModuleItem[];
  allProblems: RoadmapProblemItem[];
}

interface CachedCurriculumProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  expectedTimeComplexity: string | null;
  expectedSpaceComplexity: string | null;
  acceptedCount: number;
  submittedCount: number;
  companies: string[];
}

interface CachedCurriculumTopic {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  problems: CachedCurriculumProblem[];
}

interface CachedCurriculumModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  topics: CachedCurriculumTopic[];
}

let cachedCurriculum: { data: CachedCurriculumModule[]; expiresAt: number } | null = null;
const CURRICULUM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function getStaticCurriculum(): Promise<CachedCurriculumModule[]> {
  const now = Date.now();
  if (cachedCurriculum && cachedCurriculum.expiresAt > now) {
    return cachedCurriculum.data;
  }

  const rawModules = await prisma.module.findMany({
    where: {
      roadmap: { slug: 'dsa-placement-roadmap' },
    },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      orderIndex: true,
      topics: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          orderIndex: true,
          problems: {
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              slug: true,
              title: true,
              difficulty: true,
              expectedTimeComplexity: true,
              expectedSpaceComplexity: true,
              acceptedCount: true,
              submittedCount: true,
              companyProblems: {
                select: {
                  company: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const formatted: CachedCurriculumModule[] = rawModules.map((mod) => ({
    id: mod.id,
    slug: mod.slug,
    title: mod.title,
    description: mod.description,
    orderIndex: mod.orderIndex,
    topics: mod.topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      orderIndex: t.orderIndex,
      problems: t.problems.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        expectedTimeComplexity: p.expectedTimeComplexity,
        expectedSpaceComplexity: p.expectedSpaceComplexity,
        acceptedCount: p.acceptedCount,
        submittedCount: p.submittedCount,
        companies: p.companyProblems.map((cp) => cp.company.name),
      })),
    })),
  }));

  cachedCurriculum = {
    data: formatted,
    expiresAt: now + CURRICULUM_CACHE_TTL_MS,
  };

  return formatted;
}

/**
 * Fetches the DSA placement curriculum with real per-user
 * solved, attempted, and bookmarked statuses.
 */
export async function getDSARoadmapData(userId: string): Promise<DSARoadmapData> {
  const [modules, userProgress, userSubmissions, userBookmarks] = await Promise.all([
    getStaticCurriculum(),
    prisma.userProgress.findMany({
      where: { userId, isSolved: true },
      select: { problemId: true },
    }),
    prisma.submission.findMany({
      where: { userId },
      select: { problemId: true },
      distinct: ['problemId'],
    }),
    prisma.bookmark.findMany({
      where: { userId },
      select: { problemId: true },
    }),
  ]);

  const solvedSet = new Set(userProgress.map((p) => p.problemId));
  const attemptedSet = new Set(userSubmissions.map((s) => s.problemId));
  const bookmarkSet = new Set(userBookmarks.map((b) => b.problemId));

  let totalProblemsCount = 0;
  let totalSolvedCount = 0;

  const diffCounts = {
    EASY: { total: 0, solved: 0 },
    MEDIUM: { total: 0, solved: 0 },
    HARD: { total: 0, solved: 0 },
  };

  const allProblems: RoadmapProblemItem[] = [];

  const processedModules: RoadmapModuleItem[] = modules.map((mod) => {
    let moduleProblemCount = 0;
    let moduleSolvedCount = 0;

    const processedTopics: RoadmapTopicItem[] = mod.topics.map((topic) => {
      let topicSolvedCount = 0;
      const topicProblems: RoadmapProblemItem[] = topic.problems.map((prob) => {
        totalProblemsCount++;
        moduleProblemCount++;

        const isSolved = solvedSet.has(prob.id);
        const isAttempted = attemptedSet.has(prob.id);
        const isBookmarked = bookmarkSet.has(prob.id);

        if (isSolved) {
          totalSolvedCount++;
          moduleSolvedCount++;
          topicSolvedCount++;
        }

        const diffKey = prob.difficulty as 'EASY' | 'MEDIUM' | 'HARD';
        if (diffCounts[diffKey]) {
          diffCounts[diffKey].total++;
          if (isSolved) diffCounts[diffKey].solved++;
        }

        let status: ProblemStatus = 'UNSOLVED';
        if (isSolved) status = 'SOLVED';
        else if (isAttempted) status = 'ATTEMPTED';
        else if (isBookmarked) status = 'BOOKMARKED';

        const item: RoadmapProblemItem = {
          id: prob.id,
          slug: prob.slug,
          title: prob.title,
          difficulty: diffKey,
          topicId: topic.id,
          topicSlug: topic.slug,
          topicTitle: topic.title,
          moduleId: mod.id,
          moduleSlug: mod.slug,
          moduleTitle: mod.title,
          status,
          isSolved,
          isAttempted,
          isBookmarked,
          expectedTimeComplexity: prob.expectedTimeComplexity,
          expectedSpaceComplexity: prob.expectedSpaceComplexity,
          companies: prob.companies,
          acceptedCount: prob.acceptedCount,
          submittedCount: prob.submittedCount,
        };

        allProblems.push(item);
        return item;
      });

      const topicProgressPct =
        topicProblems.length > 0 ? Math.round((topicSolvedCount / topicProblems.length) * 100) : 0;

      return {
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        orderIndex: topic.orderIndex,
        totalProblems: topicProblems.length,
        solvedProblems: topicSolvedCount,
        progressPct: topicProgressPct,
        isCompleted: topicProblems.length > 0 && topicSolvedCount === topicProblems.length,
        problems: topicProblems,
      };
    });

    const moduleProgressPct =
      moduleProblemCount > 0 ? Math.round((moduleSolvedCount / moduleProblemCount) * 100) : 0;

    return {
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      orderIndex: mod.orderIndex,
      totalProblems: moduleProblemCount,
      solvedProblems: moduleSolvedCount,
      progressPct: moduleProgressPct,
      isCompleted: moduleProblemCount > 0 && moduleSolvedCount === moduleProblemCount,
      topics: processedTopics,
    };
  });

  const overallProgressPct =
    totalProblemsCount > 0 ? Math.round((totalSolvedCount / totalProblemsCount) * 100) : 0;

  const completedModulesCount = processedModules.filter((m) => m.isCompleted).length;

  return {
    totalProblems: totalProblemsCount,
    solvedProblems: totalSolvedCount,
    overallProgressPct,
    difficultyDistribution: {
      EASY: {
        total: diffCounts.EASY.total,
        solved: diffCounts.EASY.solved,
        progressPct:
          diffCounts.EASY.total > 0
            ? Math.round((diffCounts.EASY.solved / diffCounts.EASY.total) * 100)
            : 0,
      },
      MEDIUM: {
        total: diffCounts.MEDIUM.total,
        solved: diffCounts.MEDIUM.solved,
        progressPct:
          diffCounts.MEDIUM.total > 0
            ? Math.round((diffCounts.MEDIUM.solved / diffCounts.MEDIUM.total) * 100)
            : 0,
      },
      HARD: {
        total: diffCounts.HARD.total,
        solved: diffCounts.HARD.solved,
        progressPct:
          diffCounts.HARD.total > 0
            ? Math.round((diffCounts.HARD.solved / diffCounts.HARD.total) * 100)
            : 0,
      },
    },
    totalModules: processedModules.length,
    completedModules: completedModulesCount,
    modules: processedModules,
    allProblems,
  };
}

/**
 * Safely normalizes problem hints from PostgreSQL text[], JSON-serialized strings,
 * or null/undefined values into a predictable string[] without throwing errors.
 */
export function normalizeHints(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          try {
            return JSON.stringify(item);
          } catch {
            return String(item ?? '').trim();
          }
        }
        return String(item ?? '').trim();
      })
      .filter((h) => h.length > 0);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '[]') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
              try {
                return JSON.stringify(item);
              } catch {
                return String(item ?? '').trim();
              }
            }
            return String(item ?? '').trim();
          })
          .filter((h) => h.length > 0);
      }
      if (typeof parsed === 'string' && parsed.trim().length > 0) {
        return [parsed.trim()];
      }
    } catch {
      // If it's a non-JSON plain string hint
      return [trimmed];
    }
  }
  return [];
}

/**
 * Fetches problem detail for the Problem View.
 * CRITICAL SECURITY: Never returns secret test cases in this query!
 */
export async function getProblemDetailData(userId: string, slug: string) {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          slug: true,
          moduleId: true,
          module: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
      companyProblems: {
        select: {
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      // ONLY fetch public/sample test cases for client consumption!
      testCases: {
        where: { isSecret: false },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          orderIndex: true,
          input: true,
          expected: true,
          explanation: true,
          isSecret: true,
        },
      },
      solutions: {
        select: {
          language: true,
          editorial: true,
          timeComplexity: true,
          spaceComplexity: true,
          code: true,
        },
      },
    },
  });

  if (!problem || problem.status !== 'PUBLISHED') {
    return null;
  }

  // Fetch student's specific status for this problem
  const [userProg, userBookmark, submissions] = await Promise.all([
    prisma.userProgress.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id,
        },
      },
    }),
    prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id,
        },
      },
    }),
    prisma.submission.findMany({
      where: {
        userId,
        problemId: problem.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true,
        language: true,
        status: true,
        executionTime: true,
        memoryKb: true,
        passedTests: true,
        totalTests: true,
        errorLog: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    problem: {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      statement: problem.statement,
      constraints: problem.constraints,
      hints: normalizeHints(problem.hints),
      expectedTimeComplexity: problem.expectedTimeComplexity,
      expectedSpaceComplexity: problem.expectedSpaceComplexity,
      moduleId: problem.topic.moduleId,
      moduleTitle: problem.topic.module.title,
      moduleSlug: problem.topic.module.slug,
      topicId: problem.topicId,
      topicTitle: problem.topic.title,
      topicSlug: problem.topic.slug,
      companies: problem.companyProblems.map((cp) => cp.company.name),
      sampleTestCases: problem.testCases.map((tc) => ({
        id: tc.id,
        orderIndex: tc.orderIndex,
        input: tc.input,
        expected: tc.expected,
        explanation: tc.explanation,
      })),
      solutions: problem.solutions.map((s) => ({
        language: s.language,
        editorial: s.editorial,
        timeComplexity: s.timeComplexity,
        spaceComplexity: s.spaceComplexity,
        code: s.code,
      })),
    },
    userState: {
      isSolved: Boolean(userProg?.isSolved),
      isBookmarked: Boolean(userBookmark),
      submissions: submissions.map((s) => ({
        id: s.id,
        language: s.language,
        status: s.status,
        executionTime: s.executionTime,
        memoryKb: s.memoryKb,
        passedTests: s.passedTests,
        totalTests: s.totalTests,
        errorLog: s.errorLog,
        createdAt: s.createdAt.toISOString(),
      })),
    },
  };
}
