// ============================================================================
// PREPOS INTERVIEW PREPARATION & PRACTICE WORKSPACE SERVICE
// Deterministic Aggregations of Real Practice Items, Mistakes & Readiness
// ============================================================================

import prisma from '../db';
import { getCompanyCatalogData } from './companies';
import { getProblemDetailData } from './dsa-roadmap';
import { calculatePRS } from './readiness-score';

// ----------------------------------------------------------------------------
// DATA TYPES & INTERFACES
// ----------------------------------------------------------------------------

export type InterviewPracticeCategory = 'DSA' | 'CORE_CS' | 'COMPANY' | 'SYSTEM_DESIGN';
export type InterviewPracticeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type InterviewPracticeSource = 'DSA_CURRICULUM' | 'CORE_CS_DIAGNOSTIC' | 'COMPANY_PATTERN' | 'MOCK_ASSESSMENT';

export interface InterviewPracticeItem {
  id: string;
  slug: string;
  title: string;
  category: InterviewPracticeCategory;
  topic: string;
  difficulty: InterviewPracticeDifficulty;
  companyNames: string[];
  source: InterviewPracticeSource;
  isSolved: boolean;
  isAttempted: boolean;
  isBookmarked: boolean;
  needsReview: boolean;
  lastAttemptDate: string | null;
  lastStatus: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'FAILED' | 'PASSED' | null;
  practiceUrl: string;
  revisionDueAt: string | null;
  expectedTimeMin: number;
}

export interface InterviewModeInfo {
  id: 'DSA' | 'CORE_CS' | 'COMPANY' | 'MISTAKES' | 'REVIEW';
  title: string;
  subtitle: string;
  description: string;
  availableCount: number;
  completedCount: number;
  coveragePct: number;
  badge: string;
  isRecommended: boolean;
  ctaUrl: string;
}

export interface InterviewMistakeItem {
  id: string;
  title: string;
  category: 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'REVISION';
  topic: string;
  companyName: string | null;
  difficulty: InterviewPracticeDifficulty;
  source: string;
  errorType: string;
  failedAt: string;
  daysAgo: number;
  practiceUrl: string;
  problemId?: string;
  canAddToRevision: boolean;
  isInRevisionQueue: boolean;
}

export interface CompanyInterviewPrepItem {
  companyId: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  tier: string;
  isTarget: boolean;
  mappedProblemsCount: number;
  solvedProblemsCount: number;
  coveragePct: number;
  patterns: string[];
  hasAssessments: boolean;
  hasCoreCS: boolean;
  hubUrl: string;
}

export interface InterviewDashboardSummary {
  sessionsCompleted: number;
  questionsPracticed: number;
  recentMistakesCount: number;
  topicsRequiringReviewCount: number;
  targetCompanyCoveragePct: number;
  revisionItemsCount: number;
  studyStreakDays: number;
  totalCatalogCount: number;
  solvedCatalogCount: number;
}

export interface InterviewHistoryEvent {
  id: string;
  type: 'PRACTICE_COMPLETED' | 'DSA_SUBMISSION' | 'QUIZ_ATTEMPT' | 'ASSESSMENT_ATTEMPT' | 'REVISION_REVIEW' | 'BOOKMARK_TOGGLED';
  title: string;
  description: string;
  timestamp: string;
  statusVariant: 'emerald' | 'rose' | 'blue' | 'amber' | 'purple' | 'slate';
  url: string;
}

export interface InterviewChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REMAINING' | 'NOT_AVAILABLE';
  evidence: string;
  ctaUrl: string;
  ctaLabel: string;
}

export interface InterviewWorkspaceData {
  summary: InterviewDashboardSummary;
  modes: InterviewModeInfo[];
  catalog: InterviewPracticeItem[];
  filters: {
    companies: string[];
    topics: string[];
    difficulties: string[];
    sources: string[];
  };
  mistakes: InterviewMistakeItem[];
  companyPrep: CompanyInterviewPrepItem[];
  checklist: InterviewChecklistItem[];
  history: InterviewHistoryEvent[];
}

export interface InterviewReadinessSummary {
  sessionsCompleted: number;
  recentMistakesCount: number;
  targetCompanyCoveragePct: number;
  checklistCompletedCount: number;
  checklistTotalCount: number;
  interviewStatus: 'READY' | 'SUBSTANTIALLY_READY' | 'ACTION_REQUIRED';
  ctaUrl: string;
}

