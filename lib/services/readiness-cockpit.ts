// ============================================================================
// PREPOS PLACEMENT READINESS COCKPIT SERVICE
// Authoritative Multi-Dimensional Readiness Analytics, Insights & Milestones
// ============================================================================

import prisma from '../db';
import { getReadinessScore, PRSComponents } from './readiness-score';

export interface ReadinessDimensionData {
  name: string;
  key: 'DSA' | 'CORE_CS' | 'COMPANY' | 'ASSESSMENT' | 'REVISION';
  status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL_GAP';
  score: number; // 0 - 100
  metricLabel: string;
  completedActivity: number;
  totalActivity: number;
  activityUnit: string;
  recentTrend: 'IMPROVING' | 'STEADY' | 'DECLINING' | 'INSUFFICIENT_DATA';
  lastActivityDate: string | null;
  ctaText: string;
  ctaUrl: string;
  highlights: string[];
}

export interface ReadinessInsight {
  id: string;
  category: 'DSA' | 'CORE_CS' | 'COMPANY' | 'ASSESSMENT' | 'REVISION' | 'PRS';
  severity: 'URGENT' | 'RECOMMENDED' | 'POSITIVE' | 'INFO';
  title: string;
  supportingMetric: string;
  whyItMatters: string;
  ctaText: string;
  ctaUrl: string;
}

export interface PriorityAction {
  id: string;
  category: 'ASSESSMENT' | 'REVISION' | 'DSA' | 'CORE_CS' | 'COMPANY';
  priorityOrder: number;
  title: string;
  rationale: string;
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
  badgeText: string;
  ctaText: string;
  ctaUrl: string;
}

export interface ReadinessMilestone {
  id: string;
  title: string;
  description: string;
  category: 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'REVISION' | 'CONSISTENCY';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  completedAt: string | null;
  currentProgress?: number;
  targetProgress?: number;
}

export interface ReadinessTrendData {
  prsHistory: Array<{ date: string; score: number }>;
  dsaSubmissions: Array<{ date: string; count: number }>;
  coreCsScores: Array<{ date: string; scorePct: number; quizTitle: string }>;
  assessmentScores: Array<{ date: string; scorePct: number; assessmentTitle: string }>;
  revisionConsistency: Array<{ date: string; count: number }>;
  hasSufficientHistory: boolean;
}

export interface PlacementReadinessCockpit {
  overallPRS: {
    score: number;
    tier: 'TIER_1_READY' | 'COMPETITIVE' | 'FOUNDATION_BUILDING' | 'EARLY_STAGE';
    tierLabel: string;
    dsaScore: number;
    coreCsScore: number;
    oaScore: number;
    consistencyScore: number;
    isBaselineOnly: boolean;
    completionPct: number;
    streakDays: number;
    lastUpdated: string | null;
  };
  dimensions: {
    dsa: ReadinessDimensionData & {
      solvedByDifficulty: { easy: number; medium: number; hard: number };
      totalByDifficulty: { easy: number; medium: number; hard: number };
      submissionSuccessRate: number;
      wrongAnswerCount: number;
      tleCount: number;
      topicCoverageCount: number;
      totalTopicsCount: number;
      companyTaggedSolved: number;
      companyTaggedTotal: number;
    };
    coreCs: ReadinessDimensionData & {
      quizAttemptsCount: number;
      avgScorePct: number;
      bestScorePct: number;
      subjectsAttempted: number;
      totalSubjects: number;
      missedConceptsCount: number;
    };
    company: ReadinessDimensionData & {
      targetCompanyName: string;
      targetCompanySlug: string;
      targetRoleTier: string;
      patternsCovered: number;
      totalPatterns: number;
      companyProblemsSolved: number;
      totalCompanyProblems: number;
    };
    assessment: ReadinessDimensionData & {
      attemptsCount: number;
      passedCount: number;
      avgScorePct: number;
      bestScorePct: number;
      hasUnfinishedAttempt: boolean;
      unfinishedAttemptUrl?: string;
    };
    revision: ReadinessDimensionData & {
      dueTodayCount: number;
      overdueCount: number;
      inScheduleCount: number;
      streakDays: number;
      retentionHealthPct: number;
    };
  };
  insights: ReadinessInsight[];
  priorityActions: PriorityAction[];
  trends: ReadinessTrendData;
  milestones: ReadinessMilestone[];
}

/**
 * Aggregates complete placement readiness cockpit intelligence for an authenticated student.
 */
