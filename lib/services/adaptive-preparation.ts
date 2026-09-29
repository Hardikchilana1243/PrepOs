// ============================================================================
// PREPOS ADAPTIVE PREPARATION ENGINE
// Deterministic, Explainable Preparation & Recommendation Service
// ============================================================================

import prisma from '../db';
import {
  getCachedUserSolvedCount,
  getCachedTotalProblemCount,
  getCachedUserQuizAttempts,
  getCachedPublishedQuizzes,
} from './dashboard-queries';
import { getReadinessScore, PRSComponents } from './readiness-score';

export type MasteryLevel = 'NEEDS_EVIDENCE' | 'DEVELOPING' | 'ON_TRACK' | 'STRONG';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'RECOMMENDED';

export interface PreparationPillarStatus {
  area: 'DSA' | 'CORE_CS' | 'REVISION' | 'ASSESSMENT' | 'CONSISTENCY';
  name: string;
  level: MasteryLevel;
  headline: string;
  metric: string;
  scorePct: number;
  evidence: string;
  remedyAction: {
    title: string;
    href: string;
    ctaText: string;
  };
}

export interface AdaptivePlanTask {
  id: string;
  area: 'DSA' | 'CORE_CS' | 'REVISION' | 'ASSESSMENT' | 'COMPANY';
  title: string;
  reason: string;
  estimatedMinutes: number;
  href: string;
  priority: TaskPriority;
  metricImpact: string;
  unlockText: string;
  isCompleted: boolean;
}

export interface AdaptiveRecommendation {
  title: string;
  actionTitle: string;
  reason: string;
  metricImproved: string;
  impactScore: number;
  unlockDescription: string;
  priority: TaskPriority;
  href: string;
  ctaText: string;
  estimatedMinutes: number;
}

export interface PreparationInsightItem {
  id: string;
  category: string;
  title: string;
  detail: string;
  type: 'strength' | 'gap' | 'milestone' | 'risk';
  href?: string;
  actionLabel?: string;
}

export interface AdaptivePreparationData {
  recommendation: AdaptiveRecommendation;
  todayPlan: AdaptivePlanTask[];
  pillarsStatus: PreparationPillarStatus[];
  insights: PreparationInsightItem[];
  prsSummary: {
    totalScore: number;
    dsaScore: number;
    coreCsScore: number;
    oaScore: number;
    consistencyScore: number;
    isBaselineOnly: boolean;
  };
}