// ----------------------------------------------------------------------------
// MAIN WORKSPACE AGGREGATOR
// ----------------------------------------------------------------------------

export async function getInterviewWorkspaceData(userId: string): Promise<InterviewWorkspaceData> {
  const now = new Date();

  // Run database queries in parallel for high performance
  const [
    profile,
    userProgress,
    bookmarks,
    revisions,
    recentSubmissions,
    recentQuizAttempts,
    recentAssessmentAttempts,
    progressEvents,
    rawProblems,
    rawQuizzes,
    companyCatalog,
    dossierSnapshots,
  ] = await Promise.all([
    // 1. Candidate profile
    prisma.profile.findUnique({
      where: { userId },
      select: { streakDays: true, targetDegree: true, gradYear: true },
    }),

    // 2. User Problem Progress
    prisma.userProgress.findMany({
      where: { userId },
      select: {
        problemId: true,
        isSolved: true,
        attemptsCnt: true,
        solvedAt: true,
      },
    }),

    // 3. User Bookmarks
    prisma.bookmark.findMany({
      where: { userId },
      select: { problemId: true },
    }),

    // 4. User Revisions
    prisma.revision.findMany({
      where: { userId },
      select: {
        id: true,
        problemId: true,
        confidence: true,
        intervalDays: true,
        dueAt: true,
        completedAt: true,
      },
    }),

    // 5. Recent Submissions (for mistakes & history)
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        id: true,
        problemId: true,
        status: true,
        executionTime: true,
        createdAt: true,
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            topic: { select: { title: true } },
            companyProblems: {
              take: 1,
              select: { company: { select: { name: true } } },
            },
          },
        },
      },
    }),

    // 6. Recent Quiz Attempts (Core CS)
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        quizId: true,
        scorePct: true,
        totalQs: true,
        correctQs: true,
        completedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
            subject: { select: { title: true } },
          },
        },
      },
    }),

    // 7. Recent Assessment Attempts
    prisma.assessmentAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 15,
      select: {
        id: true,
        assessmentId: true,
        status: true,
        scorePct: true,
        passed: true,
        startedAt: true,
        assessment: {
          select: {
            id: true,
            title: true,
            slug: true,
            company: { select: { name: true } },
          },
        },
      },
    }),

    // 8. Progress Events (interview practice sessions, etc.)
    prisma.progressEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        eventType: true,
        metadata: true,
        createdAt: true,
      },
    }),

    // 9. Catalog Problems (published)
    prisma.problem.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        expectedTimeComplexity: true,
        topic: { select: { id: true, title: true, slug: true } },
        companyProblems: {
          select: { company: { select: { name: true, slug: true } } },
        },
      },
    }),

    // 10. Core CS Quizzes
    prisma.coreCSQuiz.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        durationMin: true,
        totalQuestions: true,
        subject: { select: { id: true, title: true, slug: true } },
      },
    }),

    // 11. Company catalog
    getCompanyCatalogData(userId),

    // 12. Placement Dossiers
    prisma.dossierSnapshot.findMany({
      where: { userId },
      take: 1,
      orderBy: { createdAt: 'desc' },
      select: { id: true, dossierId: true },
    }),
  ]);

  // Index user progress and bookmarks for O(1) lookup
  const solvedProblemIds = new Set<string>();
  const attemptedProblemIds = new Set<string>();
  const lastAttemptDates = new Map<string, string>();

  for (const up of userProgress) {
    if (up.isSolved) solvedProblemIds.add(up.problemId);
    if (up.attemptsCnt > 0) attemptedProblemIds.add(up.problemId);
    if (up.solvedAt) lastAttemptDates.set(up.problemId, up.solvedAt.toLocaleDateString());
  }

  const bookmarkedProblemIds = new Set(bookmarks.map((b) => b.problemId));
  const revisionByProblemId = new Map(revisions.map((r) => [r.problemId, r]));

  // Index last submission status by problem
  const lastSubmissionStatusByProb = new Map<string, 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR'>();
  for (const s of recentSubmissions) {
    if (!lastSubmissionStatusByProb.has(s.problemId)) {
      lastSubmissionStatusByProb.set(s.problemId, s.status as any);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 1: INTERVIEW PRACTICE CATALOG
  // --------------------------------------------------------------------------
  const catalog: InterviewPracticeItem[] = [];
  const companiesFilterSet = new Set<string>();
  const topicsFilterSet = new Set<string>();
  const difficultiesFilterSet = new Set<string>(['EASY', 'MEDIUM', 'HARD']);
  const sourcesFilterSet = new Set<string>([
    'DSA_CURRICULUM',
    'CORE_CS_DIAGNOSTIC',
    'COMPANY_PATTERN',
    'MOCK_ASSESSMENT',
  ]);

  // Add DSA Problems to Catalog
  for (const p of rawProblems) {
    const isSolved = solvedProblemIds.has(p.id);
    const isAttempted = attemptedProblemIds.has(p.id);
    const isBookmarked = bookmarkedProblemIds.has(p.id);
    const revision = revisionByProblemId.get(p.id);
    const isOverdue = revision ? new Date(revision.dueAt) <= now : false;
    const needsReview = isOverdue || (revision && (revision.confidence === 'AGAIN' || revision.confidence === 'HARD')) || false;
    const companyNames = p.companyProblems.map((cp) => cp.company.name);

    companyNames.forEach((c) => companiesFilterSet.add(c));
    topicsFilterSet.add(p.topic.title);

    const lastStatus = lastSubmissionStatusByProb.get(p.id) || (isSolved ? 'ACCEPTED' : null);

    catalog.push({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: 'DSA',
      topic: p.topic.title,
      difficulty: p.difficulty as InterviewPracticeDifficulty,
      companyNames,
      source: companyNames.length > 0 ? 'COMPANY_PATTERN' : 'DSA_CURRICULUM',
      isSolved,
      isAttempted,
      isBookmarked,
      needsReview,
      lastAttemptDate: lastAttemptDates.get(p.id) || null,
      lastStatus,
      practiceUrl: `/dashboard/interview/session/${p.slug}`,
      revisionDueAt: revision?.dueAt ? revision.dueAt.toISOString() : null,
      expectedTimeMin: p.difficulty === 'EASY' ? 15 : p.difficulty === 'MEDIUM' ? 30 : 45,
    });
  }

  // Add Core CS Quizzes to Catalog
  for (const q of rawQuizzes) {
    const quizAttempts = recentQuizAttempts.filter((qa) => qa.quizId === q.id);
    const isAttempted = quizAttempts.length > 0;
    const bestScore = isAttempted ? Math.max(...quizAttempts.map((qa) => qa.scorePct)) : 0;
    const isSolved = bestScore >= 70;
    const needsReview = isAttempted && bestScore < 70;

    topicsFilterSet.add(q.subject.title);

    catalog.push({
      id: q.id,
      slug: q.slug,
      title: `${q.title} Diagnostic`,
      category: 'CORE_CS',
      topic: q.subject.title,
      difficulty: 'MEDIUM',
      companyNames: [],
      source: 'CORE_CS_DIAGNOSTIC',
      isSolved,
      isAttempted,
      isBookmarked: false,
      needsReview,
      lastAttemptDate: quizAttempts[0]?.completedAt ? quizAttempts[0].completedAt.toLocaleDateString() : null,
      lastStatus: isAttempted ? (isSolved ? 'PASSED' : 'FAILED') : null,
      practiceUrl: '/dashboard/core-cs',
      revisionDueAt: null,
      expectedTimeMin: q.durationMin,
    });
  }

  // --------------------------------------------------------------------------
  // SECTION 2: INTERVIEW MODES
  // --------------------------------------------------------------------------
  const dsaCatalog = catalog.filter((i) => i.category === 'DSA');
  const dsaSolvedCount = dsaCatalog.filter((i) => i.isSolved).length;
  const dsaCoveragePct = Math.round((dsaSolvedCount / Math.max(1, dsaCatalog.length)) * 100);

  const coreCsCatalog = catalog.filter((i) => i.category === 'CORE_CS');
  const coreCsSolvedCount = coreCsCatalog.filter((i) => i.isSolved).length;
  const coreCsCoveragePct = Math.round((coreCsSolvedCount / Math.max(1, coreCsCatalog.length)) * 100);

  const companyProblems = dsaCatalog.filter((i) => i.companyNames.length > 0);
  const companyProblemsSolved = companyProblems.filter((i) => i.isSolved).length;
  const companyCoveragePct = Math.round((companyProblemsSolved / Math.max(1, companyProblems.length)) * 100);

  // --------------------------------------------------------------------------
  // SECTION 3: MISTAKE REVIEW ENGINE
  // --------------------------------------------------------------------------
  const mistakes: InterviewMistakeItem[] = [];
  const recordedMistakeIds = new Set<string>();

  // 1. DSA Submission Mistakes (non-ACCEPTED)
  for (const s of recentSubmissions) {
    if (s.status !== 'ACCEPTED' && !recordedMistakeIds.has(`sub-${s.problemId}`)) {
      recordedMistakeIds.add(`sub-${s.problemId}`);
      const daysAgo = Math.max(0, Math.floor((now.getTime() - s.createdAt.getTime()) / 86400000));
      const hasRevision = revisionByProblemId.has(s.problemId);

      mistakes.push({
        id: `mistake-sub-${s.id}`,
        title: s.problem.title,
        category: 'DSA',
        topic: s.problem.topic.title,
        companyName: s.problem.companyProblems[0]?.company.name || null,
        difficulty: s.problem.difficulty as InterviewPracticeDifficulty,
        source: 'DSA Submission',
        errorType: s.status.replace('_', ' '),
        failedAt: s.createdAt.toLocaleDateString(),
        daysAgo,
        practiceUrl: `/dashboard/interview/session/${s.problem.slug}`,
        problemId: s.problemId,
        canAddToRevision: !hasRevision,
        isInRevisionQueue: hasRevision,
      });
    }
  }

  // 2. Core CS Quiz Mistakes (< 70% score)
  for (const q of recentQuizAttempts) {
    if (q.scorePct < 70 && !recordedMistakeIds.has(`quiz-${q.quizId}`)) {
      recordedMistakeIds.add(`quiz-${q.quizId}`);
      const daysAgo = Math.max(0, Math.floor((now.getTime() - q.completedAt.getTime()) / 86400000));

      mistakes.push({
        id: `mistake-quiz-${q.id}`,
        title: q.quiz.title,
        category: 'CORE_CS',
        topic: q.quiz.subject.title,
        companyName: null,
        difficulty: 'MEDIUM',
        source: 'Core CS Diagnostic',
        errorType: `Score: ${q.scorePct}% (Benchmark: 70%)`,
        failedAt: q.completedAt.toLocaleDateString(),
        daysAgo,
        practiceUrl: '/dashboard/core-cs',
        canAddToRevision: false,
        isInRevisionQueue: false,
      });
    }
  }

  // 3. Failed Assessment Attempts
  for (const a of recentAssessmentAttempts) {
    if (!a.passed && a.status === 'EVALUATED' && !recordedMistakeIds.has(`oa-${a.assessmentId}`)) {
      recordedMistakeIds.add(`oa-${a.assessmentId}`);
      const daysAgo = Math.max(0, Math.floor((now.getTime() - a.startedAt.getTime()) / 86400000));

      mistakes.push({
        id: `mistake-oa-${a.id}`,
        title: a.assessment.title,
        category: 'ASSESSMENT',
        topic: 'Timed Assessment',
        companyName: a.assessment.company?.name || null,
        difficulty: 'HARD',
        source: 'Mock OA Simulation',
        errorType: `Score: ${a.scorePct}% (Passing threshold not met)`,
        failedAt: a.startedAt.toLocaleDateString(),
        daysAgo,
        practiceUrl: `/dashboard/assessments/${a.assessmentId}`,
        canAddToRevision: false,
        isInRevisionQueue: false,
      });
    }
  }

  // 4. Overdue Revisions
  for (const r of revisions) {
    if (new Date(r.dueAt) <= now && !recordedMistakeIds.has(`rev-${r.problemId}`)) {
      recordedMistakeIds.add(`rev-${r.problemId}`);
      const prob = rawProblems.find((p) => p.id === r.problemId);
      if (prob) {
        const daysAgo = Math.max(0, Math.floor((now.getTime() - new Date(r.dueAt).getTime()) / 86400000));
        mistakes.push({
          id: `mistake-rev-${r.id}`,
          title: prob.title,
          category: 'REVISION',
          topic: prob.topic.title,
          companyName: prob.companyProblems[0]?.company.name || null,
          difficulty: prob.difficulty as InterviewPracticeDifficulty,
          source: 'Spaced Recall Queue',
          errorType: `Overdue by ${daysAgo} day${daysAgo === 1 ? '' : 's'}`,
          failedAt: new Date(r.dueAt).toLocaleDateString(),
          daysAgo,
          practiceUrl: `/dashboard/interview/session/${prob.slug}`,
          problemId: prob.id,
          canAddToRevision: false,
          isInRevisionQueue: true,
        });
      }
    }
  }

  // Sort mistakes by recency (daysAgo ascending)
  mistakes.sort((a, b) => a.daysAgo - b.daysAgo);

  const reviewItemsCount = catalog.filter((i) => i.needsReview || i.isBookmarked).length;

  const modes: InterviewModeInfo[] = [
    {
      id: 'DSA',
      title: 'DSA Technical Interview Practice',
      subtitle: 'Algorithmic Problem Solving',
      description: 'Practice high-frequency interview coding challenges across core algorithmic patterns.',
      availableCount: dsaCatalog.length,
      completedCount: dsaSolvedCount,
      coveragePct: dsaCoveragePct,
      badge: 'Coding Round',
      isRecommended: dsaSolvedCount < 5,
      ctaUrl: '#catalog',
    },
    {
      id: 'CORE_CS',
      title: 'Core CS Technical Screening',
      subtitle: 'OS, DBMS, Networks & Architecture',
      description: 'Test foundational computer science concepts required for placement interviews.',
      availableCount: coreCsCatalog.length,
      completedCount: coreCsSolvedCount,
      coveragePct: coreCsCoveragePct,
      badge: 'Technical Screening',
      isRecommended: coreCsCoveragePct < 70,
      ctaUrl: '/dashboard/core-cs',
    },
    {
      id: 'COMPANY',
      title: 'Target Company Track Practice',
      subtitle: 'Company-Specific Questions',
      description: 'Practice verified interview patterns from Tier-1 recruiters and target employers.',
      availableCount: companyProblems.length,
      completedCount: companyProblemsSolved,
      coveragePct: companyCoveragePct,
      badge: 'Company Focus',
      isRecommended: companyCatalog.totalTargetCount > 0 && companyCoveragePct < 60,
      ctaUrl: '#company-prep',
    },
    {
      id: 'MISTAKES',
      title: 'Mistake-Based Interview Drills',
      subtitle: 'Unresolved Deficits & Failed Attempts',
      description: 'Review and conquer questions where test cases failed or benchmarks were missed.',
      availableCount: mistakes.length,
      completedCount: mistakes.filter((m) => solvedProblemIds.has(m.problemId || '')).length,
      coveragePct: mistakes.length > 0 ? Math.round((mistakes.filter((m) => solvedProblemIds.has(m.problemId || '')).length / mistakes.length) * 100) : 100,
      badge: `${mistakes.length} Identified`,
      isRecommended: mistakes.length > 0,
      ctaUrl: '#mistakes',
    },
    {
      id: 'REVIEW',
      title: 'Technical Review & Recall',
      subtitle: 'Active Spaced Repetition Queue',
      description: 'Reinforce bookmarked concepts and due active recall items to retain interview mastery.',
      availableCount: reviewItemsCount,
      completedCount: revisions.filter((r) => r.completedAt).length,
      coveragePct: revisions.length > 0 ? Math.round((revisions.filter((r) => r.completedAt).length / revisions.length) * 100) : 0,
      badge: 'Spaced Recall',
      isRecommended: reviewItemsCount > 0,
      ctaUrl: '/dashboard/revision',
    },
  ];

  // --------------------------------------------------------------------------
  // SECTION 4: COMPANY INTERVIEW PREPARATION
  // --------------------------------------------------------------------------
  const companyPrep: CompanyInterviewPrepItem[] = companyCatalog.companies.map((c) => ({
    companyId: c.id,
    slug: c.slug,
    name: c.name,
    logoUrl: c.logoUrl,
    tier: c.tier,
    isTarget: c.isTarget,
    mappedProblemsCount: c.mappedProblemsCount,
    solvedProblemsCount: c.solvedProblemsCount,
    coveragePct: c.coveragePct,
    patterns: c.topPattern ? [c.topPattern] : [],
    hasAssessments: c.hasAssessments,
    hasCoreCS: c.hasCoreCS,
    hubUrl: `/dashboard/companies/${c.slug}`,
  }));

  // Sort target companies first
  companyPrep.sort((a, b) => {
    if (a.isTarget && !b.isTarget) return -1;
    if (!a.isTarget && b.isTarget) return 1;
    return b.coveragePct - a.coveragePct;
  });

  // --------------------------------------------------------------------------
  // SECTION 5: INTERVIEW CHECKLIST (7 Verifiable Conditions)
  // --------------------------------------------------------------------------
  const practiceCompletedEvents = progressEvents.filter(
    (pe) => pe.eventType === 'INTERVIEW_PRACTICE_COMPLETED' || pe.eventType === 'PROBLEM_SOLVED'
  );
  const totalPracticeSessions = practiceCompletedEvents.length;

  const hasDossier = dossierSnapshots.length > 0;
  const overdueRevisionCount = revisions.filter((r) => new Date(r.dueAt) <= now).length;
  const passedOaCount = recentAssessmentAttempts.filter((a) => a.passed).length;
  const passedCoreCsCount = recentQuizAttempts.filter((q) => q.scorePct >= 70).length;

  const checklist: InterviewChecklistItem[] = [
    {
      id: 'chk-company-coverage',
      label: 'Target-Company DSA Coverage Reviewed',
      description: 'Solved or practiced algorithmic questions mapped to target recruiters.',
      status: companyProblemsSolved >= 3 ? 'COMPLETED' : companyProblemsSolved > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${companyProblemsSolved} of ${companyProblems.length} company problems solved (${companyCoveragePct}%)`,
      ctaUrl: '/dashboard/companies',
      ctaLabel: 'Company Hubs',
    },
    {
      id: 'chk-core-cs-benchmark',
      label: 'Core CS 70% Technical Benchmark Cleared',
      description: 'Passed foundational computer science diagnostic screening quizzes.',
      status: passedCoreCsCount >= 1 ? 'COMPLETED' : recentQuizAttempts.length > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${passedCoreCsCount} passed diagnostics (${coreCsCoveragePct}% coverage)`,
      ctaUrl: '/dashboard/core-cs',
      ctaLabel: 'Core CS Hub',
    },
    {
      id: 'chk-mock-oa',
      label: 'Timed Mock Assessment Attempted',
      description: 'Completed a simulated online assessment under authentic exam timer constraints.',
      status: passedOaCount >= 1 ? 'COMPLETED' : recentAssessmentAttempts.length > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${recentAssessmentAttempts.length} attempts recorded, ${passedOaCount} cleared`,
      ctaUrl: '/dashboard/assessments',
      ctaLabel: 'Assessments',
    },
    {
      id: 'chk-mistakes-reviewed',
      label: 'Recent Interview Mistakes Reviewed',
      description: 'Addressed failed submissions and scheduled weak concepts into revision.',
      status: mistakes.length === 0 ? 'COMPLETED' : mistakes.some((m) => m.isInRevisionQueue) ? 'IN_PROGRESS' : 'REMAINING',
      evidence: mistakes.length === 0 ? 'Zero outstanding mistakes recorded' : `${mistakes.length} mistakes identified for review`,
      ctaUrl: '#mistakes',
      ctaLabel: 'Review Mistakes',
    },
    {
      id: 'chk-revision-current',
      label: 'Active Spaced Revision Queue Current',
      description: 'Zero overdue active recall items in the daily SuperMemo SM-2 queue.',
      status: overdueRevisionCount === 0 && revisions.length > 0 ? 'COMPLETED' : overdueRevisionCount > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${overdueRevisionCount} overdue items, ${revisions.length} total scheduled`,
      ctaUrl: '/dashboard/revision',
      ctaLabel: 'Revision Queue',
    },
    {
      id: 'chk-practice-session',
      label: 'Interview Practice Session Completed',
      description: 'Successfully completed dedicated interview problem-solving sessions.',
      status: totalPracticeSessions >= 1 ? 'COMPLETED' : 'REMAINING',
      evidence: `${totalPracticeSessions} practice sessions verified in audit history`,
      ctaUrl: '#catalog',
      ctaLabel: 'Start Practice',
    },
    {
      id: 'chk-placement-dossier',
      label: 'Placement Readiness Dossier Available',
      description: 'Official tamper-evident preparation dossier snapshot sealed in database.',
      status: hasDossier ? 'COMPLETED' : 'REMAINING',
      evidence: hasDossier ? `Dossier ${dossierSnapshots[0].dossierId} active` : 'No dossier snapshot generated',
      ctaUrl: '/dashboard/readiness/report',
      ctaLabel: 'Generate Dossier',
    },
  ];

  // --------------------------------------------------------------------------
  // SECTION 6: CHRONOLOGICAL ACTIVITY HISTORY
  // --------------------------------------------------------------------------
  const history: InterviewHistoryEvent[] = [];

  // Add Practice completed events
  for (const pe of progressEvents) {
    if (pe.eventType === 'INTERVIEW_PRACTICE_COMPLETED') {
      const meta = (typeof pe.metadata === 'object' && pe.metadata !== null) ? pe.metadata as any : {};
      history.push({
        id: `hist-pe-${pe.id}`,
        type: 'PRACTICE_COMPLETED',
        title: `Interview Practice: ${meta.title || meta.problemTitle || 'Challenge Session'}`,
        description: `Completed in ~${meta.durationSec ? Math.round(meta.durationSec / 60) : 15}m · Focus: Technical Practice`,
        timestamp: pe.createdAt.toISOString(),
        statusVariant: 'purple',
        url: meta.problemSlug ? `/dashboard/interview/session/${meta.problemSlug}` : '/dashboard/interview',
      });
    }
  }

  // Add DSA Submissions
  for (const s of recentSubmissions.slice(0, 10)) {
    history.push({
      id: `hist-sub-${s.id}`,
      type: 'DSA_SUBMISSION',
      title: `DSA Practice: ${s.problem.title}`,
      description: `Result: ${s.status.replace('_', ' ')} · Runtime: ${s.executionTime ? `${s.executionTime}ms` : 'N/A'}`,
      timestamp: s.createdAt.toISOString(),
      statusVariant: s.status === 'ACCEPTED' ? 'emerald' : 'rose',
      url: `/dashboard/interview/session/${s.problem.slug}`,
    });
  }

  // Add Core CS Quiz Attempts
  for (const q of recentQuizAttempts.slice(0, 8)) {
    const isPassed = q.scorePct >= 70;
    history.push({
      id: `hist-quiz-${q.id}`,
      type: 'QUIZ_ATTEMPT',
      title: `Diagnostic: ${q.quiz.title}`,
      description: `Score: ${q.scorePct}% · ${isPassed ? 'Benchmark Met (Pass)' : 'Below Benchmark'}`,
      timestamp: q.completedAt.toISOString(),
      statusVariant: isPassed ? 'blue' : 'amber',
      url: '/dashboard/core-cs',
    });
  }

  // Add Assessment Attempts
  for (const a of recentAssessmentAttempts.slice(0, 5)) {
    history.push({
      id: `hist-oa-${a.id}`,
      type: 'ASSESSMENT_ATTEMPT',
      title: `Assessment: ${a.assessment.title}`,
      description: `Score: ${a.scorePct}% · Status: ${a.status} (${a.passed ? 'Cleared' : 'Failed'})`,
      timestamp: a.startedAt.toISOString(),
      statusVariant: a.passed ? 'emerald' : 'slate',
      url: `/dashboard/assessments/${a.assessmentId}`,
    });
  }

  // Sort history chronologically descending
  history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // --------------------------------------------------------------------------
  // SECTION 7: DASHBOARD SUMMARY METRICS
  // --------------------------------------------------------------------------
  const distinctTopicsWithMistakes = new Set(mistakes.map((m) => m.topic)).size;
  const questionsPracticed = new Set([...solvedProblemIds, ...attemptedProblemIds]).size;

  const targetCompanies = companyPrep.filter((c) => c.isTarget);
  const targetCompanyCoveragePct =
    targetCompanies.length > 0
      ? Math.round(targetCompanies.reduce((acc, c) => acc + c.coveragePct, 0) / targetCompanies.length)
      : companyCatalog.overallCoveragePct;

  const summary: InterviewDashboardSummary = {
    sessionsCompleted: totalPracticeSessions,
    questionsPracticed,
    recentMistakesCount: mistakes.length,
    topicsRequiringReviewCount: distinctTopicsWithMistakes,
    targetCompanyCoveragePct,
    revisionItemsCount: revisions.length,
    studyStreakDays: profile?.streakDays || 0,
    totalCatalogCount: catalog.length,
    solvedCatalogCount: solvedProblemIds.size,
  };

  return {
    summary,
    modes,
    catalog,
    filters: {
      companies: Array.from(companiesFilterSet).sort(),
      topics: Array.from(topicsFilterSet).sort(),
      difficulties: Array.from(difficultiesFilterSet),
      sources: Array.from(sourcesFilterSet),
    },
    mistakes,
    companyPrep,
    checklist,
    history,
  };
}

// ----------------------------------------------------------------------------
// INTERVIEW READINESS SUMMARY (For /dashboard/readiness Integration)
// ----------------------------------------------------------------------------

export async function getInterviewReadinessSummary(userId: string): Promise<InterviewReadinessSummary> {
  const data = await getInterviewWorkspaceData(userId);
  const checklistCompleted = data.checklist.filter((c) => c.status === 'COMPLETED').length;
  const checklistTotal = data.checklist.length;

  const interviewStatus: 'READY' | 'SUBSTANTIALLY_READY' | 'ACTION_REQUIRED' =
    checklistCompleted >= 6 ? 'READY' : checklistCompleted >= 3 ? 'SUBSTANTIALLY_READY' : 'ACTION_REQUIRED';

  return {
    sessionsCompleted: data.summary.sessionsCompleted,
    recentMistakesCount: data.summary.recentMistakesCount,
    targetCompanyCoveragePct: data.summary.targetCompanyCoveragePct,
    checklistCompletedCount: checklistCompleted,
    checklistTotalCount: checklistTotal,
    interviewStatus,
    ctaUrl: '/dashboard/interview',
  };
}

// ----------------------------------------------------------------------------
// SESSION DATA LOADER (Distraction-Free Interview Workspace)
// ----------------------------------------------------------------------------

export async function getInterviewSessionData(userId: string, problemSlug: string) {
  // Reuses existing authoritative problem data service without duplicating question content
  const baseProblemData = await getProblemDetailData(userId, problemSlug);
  if (!baseProblemData) {
    return null;
  }

  // Fetch recent interview practice attempts and candidate bookmark state
  const [bookmark, revision, recentSubmissions] = await Promise.all([
    prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: baseProblemData.problem.id,
        },
      },
    }),
    prisma.revision.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: baseProblemData.problem.id,
        },
      },
    }),
    prisma.submission.findMany({
      where: {
        userId,
        problemId: baseProblemData.problem.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        executionTime: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    problem: baseProblemData.problem,
    userState: {
      ...baseProblemData.userState,
      isBookmarked: Boolean(bookmark),
      isInRevision: Boolean(revision),
      revisionConfidence: revision?.confidence || null,
      recentAttempts: recentSubmissions.map((s) => ({
        id: s.id,
        status: s.status,
        executionTime: s.executionTime,
        date: s.createdAt.toLocaleDateString(),
      })),
    },
  };
}

// ----------------------------------------------------------------------------
// ADD PROBLEM TO REVISION QUEUE (Mistake-to-Revision Server Helper)
// ----------------------------------------------------------------------------

export async function addProblemToRevisionQueue(userId: string, problemId: string): Promise<boolean> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.revision.upsert({
    where: {
      userId_problemId: {
        userId,
        problemId,
      },
    },
    update: {
      confidence: 'AGAIN',
      intervalDays: 1,
      dueAt: tomorrow,
    },
    create: {
      userId,
      problemId,
      confidence: 'AGAIN',
      intervalDays: 1,
      dueAt: tomorrow,
    },
  });

  // Trigger PRS recalculation
  await calculatePRS(userId).catch(() => null);

  return true;
}
