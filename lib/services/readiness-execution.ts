// ============================================================================
// PREPOS PLACEMENT READINESS EXECUTION SERVICE (PHASE 6.14)
// Authoritative Service Coordinating Critical Gaps, Daily Plan, Targets,
// Verifiable Checklist, Activity Feed & Verification Controls
// ============================================================================

import prisma from '../db';
import { getPlacementReadinessCockpitData, PlacementReadinessCockpit } from './readiness-cockpit';
import { getStudentShareStatus } from './dossier-verification';
import { getUserTargetCompanySlugs, getCompanyCatalogData } from './companies';

export interface CriticalGapItem {
  id: string;
  category: 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'REVISION' | 'COMPANY' | 'MILESTONE';
  title: string;
  description: string;
  currentMetric: string;
  targetMetric: string;
  remainingAmount: string;
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
  ctaText: string;
  ctaUrl: string;
  reason: string;
}

export interface DailyExecutionTask {
  id: string;
  taskType:
    | 'REVISION_OVERDUE'
    | 'REVISION_DUE'
    | 'DSA_COMPANY'
    | 'CORE_CS_BENCHMARK'
    | 'MOCK_OA'
    | 'MILESTONE_ACTION';
  title: string;
  subtitle: string;
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
  estimatedMinutes: number;
  ctaText: string;
  ctaUrl: string;
  isCompleted: boolean;
  category: string;
}

export interface TargetCompanyTimelineItem {
  companySlug: string;
  companyName: string;
  tier: string;
  coveragePct: number;
  solvedProblems: number;
  totalProblems: number;
  quizzesPassed: number;
  totalQuizzes: number;
  hasAssessment: boolean;
  assessmentCleared: boolean;
  isPrimaryTarget: boolean;
  workspaceUrl: string;
}

export interface ReadinessChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REMAINING' | 'NOT_AVAILABLE';
  evidence: string;
  ctaUrl: string;
  ctaLabel: string;
}

export interface ReadinessActivityEvent {
  id: string;
  type:
    | 'DSA_SUBMISSION'
    | 'QUIZ_ATTEMPT'
    | 'ASSESSMENT_ATTEMPT'
    | 'REVISION_REVIEW'
    | 'TARGET_SET'
    | 'DOSSIER_GENERATED'
    | 'VERIFICATION_ACCESSED';
  title: string;
  description: string;
  timestamp: string;
  statusVariant: 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'slate' | 'rose';
  url: string;
}

export interface FinalReadinessExecutionData {
  cockpit: PlacementReadinessCockpit;
  currentPosition: {
    prsScore: number;
    prsTier: string;
    prsTierLabel: string;
    composition: {
      dsaWeight: number;
      coreCsWeight: number;
      oaWeight: number;
      consistencyWeight: number;
      dsaScore: number;
      coreCsScore: number;
      oaScore: number;
      consistencyScore: number;
    };
    preparationCompletionPct: number;
    dsaRemaining: {
      solved: number;
      total: number;
      remaining: number;
      solvedPct: number;
    };
    coreCsBenchmark: {
      currentAvg: number;
      benchmarkPct: number;
      isMet: boolean;
      passedQuizzes: number;
      totalQuizzes: number;
    };
    oaHistory: {
      completedCount: number;
      passedCount: number;
      latestAttempt: {
        title: string;
        scorePct: number;
        passed: boolean;
        date: string;
      } | null;
    };
    revisionWorkload: {
      dueToday: number;
      overdue: number;
      totalScheduled: number;
      healthPct: number;
    };
    targetCompanyCoverage: {
      primaryTarget: string | null;
      targetCompaniesCount: number;
      avgCoveragePct: number;
    };
    activeStreak: number;
  };
  criticalGaps: CriticalGapItem[];
  dailyExecutionPlan: {
    date: string;
    totalPendingTasks: number;
    completedTasksCount: number;
    items: DailyExecutionTask[];
  };
  placementTargets: {
    targets: TargetCompanyTimelineItem[];
    hasTargetCompanies: boolean;
    summary: {
      totalTargetCount: number;
      averageCoveragePct: number;
      readyCount: number;
    };
  };
  finalChecklist: {
    items: ReadinessChecklistItem[];
    completedCount: number;
    totalCount: number;
    readinessStatus: 'ACTION_REQUIRED' | 'SUBSTANTIALLY_READY' | 'READY_FOR_PLACEMENT';
  };
  activityTimeline: {
    events: ReadinessActivityEvent[];
  };
  verificationControls: {
    hasDossier: boolean;
    latestDossierId: string | null;
    latestDossierVersion: number | null;
    hasActiveShare: boolean;
    shareUrl: string | null;
    expiresAt: string | null;
    verificationCount: number;
    lastVerifiedAt: string | null;
    shareStatus: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'NOT_CREATED';
  };
}