export async function getPlacementReadinessCockpitData(
  userId: string
): Promise<PlacementReadinessCockpit> {
  const now = new Date();

  // Parallel fetch across authoritative database models with targeted projections
  const [
    prs,
    profile,
    prsHistory,
    userProgress,
    allProblems,
    allTopics,
    submissions,
    quizAttempts,
    allSubjects,
    missedQuizAnswers,
    assessmentAttempts,
    revisions,
    streakEvents,
    targetCompanyEvent,
    defaultCompany,
  ] = await Promise.all([
    // 1. Authoritative PRS Score
    getReadinessScore(userId),

    // 2. Student Profile Settings
    prisma.profile.findUnique({
      where: { userId },
      select: {
        gradYear: true,
        targetDegree: true,
        targetRoleTier: true,
        preferredLang: true,
        streakDays: true,
        updatedAt: true,
      },
    }),

    // 3. Historical PRS audit trail
    prisma.readinessScoreHistory.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
      take: 15,
      select: { score: true, recordedAt: true },
    }),

    // 4. DSA Solved Progress
    prisma.userProgress.findMany({
      where: { userId, isSolved: true },
      select: {
        problemId: true,
        solvedAt: true,
        problem: {
          select: {
            difficulty: true,
            topicId: true,
            companyProblems: { select: { companyId: true } },
          },
        },
      },
    }),

    // 5. Total Published Problems catalog
    prisma.problem.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        difficulty: true,
        topicId: true,
        companyProblems: { select: { companyId: true } },
      },
    }),

    // 6. Total Topics
    prisma.topic.findMany({
      select: { id: true, title: true },
    }),

    // 7. Recent Submissions for error pattern analysis
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        id: true,
        status: true,
        language: true,
        createdAt: true,
        problem: { select: { title: true, slug: true } },
      },
    }),

    // 8. Core CS Quiz Attempts
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        scorePct: true,
        correctQs: true,
        totalQs: true,
        completedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            subjectId: true,
            subject: { select: { title: true, slug: true } },
          },
        },
      },
    }),

    // 9. All Core CS Subjects
    prisma.coreCSSubject.findMany({
      select: { id: true, title: true, slug: true },
    }),

    // 10. Missed quiz answers for concept gap analysis
    prisma.quizAnswer.findMany({
      where: { attempt: { userId }, isCorrect: false },
      select: { question: { select: { questionText: true } } },
      take: 20,
    }),

    // 11. Mock Assessment Attempts
    prisma.assessmentAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 15,
      select: {
        id: true,
        status: true,
        totalScore: true,
        maxPossibleScore: true,
        scorePct: true,
        passed: true,
        startedAt: true,
        submittedAt: true,
        expiresAt: true,
        assessment: {
          select: { id: true, slug: true, title: true },
        },
      },
    }),

    // 12. Spaced Revision records
    prisma.revision.findMany({
      where: { userId },
      select: {
        id: true,
        intervalDays: true,
        dueAt: true,
        completedAt: true,
        confidence: true,
        problem: { select: { title: true, slug: true } },
      },
    }),

    // 13. Revision Streak Activity Events
    prisma.streakEvent.findMany({
      where: { userId, activityType: 'REVISION' },
      orderBy: { date: 'asc' },
      take: 14,
      select: { date: true, count: true },
    }),

    // 14. Target Company Event
    prisma.progressEvent.findFirst({
      where: { userId, eventType: 'TARGET_COMPANY_SET' },
      orderBy: { createdAt: 'desc' },
      select: { metadata: true },
    }),

    // 15. Default Company (Amazon or first registered company)
    prisma.company.findFirst({
      where: { slug: 'amazon' },
      select: { name: true, slug: true },
    }),
  ]);

  // Determine Target Company
  let targetCompanyName = defaultCompany?.name || 'Amazon';
  let targetCompanySlug = defaultCompany?.slug || 'amazon';

  if (targetCompanyEvent?.metadata) {
    try {
      const meta =
        typeof targetCompanyEvent.metadata === 'string'
          ? JSON.parse(targetCompanyEvent.metadata)
          : (targetCompanyEvent.metadata as any);
      if (meta?.companyName) targetCompanyName = meta.companyName;
      if (meta?.companySlug) targetCompanySlug = meta.companySlug;
    } catch {
      // Keep default
    }
  }

  // Fetch Target Company Patterns & Problems
  const [targetPatterns, targetProblems] = await Promise.all([
    prisma.companyPattern.findMany({
      where: { company: { slug: targetCompanySlug } },
      select: { id: true, patternName: true },
    }),
    prisma.companyProblem.findMany({
      where: { company: { slug: targetCompanySlug } },
      select: { problemId: true },
    }),
  ]);

  // --------------------------------------------------------------------------
  // A. DSA Dimension Analytics
  // --------------------------------------------------------------------------
  const solvedProblemIds = new Set(userProgress.map((p) => p.problemId));
  const solvedCount = solvedProblemIds.size;
  const totalProblemsCount = allProblems.length > 0 ? allProblems.length : 20;

  const solvedByDiff = { easy: 0, medium: 0, hard: 0 };
  const totalByDiff = { easy: 0, medium: 0, hard: 0 };

  for (const prob of allProblems) {
    const diff = prob.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    if (totalByDiff[diff] !== undefined) totalByDiff[diff]++;
    if (solvedProblemIds.has(prob.id) && solvedByDiff[diff] !== undefined) {
      solvedByDiff[diff]++;
    }
  }

  const acceptedSubmissions = submissions.filter((s) => s.status === 'ACCEPTED').length;
  const wrongAnswers = submissions.filter((s) => s.status === 'WRONG_ANSWER').length;
  const tles = submissions.filter((s) => s.status === 'TIME_LIMIT_EXCEEDED').length;
  const subSuccessRate =
    submissions.length > 0 ? Math.round((acceptedSubmissions / submissions.length) * 100) : 0;

  const topicsCovered = new Set(userProgress.map((p) => p.problem.topicId)).size;
  const totalTopicsCount = allTopics.length > 0 ? allTopics.length : 14;

  const companyTaggedProblems = allProblems.filter((p) => p.companyProblems.length > 0);
  const companyTaggedSolved = companyTaggedProblems.filter((p) => solvedProblemIds.has(p.id)).length;

  const lastDsaSubmission = submissions[0]?.createdAt
    ? new Date(submissions[0].createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const dsaDimensionStatus =
    prs.dsaScore >= 70
      ? 'EXCELLENT'
      : prs.dsaScore >= 40
      ? 'ON_TRACK'
      : prs.dsaScore >= 20
      ? 'ATTENTION_NEEDED'
      : 'CRITICAL_GAP';

  // --------------------------------------------------------------------------
  // B. Core CS Dimension Analytics
  // --------------------------------------------------------------------------
  const quizAttemptsCount = quizAttempts.length;
  const avgScorePct =
    quizAttemptsCount > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + q.scorePct, 0) / quizAttemptsCount)
      : 0;
  const bestScorePct =
    quizAttemptsCount > 0 ? Math.round(Math.max(...quizAttempts.map((q) => q.scorePct))) : 0;

  const subjectsAttempted = new Set(
    quizAttempts.map((q) => q.quiz.subjectId).filter(Boolean)
  ).size;
  const totalSubjectsCount = allSubjects.length > 0 ? allSubjects.length : 2;

  const lastCoreCsActivity = quizAttempts[0]?.completedAt
    ? new Date(quizAttempts[0].completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const coreCsDimensionStatus =
    prs.coreCsScore >= 75
      ? 'EXCELLENT'
      : prs.coreCsScore >= 50
      ? 'ON_TRACK'
      : prs.coreCsScore >= 25
      ? 'ATTENTION_NEEDED'
      : 'CRITICAL_GAP';

  // --------------------------------------------------------------------------
  // C. Company Preparation Dimension Analytics
  // --------------------------------------------------------------------------
  const targetProbIds = new Set(targetProblems.map((tp) => tp.problemId));
  const companyProbsSolved = Array.from(targetProbIds).filter((id) => solvedProblemIds.has(id)).length;
  const totalCompanyProbs = targetProblems.length > 0 ? targetProblems.length : 5;

  const patternsCount = targetPatterns.length > 0 ? targetPatterns.length : 4;
  const patternsCovered = Math.min(patternsCount, companyProbsSolved);

  const companyScore = Math.min(
    100,
    Math.round((companyProbsSolved / Math.max(1, totalCompanyProbs)) * 100)
  );

  const companyDimensionStatus =
    companyScore >= 70
      ? 'EXCELLENT'
      : companyScore >= 40
      ? 'ON_TRACK'
      : companyScore >= 20
      ? 'ATTENTION_NEEDED'
      : 'CRITICAL_GAP';

  // --------------------------------------------------------------------------
  // D. Mock Assessment Dimension Analytics
  // --------------------------------------------------------------------------
  const evaluatedAttempts = assessmentAttempts.filter((a) => a.status === 'EVALUATED');
  const evaluatedCount = evaluatedAttempts.length;
  const passedOaCount = evaluatedAttempts.filter((a) => a.passed).length;
  const avgOaScore =
    evaluatedCount > 0
      ? Math.round(evaluatedAttempts.reduce((acc, a) => acc + a.scorePct, 0) / evaluatedCount)
      : 0;
  const bestOaScore =
    evaluatedCount > 0 ? Math.round(Math.max(...evaluatedAttempts.map((a) => a.scorePct))) : 0;

  const unfinishedAttempt = assessmentAttempts.find(
    (a) => a.status === 'IN_PROGRESS' && a.expiresAt > now
  );

  const lastAssessmentActivity = assessmentAttempts[0]?.startedAt
    ? new Date(assessmentAttempts[0].startedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const assessmentDimensionStatus =
    prs.oaScore >= 70
      ? 'EXCELLENT'
      : prs.oaScore >= 40
      ? 'ON_TRACK'
      : prs.oaScore > 0
      ? 'ATTENTION_NEEDED'
      : 'CRITICAL_GAP';

  // --------------------------------------------------------------------------
  // E. Spaced Revision Dimension Analytics
  // --------------------------------------------------------------------------
  let dueTodayCount = 0;
  let overdueCount = 0;
  let completedRevs = 0;

  for (const rev of revisions) {
    if (rev.completedAt) {
      completedRevs++;
    } else if (new Date(rev.dueAt) <= now) {
      const diffDays = Math.floor((now.getTime() - new Date(rev.dueAt).getTime()) / 86400000);
      if (diffDays >= 1) {
        overdueCount++;
      } else {
        dueTodayCount++;
      }
    }
  }

  const inScheduleCount = revisions.length;
  const totalRevsScheduled = dueTodayCount + overdueCount + completedRevs;
  const retentionHealthPct =
    totalRevsScheduled > 0
      ? Math.max(0, Math.round(((completedRevs + dueTodayCount) / totalRevsScheduled) * 100))
      : 100;

  const lastRevisionActivity = revisions.find((r) => r.completedAt)?.completedAt
    ? new Date(revisions.find((r) => r.completedAt)!.completedAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const revisionDimensionStatus =
    overdueCount === 0 && dueTodayCount <= 2
      ? 'EXCELLENT'
      : overdueCount <= 2
      ? 'ON_TRACK'
      : overdueCount <= 5
      ? 'ATTENTION_NEEDED'
      : 'CRITICAL_GAP';

  // --------------------------------------------------------------------------
  // F. Overall PRS Tier & Classification
  // --------------------------------------------------------------------------
  let prsTier: PlacementReadinessCockpit['overallPRS']['tier'] = 'EARLY_STAGE';
  let tierLabel = 'Early Stage Preparation';

  if (prs.totalScore >= 75) {
    prsTier = 'TIER_1_READY';
    tierLabel = 'Tier-1 Recruiter Ready';
  } else if (prs.totalScore >= 50) {
    prsTier = 'COMPETITIVE';
    tierLabel = 'Competitive Placement Candidate';
  } else if (prs.totalScore >= 25) {
    prsTier = 'FOUNDATION_BUILDING';
    tierLabel = 'Foundation Building';
  }

  const completionPct = Math.round(
    ((solvedCount / totalProblemsCount) * 0.4 +
      (subjectsAttempted / totalSubjectsCount) * 0.3 +
      (evaluatedCount > 0 ? 1 : 0) * 0.15 +
      Math.min(1, (profile?.streakDays ?? 0) / 14) * 0.15) *
      100
  );

  const lastUpdated = prsHistory[prsHistory.length - 1]?.recordedAt
    ? new Date(prsHistory[prsHistory.length - 1].recordedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  // --------------------------------------------------------------------------
  // G. Deterministic Insights Engine
  // --------------------------------------------------------------------------
  const insights: ReadinessInsight[] = [];

  // 1. Unfinished active assessment
  if (unfinishedAttempt) {
    insights.push({
      id: 'insight-unfinished-oa',
      category: 'ASSESSMENT',
      severity: 'URGENT',
      title: 'Active Assessment In Progress',
      supportingMetric: '1 Unfinished OA Attempt',
      whyItMatters:
        'Your mock assessment timer is running. Complete your submission to record an official evaluation.',
      ctaText: 'Resume Assessment',
      ctaUrl: `/dashboard/assessments/${unfinishedAttempt.assessment.id}/attempt/${unfinishedAttempt.id}`,
    });
  }

  // 2. Spaced Revision backlog
  if (overdueCount > 0) {
    insights.push({
      id: 'insight-overdue-revisions',
      category: 'REVISION',
      severity: 'URGENT',
      title: 'Algorithmic Memory Decay Risk',
      supportingMetric: `${overdueCount} Overdue Recall Item${overdueCount > 1 ? 's' : ''}`,
      whyItMatters:
        'SM-2 interval dates have passed. Completing active recall prevents forgetting algorithmic edge cases.',
      ctaText: 'Review Queue',
      ctaUrl: '/dashboard/revision',
    });
  }

  // 3. DSA Execution vs Accuracy
  if (submissions.length >= 3 && subSuccessRate < 50) {
    insights.push({
      id: 'insight-dsa-accuracy',
      category: 'DSA',
      severity: 'RECOMMENDED',
      title: 'Edge Case & Execution Accuracy Gap',
      supportingMetric: `${subSuccessRate}% Submission Pass Rate (${wrongAnswers} WA, ${tles} TLE)`,
      whyItMatters:
        'Recruiters penalize multiple failed OA attempts. Test sample edge cases and constraints locally before submitting.',
      ctaText: 'Practice Coding Patterns',
      ctaUrl: '/dashboard/dsa',
    });
  } else if (solvedCount >= 5) {
    insights.push({
      id: 'insight-dsa-positive',
      category: 'DSA',
      severity: 'POSITIVE',
      title: 'Strong Algorithmic Velocity',
      supportingMetric: `${solvedCount} Verified Solved Problems`,
      whyItMatters:
        'You have established algorithmic problem-solving coverage across key placement modules.',
      ctaText: 'Continue DSA Roadmap',
      ctaUrl: '/dashboard/dsa',
    });
  }

  // 4. Core CS Benchmark
  if (quizAttemptsCount > 0 && avgScorePct < 70) {
    insights.push({
      id: 'insight-core-cs-gap',
      category: 'CORE_CS',
      severity: 'RECOMMENDED',
      title: 'Core CS Foundational Screening Gap',
      supportingMetric: `${avgScorePct}% Diagnostic Average (Benchmark: 70%)`,
      whyItMatters:
        'Technical rounds at product companies eliminate candidates on ACID properties, indexing, and OS paging.',
      ctaText: 'Take Core CS Drills',
      ctaUrl: '/dashboard/core-cs',
    });
  } else if (quizAttemptsCount === 0) {
    insights.push({
      id: 'insight-core-cs-unattempted',
      category: 'CORE_CS',
      severity: 'RECOMMENDED',
      title: 'Core CS Diagnostics Unstarted',
      supportingMetric: '0 Quizzes Completed',
      whyItMatters:
        'Validate DBMS and Operating Systems foundations to ensure high-percentile placement readiness.',
      ctaText: 'Start Core CS Drills',
      ctaUrl: '/dashboard/core-cs',
    });
  }

  // 5. Target Company Pattern Coverage
  if (companyScore < 50) {
    insights.push({
      id: 'insight-company-coverage',
      category: 'COMPANY',
      severity: 'RECOMMENDED',
      title: `${targetCompanyName} Pattern Coverage Gap`,
      supportingMetric: `${companyProbsSolved}/${totalCompanyProbs} Patterns Covered (${companyScore}%)`,
      whyItMatters:
        `Interviews at ${targetCompanyName} follow distinct recurring patterns like Sliding Window and Tree Traversal.`,
      ctaText: `Prepare ${targetCompanyName}`,
      ctaUrl: `/dashboard/companies/${targetCompanySlug}`,
    });
  }

  // 6. Trend data availability note
  if (prsHistory.length < 2) {
    insights.push({
      id: 'insight-trend-limited',
      category: 'PRS',
      severity: 'INFO',
      title: 'Readiness History Establishing',
      supportingMetric: `${prsHistory.length} Recorded Milestone`,
      whyItMatters:
        'As you solve more problems, complete quizzes, and record reviews, your multi-day readiness trajectory will materialize.',
      ctaText: 'Explore Dashboard',
      ctaUrl: '/dashboard',
    });
  }

  // --------------------------------------------------------------------------
  // H. Priority Action Plan (3 to 5 Deterministic Actions)
  // --------------------------------------------------------------------------
  const priorityActions: PriorityAction[] = [];
  let order = 1;

  if (unfinishedAttempt) {
    priorityActions.push({
      id: 'p-act-unfinished-oa',
      category: 'ASSESSMENT',
      priorityOrder: order++,
      title: `Resume ${unfinishedAttempt.assessment.title}`,
      rationale: 'Active exam attempt with active countdown timer.',
      urgency: 'HIGH',
      badgeText: 'Active Exam',
      ctaText: 'Resume Test',
      ctaUrl: `/dashboard/assessments/${unfinishedAttempt.assessment.id}/attempt/${unfinishedAttempt.id}`,
    });
  }

  if (overdueCount > 0 || dueTodayCount > 0) {
    priorityActions.push({
      id: 'p-act-revision',
      category: 'REVISION',
      priorityOrder: order++,
      title: `Review ${overdueCount > 0 ? `${overdueCount} Overdue Items` : `${dueTodayCount} Due Items`}`,
      rationale: 'SuperMemo SM-2 interval scheduled for active retrieval.',
      urgency: overdueCount > 0 ? 'HIGH' : 'MEDIUM',
      badgeText: overdueCount > 0 ? 'Overdue Recall' : 'Due Today',
      ctaText: 'Review Queue',
      ctaUrl: '/dashboard/revision',
    });
  }

  if (solvedCount < totalProblemsCount) {
    priorityActions.push({
      id: 'p-act-dsa',
      category: 'DSA',
      priorityOrder: order++,
      title: 'Practice Next Unsolved Algorithmic Pattern',
      rationale: `${totalProblemsCount - solvedCount} problems remaining on curated DSA Roadmap.`,
      urgency: 'NORMAL',
      badgeText: 'Curriculum',
      ctaText: 'Solve Problem',
      ctaUrl: '/dashboard/dsa',
    });
  }

  if (quizAttemptsCount === 0 || avgScorePct < 70) {
    priorityActions.push({
      id: 'p-act-core-cs',
      category: 'CORE_CS',
      priorityOrder: order++,
      title: 'Complete Core CS Technical Diagnostic',
      rationale: 'Benchmark Operating Systems and DBMS concepts.',
      urgency: 'MEDIUM',
      badgeText: 'Foundations',
      ctaText: 'Start Diagnostic',
      ctaUrl: '/dashboard/core-cs',
    });
  }

  if (companyScore < 60 && priorityActions.length < 5) {
    priorityActions.push({
      id: 'p-act-company',
      category: 'COMPANY',
      priorityOrder: order++,
      title: `Cover Target Patterns for ${targetCompanyName}`,
      rationale: `Target placement hub: ${companyProbsSolved}/${totalCompanyProbs} problems solved.`,
      urgency: 'NORMAL',
      badgeText: 'Recruiter Hub',
      ctaText: 'Open Hub',
      ctaUrl: `/dashboard/companies/${targetCompanySlug}`,
    });
  }

  // --------------------------------------------------------------------------
  // I. Readiness Milestones
  // --------------------------------------------------------------------------
  const milestones: ReadinessMilestone[] = [
    {
      id: 'm-first-dsa',
      title: 'First Verified Algorithmic Solution',
      description: 'Solve and submit code passing 100% of test cases in the Judge0 sandbox.',
      category: 'DSA',
      status: solvedCount >= 1 ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: userProgress[0]?.solvedAt
        ? new Date(userProgress[0].solvedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : null,
      currentProgress: Math.min(1, solvedCount),
      targetProgress: 1,
    },
    {
      id: 'm-dsa-momentum',
      title: 'Algorithmic Problem-Solving Momentum',
      description: 'Solve 5 verified algorithmic problems across core placement topics.',
      category: 'DSA',
      status: solvedCount >= 5 ? 'COMPLETED' : solvedCount > 0 ? 'IN_PROGRESS' : 'UPCOMING',
      completedAt: solvedCount >= 5 ? 'Completed' : null,
      currentProgress: Math.min(5, solvedCount),
      targetProgress: 5,
    },
    {
      id: 'm-core-cs-benchmark',
      title: 'Core CS Placement Benchmark (70%+)',
      description: 'Score 70% or higher on a Core CS subject diagnostic quiz.',
      category: 'CORE_CS',
      status: bestScorePct >= 70 ? 'COMPLETED' : quizAttemptsCount > 0 ? 'IN_PROGRESS' : 'UPCOMING',
      completedAt: bestScorePct >= 70 ? 'Benchmark Passed' : null,
      currentProgress: bestScorePct,
      targetProgress: 70,
    },
    {
      id: 'm-first-oa',
      title: 'Complete Timed Mock Assessment',
      description: 'Finish and submit a full timed Online Assessment simulation with automated scoring.',
      category: 'ASSESSMENT',
      status: evaluatedCount >= 1 ? 'COMPLETED' : unfinishedAttempt ? 'IN_PROGRESS' : 'UPCOMING',
      completedAt: evaluatedCount >= 1 ? 'Evaluation Recorded' : null,
      currentProgress: Math.min(1, evaluatedCount),
      targetProgress: 1,
    },
    {
      id: 'm-spaced-habit',
      title: 'Active Recall Habit Established',
      description: 'Review 3 or more spaced repetition items at scheduled SM-2 intervals.',
      category: 'REVISION',
      status: completedRevs >= 3 ? 'COMPLETED' : completedRevs > 0 ? 'IN_PROGRESS' : 'UPCOMING',
      completedAt: completedRevs >= 3 ? 'Recall Habit Active' : null,
      currentProgress: Math.min(3, completedRevs),
      targetProgress: 3,
    },
    {
      id: 'm-consistency-streak',
      title: '7-Day Continuous Study Rhythm',
      description: 'Maintain an active daily study streak of at least 7 consecutive days.',
      category: 'CONSISTENCY',
      status:
        (profile?.streakDays ?? 0) >= 7
          ? 'COMPLETED'
          : (profile?.streakDays ?? 0) > 0
          ? 'IN_PROGRESS'
          : 'UPCOMING',
      completedAt: (profile?.streakDays ?? 0) >= 7 ? '7-Day Streak Achieved' : null,
      currentProgress: Math.min(7, profile?.streakDays ?? 0),
      targetProgress: 7,
    },
  ];

  // --------------------------------------------------------------------------
  // J. Visual Trends Data
  // --------------------------------------------------------------------------
  const prsHistoryFormatted = prsHistory.map((h) => ({
    date: new Date(h.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.score,
  }));

  const dsaSubmissionsTrend = submissions.slice(0, 10).reverse().map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: s.status === 'ACCEPTED' ? 1 : 0,
  }));

  const coreCsTrend = quizAttempts.slice(0, 8).reverse().map((q) => ({
    date: new Date(q.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scorePct: Math.round(q.scorePct),
    quizTitle: q.quiz.title,
  }));

  const assessmentTrend = evaluatedAttempts.slice(0, 6).reverse().map((a) => ({
    date: new Date(a.submittedAt || a.startedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    scorePct: Math.round(a.scorePct),
    assessmentTitle: a.assessment.title,
  }));

  const revisionTrend = streakEvents.map((se) => ({
    date: new Date(se.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: se.count,
  }));

  const hasSufficientHistory = prsHistory.length >= 2 || quizAttempts.length >= 2 || evaluatedCount >= 1;

  return {
    overallPRS: {
      score: prs.totalScore,
      tier: prsTier,
      tierLabel,
      dsaScore: prs.dsaScore,
      coreCsScore: prs.coreCsScore,
      oaScore: prs.oaScore,
      consistencyScore: prs.consistencyScore,
      isBaselineOnly: prs.isBaselineOnly,
      completionPct,
      streakDays: profile?.streakDays ?? 0,
      lastUpdated,
    },
    dimensions: {
      dsa: {
        name: 'DSA Problem-Solving',
        key: 'DSA',
        status: dsaDimensionStatus,
        score: prs.dsaScore,
        metricLabel: `${solvedCount} / ${totalProblemsCount} solved`,
        completedActivity: solvedCount,
        totalActivity: totalProblemsCount,
        activityUnit: 'problems',
        recentTrend: submissions.length >= 2 ? (subSuccessRate >= 60 ? 'IMPROVING' : 'STEADY') : 'INSUFFICIENT_DATA',
        lastActivityDate: lastDsaSubmission,
        ctaText: 'Continue DSA Roadmap',
        ctaUrl: '/dashboard/dsa',
        highlights: [
          `${solvedByDiff.easy} Easy, ${solvedByDiff.medium} Medium, ${solvedByDiff.hard} Hard`,
          `${subSuccessRate}% submission acceptance rate`,
          `${topicsCovered}/${totalTopicsCount} core topics explored`,
        ],
        solvedByDifficulty: solvedByDiff,
        totalByDifficulty: totalByDiff,
        submissionSuccessRate: subSuccessRate,
        wrongAnswerCount: wrongAnswers,
        tleCount: tles,
        topicCoverageCount: topicsCovered,
        totalTopicsCount,
        companyTaggedSolved,
        companyTaggedTotal: companyTaggedProblems.length,
      },
      coreCs: {
        name: 'Core CS Foundations',
        key: 'CORE_CS',
        status: coreCsDimensionStatus,
        score: prs.coreCsScore,
        metricLabel: `${quizAttemptsCount} diagnostics completed`,
        completedActivity: subjectsAttempted,
        totalActivity: totalSubjectsCount,
        activityUnit: 'subjects',
        recentTrend: quizAttemptsCount >= 2 ? (avgScorePct >= 70 ? 'IMPROVING' : 'STEADY') : 'INSUFFICIENT_DATA',
        lastActivityDate: lastCoreCsActivity,
        ctaText: 'Practice Core CS Drills',
        ctaUrl: '/dashboard/core-cs',
        highlights: [
          `${avgScorePct}% average diagnostic score`,
          `${bestScorePct}% personal best score`,
          `${missedQuizAnswers.length} conceptual misses identified`,
        ],
        quizAttemptsCount,
        avgScorePct,
        bestScorePct,
        subjectsAttempted,
        totalSubjects: totalSubjectsCount,
        missedConceptsCount: missedQuizAnswers.length,
      },
      company: {
        name: 'Target Company Preparation',
        key: 'COMPANY',
        status: companyDimensionStatus,
        score: companyScore,
        metricLabel: `${companyProbsSolved} / ${totalCompanyProbs} patterns covered`,
        completedActivity: companyProbsSolved,
        totalActivity: totalCompanyProbs,
        activityUnit: 'patterns',
        recentTrend: companyProbsSolved > 0 ? 'IMPROVING' : 'STEADY',
        lastActivityDate: null,
        ctaText: `Prepare for ${targetCompanyName}`,
        ctaUrl: `/dashboard/companies/${targetCompanySlug}`,
        highlights: [
          `Target Recruiter: ${targetCompanyName}`,
          `Target Tier: ${profile?.targetRoleTier?.replace('_', ' ') || 'PRODUCT TIER 1'}`,
          `${patternsCovered}/${patternsCount} interview patterns mastered`,
        ],
        targetCompanyName,
        targetCompanySlug,
        targetRoleTier: profile?.targetRoleTier || 'PRODUCT_TIER_1',
        patternsCovered,
        totalPatterns: patternsCount,
        companyProblemsSolved: companyProbsSolved,
        totalCompanyProblems: totalCompanyProbs,
      },
      assessment: {
        name: 'Mock OA Simulations',
        key: 'ASSESSMENT',
        status: assessmentDimensionStatus,
        score: prs.oaScore,
        metricLabel: `${evaluatedCount} evaluated attempts`,
        completedActivity: passedOaCount,
        totalActivity: Math.max(1, evaluatedCount),
        activityUnit: 'passed',
        recentTrend: evaluatedCount >= 2 ? (avgOaScore >= 60 ? 'IMPROVING' : 'STEADY') : 'INSUFFICIENT_DATA',
        lastActivityDate: lastAssessmentActivity,
        ctaText: unfinishedAttempt ? 'Resume Assessment' : 'Take Practice OA',
        ctaUrl: unfinishedAttempt
          ? `/dashboard/assessments/${unfinishedAttempt.assessment.id}/attempt/${unfinishedAttempt.id}`
          : '/dashboard/assessments',
        highlights: [
          `${passedOaCount} assessments cleared`,
          `${avgOaScore}% average OA performance`,
          unfinishedAttempt ? '1 active attempt in progress' : 'All attempts submitted',
        ],
        attemptsCount: evaluatedCount,
        passedCount: passedOaCount,
        avgScorePct: avgOaScore,
        bestScorePct: bestOaScore,
        hasUnfinishedAttempt: Boolean(unfinishedAttempt),
        unfinishedAttemptUrl: unfinishedAttempt
          ? `/dashboard/assessments/${unfinishedAttempt.assessment.id}/attempt/${unfinishedAttempt.id}`
          : undefined,
      },
      revision: {
        name: 'Spaced Repetition Health',
        key: 'REVISION',
        status: revisionDimensionStatus,
        score: retentionHealthPct,
        metricLabel: `${dueTodayCount} due, ${overdueCount} overdue`,
        completedActivity: inScheduleCount - overdueCount,
        totalActivity: Math.max(1, inScheduleCount),
        activityUnit: 'cards',
        recentTrend: overdueCount === 0 ? 'IMPROVING' : 'DECLINING',
        lastActivityDate: lastRevisionActivity,
        ctaText: 'Open Revision Queue',
        ctaUrl: '/dashboard/revision',
        highlights: [
          `${inScheduleCount} active recall items tracked`,
          `${profile?.streakDays ?? 0} day study consistency streak`,
          `${retentionHealthPct}% active retention health`,
        ],
        dueTodayCount,
        overdueCount,
        inScheduleCount,
        streakDays: profile?.streakDays ?? 0,
        retentionHealthPct,
      },
    },
    insights,
    priorityActions,
    trends: {
      prsHistory: prsHistoryFormatted,
      dsaSubmissions: dsaSubmissionsTrend,
      coreCsScores: coreCsTrend,
      assessmentScores: assessmentTrend,
      revisionConsistency: revisionTrend,
      hasSufficientHistory,
    },
    milestones,
  };
}
