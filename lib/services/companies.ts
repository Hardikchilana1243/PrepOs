// ============================================================================
// PREPOS COMPANY HUBS SERVICE
// Deterministic Aggregation of Target Companies, Verification Patterns & Modules
// ============================================================================

import prisma from '../db';
import { requestCache } from '../utils/cache';

export interface CompanySummary {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  tier: string;
  description: string | null;
  websiteUrl: string | null;
  isTarget: boolean;
  topPattern?: string;
  mappedProblemsCount: number;
  solvedProblemsCount: number;
  hasCoreCS: boolean;
  coreCSQuizzesCount: number;
  coreCSQuizzesPassed: number;
  assessmentsCount: number;
  assessmentsPassed: number;
  hasAssessments: boolean;
  coveragePct: number;
  preparationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED';
}

export interface CompanyCatalogData {
  totalCompanies: number;
  totalTargetCount: number;
  totalCoveredCount: number;
  totalInProgressCount: number;
  totalUnstartedCount: number;
  overallCoveragePct: number;
  companies: CompanySummary[];
}

export interface CompanyProblemDetail {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: {
    id: string;
    title: string;
    slug: string;
  };
  isSolved: boolean;
  isAttempted: boolean;
  isBookmarked: boolean;
  status: 'SOLVED' | 'ATTEMPTED' | 'TODO';
  frequency: number;
}

export interface CompanyPatternItem {
  id: string;
  patternName: string;
  frequencyPct: number;
  veracity: string;
  lastVerifiedAt: Date;
}

export interface CompanyCoreCSQuizDetail {
  id: string;
  slug: string;
  title: string;
  subjectTitle: string;
  subjectSlug: string;
  totalQuestions: number;
  durationMin: number;
  attemptCount: number;
  bestScorePct: number | null;
  averageScorePct: number | null;
  isBenchmarkMet: boolean;
}

export interface CompanyAssessmentDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMin: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: string;
  passingScorePct: number;
  sectionsCount: number;
  attemptsCount: number;
  latestAttempt: {
    id: string;
    status: string;
    scorePct: number;
    passed: boolean;
    totalScore: number;
    maxPossibleScore: number;
    durationTakenSec: number;
    createdAt: Date;
  } | null;
  bestScorePct: number | null;
  isPassed: boolean;
}

export interface CompanyRevisionDetail {
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  intervalDays: number;
  dueAt: Date;
  isDue: boolean;
  confidence: string;
}

export interface PreparationChecklistItem {
  id: string;
  category: 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'REVISION';
  title: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'TODO';
  ctaLabel: string;
  ctaHref: string;
  badge?: string;
}

export interface CompanyActivityItem {
  id: string;
  type: 'PROBLEM_SOLVED' | 'PROBLEM_ATTEMPTED' | 'ASSESSMENT_COMPLETED' | 'QUIZ_ATTEMPTED' | 'TARGET_SET';
  title: string;
  detail: string;
  timestamp: Date;
  badge?: string;
}

export interface CompanyDetailData {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  tier: string;
  description: string | null;
  websiteUrl: string | null;
  isTarget: boolean;
  patterns: CompanyPatternItem[];

  dsa: {
    totalCount: number;
    solvedCount: number;
    attemptedCount: number;
    coveragePct: number;
    easySolved: number;
    easyTotal: number;
    mediumSolved: number;
    mediumTotal: number;
    hardSolved: number;
    hardTotal: number;
    problems: CompanyProblemDetail[];
  };

  coreCs: {
    hasMapping: boolean;
    totalQuizzes: number;
    passedQuizzes: number;
    quizzes: CompanyCoreCSQuizDetail[];
  };

  assessments: {
    hasAssessments: boolean;
    totalCount: number;
    passedCount: number;
    items: CompanyAssessmentDetail[];
  };

  revision: {
    hasScheduled: boolean;
    totalScheduled: number;
    dueCount: number;
    items: CompanyRevisionDetail[];
  };

  coverage: {
    totalItems: number;
    completedItems: number;
    remainingItems: number;
    coveragePct: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED';
  };