export async function getAdaptivePreparationData(userId: string): Promise<AdaptivePreparationData> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Parallel data extraction with cached service helpers
  const [
    profile,
    solvedCount,
    totalProblems,
    allQuizzes,
    userQuizAttempts,
    dueRevisionsCount,
    overdueRevisionsCount,
    nextRevision,
    nextUnsolvedProblem,
    oaAttempts,
    publishedAssessments,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { streakDays: true, gradYear: true, targetRoleTier: true },
    }),
    getCachedUserSolvedCount(userId),
    getCachedTotalProblemCount(),
    getCachedPublishedQuizzes(),
    getCachedUserQuizAttempts(userId),
    prisma.revision.count({
      where: {
        userId,
        dueAt: { lte: now },
        completedAt: null,
      },
    }),
    prisma.revision.count({
      where: {
        userId,
        dueAt: { lte: oneDayAgo },
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
        id: true,
        intervalDays: true,
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    }),
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
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        topic: { select: { title: true } },
      },
    }),
    prisma.assessmentAttempt.findMany({
      where: {
        userId,
        status: { in: ['SUBMITTED', 'EVALUATING', 'EVALUATED', 'EXPIRED'] },
      },
      select: {
        id: true,
        scorePct: true,
        passed: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.assessment.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        title: true,
        durationMin: true,
        totalMarks: true,
        company: { select: { name: true } },
      },
      orderBy: { orderIndex: 'asc' },
    }),
  ]);

  const streakDays = profile?.streakDays ?? 0;
  const readiness = await getReadinessScore(userId, { streakDays });

  // 1. Calculate Core CS diagnostic averages
  const coreCsAttemptedIds = new Set(userQuizAttempts.map((a) => a.quizId));
  const unattemptedQuizzes = allQuizzes.filter((q) => !coreCsAttemptedIds.has(q.id));
  const coreCsAvgScore =
    userQuizAttempts.length > 0
      ? Math.round(userQuizAttempts.reduce((acc, a) => acc + a.scorePct, 0) / userQuizAttempts.length)
      : 0;

  // Find lowest scoring attempted quiz for targeted review
  const weakestAttemptedQuiz = userQuizAttempts.length > 0
    ? [...userQuizAttempts].sort((a, b) => a.scorePct - b.scorePct)[0]
    : null;
  const weakestQuizRecord = weakestAttemptedQuiz
    ? allQuizzes.find((q) => q.id === weakestAttemptedQuiz.quizId)
    : null;

  // 2. Assess Online Assessment performance
  const oaAttemptsCount = oaAttempts.length;
  const oaPassedCount = oaAttempts.filter((a) => a.passed).length;
  const latestOaAttempt = oaAttempts[0];
  const unattemptedAssessment = publishedAssessments.find(
    (a) => !oaAttempts.some((att) => att.id === a.id)
  ) ?? publishedAssessments[0];

  // --------------------------------------------------------------------------
  // 3. PILLAR STATUS EVALUATION (Explainable Mastery Levels)
  // --------------------------------------------------------------------------
  const getDsaMastery = (): { level: MasteryLevel; headline: string; evidence: string } => {
    if (solvedCount === 0) {
      return {
        level: 'NEEDS_EVIDENCE',
        headline: 'No Problem Solutions Submitted',
        evidence: `0 of ${totalProblems} curriculum problems completed. Baseline problem-solving evidence required.`,
      };
    }
    if (solvedCount < 6) {
      return {
        level: 'DEVELOPING',
        headline: 'Early Roadmap Foundations',
        evidence: `${solvedCount} of ${totalProblems} problems solved. Key array and two-pointer patterns established.`,
      };
    }
    if (solvedCount < 14) {
      return {
        level: 'ON_TRACK',
        headline: 'Solid Algorithmic Coverage',
        evidence: `${solvedCount} problems solved across multiple modules. Tree and linked list patterns active.`,
      };
    }
    return {
      level: 'STRONG',
      headline: 'Advanced Problem Mastery',
      evidence: `${solvedCount} of ${totalProblems} problems solved with automated Judge0 verification.`,
    };
  };

  const getCoreCsMastery = (): { level: MasteryLevel; headline: string; evidence: string } => {
    if (userQuizAttempts.length === 0) {
      return {
        level: 'NEEDS_EVIDENCE',
        headline: 'No Diagnostic Drills Attempted',
        evidence: '0 diagnostic quizzes completed. DBMS and OS screening benchmark uncalibrated.',
      };
    }
    if (coreCsAvgScore < 70) {
      return {
        level: 'DEVELOPING',
        headline: 'Below 70% Screening Benchmark',
        evidence: `Average score is ${coreCsAvgScore}% across ${userQuizAttempts.length} diagnostic attempt(s). Recruiter threshold is 70%.`,
      };
    }
    if (coreCsAvgScore < 85) {
      return {
        level: 'ON_TRACK',
        headline: 'Screening Benchmark Cleared',
        evidence: `Average score is ${coreCsAvgScore}%. Solid recall in DBMS transaction isolation and OS concurrency.`,
      };
    }
    return {
      level: 'STRONG',
      headline: 'Exemplary Fundamentals Mastery',
      evidence: `Average score is ${coreCsAvgScore}% across all curriculum diagnostic drills.`,
    };
  };

  const getOaMastery = (): { level: MasteryLevel; headline: string; evidence: string } => {
    if (oaAttemptsCount === 0) {
      return {
        level: 'NEEDS_EVIDENCE',
        headline: 'No Mock OAs Attempted',
        evidence: '0 timed assessment simulations logged. Timed exam stamina uncalibrated.',
      };
    }
    if (oaPassedCount === 0) {
      return {
        level: 'DEVELOPING',
        headline: 'Needs Practice Under Timed Constraints',
        evidence: `Attempted ${oaAttemptsCount} simulation(s), latest score: ${latestOaAttempt?.scorePct}%. Benchmark not yet cleared.`,
      };
    }
    if (latestOaAttempt && latestOaAttempt.scorePct < 85) {
      return {
        level: 'ON_TRACK',
        headline: 'OA Benchmark Cleared',
        evidence: `Latest simulation score: ${latestOaAttempt.scorePct}%. Successfully cleared pass threshold.`,
      };
    }
    return {
      level: 'STRONG',
      headline: 'High-Scoring Assessment Performer',
      evidence: `Latest simulation score: ${latestOaAttempt?.scorePct}%. Cleared screening benchmark with distinction.`,
    };
  };

  const getConsistencyMastery = (): { level: MasteryLevel; headline: string; evidence: string } => {
    if (streakDays === 0) {
      return {
        level: 'NEEDS_EVIDENCE',
        headline: 'Zero Active Streak',
        evidence: 'No consecutive daily preparation events recorded this week.',
      };
    }
    if (streakDays < 3) {
      return {
        level: 'DEVELOPING',
        headline: 'Building Habit Momentum',
        evidence: `${streakDays}-day streak active. Reach 7 days to solidify daily consistency habit.`,
      };
    }
    if (streakDays < 7) {
      return {
        level: 'ON_TRACK',
        headline: 'Reliable Study Consistency',
        evidence: `${streakDays}-day streak active. Steady progress towards 14-day mastery target.`,
      };
    }
    return {
      level: 'STRONG',
      headline: 'Exceptional Preparation Discipline',
      evidence: `${streakDays}-day streak maintained across problem solving, quizzes, and spaced revision.`,
    };
  };

  const dsaStatus = getDsaMastery();
  const coreCsStatus = getCoreCsMastery();
  const oaStatus = getOaMastery();
  const consistencyStatus = getConsistencyMastery();

  const pillarsStatus: PreparationPillarStatus[] = [
    {
      area: 'DSA',
      name: 'DSA Problem Mastery',
      level: dsaStatus.level,
      headline: dsaStatus.headline,
      metric: `${solvedCount} / ${totalProblems} Solved`,
      scorePct: readiness.dsaScore,
      evidence: dsaStatus.evidence,
      remedyAction: {
        title: nextUnsolvedProblem ? `Solve: ${nextUnsolvedProblem.title}` : 'Review Solved Problems',
        href: nextUnsolvedProblem ? `/dashboard/dsa/problem/${nextUnsolvedProblem.slug}` : '/dashboard/dsa',
        ctaText: 'Solve Problem',
      },
    },
    {
      area: 'CORE_CS',
      name: 'Core CS Fundamentals',
      level: coreCsStatus.level,
      headline: coreCsStatus.headline,
      metric: coreCsAvgScore > 0 ? `${coreCsAvgScore}% Diagnostic Avg` : 'Unattempted',
      scorePct: readiness.coreCsScore,
      evidence: coreCsStatus.evidence,
      remedyAction: {
        title: unattemptedQuizzes[0]
          ? `Attempt: ${unattemptedQuizzes[0].title}`
          : weakestQuizRecord
          ? `Retake: ${weakestQuizRecord.title}`
          : 'Core CS Diagnostics',
        href: unattemptedQuizzes[0]
          ? `/dashboard/core-cs?quiz=${unattemptedQuizzes[0].slug}`
          : '/dashboard/core-cs',
        ctaText: 'Launch Drill',
      },
    },
    {
      area: 'ASSESSMENT',
      name: 'Mock OA Simulations',
      level: oaStatus.level,
      headline: oaStatus.headline,
      metric: latestOaAttempt ? `${latestOaAttempt.scorePct}% Latest Score` : '0 Simulations',
      scorePct: readiness.oaScore,
      evidence: oaStatus.evidence,
      remedyAction: {
        title: unattemptedAssessment ? `Take ${unattemptedAssessment.title}` : 'Mock OA Directory',
        href: unattemptedAssessment ? `/dashboard/assessments/${unattemptedAssessment.slug}` : '/dashboard/assessments',
        ctaText: 'Take Assessment',
      },
    },
    {
      area: 'CONSISTENCY',
      name: 'Study Consistency & Revision',
      level: consistencyStatus.level,
      headline: consistencyStatus.headline,
      metric: `${streakDays} Days Streak`,
      scorePct: readiness.consistencyScore,
      evidence: consistencyStatus.evidence,
      remedyAction: {
        title: dueRevisionsCount > 0 ? `Review ${dueRevisionsCount} Due Items` : 'Spaced Revision Queue',
        href: '/dashboard/revision',
        ctaText: 'Review Queue',
      },
    },
  ];

  // --------------------------------------------------------------------------
  // 4. PRIMARY ADAPTIVE RECOMMENDATION (Deterministic Priority Precedence)
  // --------------------------------------------------------------------------
  const getPrimaryRecommendation = (): AdaptiveRecommendation => {
    // 1. Overdue Spaced Revision (Retention Decay Risk)
    if (overdueRevisionsCount > 0 && nextRevision) {
      return {
        title: 'Prioritize Overdue Spaced Recall',
        actionTitle: `Review "${nextRevision.problem.title}"`,
        reason: `${overdueRevisionsCount} algorithmic item(s) have passed their scheduled SM-2 review window. Memory decay accelerates if recall intervals are skipped.`,
        metricImproved: 'PRS Consistency & Memory Retention',
        impactScore: 95,
        unlockDescription: 'Locks in long-term retention and maintains active study streak.',
        priority: 'CRITICAL',
        href: '/dashboard/revision',
        ctaText: 'Review Recall Now',
        estimatedMinutes: 5,
      };
    }

    // 2. Critical Unattempted Core CS Diagnostic
    if (unattemptedQuizzes.length > 0) {
      const targetQuiz = unattemptedQuizzes[0];
      return {
        title: 'Calibrate Core CS Fundamentals',
        actionTitle: `Attempt ${targetQuiz.title}`,
        reason: `Core CS represents 30% of your Placement Readiness Score. You have not yet calibrated ${targetQuiz.title} (${targetQuiz.subject.title}).`,
        metricImproved: 'Core CS Fundamentals (30% PRS Weight)',
        impactScore: 90,
        unlockDescription: `Unlocks topic mastery breakdown in ${targetQuiz.subject.title} and establishes screening baseline.`,
        priority: 'HIGH',
        href: `/dashboard/core-cs?quiz=${targetQuiz.slug}`,
        ctaText: 'Launch Diagnostic Drill',
        estimatedMinutes: 10,
      };
    }

    // 3. Significant Core CS Gap (<70% Screening Threshold)
    if (coreCsAvgScore < 70 && weakestQuizRecord) {
      return {
        title: 'Clear Placement Screening Benchmark',
        actionTitle: `Retake ${weakestQuizRecord.title}`,
        reason: `Your current diagnostic average is ${coreCsAvgScore}%. Placement screening rounds at top firms require minimum 70% threshold.`,
        metricImproved: `Core CS Fundamentals (+${70 - coreCsAvgScore}% gap)`,
        impactScore: 85,
        unlockDescription: 'Clears the 70% diagnostic screening benchmark.',
        priority: 'HIGH',
        href: `/dashboard/core-cs?quiz=${weakestQuizRecord.slug}`,
        ctaText: 'Retake Diagnostic',
        estimatedMinutes: 10,
      };
    }

    // 4. Missing Mock OA Simulation
    if (oaAttemptsCount === 0 && unattemptedAssessment) {
      return {
        title: 'Calibrate Timed Online Assessment Stamina',
        actionTitle: `Attempt ${unattemptedAssessment.title}`,
        reason: `Mock OA Simulations contribute 15% of your Readiness Score. You have 0 completed assessment simulations logged.`,
        metricImproved: 'Mock OA Simulation (15% PRS Weight)',
        impactScore: 80,
        unlockDescription: 'Tests multi-section coding & MCQ time management under exam conditions.',
        priority: 'HIGH',
        href: `/dashboard/assessments/${unattemptedAssessment.slug}`,
        ctaText: 'Start OA Simulation',
        estimatedMinutes: unattemptedAssessment.durationMin,
      };
    }

    // 5. Next DSA Progression Problem
    if (nextUnsolvedProblem) {
      return {
        title: 'Advance DSA Roadmap Problem Solving',
        actionTitle: `Solve: ${nextUnsolvedProblem.title}`,
        reason: `DSA mastery comprises 40% of overall PRS weight. Solved ${solvedCount} of ${totalProblems} problems.`,
        metricImproved: 'DSA Problem Mastery (+2.5 pts)',
        impactScore: 75,
        unlockDescription: 'Advances curriculum completion and schedules problem into spaced repetition queue.',
        priority: 'MEDIUM',
        href: `/dashboard/dsa/problem/${nextUnsolvedProblem.slug}`,
        ctaText: 'Solve Problem',
        estimatedMinutes: 20,
      };
    }

    // 6. Target Company Drill
    return {
      title: 'Practice Target Recruiter Patterns',
      actionTitle: 'Explore Company Hubs & OA Drills',
      reason: 'Baseline preparation pillars are calibrated. Practice verified high-frequency patterns for target placement recruiters.',
      metricImproved: 'Company Placement Readiness',
      impactScore: 70,
      unlockDescription: 'Deepens pattern matching for campus recruitment drives.',
      priority: 'RECOMMENDED',
      href: '/dashboard/companies',
      ctaText: 'Open Company Hubs',
      estimatedMinutes: 25,
    };
  };

  const recommendation = getPrimaryRecommendation();

  // --------------------------------------------------------------------------
  // 5. TODAY'S ADAPTIVE PLAN (3–5 Deterministic Action Tasks)
  // --------------------------------------------------------------------------
  const todayPlan: AdaptivePlanTask[] = [];

  // Task A: Spaced Revision (if due items exist)
  if (dueRevisionsCount > 0) {
    todayPlan.push({
      id: 'task-revision',
      area: 'REVISION',
      title: `Complete ${dueRevisionsCount} Spaced Recall Checkpoint(s)`,
      reason: `${dueRevisionsCount} problem(s) are due for recall intervals today under SM-2 protocol.`,
      estimatedMinutes: Math.min(15, dueRevisionsCount * 3),
      href: '/dashboard/revision',
      priority: overdueRevisionsCount > 0 ? 'CRITICAL' : 'HIGH',
      metricImpact: 'Retention & Consistency (+5 pts)',
      unlockText: 'Maintains daily study streak and prevents algorithmic memory decay.',
      isCompleted: false,
    });
  }

  // Task B: Core CS Diagnostic Drill
  if (unattemptedQuizzes.length > 0) {
    const q = unattemptedQuizzes[0];
    todayPlan.push({
      id: `task-corecs-${q.id}`,
      area: 'CORE_CS',
      title: `Attempt ${q.title}`,
      reason: `Calibrate baseline fundamentals in ${q.subject.title}.`,
      estimatedMinutes: 10,
      href: `/dashboard/core-cs?quiz=${q.slug}`,
      priority: 'HIGH',
      metricImpact: 'Core CS Score (+15 pts)',
      unlockText: 'Generates topic-level mastery analysis in DBMS/OS.',
      isCompleted: false,
    });
  } else if (weakestQuizRecord && coreCsAvgScore < 70) {
    todayPlan.push({
      id: `task-corecs-${weakestQuizRecord.id}`,
      area: 'CORE_CS',
      title: `Improve ${weakestQuizRecord.title}`,
      reason: `Raise diagnostic score from ${weakestAttemptedQuiz?.scorePct}% to clear 70% threshold.`,
      estimatedMinutes: 10,
      href: `/dashboard/core-cs?quiz=${weakestQuizRecord.slug}`,
      priority: 'HIGH',
      metricImpact: 'Core CS Benchmark',
      unlockText: 'Clears placement screening benchmark.',
      isCompleted: false,
    });
  }

  // Task C: DSA Progression Problem
  if (nextUnsolvedProblem) {
    todayPlan.push({
      id: `task-dsa-${nextUnsolvedProblem.id}`,
      area: 'DSA',
      title: `Solve: ${nextUnsolvedProblem.title}`,
      reason: `Next unsolved ${nextUnsolvedProblem.difficulty} problem in ${nextUnsolvedProblem.topic?.title || 'Roadmap'}.`,
      estimatedMinutes: 20,
      href: `/dashboard/dsa/problem/${nextUnsolvedProblem.slug}`,
      priority: 'MEDIUM',
      metricImpact: 'DSA Mastery (+2.5 pts)',
      unlockText: 'Schedules problem into upcoming recall queue.',
      isCompleted: false,
    });
  }

  // Task D: Mock Assessment Exposure
  if (oaAttemptsCount === 0 && unattemptedAssessment) {
    todayPlan.push({
      id: `task-oa-${unattemptedAssessment.id}`,
      area: 'ASSESSMENT',
      title: `Attempt ${unattemptedAssessment.title}`,
      reason: 'Calibrate timed multi-section exam stamina (Coding + MCQs).',
      estimatedMinutes: unattemptedAssessment.durationMin,
      href: `/dashboard/assessments/${unattemptedAssessment.slug}`,
      priority: 'HIGH',
      metricImpact: 'OA Score (+15 pts)',
      unlockText: 'Unlocks timed online assessment performance analytics.',
      isCompleted: false,
    });
  }

  // Task E: Company Target Practice
  todayPlan.push({
    id: 'task-company',
    area: 'COMPANY',
    title: 'Review Verified Interview Patterns (Tier-1)',
    reason: 'Align algorithm study with verified company hiring frequency.',
    estimatedMinutes: 15,
    href: '/dashboard/companies',
    priority: 'RECOMMENDED',
    metricImpact: 'Company Preparedness',
    unlockText: 'Prepares candidate for company-specific interview rounds.',
    isCompleted: false,
  });

  // Limit today's plan to 3-5 tasks
  const boundedPlan = todayPlan.slice(0, 4);

  // --------------------------------------------------------------------------
  // 6. PREPARATION INSIGHTS
  // --------------------------------------------------------------------------
  const insights: PreparationInsightItem[] = [];

  // Strongest area insight
  if (solvedCount >= 8) {
    insights.push({
      id: 'ins-strong-dsa',
      category: 'Demonstrated Strength',
      title: 'Strong DSA Problem Solving Velocity',
      detail: `Verified completion of ${solvedCount} problems across multiple algorithmic modules.`,
      type: 'strength',
      href: '/dashboard/dsa',
      actionLabel: 'View Roadmap',
    });
  } else if (coreCsAvgScore >= 70) {
    insights.push({
      id: 'ins-strong-cs',
      category: 'Demonstrated Strength',
      title: 'Core CS Benchmark Cleared',
      detail: `Average score of ${coreCsAvgScore}% satisfies technical screening thresholds.`,
      type: 'strength',
      href: '/dashboard/core-cs',
      actionLabel: 'View Syllabus',
    });
  }

  // Largest gap insight
  if (oaAttemptsCount === 0) {
    insights.push({
      id: 'ins-gap-oa',
      category: 'Largest Measurable Gap',
      title: 'Timed OA Simulation Uncalibrated',
      detail: '0 mock assessments completed. 15% of your Readiness Index is running on baseline default.',
      type: 'gap',
      href: '/dashboard/assessments',
      actionLabel: 'Take Mock OA',
    });
  } else if (userQuizAttempts.length === 0) {
    insights.push({
      id: 'ins-gap-cs',
      category: 'Largest Measurable Gap',
      title: 'Core CS Fundamentals Uncalibrated',
      detail: 'Complete DBMS and OS diagnostic drills to establish your screening score.',
      type: 'gap',
      href: '/dashboard/core-cs',
      actionLabel: 'Start Diagnostic',
    });
  } else if (coreCsAvgScore < 70) {
    insights.push({
      id: 'ins-gap-cs-score',
      category: 'Largest Measurable Gap',
      title: `Core CS Average Below 70% (${coreCsAvgScore}%)`,
      detail: 'Raise diagnostic score by retaking DBMS/OS drills to clear screening cutoffs.',
      type: 'gap',
      href: '/dashboard/core-cs',
      actionLabel: 'Review Mistakes',
    });
  }

  // Spaced revision risk insight
  if (overdueRevisionsCount > 0) {
    insights.push({
      id: 'ins-risk-rev',
      category: 'Retention Risk',
      title: `${overdueRevisionsCount} Overdue Spaced Recall Item(s)`,
      detail: 'Recall decay accelerates once intervals elapse. Review now to avoid re-learning algorithms.',
      type: 'risk',
      href: '/dashboard/revision',
      actionLabel: 'Review Queue',
    });
  }

  // Next milestone insight
  insights.push({
    id: 'ins-milestone-dsa',
    category: 'Next Milestone',
    title: `Roadmap Coverage: ${solvedCount}/${totalProblems} Problems`,
    detail: nextUnsolvedProblem
      ? `Next: "${nextUnsolvedProblem.title}" (${nextUnsolvedProblem.difficulty}).`
      : 'All standard curriculum problems completed.',
    type: 'milestone',
    href: nextUnsolvedProblem ? `/dashboard/dsa/problem/${nextUnsolvedProblem.slug}` : '/dashboard/dsa',
    actionLabel: 'Open Workspace',
  });

  return {
    recommendation,
    todayPlan: boundedPlan,
    pillarsStatus,
    insights,
    prsSummary: {
      totalScore: readiness.totalScore,
      dsaScore: readiness.dsaScore,
      coreCsScore: readiness.coreCsScore,
      oaScore: readiness.oaScore,
      consistencyScore: readiness.consistencyScore,
      isBaselineOnly: readiness.isBaselineOnly,
    },
  };
}