/**
 * Aggregates complete placement execution command center data for an authenticated student.
 */
export async function getPlacementExecutionData(userId: string): Promise<FinalReadinessExecutionData> {
  const now = new Date();

  // 1. Parallel authoritative data fetching across existing subsystems
  const [
    cockpit,
    shareStatusRes,
    targetSlugs,
    companyCatalog,
    profile,
    latestSnapshots,
    recentSubmissions,
    recentQuizAttempts,
    recentAssessmentAttempts,
    recentRevisions,
    recentAudits,
    unsolvedCompanyProblems,
  ] = await Promise.all([
    getPlacementReadinessCockpitData(userId),
    getStudentShareStatus(userId),
    getUserTargetCompanySlugs(userId),
    getCompanyCatalogData(userId),
    prisma.profile.findUnique({
      where: { userId },
      select: {
        gradYear: true,
        targetDegree: true,
      },
    }),
    prisma.dossierSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 2,
    }),
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { problem: { select: { title: true, slug: true } } },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { quiz: { select: { title: true, slug: true } } },
    }),
    prisma.assessmentAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: { assessment: { select: { title: true, slug: true } } },
    }),
    prisma.revision.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { problem: { select: { title: true, slug: true } } },
    }),
    prisma.dossierVerificationAudit.findMany({
      where: { shareToken: { userId } },
      orderBy: { timestamp: 'desc' },
      take: 5,
      include: { shareToken: { select: { id: true, verificationCount: true } } },
    }),
    prisma.problem.findMany({
      where: {
        companyProblems: { some: {} },
        userProgress: { none: { userId, isSolved: true } },
      },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        companyProblems: {
          take: 1,
          select: { company: { select: { name: true } } },
        },
      },
    }),
  ]);

  const { overallPRS, dimensions, priorityActions, milestones } = cockpit;

  // --------------------------------------------------------------------------
  // SECTION 1: CURRENT POSITION COMPOSITION
  // --------------------------------------------------------------------------
  const dsaTotal = dimensions.dsa.totalActivity || 20;
  const dsaSolved = dimensions.dsa.completedActivity || 0;
  const dsaRemainingCount = Math.max(0, dsaTotal - dsaSolved);
  const dsaSolvedPct = Math.round((dsaSolved / Math.max(1, dsaTotal)) * 100);

  const coreCsBenchmarkMet = dimensions.coreCs.avgScorePct >= 70 && dimensions.coreCs.quizAttemptsCount > 0;

  const latestAssessment = recentAssessmentAttempts[0]
    ? {
        title: recentAssessmentAttempts[0].assessment.title,
        scorePct: recentAssessmentAttempts[0].scorePct,
        passed: recentAssessmentAttempts[0].passed,
        date: recentAssessmentAttempts[0].startedAt.toLocaleDateString(),
      }
    : null;

  // Target company calculation
  const targetCompanies = companyCatalog.companies.filter(
    (c) => targetSlugs.has(c.slug) || c.isTarget || c.name === dimensions.company.targetCompanyName
  );

  const avgCompanyCoverage =
    targetCompanies.length > 0
      ? Math.round(
          targetCompanies.reduce((acc, c) => acc + c.coveragePct, 0) / targetCompanies.length
        )
      : dimensions.company.score;

  const currentPosition = {
    prsScore: overallPRS.score,
    prsTier: overallPRS.tier,
    prsTierLabel: overallPRS.tierLabel,
    composition: {
      dsaWeight: 40,
      coreCsWeight: 30,
      oaWeight: 15,
      consistencyWeight: 15,
      dsaScore: overallPRS.dsaScore,
      coreCsScore: overallPRS.coreCsScore,
      oaScore: overallPRS.oaScore,
      consistencyScore: overallPRS.consistencyScore,
    },
    preparationCompletionPct: overallPRS.completionPct,
    dsaRemaining: {
      solved: dsaSolved,
      total: dsaTotal,
      remaining: dsaRemainingCount,
      solvedPct: dsaSolvedPct,
    },
    coreCsBenchmark: {
      currentAvg: dimensions.coreCs.avgScorePct,
      benchmarkPct: 70,
      isMet: coreCsBenchmarkMet,
      passedQuizzes: dimensions.coreCs.quizAttemptsCount,
      totalQuizzes: 10,
    },
    oaHistory: {
      completedCount: dimensions.assessment.attemptsCount,
      passedCount: dimensions.assessment.passedCount,
      latestAttempt: latestAssessment,
    },
    revisionWorkload: {
      dueToday: dimensions.revision.dueTodayCount,
      overdue: dimensions.revision.overdueCount,
      totalScheduled: dimensions.revision.inScheduleCount,
      healthPct: dimensions.revision.retentionHealthPct,
    },
    targetCompanyCoverage: {
      primaryTarget: dimensions.company.targetCompanyName || null,
      targetCompaniesCount: targetCompanies.length,
      avgCoveragePct: avgCompanyCoverage,
    },
    activeStreak: overallPRS.streakDays,
  };

  // --------------------------------------------------------------------------
  // SECTION 2: CRITICAL GAPS ENGINE (Deterministic, Database-Driven)
  // --------------------------------------------------------------------------
  const criticalGaps: CriticalGapItem[] = [];

  // Gap 1: Overdue Revisions (Spaced Repetition decay risk)
  if (dimensions.revision.overdueCount > 0) {
    criticalGaps.push({
      id: 'gap-revision-overdue',
      category: 'REVISION',
      title: 'Spaced Repetition Schedule Lapsed',
      description: `${dimensions.revision.overdueCount} concept items have exceeded their SM-2 active recall interval.`,
      currentMetric: `${dimensions.revision.overdueCount} Overdue`,
      targetMetric: '0 Overdue',
      remainingAmount: `${dimensions.revision.overdueCount} items to review`,
      urgency: 'HIGH',
      ctaText: 'Clear Overdue Items',
      ctaUrl: '/dashboard/revision',
      reason: 'Active recall retention degrades rapidly when review intervals lapse before technical interviews.',
    });
  }

  // Gap 2: Core CS Below 70% Benchmark
  if (dimensions.coreCs.quizAttemptsCount === 0 || dimensions.coreCs.avgScorePct < 70) {
    criticalGaps.push({
      id: 'gap-core-cs-benchmark',
      category: 'CORE_CS',
      title: 'Core CS Diagnostic Score Below Benchmark',
      description:
        dimensions.coreCs.quizAttemptsCount === 0
          ? 'No Core CS diagnostic quizzes have been attempted.'
          : `Current diagnostic average of ${dimensions.coreCs.avgScorePct}% is below the 70% institutional benchmark.`,
      currentMetric: `${dimensions.coreCs.avgScorePct}% Average`,
      targetMetric: '70% Benchmark',
      remainingAmount: `${Math.max(0, 70 - dimensions.coreCs.avgScorePct)}% improvement needed`,
      urgency: 'HIGH',
      ctaText: 'Take Core CS Quizzes',
      ctaUrl: '/dashboard/core-cs',
      reason: 'Tier-1 tech and product companies filter heavily on OS concurrency, ACID properties, and memory management.',
    });
  }

  // Gap 3: Mock Online Assessment Deficit
  if (dimensions.assessment.attemptsCount === 0 || dimensions.assessment.passedCount === 0) {
    criticalGaps.push({
      id: 'gap-mock-assessment',
      category: 'ASSESSMENT',
      title: 'No Timed Online Assessment Cleared',
      description:
        dimensions.assessment.attemptsCount === 0
          ? 'No full-length timed mock assessment simulations have been submitted.'
          : `${dimensions.assessment.attemptsCount} assessment attempted, but passing cutoff has not been cleared.`,
      currentMetric: `${dimensions.assessment.passedCount} Cleared`,
      targetMetric: 'At least 1 Cleared OA',
      remainingAmount: '1 passed simulation',
      urgency: dimensions.assessment.attemptsCount === 0 ? 'HIGH' : 'MEDIUM',
      ctaText: 'Start Timed Assessment',
      ctaUrl: '/dashboard/assessments',
      reason: 'Timed simulations evaluate pacing under strict anti-cheat conditions and negative marking.',
    });
  }

  // Gap 4: Unsolved Company-Tagged Problems
  if (dimensions.dsa.companyTaggedSolved < dimensions.dsa.companyTaggedTotal) {
    const uncompletedCompanyCount = dimensions.dsa.companyTaggedTotal - dimensions.dsa.companyTaggedSolved;
    criticalGaps.push({
      id: 'gap-company-dsa',
      category: 'DSA',
      title: 'Unsolved Target Company Algorithmic Problems',
      description: `${uncompletedCompanyCount} company-tagged coding problems remain unsolved in active tracks.`,
      currentMetric: `${dimensions.dsa.companyTaggedSolved} / ${dimensions.dsa.companyTaggedTotal} Solved`,
      targetMetric: `${dimensions.dsa.companyTaggedTotal} Solved`,
      remainingAmount: `${uncompletedCompanyCount} problems remaining`,
      urgency: 'MEDIUM',
      ctaText: 'Solve Company Problems',
      ctaUrl: dimensions.company.targetCompanySlug
        ? `/dashboard/companies/${dimensions.company.targetCompanySlug}`
        : '/dashboard/dsa',
      reason: 'Company-specific algorithmic patterns account for over 60% of technical screen questions.',
    });
  }

  // Gap 5: Incomplete Milestones
  const inProgressMilestones = milestones.filter((m) => m.status === 'IN_PROGRESS');
  for (const m of inProgressMilestones.slice(0, 2)) {
    criticalGaps.push({
      id: `gap-milestone-${m.id}`,
      category: 'MILESTONE',
      title: m.title,
      description: m.description,
      currentMetric: `${m.currentProgress ?? 0}`,
      targetMetric: `${m.targetProgress ?? 1}`,
      remainingAmount: `${(m.targetProgress ?? 1) - (m.currentProgress ?? 0)} to achieve`,
      urgency: 'NORMAL',
      ctaText: 'Continue Milestone',
      ctaUrl: '/dashboard/readiness',
      reason: `Key placement milestone in ${m.category} is actively pending completion.`,
    });
  }

  // --------------------------------------------------------------------------
  // SECTION 3: TODAY'S EXECUTION PLAN
  // --------------------------------------------------------------------------
  const executionTasks: DailyExecutionTask[] = [];

  // Task 1: Overdue revisions (if any)
  if (dimensions.revision.overdueCount > 0) {
    executionTasks.push({
      id: 'exec-revision-overdue',
      taskType: 'REVISION_OVERDUE',
      title: `Clear ${dimensions.revision.overdueCount} Overdue Spaced Revisions`,
      subtitle: 'Critical recall decay mitigation via SM-2 active recall protocol',
      urgency: 'HIGH',
      estimatedMinutes: Math.min(45, dimensions.revision.overdueCount * 3),
      ctaText: 'Review Now',
      ctaUrl: '/dashboard/revision',
      isCompleted: false,
      category: 'Revision',
    });
  } else if (dimensions.revision.dueTodayCount > 0) {
    executionTasks.push({
      id: 'exec-revision-due',
      taskType: 'REVISION_DUE',
      title: `Complete ${dimensions.revision.dueTodayCount} Revisions Due Today`,
      subtitle: 'Daily SM-2 flashcard review to lock in long-term memory',
      urgency: 'NORMAL',
      estimatedMinutes: Math.min(30, dimensions.revision.dueTodayCount * 3),
      ctaText: 'Start Review',
      ctaUrl: '/dashboard/revision',
      isCompleted: false,
      category: 'Revision',
    });
  }

  // Task 2: High-priority DSA Problem
  if (unsolvedCompanyProblems.length > 0) {
    const nextProb = unsolvedCompanyProblems[0];
    const companyTag = nextProb.companyProblems[0]?.company?.name;
    executionTasks.push({
      id: `exec-dsa-${nextProb.id}`,
      taskType: 'DSA_COMPANY',
      title: `Solve ${nextProb.title}`,
      subtitle: `${nextProb.difficulty} algorithmic problem${companyTag ? ` tagged by ${companyTag}` : ''}`,
      urgency: nextProb.difficulty === 'HARD' ? 'HIGH' : 'MEDIUM',
      estimatedMinutes: nextProb.difficulty === 'HARD' ? 45 : 30,
      ctaText: 'Solve Problem',
      ctaUrl: `/dashboard/dsa/problem/${nextProb.slug}`,
      isCompleted: false,
      category: 'Algorithms',
    });
  }

  // Task 3: Core CS Diagnostic Diagnostic
  if (dimensions.coreCs.avgScorePct < 70 || dimensions.coreCs.quizAttemptsCount === 0) {
    executionTasks.push({
      id: 'exec-core-cs-diagnostic',
      taskType: 'CORE_CS_BENCHMARK',
      title: 'Core CS Diagnostic Quiz Improvement',
      subtitle: 'OS, DBMS, or Networks diagnostic assessment to reach 70% threshold',
      urgency: 'MEDIUM',
      estimatedMinutes: 20,
      ctaText: 'Take Diagnostic',
      ctaUrl: '/dashboard/core-cs',
      isCompleted: false,
      category: 'Core CS',
    });
  }

  // Task 4: Timed OA Simulation
  if (dimensions.assessment.passedCount === 0) {
    executionTasks.push({
      id: 'exec-mock-oa',
      taskType: 'MOCK_OA',
      title: 'Complete Timed Mock Assessment',
      subtitle: 'Full 60-minute placement simulation with automated code evaluation',
      urgency: dimensions.assessment.attemptsCount === 0 ? 'HIGH' : 'MEDIUM',
      estimatedMinutes: 60,
      ctaText: 'Enter Simulation',
      ctaUrl: '/dashboard/assessments',
      isCompleted: false,
      category: 'Assessments',
    });
  }

  // Task 5: Dossier Snapshot generation if missing
  if (latestSnapshots.length === 0) {
    executionTasks.push({
      id: 'exec-generate-dossier',
      taskType: 'MILESTONE_ACTION',
      title: 'Compile Initial Placement Dossier',
      subtitle: 'Lock in authoritative verified snapshot for campus placement and recruiter verification',
      urgency: 'NORMAL',
      estimatedMinutes: 5,
      ctaText: 'Generate Dossier',
      ctaUrl: '/dashboard/readiness/report',
      isCompleted: false,
      category: 'Dossier',
    });
  }

  // --------------------------------------------------------------------------
  // SECTION 4: PLACEMENT TARGET TIMELINE
  // --------------------------------------------------------------------------
  const placementTargetItems: TargetCompanyTimelineItem[] = targetCompanies.map((c) => ({
    companySlug: c.slug,
    companyName: c.name,
    tier: c.tier,
    coveragePct: c.coveragePct,
    solvedProblems: c.solvedProblemsCount,
    totalProblems: c.mappedProblemsCount,
    quizzesPassed: c.coreCSQuizzesPassed,
    totalQuizzes: c.coreCSQuizzesCount,
    hasAssessment: c.hasAssessments,
    assessmentCleared: c.assessmentsPassed > 0,
    isPrimaryTarget: c.name === dimensions.company.targetCompanyName,
    workspaceUrl: `/dashboard/companies/${c.slug}`,
  }));

  // --------------------------------------------------------------------------
  // SECTION 5: FINAL READINESS CHECKLIST (Verifiable Conditions Backed by DB)
  // --------------------------------------------------------------------------
  const latestSnapshot = latestSnapshots[0];
  const hasDossier = Boolean(latestSnapshot);
  const hasActiveShare = shareStatusRes.activeShare !== null;

  const checklistItems: ReadinessChecklistItem[] = [
    {
      id: 'chk-dsa',
      label: 'Algorithmic Problem-Solving Coverage',
      description: 'Completed foundational DSA problems across multiple core modules.',
      status: dsaSolved >= 10 ? 'COMPLETED' : dsaSolved > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${dsaSolved} of ${dsaTotal} verified solutions (${dsaSolvedPct}%)`,
      ctaUrl: '/dashboard/dsa',
      ctaLabel: 'DSA Workspace',
    },
    {
      id: 'chk-core-cs',
      label: 'Core CS 70% Placement Benchmark',
      description: 'Achieved institutional 70% passing threshold across diagnostic quizzes.',
      status: coreCsBenchmarkMet ? 'COMPLETED' : dimensions.coreCs.quizAttemptsCount > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `Mean diagnostic score: ${dimensions.coreCs.avgScorePct}% (Benchmark: 70%, Attempts: ${dimensions.coreCs.quizAttemptsCount})`,
      ctaUrl: '/dashboard/core-cs',
      ctaLabel: 'Core CS Hub',
    },
    {
      id: 'chk-assessment',
      label: 'Timed Mock Assessment Cleared',
      description: 'Successfully submitted and cleared a 60-minute anti-cheat assessment.',
      status: dimensions.assessment.passedCount > 0 ? 'COMPLETED' : dimensions.assessment.attemptsCount > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${dimensions.assessment.passedCount} cleared of ${dimensions.assessment.attemptsCount} attempts`,
      ctaUrl: '/dashboard/assessments',
      ctaLabel: 'Assessments',
    },
    {
      id: 'chk-company',
      label: 'Target Company Track Selected & Reviewed',
      description: 'Active target company configured with interview patterns studied.',
      status: dimensions.company.score >= 70 ? 'COMPLETED' : dimensions.company.targetCompanyName ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `Target: ${dimensions.company.targetCompanyName || 'None Selected'} (${dimensions.company.score}% pattern coverage)`,
      ctaUrl: '/dashboard/companies',
      ctaLabel: 'Company Hubs',
    },
    {
      id: 'chk-revision',
      label: 'Spaced Revision Queue Cleared',
      description: 'Zero overdue active recall items in the daily SM-2 retention engine.',
      status: dimensions.revision.overdueCount === 0 && dimensions.revision.inScheduleCount > 0 ? 'COMPLETED' : dimensions.revision.overdueCount > 0 ? 'IN_PROGRESS' : 'REMAINING',
      evidence: `${dimensions.revision.overdueCount} overdue, ${dimensions.revision.dueTodayCount} due today (${dimensions.revision.retentionHealthPct}% retention)`,
      ctaUrl: '/dashboard/revision',
      ctaLabel: 'Revision Queue',
    },
    {
      id: 'chk-dossier',
      label: 'Placement Readiness Dossier Sealed',
      description: 'Authoritative tamper-evident dossier snapshot locked in database.',
      status: hasDossier ? 'COMPLETED' : 'REMAINING',
      evidence: hasDossier ? `Dossier ${latestSnapshot.dossierId} sealed` : 'No dossier snapshot generated',
      ctaUrl: '/dashboard/readiness/report',
      ctaLabel: 'Dossier View',
    },
    {
      id: 'chk-share',
      label: 'Recruiter Verification Link Active',
      description: 'Cryptographically secure public verification URL generated for recruiters.',
      status: hasActiveShare ? 'COMPLETED' : 'REMAINING',
      evidence: hasActiveShare
        ? `Active link with ${shareStatusRes.activeShare?.verificationCount || 0} verifications`
        : 'No active verification share link',
      ctaUrl: '/dashboard/readiness/report',
      ctaLabel: 'Share Manager',
    },
    {
      id: 'chk-profile',
      label: 'Candidate Academic Profile Complete',
      description: 'Graduation year and target degree verified for placement credentials.',
      status: profile?.gradYear && profile?.targetDegree ? 'COMPLETED' : 'REMAINING',
      evidence: profile?.gradYear && profile?.targetDegree
        ? `${profile.targetDegree} · Class of ${profile.gradYear}`
        : 'Profile degree or graduation year missing',
      ctaUrl: '/dashboard/profile',
      ctaLabel: 'Edit Profile',
    },
  ];

  const completedChecklistCount = checklistItems.filter((i) => i.status === 'COMPLETED').length;
  const checklistReadinessStatus: 'ACTION_REQUIRED' | 'SUBSTANTIALLY_READY' | 'READY_FOR_PLACEMENT' =
    completedChecklistCount >= 7
      ? 'READY_FOR_PLACEMENT'
      : completedChecklistCount >= 4
      ? 'SUBSTANTIALLY_READY'
      : 'ACTION_REQUIRED';

  // --------------------------------------------------------------------------
  // SECTION 6: READINESS ACTIVITY TIMELINE (Real Database Events Aggregation)
  // --------------------------------------------------------------------------
  const activityEvents: ReadinessActivityEvent[] = [];

  // Add DSA Submissions
  for (const s of recentSubmissions) {
    activityEvents.push({
      id: `act-sub-${s.id}`,
      type: 'DSA_SUBMISSION',
      title: `DSA Submission: ${s.problem.title}`,
      description: `Status: ${s.status.replace('_', ' ')} · Runtime: ${s.executionTime ? `${s.executionTime}ms` : 'N/A'}`,
      timestamp: s.createdAt.toISOString(),
      statusVariant: s.status === 'ACCEPTED' ? 'emerald' : 'rose',
      url: `/dashboard/dsa/problem/${s.problem.slug}`,
    });
  }

  // Add Quiz Attempts
  for (const q of recentQuizAttempts) {
    const isBenchmarkMet = q.scorePct >= 70;
    activityEvents.push({
      id: `act-quiz-${q.id}`,
      type: 'QUIZ_ATTEMPT',
      title: `Diagnostic Quiz: ${q.quiz.title}`,
      description: `Score: ${q.scorePct}% · ${isBenchmarkMet ? 'Benchmark Met (Pass)' : 'Below Benchmark'}`,
      timestamp: q.createdAt.toISOString(),
      statusVariant: isBenchmarkMet ? 'blue' : 'amber',
      url: '/dashboard/core-cs',
    });
  }

  // Add Assessment Attempts
  for (const a of recentAssessmentAttempts) {
    activityEvents.push({
      id: `act-oa-${a.id}`,
      type: 'ASSESSMENT_ATTEMPT',
      title: `Timed Assessment: ${a.assessment.title}`,
      description: `Attempt #${a.attemptNumber} · Score: ${a.scorePct}% · Status: ${a.status}`,
      timestamp: a.startedAt.toISOString(),
      statusVariant: a.passed ? 'emerald' : 'indigo',
      url: `/dashboard/assessments/${a.assessmentId}`,
    });
  }

  // Add Revision Reviews
  for (const r of recentRevisions) {
    if (r.completedAt) {
      activityEvents.push({
        id: `act-rev-${r.id}`,
        type: 'REVISION_REVIEW',
        title: `Spaced Revision: ${r.problem?.title || 'Concept Item'}`,
        description: `Confidence: ${r.confidence || 'GOOD'} · Next Interval: ${r.intervalDays} days`,
        timestamp: r.completedAt.toISOString(),
        statusVariant: 'amber',
        url: '/dashboard/revision',
      });
    }
  }

  // Add Dossier Snapshots
  for (const snap of latestSnapshots) {
    activityEvents.push({
      id: `act-dossier-${snap.id}`,
      type: 'DOSSIER_GENERATED',
      title: `Placement Dossier Snapshot #${snap.dossierId}`,
      description: `Version ${snap.version} sealed with SHA-256 integrity hash`,
      timestamp: snap.createdAt.toISOString(),
      statusVariant: 'purple',
      url: '/dashboard/readiness/report',
    });
  }

  // Add Verification Audits
  for (const aud of recentAudits) {
    activityEvents.push({
      id: `act-audit-${aud.id}`,
      type: 'VERIFICATION_ACCESSED',
      title: `Verification Event: ${aud.eventType.replace('_', ' ')}`,
      description: `Share Token record accessed · Total checks: ${aud.shareToken?.verificationCount || 1}`,
      timestamp: aud.timestamp.toISOString(),
      statusVariant: 'slate',
      url: '/dashboard/readiness/report',
    });
  }

  // Sort unified activity by timestamp descending
  activityEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // --------------------------------------------------------------------------
  // SECTION 7: FINAL VERIFICATION CONTROLS DATA
  // --------------------------------------------------------------------------
  const verificationControls = {
    hasDossier,
    latestDossierId: latestSnapshot?.dossierId ?? null,
    latestDossierVersion: latestSnapshot ? parseInt(latestSnapshot.version, 10) || 1 : null,
    hasActiveShare,
    shareUrl: shareStatusRes.activeShare ? `/verify/dossier/${shareStatusRes.activeShare.shareTokenId}` : null,
    expiresAt: shareStatusRes.activeShare?.expiresAt ?? null,
    verificationCount: shareStatusRes.activeShare?.verificationCount ?? 0,
    lastVerifiedAt: shareStatusRes.activeShare?.lastVerifiedAt ?? null,
    shareStatus: (shareStatusRes.activeShare
      ? 'ACTIVE'
      : shareStatusRes.status?.hasShareLink
      ? shareStatusRes.status.status || 'EXPIRED'
      : 'NOT_CREATED') as 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'NOT_CREATED',
  };

  return {
    cockpit,
    currentPosition,
    criticalGaps,
    dailyExecutionPlan: {
      date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      totalPendingTasks: executionTasks.length,
      completedTasksCount: 0,
      items: executionTasks,
    },
    placementTargets: {
      targets: placementTargetItems,
      hasTargetCompanies: placementTargetItems.length > 0,
      summary: {
        totalTargetCount: placementTargetItems.length,
        averageCoveragePct: avgCompanyCoverage,
        readyCount: placementTargetItems.filter((t) => t.coveragePct >= 70).length,
      },
    },
    finalChecklist: {
      items: checklistItems,
      completedCount: completedChecklistCount,
      totalCount: checklistItems.length,
      readinessStatus: checklistReadinessStatus,
    },
    activityTimeline: {
      events: activityEvents.slice(0, 10),
    },
    verificationControls,
  };
}