  checklist: PreparationChecklistItem[];
  history: CompanyActivityItem[];
}

/**
 * Standard tier classification based on company recruitment tier
 */
export function getCompanyTier(slug: string): string {
  if (['google', 'microsoft', 'amazon', 'uber', 'atlassian'].includes(slug)) {
    return 'Tier-1 Tech';
  }
  if (['flipkart', 'goldman-sachs', 'walmart'].includes(slug)) {
    return 'Product';
  }
  if (['cisco', 'oracle'].includes(slug)) {
    return 'Enterprise';
  }
  return 'High-Impact IT';
}

/**
 * Fetches user-targeted company slugs using persisted ProgressEvents.
 */
export async function getUserTargetCompanySlugs(userId: string): Promise<Set<string>> {
  const events = await prisma.progressEvent.findMany({
    where: {
      userId,
      eventType: 'TARGET_COMPANY_SET',
    },
    select: { metadata: true },
  });

  const targets = new Set<string>();
  for (const ev of events) {
    if (!ev.metadata) continue;
    try {
      const meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata) : (ev.metadata as any);
      if (meta?.companySlug) {
        targets.add(meta.companySlug);
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  return targets;
}

/**
 * Persists target status for a company via user-scoped ProgressEvent
 */
export async function toggleTargetCompany(
  userId: string,
  companySlug: string,
  isTarget: boolean
): Promise<{ success: boolean; isTarget: boolean }> {
  // Clean up any previous target events for this company to prevent duplicates
  const existing = await prisma.progressEvent.findMany({
    where: {
      userId,
      eventType: { in: ['TARGET_COMPANY_SET', 'TARGET_COMPANY_REMOVED'] },
    },
    select: { id: true, metadata: true },
  });

  const toDeleteIds: string[] = [];
  for (const ev of existing) {
    try {
      const meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata) : (ev.metadata as any);
      if (meta?.companySlug === companySlug) {
        toDeleteIds.push(ev.id);
      }
    } catch {
      // Ignore
    }
  }

  if (toDeleteIds.length > 0) {
    await prisma.progressEvent.deleteMany({
      where: { id: { in: toDeleteIds } },
    });
  }

  if (isTarget) {
    await prisma.progressEvent.create({
      data: {
        userId,
        eventType: 'TARGET_COMPANY_SET',
        metadata: JSON.stringify({
          companySlug,
          isTarget: true,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  }

  return { success: true, isTarget };
}

/**
 * Fetches high-scanability catalog data for /dashboard/companies
 */
export const getCompanyCatalogData = requestCache(async (userId: string): Promise<CompanyCatalogData> => {
  const [companies, userProgress, userAssessments, targetSet, allQuizzes, quizAttempts] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        description: true,
        websiteUrl: true,
        patterns: {
          orderBy: { frequencyPct: 'desc' },
          select: {
            patternName: true,
            frequencyPct: true,
          },
        },
        assessments: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            slug: true,
            sections: {
              select: {
                type: true,
                questions: {
                  select: {
                    mcqQuestion: {
                      select: {
                        quizId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        companyProblems: {
          select: {
            problemId: true,
          },
        },
      },
    }),
    prisma.userProgress.findMany({
      where: { userId, isSolved: true },
      select: { problemId: true },
    }),
    prisma.assessmentAttempt.findMany({
      where: { userId },
      select: {
        assessmentId: true,
        passed: true,
        status: true,
      },
    }),
    getUserTargetCompanySlugs(userId),
    prisma.coreCSQuiz.findMany({
      select: {
        id: true,
        slug: true,
        subject: {
          select: { slug: true },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      select: { quizId: true, scorePct: true },
    }),
  ]);

  const solvedProblemSet = new Set(userProgress.map((p) => p.problemId));
  const passedAssessmentSet = new Set(
    userAssessments.filter((a) => a.passed).map((a) => a.assessmentId)
  );
  const attemptedAssessmentSet = new Set(
    userAssessments.map((a) => a.assessmentId)
  );

  const passedQuizSet = new Set<string>();
  for (const qa of quizAttempts) {
    if (qa.scorePct >= 70) {
      passedQuizSet.add(qa.quizId);
    }
  }

  let totalCoveredCount = 0;
  let totalInProgressCount = 0;
  let totalUnstartedCount = 0;
  let cumulativeCoverage = 0;

  const catalogItems: CompanySummary[] = companies.map((c) => {
    const isTarget = targetSet.has(c.slug);
    const mappedProblems = c.companyProblems.map((cp) => cp.problemId);
    const mappedProblemsCount = mappedProblems.length;
    const solvedProblemsCount = mappedProblems.filter((id) => solvedProblemSet.has(id)).length;

    // Detect Core CS associations via assessment sections or patterns
    const quizIdSet = new Set<string>();
    for (const a of c.assessments) {
      for (const s of a.sections) {
        if (s.type === 'CORE_CS') {
          for (const q of s.questions) {
            if (q.mcqQuestion?.quizId) {
              quizIdSet.add(q.mcqQuestion.quizId);
            }
          }
        }
      }
    }

    // Pattern-based Core CS detection (DBMS / OS mentions)
    for (const p of c.patterns) {
      const lower = p.patternName.toLowerCase();
      if (lower.includes('dbms') || lower.includes('database') || lower.includes('sql')) {
        const dbmsQuiz = allQuizzes.find((q) => q.subject.slug === 'dbms');
        if (dbmsQuiz) quizIdSet.add(dbmsQuiz.id);
      }
      if (lower.includes('os') || lower.includes('operating system')) {
        const osQuiz = allQuizzes.find((q) => q.subject.slug === 'os');
        if (osQuiz) quizIdSet.add(osQuiz.id);
      }
    }

    const coreCSQuizzesCount = quizIdSet.size;
    const coreCSQuizzesPassed = Array.from(quizIdSet).filter((qid) => passedQuizSet.has(qid)).length;
    const hasCoreCS = coreCSQuizzesCount > 0;

    const assessmentsCount = c.assessments.length;
    const assessmentsPassed = c.assessments.filter((a) => passedAssessmentSet.has(a.id)).length;
    const assessmentsAttempted = c.assessments.some((a) => attemptedAssessmentSet.has(a.id));

    // Transparent coverage: only from real mapped data
    const totalItems = mappedProblemsCount + assessmentsCount + (hasCoreCS ? coreCSQuizzesCount : 0);
    const completedItems = solvedProblemsCount + assessmentsPassed + (hasCoreCS ? coreCSQuizzesPassed : 0);
    const coveragePct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    let preparationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED' = 'NOT_STARTED';
    if (totalItems > 0 && completedItems === totalItems) {
      preparationStatus = 'COVERED';
      totalCoveredCount++;
    } else if (solvedProblemsCount > 0 || assessmentsAttempted || coreCSQuizzesPassed > 0) {
      preparationStatus = 'IN_PROGRESS';
      totalInProgressCount++;
    } else {
      totalUnstartedCount++;
    }

    cumulativeCoverage += coveragePct;

    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      logoUrl: c.logoUrl,
      tier: getCompanyTier(c.slug),
      description: c.description,
      websiteUrl: c.websiteUrl,
      isTarget,
      topPattern: c.patterns[0]?.patternName,
      mappedProblemsCount,
      solvedProblemsCount,
      hasCoreCS,
      coreCSQuizzesCount,
      coreCSQuizzesPassed,
      assessmentsCount,
      assessmentsPassed,
      hasAssessments: assessmentsCount > 0,
      coveragePct,
      preparationStatus,
    };
  });

  const totalCompanies = catalogItems.length;
  const overallCoveragePct = totalCompanies > 0 ? Math.round(cumulativeCoverage / totalCompanies) : 0;

  return {
    totalCompanies,
    totalTargetCount: targetSet.size,
    totalCoveredCount,
    totalInProgressCount,
    totalUnstartedCount,
    overallCoveragePct,
    companies: catalogItems,
  };
});

/**
 * Fetches focused company preparation workspace data for /dashboard/companies/[slug]
 */
export const getCompanyDetailData = requestCache(async (
  slug: string,
  userId: string
): Promise<CompanyDetailData | null> => {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      patterns: {
        orderBy: { frequencyPct: 'desc' },
      },
      companyProblems: {
        include: {
          problem: {
            include: {
              topic: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
      assessments: {
        where: { status: 'PUBLISHED' },
        orderBy: { orderIndex: 'asc' },
        include: {
          sections: {
            include: {
              questions: {
                include: {
                  mcqQuestion: {
                    include: {
                      quiz: {
                        include: {
                          subject: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          attempts: {
            where: { userId },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!company) return null;

  const problemIds = company.companyProblems.map((cp) => cp.problem.id);

  // Parallel user-specific data fetching
  const [
    userProgress,
    userSubmissions,
    userBookmarks,
    targetSet,
    allQuizzes,
    allQuizAttempts,
    revisions,
  ] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId, problemId: { in: problemIds } },
      select: { problemId: true, isSolved: true, solvedAt: true },
    }),
    prisma.submission.findMany({
      where: { userId, problemId: { in: problemIds } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, problemId: true, status: true, createdAt: true },
    }),
    prisma.bookmark.findMany({
      where: { userId, problemId: { in: problemIds } },
      select: { problemId: true },
    }),
    getUserTargetCompanySlugs(userId),
    prisma.coreCSQuiz.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        durationMin: true,
        totalQuestions: true,
        subject: {
          select: { title: true, slug: true },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        quizId: true,
        scorePct: true,
        totalQs: true,
        correctQs: true,
        completedAt: true,
      },
    }),
    prisma.revision.findMany({
      where: { userId, problemId: { in: problemIds } },
      include: {
        problem: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),
  ]);

  const solvedSet = new Set(userProgress.filter((p) => p.isSolved).map((p) => p.problemId));
  const attemptedProblemSet = new Set(userSubmissions.map((s) => s.problemId));
  const bookmarkSet = new Set(userBookmarks.map((b) => b.problemId));
  const isTarget = targetSet.has(company.slug);

  // 1. Process DSA Problems
  const problems: CompanyProblemDetail[] = company.companyProblems.map((cp) => {
    const isSolved = solvedSet.has(cp.problem.id);
    const isAttempted = attemptedProblemSet.has(cp.problem.id) && !isSolved;
    const isBookmarked = bookmarkSet.has(cp.problem.id);

    let status: 'SOLVED' | 'ATTEMPTED' | 'TODO' = 'TODO';
    if (isSolved) status = 'SOLVED';
    else if (isAttempted) status = 'ATTEMPTED';

    return {
      id: cp.problem.id,
      slug: cp.problem.slug,
      title: cp.problem.title,
      difficulty: cp.problem.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      topic: cp.problem.topic,
      isSolved,
      isAttempted,
      isBookmarked,
      status,
      frequency: cp.frequency,
    };
  });

  const totalDsaCount = problems.length;
  const solvedDsaCount = problems.filter((p) => p.isSolved).length;
  const attemptedDsaCount = problems.filter((p) => p.isAttempted).length;
  const dsaCoveragePct = totalDsaCount > 0 ? Math.round((solvedDsaCount / totalDsaCount) * 100) : 0;

  const easyTotal = problems.filter((p) => p.difficulty === 'EASY').length;
  const easySolved = problems.filter((p) => p.difficulty === 'EASY' && p.isSolved).length;
  const mediumTotal = problems.filter((p) => p.difficulty === 'MEDIUM').length;
  const mediumSolved = problems.filter((p) => p.difficulty === 'MEDIUM' && p.isSolved).length;
  const hardTotal = problems.filter((p) => p.difficulty === 'HARD').length;
  const hardSolved = problems.filter((p) => p.difficulty === 'HARD' && p.isSolved).length;

  // 2. Process Core CS Quizzes
  const mappedQuizIds = new Set<string>();
  for (const a of company.assessments) {
    for (const s of a.sections) {
      if (s.type === 'CORE_CS') {
        for (const q of s.questions) {
          if (q.mcqQuestion?.quizId) {
            mappedQuizIds.add(q.mcqQuestion.quizId);
          }
        }
      }
    }
  }

  // Also include patterns that explicitly reference DBMS / OS
  for (const p of company.patterns) {
    const lower = p.patternName.toLowerCase();
    if (lower.includes('dbms') || lower.includes('database') || lower.includes('sql')) {
      const dbmsQuiz = allQuizzes.find((q) => q.subject.slug === 'dbms');
      if (dbmsQuiz) mappedQuizIds.add(dbmsQuiz.id);
    }
    if (lower.includes('os') || lower.includes('operating system')) {
      const osQuiz = allQuizzes.find((q) => q.subject.slug === 'os');
      if (osQuiz) mappedQuizIds.add(osQuiz.id);
    }
  }

  const coreCsQuizzes: CompanyCoreCSQuizDetail[] = [];
  let passedCoreCsCount = 0;

  for (const quizId of mappedQuizIds) {
    const quiz = allQuizzes.find((q) => q.id === quizId);
    if (!quiz) continue;

    const attempts = allQuizAttempts.filter((qa) => qa.quizId === quizId);
    const attemptCount = attempts.length;
    const bestScorePct = attemptCount > 0 ? Math.max(...attempts.map((a) => a.scorePct)) : null;
    const averageScorePct =
      attemptCount > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.scorePct, 0) / attemptCount)
        : null;
    const isBenchmarkMet = bestScorePct !== null && bestScorePct >= 70;
    if (isBenchmarkMet) passedCoreCsCount++;

    coreCsQuizzes.push({
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      subjectTitle: quiz.subject.title,
      subjectSlug: quiz.subject.slug,
      totalQuestions: quiz.totalQuestions,
      durationMin: quiz.durationMin,
      attemptCount,
      bestScorePct,
      averageScorePct,
      isBenchmarkMet,
    });
  }

  const hasCoreCSMapping = coreCsQuizzes.length > 0;

  // 3. Process Assessments
  const assessmentDetails: CompanyAssessmentDetail[] = company.assessments.map((a) => {
    const latestAttempt = a.attempts[0]
      ? {
          id: a.attempts[0].id,
          status: a.attempts[0].status,
          scorePct: a.attempts[0].scorePct,
          passed: a.attempts[0].passed,
          totalScore: a.attempts[0].totalScore,
          maxPossibleScore: a.attempts[0].maxPossibleScore,
          durationTakenSec: a.attempts[0].durationTakenSec,
          createdAt: a.attempts[0].createdAt,
        }
      : null;

    const attemptsCount = a.attempts.length;
    const bestScorePct = attemptsCount > 0 ? Math.max(...a.attempts.map((att) => att.scorePct)) : null;
    const isPassed = a.attempts.some((att) => att.passed);

    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description,
      instructions: a.instructions,
      durationMin: a.durationMin,
      totalMarks: a.totalMarks,
      totalQuestions: a.totalQuestions,
      difficulty: a.difficulty,
      passingScorePct: a.passingScorePct,
      sectionsCount: a.sections.length,
      attemptsCount,
      latestAttempt,
      bestScorePct,
      isPassed,
    };
  });

  const totalAssessments = assessmentDetails.length;
  const passedAssessments = assessmentDetails.filter((a) => a.isPassed).length;

  // 4. Process Spaced Revisions
  const now = new Date();
  const revisionItems: CompanyRevisionDetail[] = revisions.map((r) => ({
    problemId: r.problem.id,
    problemTitle: r.problem.title,
    problemSlug: r.problem.slug,
    intervalDays: r.intervalDays,
    dueAt: r.dueAt,
    isDue: r.dueAt <= now && r.completedAt === null,
    confidence: r.confidence,
  }));

  const dueRevisionsCount = revisionItems.filter((r) => r.isDue).length;

  // 5. Total Coverage Calculation
  const totalItems = totalDsaCount + totalAssessments + (hasCoreCSMapping ? coreCsQuizzes.length : 0);
  const completedItems = solvedDsaCount + passedAssessments + (hasCoreCSMapping ? passedCoreCsCount : 0);
  const remainingItems = Math.max(0, totalItems - completedItems);
  const overallCoveragePct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  let preparationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED' = 'NOT_STARTED';
  if (totalItems > 0 && completedItems === totalItems) {
    preparationStatus = 'COVERED';
  } else if (solvedDsaCount > 0 || totalAssessments > 0 && assessmentDetails.some((a) => a.attemptsCount > 0) || passedCoreCsCount > 0) {
    preparationStatus = 'IN_PROGRESS';
  }

  // 6. Deterministic Checklist
  const checklist: PreparationChecklistItem[] = [];

  // Item 1: DSA
  const firstUnsolvedDsa = problems.find((p) => !p.isSolved);
  checklist.push({
    id: 'chk-dsa',
    category: 'DSA',
    title: 'Solve Tagged Algorithmic Problems',
    description: `${solvedDsaCount} of ${totalDsaCount} problems solved across verified company topics.`,
    status: solvedDsaCount === totalDsaCount && totalDsaCount > 0 ? 'COMPLETED' : solvedDsaCount > 0 ? 'IN_PROGRESS' : 'TODO',
    ctaLabel: firstUnsolvedDsa ? `Solve ${firstUnsolvedDsa.title}` : 'Review Solved Problems',
    ctaHref: firstUnsolvedDsa ? `/dashboard/dsa/problem/${firstUnsolvedDsa.slug}` : '#dsa-section',
    badge: `${solvedDsaCount}/${totalDsaCount}`,
  });

  // Item 2: Core CS (if mapped)
  if (hasCoreCSMapping) {
    const unpassedQuiz = coreCsQuizzes.find((q) => !q.isBenchmarkMet);
    checklist.push({
      id: 'chk-corecs',
      category: 'CORE_CS',
      title: 'Pass Core CS Placement Screening',
      description: `${passedCoreCsCount} of ${coreCsQuizzes.length} diagnostic screening quizzes cleared (≥70% benchmark).`,
      status: passedCoreCsCount === coreCsQuizzes.length ? 'COMPLETED' : passedCoreCsCount > 0 ? 'IN_PROGRESS' : 'TODO',
      ctaLabel: unpassedQuiz ? `Take ${unpassedQuiz.title}` : 'Review Core CS',
      ctaHref: unpassedQuiz ? `/dashboard/core-cs?subject=${unpassedQuiz.subjectSlug}` : '/dashboard/core-cs',
      badge: `${passedCoreCsCount}/${coreCsQuizzes.length}`,
    });
  }

  // Item 3: Mock OA (if mapped)
  if (totalAssessments > 0) {
    const firstAssessment = assessmentDetails[0];
    checklist.push({
      id: 'chk-oa',
      category: 'ASSESSMENT',
      title: `Attempt ${company.name} Mock OA Simulation`,
      description: firstAssessment.isPassed
        ? `Simulation cleared with ${firstAssessment.bestScorePct}% score.`
        : `Simulate timed recruitment test (${firstAssessment.durationMin} mins, ${firstAssessment.totalMarks} marks).`,
      status: firstAssessment.isPassed ? 'COMPLETED' : firstAssessment.attemptsCount > 0 ? 'IN_PROGRESS' : 'TODO',
      ctaLabel: firstAssessment.isPassed ? 'Review / Retake' : 'Launch Simulation',
      ctaHref: `/dashboard/assessments/${firstAssessment.slug}`,
      badge: firstAssessment.isPassed ? 'Passed' : `${firstAssessment.durationMin}m timed`,
    });
  }

  // Item 4: Revision (if scheduled items exist)
  if (revisionItems.length > 0) {
    checklist.push({
      id: 'chk-revision',
      category: 'REVISION',
      title: 'Maintain Spaced Revision Intervals',
      description: dueRevisionsCount === 0
        ? `All ${revisionItems.length} company problem repetition intervals are up to date.`
        : `${dueRevisionsCount} company problem repetition(s) due today.`,
      status: dueRevisionsCount === 0 ? 'COMPLETED' : 'TODO',
      ctaLabel: dueRevisionsCount === 0 ? 'View Revision Queue' : 'Review Due Problems',
      ctaHref: '/dashboard/revision',
      badge: dueRevisionsCount === 0 ? 'Up to date' : `${dueRevisionsCount} Due`,
    });
  }

  // 7. Persisted Activity History
  const history: CompanyActivityItem[] = [];

  // Problem Solves
  for (const prog of userProgress) {
    if (prog.isSolved && prog.solvedAt) {
      const prob = problems.find((p) => p.id === prog.problemId);
      history.push({
        id: `sol-${prog.problemId}`,
        type: 'PROBLEM_SOLVED',
        title: `Solved ${prob?.title || 'Algorithmic Problem'}`,
        detail: `Verified optimal solution accepted in ${prob?.topic.title || 'Curriculum'}.`,
        timestamp: prog.solvedAt,
        badge: 'Accepted',
      });
    }
  }

  // Problem Submissions (latest per problem if not already listed as solve)
  for (const sub of userSubmissions.slice(0, 5)) {
    if (sub.status !== 'ACCEPTED') {
      const prob = problems.find((p) => p.id === sub.problemId);
      history.push({
        id: `sub-${sub.id}`,
        type: 'PROBLEM_ATTEMPTED',
        title: `Attempted ${prob?.title || 'Algorithmic Problem'}`,
        detail: `Submission recorded with verdict: ${sub.status.replace(/_/g, ' ')}.`,
        timestamp: sub.createdAt,
        badge: sub.status,
      });
    }
  }

  // Assessment Attempts
  for (const a of company.assessments) {
    for (const att of a.attempts) {
      history.push({
        id: `att-${att.id}`,
        type: 'ASSESSMENT_COMPLETED',
        title: `Online Assessment: ${a.title}`,
        detail: `Scored ${att.scorePct}% (${att.totalScore}/${att.maxPossibleScore} marks) • ${att.passed ? 'Benchmark Passed' : 'Below Passing Score'}.`,
        timestamp: att.createdAt,
        badge: `${att.scorePct}%`,
      });
    }
  }

  // Quiz Attempts
  for (const q of coreCsQuizzes) {
    const attempts = allQuizAttempts.filter((qa) => qa.quizId === q.id);
    for (const att of attempts) {
      history.push({
        id: `qa-${att.id}`,
        type: 'QUIZ_ATTEMPTED',
        title: `Core CS Quiz: ${q.title}`,
        detail: `Scored ${att.scorePct}% (${att.correctQs}/${att.totalQs} correct) in ${q.subjectTitle}.`,
        timestamp: att.completedAt,
        badge: `${att.scorePct}%`,
      });
    }
  }

  // Sort history chronologically descending
  history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    logoUrl: company.logoUrl,
    tier: getCompanyTier(company.slug),
    description: company.description,
    websiteUrl: company.websiteUrl,
    isTarget,
    patterns: company.patterns.map((p) => ({
      id: p.id,
      patternName: p.patternName,
      frequencyPct: p.frequencyPct,
      veracity: p.veracity,
      lastVerifiedAt: p.lastVerifiedAt,
    })),
    dsa: {
      totalCount: totalDsaCount,
      solvedCount: solvedDsaCount,
      attemptedCount: attemptedDsaCount,
      coveragePct: dsaCoveragePct,
      easySolved,
      easyTotal,
      mediumSolved,
      mediumTotal,
      hardSolved,
      hardTotal,
      problems,
    },
    coreCs: {
      hasMapping: hasCoreCSMapping,
      totalQuizzes: coreCsQuizzes.length,
      passedQuizzes: passedCoreCsCount,
      quizzes: coreCsQuizzes,
    },
    assessments: {
      hasAssessments: totalAssessments > 0,
      totalCount: totalAssessments,
      passedCount: passedAssessments,
      items: assessmentDetails,
    },
    revision: {
      hasScheduled: revisionItems.length > 0,
      totalScheduled: revisionItems.length,
      dueCount: dueRevisionsCount,
      items: revisionItems,
    },
    coverage: {
      totalItems,
      completedItems,
      remainingItems,
      coveragePct: overallCoveragePct,
      status: preparationStatus,
    },
    checklist,
    history: history.slice(0, 10),
  };
});
