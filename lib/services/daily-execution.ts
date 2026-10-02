// ============================================================================
// PREPOS DAILY PLACEMENT EXECUTION ENGINE & CONSISTENCY SERVICE (PHASE 6.15)
// Authoritative Service Driving Daily Task Generation, Persistent Progress,
// Task Reconciliation, Spaced Repetition Integration & Consistency Analytics
// ============================================================================

import prisma from '../db';
import { getPlacementReadinessCockpitData } from './readiness-cockpit';
import { getUserTargetCompanySlugs, getCompanyCatalogData } from './companies';

// ----------------------------------------------------------------------------
// INTERFACES & DOMAIN TYPES
// ----------------------------------------------------------------------------

export type ExecutionCategory =
  | 'DSA'
  | 'CORE_CS'
  | 'ASSESSMENT'
  | 'REVISION'
  | 'COMPANY'
  | 'MILESTONE';

export type ExecutionPriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

export interface ExecutionTaskItem {
  id: string; // e.g. "exec-dsa-cmum..." or "exec-revision-overdue"
  sourceRefId: string; // Problem ID, Quiz ID, Assessment ID, or category ref
  category: ExecutionCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  topic?: string;
  company?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedMinutes: number;
  isStandardDuration: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  isSkipped: boolean;
  deepLinkUrl: string;
  actionLabel: string; // "Start", "Continue", "Review", "Completed", etc.
  priority: ExecutionPriority;
  priorityRank: number; // 1, 2, 3...
  reason: string;
  orderIndex: number;
}

export interface TodayExecutionSummary {
  date: string; // Formatted readable: "Thursday, October 1, 2026"
  dateIso: string; // "2026-10-01"
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionPercentage: number;
  estimatedRemainingMinutes: number;
  currentStreak: number;
  overdueWorkloadCount: number;
  status: 'ALL_COMPLETED' | 'IN_PROGRESS' | 'LOW_WORKLOAD' | 'NO_TASKS';
}

export interface ConsistencyCategoryStat {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ConsistencyTrendDay {
  date: string; // "2026-10-01"
  dateLabel: string; // "Oct 01"
  dayOfWeek: string; // "Thu"
  planned: number;
  completed: number;
  percentage: number;
  active: boolean;
}

export interface ConsistencyAnalyticsData {
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  tasksCompleted7Days: number;
  tasksCompleted30Days: number;
  activeExecutionDays: number;
  completionRate: number; // 0-100%
  categoryDistribution: ConsistencyCategoryStat[];
  dailyTrend14Days: ConsistencyTrendDay[];
  dailyTrend30Days: ConsistencyTrendDay[];
  missedDaysCount: number;
}

export interface ExecutionHistoryDay {
  date: string; // "2026-10-01"
  dateLabel: string;
  tasksPlanned: number;
  tasksCompleted: number;
  tasksSkipped: number;
  completionPercentage: number;
  categoriesCompleted: string[];
  status: 'PERFECT' | 'PARTIAL' | 'MISSED' | 'EMPTY';
  tasks: Array<{
    taskId: string;
    title: string;
    category: string;
    isCompleted: boolean;
    isSkipped: boolean;
    completedAt: string | null;
  }>;
}

export interface UpcomingExecutionItem {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  estimatedMinutes: number;
  state: 'SCHEDULED' | 'PENDING';
  reason: string;
  deepLinkUrl: string;
}

export interface DailyExecutionWorkspaceData {
  summary: TodayExecutionSummary;
  tasks: ExecutionTaskItem[];
  consistency: ConsistencyAnalyticsData;
  history: ExecutionHistoryDay[];
  upcoming: UpcomingExecutionItem[];
}

// ----------------------------------------------------------------------------
// DATE HELPERS (Deterministic UTC-safe)
// ----------------------------------------------------------------------------

function getUtcDateIso(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

function formatReadableDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

function formatDayOfWeek(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ----------------------------------------------------------------------------
// MAIN DATA AGGREGATION SERVICE
// ----------------------------------------------------------------------------

export async function getDailyExecutionData(
  userId: string
): Promise<DailyExecutionWorkspaceData> {
  const now = new Date();
  const todayIso = getUtcDateIso(now);
  const startOfToday = new Date(todayIso + 'T00:00:00.000Z');
  const endOfToday = new Date(todayIso + 'T23:59:59.999Z');

  // 1. Parallel Fetch of Authoritative Subsystems
  const [
    cockpit,
    targetSlugs,
    companyCatalog,
    profile,
    recentProgressEvents,
    streakEvents,
    unsolvedCompanyProblems,
    unsolvedGeneralProblems,
    upcomingRevisions,
    unattemptedQuizzes,
    unpassedAssessments,
    dossierSnapshots,
  ] = await Promise.all([
    getPlacementReadinessCockpitData(userId),
    getUserTargetCompanySlugs(userId),
    getCompanyCatalogData(userId),
    prisma.profile.findUnique({
      where: { userId },
      select: { streakDays: true, lastActiveAt: true },
    }),
    prisma.progressEvent.findMany({
      where: {
        userId,
        eventType: {
          in: [
            'EXECUTION_PLAN_GENERATED',
            'EXECUTION_TASK_COMPLETED',
            'EXECUTION_TASK_SKIPPED',
            'EXECUTION_TASK_REOPENED',
            'PROBLEM_SOLVED',
            'QUIZ_COMPLETED',
            'REVISION_DONE',
            'INTERVIEW_PRACTICE_COMPLETED',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.streakEvent.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 60,
    }),
    prisma.problem.findMany({
      where: {
        companyProblems: { some: {} },
        userProgress: { none: { userId, isSolved: true } },
      },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        companyProblems: {
          take: 1,
          select: { company: { select: { name: true, slug: true } } },
        },
      },
    }),
    prisma.problem.findMany({
      where: {
        userProgress: { none: { userId, isSolved: true } },
      },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        topic: { select: { title: true, slug: true } },
      },
    }),
    prisma.revision.findMany({
      where: {
        userId,
        dueAt: { gt: endOfToday },
      },
      orderBy: { dueAt: 'asc' },
      take: 5,
      include: {
        problem: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.coreCSQuiz.findMany({
      where: {
        attempts: { none: { userId, scorePct: { gte: 70 } } },
      },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        durationMin: true,
        subject: { select: { title: true, slug: true } },
      },
    }),
    prisma.assessment.findMany({
      where: {
        status: 'PUBLISHED',
        attempts: { none: { userId, passed: true } },
      },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        durationMin: true,
        difficulty: true,
      },
    }),
    prisma.dossierSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, dossierId: true },
    }),
  ]);

  const { dimensions, milestones } = cockpit;

  // --------------------------------------------------------------------------
  // 2. CHECK / PARSE PERSISTED TODAY'S EXECUTION PLAN
  // --------------------------------------------------------------------------
  const todayPlanEvent = recentProgressEvents.find((e) => {
    if (e.eventType !== 'EXECUTION_PLAN_GENERATED') return false;
    try {
      const meta = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
      return meta?.date === todayIso;
    } catch {
      return false;
    }
  });

  // Track today's latest task event per taskId (recentProgressEvents is ordered by createdAt desc)
  const latestTaskEvent = new Map<string, { type: string; timestamp: string }>();

  for (const e of recentProgressEvents) {
    try {
      const meta = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
      const eventDate = meta?.date || getUtcDateIso(e.createdAt);

      if (eventDate === todayIso) {
        const taskId = meta?.taskId;
        if (!taskId) continue;

        if (
          !latestTaskEvent.has(taskId) &&
          (e.eventType === 'EXECUTION_TASK_COMPLETED' ||
            e.eventType === 'EXECUTION_TASK_SKIPPED' ||
            e.eventType === 'EXECUTION_TASK_REOPENED')
        ) {
          latestTaskEvent.set(taskId, {
            type: e.eventType,
            timestamp: e.createdAt.toISOString(),
          });
        }
      }
    } catch {
      // safe fallback
    }
  }

  let baseTasks: ExecutionTaskItem[] = [];

  if (todayPlanEvent) {
    try {
      const meta =
        typeof todayPlanEvent.metadata === 'string'
          ? JSON.parse(todayPlanEvent.metadata)
          : todayPlanEvent.metadata;
      if (Array.isArray(meta?.tasks)) {
        baseTasks = meta.tasks;
      }
    } catch {
      baseTasks = [];
    }
  }

  // --------------------------------------------------------------------------
  // 3. DETERMINISTIC TASK GENERATION (If not persisted for today)
  // --------------------------------------------------------------------------
  if (baseTasks.length === 0) {
    let orderCounter = 1;

    // Rule 1: Overdue Spaced Revision (SM-2 memory decay prevention)
    if (dimensions.revision.overdueCount > 0) {
      baseTasks.push({
        id: 'exec-revision-overdue',
        sourceRefId: 'revision-overdue-batch',
        category: 'REVISION',
        categoryLabel: 'Spaced Revision',
        title: `Clear ${dimensions.revision.overdueCount} Overdue Spaced Revisions`,
        subtitle: 'Critical recall decay mitigation via SM-2 active recall protocol',
        estimatedMinutes: Math.min(45, dimensions.revision.overdueCount * 3),
        isStandardDuration: false,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: '/dashboard/revision',
        actionLabel: 'Review Now',
        priority: 'HIGH',
        priorityRank: 1,
        reason: 'Active recall retention degrades rapidly when review intervals lapse before technical interviews.',
        orderIndex: orderCounter++,
      });
    } else if (dimensions.revision.dueTodayCount > 0) {
      baseTasks.push({
        id: 'exec-revision-due',
        sourceRefId: 'revision-due-batch',
        category: 'REVISION',
        categoryLabel: 'Spaced Revision',
        title: `Complete ${dimensions.revision.dueTodayCount} Revisions Due Today`,
        subtitle: 'Daily SM-2 flashcard review to lock in long-term memory',
        estimatedMinutes: Math.min(30, dimensions.revision.dueTodayCount * 3),
        isStandardDuration: false,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: '/dashboard/revision',
        actionLabel: 'Start Review',
        priority: 'NORMAL',
        priorityRank: 2,
        reason: 'Scheduled daily SM-2 active recall interval to consolidate recent concepts.',
        orderIndex: orderCounter++,
      });
    }

    // Rule 2: High-Priority Target Company DSA Problem
    if (unsolvedCompanyProblems.length > 0) {
      const targetProb = unsolvedCompanyProblems[0];
      const companyName = targetProb.companyProblems[0]?.company?.name || 'Target Company';
      baseTasks.push({
        id: `exec-dsa-${targetProb.id}`,
        sourceRefId: targetProb.id,
        category: 'DSA',
        categoryLabel: 'Algorithms',
        title: `Solve ${targetProb.title}`,
        subtitle: `${targetProb.difficulty} algorithmic problem tagged by ${companyName}`,
        company: companyName,
        difficulty: targetProb.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        estimatedMinutes: targetProb.difficulty === 'HARD' ? 45 : 30,
        isStandardDuration: false,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: `/dashboard/dsa/problem/${targetProb.slug}`,
        actionLabel: 'Solve Problem',
        priority: targetProb.difficulty === 'HARD' ? 'HIGH' : 'MEDIUM',
        priorityRank: targetProb.difficulty === 'HARD' ? 1 : 2,
        reason: `Target company algorithmic patterns represent high-probability interview questions.`,
        orderIndex: orderCounter++,
      });
    }

    // Rule 3: Core CS Diagnostic Diagnostic Improvement
    if (
      dimensions.coreCs.quizAttemptsCount === 0 ||
      dimensions.coreCs.avgScorePct < 70
    ) {
      const targetQuiz = unattemptedQuizzes[0];
      const subjectTitle = targetQuiz?.subject?.title || 'OS & Concurrency';
      baseTasks.push({
        id: targetQuiz ? `exec-core-cs-${targetQuiz.id}` : 'exec-core-cs-diagnostic',
        sourceRefId: targetQuiz?.id || 'core-cs-diagnostic-batch',
        category: 'CORE_CS',
        categoryLabel: 'Core CS',
        title: targetQuiz
          ? `Core CS Benchmark: ${targetQuiz.title}`
          : 'Core CS Diagnostic Quiz Improvement',
        subtitle: `${subjectTitle} diagnostic assessment to reach 70% institutional threshold`,
        topic: subjectTitle,
        estimatedMinutes: targetQuiz?.durationMin || 20,
        isStandardDuration: !targetQuiz?.durationMin,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: '/dashboard/core-cs',
        actionLabel: 'Take Diagnostic',
        priority: 'MEDIUM',
        priorityRank: 3,
        reason: 'Tier-1 tech and product companies filter heavily on OS concurrency, ACID properties, and memory management.',
        orderIndex: orderCounter++,
      });
    }

    // Rule 4: Timed Mock Assessment Simulation
    if (dimensions.assessment.passedCount === 0) {
      const targetOA = unpassedAssessments[0];
      baseTasks.push({
        id: targetOA ? `exec-mock-oa-${targetOA.id}` : 'exec-mock-oa',
        sourceRefId: targetOA?.id || 'mock-oa-batch',
        category: 'ASSESSMENT',
        categoryLabel: 'Assessments',
        title: targetOA
          ? `Clear Timed Assessment: ${targetOA.title}`
          : 'Complete Timed Mock Assessment',
        subtitle: 'Full 60-minute placement simulation with automated code evaluation',
        estimatedMinutes: targetOA?.durationMin || 60,
        isStandardDuration: false,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: targetOA
          ? `/dashboard/assessments/${targetOA.id}`
          : '/dashboard/assessments',
        actionLabel: 'Enter Simulation',
        priority: dimensions.assessment.attemptsCount === 0 ? 'HIGH' : 'MEDIUM',
        priorityRank: dimensions.assessment.attemptsCount === 0 ? 1 : 2,
        reason: 'Timed simulations evaluate pacing under strict anti-cheat conditions and negative marking.',
        orderIndex: orderCounter++,
      });
    }

    // Rule 5: Placement Dossier Snapshot if Missing
    if (dossierSnapshots.length === 0) {
      baseTasks.push({
        id: 'exec-generate-dossier',
        sourceRefId: 'dossier-creation',
        category: 'MILESTONE',
        categoryLabel: 'Dossier',
        title: 'Compile Initial Placement Dossier',
        subtitle: 'Lock in authoritative verified snapshot for campus placement and recruiter verification',
        estimatedMinutes: 5,
        isStandardDuration: true,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: '/dashboard/readiness/report',
        actionLabel: 'Generate Dossier',
        priority: 'NORMAL',
        priorityRank: 4,
        reason: 'Verified dossier snapshot establishes formal placement evidence for university placement cells.',
        orderIndex: orderCounter++,
      });
    }

    // Rule 6: Additional DSA Progression Problem if workload is low
    if (baseTasks.length < 2 && unsolvedGeneralProblems.length > 0) {
      const nextGen = unsolvedGeneralProblems[0];
      baseTasks.push({
        id: `exec-dsa-foundational-${nextGen.id}`,
        sourceRefId: nextGen.id,
        category: 'DSA',
        categoryLabel: 'Algorithms',
        title: `Solve ${nextGen.title}`,
        subtitle: `${nextGen.difficulty} algorithmic problem in ${nextGen.topic?.title || 'Data Structures'}`,
        topic: nextGen.topic?.title,
        difficulty: nextGen.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        estimatedMinutes: nextGen.difficulty === 'HARD' ? 45 : 30,
        isStandardDuration: false,
        isCompleted: false,
        completedAt: null,
        isSkipped: false,
        deepLinkUrl: `/dashboard/dsa/problem/${nextGen.slug}`,
        actionLabel: 'Solve Problem',
        priority: 'NORMAL',
        priorityRank: 3,
        reason: 'Foundational algorithmic consistency and topic breadth progression.',
        orderIndex: orderCounter++,
      });
    }

    // Persist newly generated plan asynchronously/safely without blocking if concurrent
    try {
      await prisma.progressEvent.create({
        data: {
          userId,
          eventType: 'EXECUTION_PLAN_GENERATED',
          metadata: JSON.stringify({
            date: todayIso,
            tasks: baseTasks,
          }),
        },
      });
    } catch {
      // ignore persistence conflict
    }
  }

  // --------------------------------------------------------------------------
  // 4. RECONCILIATION AGAINST AUTHORITATIVE DATABASE RECORDS
  // --------------------------------------------------------------------------
  const reconciledTasks: ExecutionTaskItem[] = [];

  for (const task of baseTasks) {
    const latestEvent = latestTaskEvent.get(task.id);
    let isCompleted = task.isCompleted;
    let completedAt = task.completedAt;
    let isSkipped = false;

    if (latestEvent) {
      if (latestEvent.type === 'EXECUTION_TASK_COMPLETED') {
        isCompleted = true;
        completedAt = latestEvent.timestamp;
      } else if (latestEvent.type === 'EXECUTION_TASK_SKIPPED') {
        isSkipped = true;
        isCompleted = false;
        completedAt = null;
      } else if (latestEvent.type === 'EXECUTION_TASK_REOPENED') {
        isCompleted = false;
        isSkipped = false;
        completedAt = null;
      }
    } else {
      // Domain reconciliation if no explicit execution event exists for this task today
      if (task.category === 'DSA' && task.sourceRefId) {
        const prog = await prisma.userProgress.findUnique({
          where: {
            userId_problemId: { userId, problemId: task.sourceRefId },
          },
        });
        if (prog?.isSolved) {
          isCompleted = true;
          completedAt = prog.solvedAt ? prog.solvedAt.toISOString() : now.toISOString();
        }
      } else if (task.category === 'CORE_CS' && task.sourceRefId.startsWith('cm')) {
        const attempt = await prisma.quizAttempt.findFirst({
          where: {
            userId,
            quizId: task.sourceRefId,
            scorePct: { gte: 70 },
          },
          orderBy: { completedAt: 'desc' },
        });
        if (attempt) {
          isCompleted = true;
          completedAt = attempt.completedAt.toISOString();
        }
      } else if (task.category === 'ASSESSMENT' && task.sourceRefId.startsWith('cm')) {
        const attempt = await prisma.assessmentAttempt.findFirst({
          where: {
            userId,
            assessmentId: task.sourceRefId,
            passed: true,
          },
        });
        if (attempt) {
          isCompleted = true;
          completedAt = attempt.evaluatedAt?.toISOString() || attempt.updatedAt.toISOString();
        }
      } else if (task.id === 'exec-revision-overdue') {
        if (dimensions.revision.overdueCount === 0) {
          isCompleted = true;
          completedAt = now.toISOString();
        }
      } else if (task.id === 'exec-revision-due') {
        if (dimensions.revision.dueTodayCount === 0) {
          isCompleted = true;
          completedAt = now.toISOString();
        }
      } else if (task.id === 'exec-generate-dossier') {
        if (dossierSnapshots.length > 0) {
          isCompleted = true;
          completedAt = now.toISOString();
        }
      }
    }

    reconciledTasks.push({
      ...task,
      isCompleted,
      completedAt,
      isSkipped,
      actionLabel: isCompleted ? 'Completed' : isSkipped ? 'Skipped' : task.actionLabel,
    });
  }

  // Sort tasks: Priority HIGH first, then uncompleted before completed, then orderIndex
  reconciledTasks.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    if (a.isSkipped !== b.isSkipped) return a.isSkipped ? 1 : -1;
    return a.orderIndex - b.orderIndex;
  });

  // --------------------------------------------------------------------------
  // 5. TODAY'S EXECUTION SUMMARY
  // --------------------------------------------------------------------------
  const totalTasks = reconciledTasks.length;
  const completedTasks = reconciledTasks.filter((t) => t.isCompleted).length;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  const estimatedRemainingMinutes = reconciledTasks
    .filter((t) => !t.isCompleted && !t.isSkipped)
    .reduce((acc, t) => acc + t.estimatedMinutes, 0);

  const status: TodayExecutionSummary['status'] =
    totalTasks === 0
      ? 'NO_TASKS'
      : completedTasks === totalTasks
      ? 'ALL_COMPLETED'
      : totalTasks <= 1
      ? 'LOW_WORKLOAD'
      : 'IN_PROGRESS';

  const currentStreak = profile?.streakDays ?? 0;

  const summary: TodayExecutionSummary = {
    date: formatReadableDate(now),
    dateIso: todayIso,
    totalTasks,
    completedTasks,
    remainingTasks,
    completionPercentage,
    estimatedRemainingMinutes,
    currentStreak,
    overdueWorkloadCount: dimensions.revision.overdueCount,
    status,
  };

  // --------------------------------------------------------------------------
  // 6. CONSISTENCY ANALYTICS & TREND VISUALIZATION
  // --------------------------------------------------------------------------
  // Build 30-day and 14-day chronological map of activity
  const activeDaysSet = new Set<string>();
  const dailyCompletedTasksCount: Record<string, number> = {};
  const dailyPlannedTasksCount: Record<string, number> = {};

  // Register today's tasks
  dailyPlannedTasksCount[todayIso] = totalTasks;
  dailyCompletedTasksCount[todayIso] = completedTasks;
  if (completedTasks > 0) {
    activeDaysSet.add(todayIso);
  }

  // Map progress events to dates
  for (const ev of recentProgressEvents) {
    const dStr = getUtcDateIso(ev.createdAt);
    if (
      ev.eventType === 'EXECUTION_TASK_COMPLETED' ||
      ev.eventType === 'PROBLEM_SOLVED' ||
      ev.eventType === 'QUIZ_COMPLETED' ||
      ev.eventType === 'REVISION_DONE' ||
      ev.eventType === 'INTERVIEW_PRACTICE_COMPLETED'
    ) {
      activeDaysSet.add(dStr);
      dailyCompletedTasksCount[dStr] = (dailyCompletedTasksCount[dStr] || 0) + 1;
    }
  }

  // Register streak events
  for (const se of streakEvents) {
    const dStr = getUtcDateIso(se.date);
    if (se.count > 0) {
      activeDaysSet.add(dStr);
    }
  }

  // Calculate 14-day and 30-day trend arrays
  const trend14: ConsistencyTrendDay[] = [];
  const trend30: ConsistencyTrendDay[] = [];

  let tasksCompleted7Days = 0;
  let tasksCompleted30Days = 0;
  let missedDaysCount = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dIso = getUtcDateIso(d);
    const completed = dailyCompletedTasksCount[dIso] || 0;
    const planned = dailyPlannedTasksCount[dIso] || (completed > 0 ? completed : i === 0 ? totalTasks : 0);
    const isActive = activeDaysSet.has(dIso) || completed > 0;
    const pct = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : isActive ? 100 : 0;

    tasksCompleted30Days += completed;
    if (i < 7) {
      tasksCompleted7Days += completed;
    }

    if (planned > 0 && completed === 0 && i > 0) {
      missedDaysCount++;
    }

    const dayEntry: ConsistencyTrendDay = {
      date: dIso,
      dateLabel: formatShortDate(d),
      dayOfWeek: formatDayOfWeek(d),
      planned,
      completed,
      percentage: pct,
      active: isActive,
    };

    trend30.push(dayEntry);
    if (i < 14) {
      trend14.push(dayEntry);
    }
  }

  // Longest streak calculation from streak dates
  let longestStreak = currentStreak;
  let runningStreak = 0;
  const sortedDates = Array.from(activeDaysSet).sort();

  for (let idx = 0; idx < sortedDates.length; idx++) {
    if (idx === 0) {
      runningStreak = 1;
    } else {
      const prev = new Date(sortedDates[idx - 1]).getTime();
      const curr = new Date(sortedDates[idx]).getTime();
      const diffDays = Math.round((curr - prev) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  // Category Distribution
  const categoryCounts: Record<string, number> = {
    DSA: dimensions.dsa.completedActivity || 0,
    'Core CS': dimensions.coreCs.quizAttemptsCount || 0,
    Assessments: dimensions.assessment.attemptsCount || 0,
    Revision: dimensions.revision.completedActivity || 0,
    Company: dimensions.dsa.companyTaggedSolved || 0,
    Milestone: milestones.filter((m) => m.status === 'COMPLETED').length,
  };

  const totalCompletedAllTime = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const categoryColors: Record<string, string> = {
    DSA: '#3B82F6', // Blue
    'Core CS': '#8B5CF6', // Purple
    Assessments: '#F59E0B', // Amber
    Revision: '#10B981', // Emerald
    Company: '#EC4899', // Pink
    Milestone: '#6366F1', // Indigo
  };

  const categoryDistribution: ConsistencyCategoryStat[] = Object.entries(categoryCounts).map(
    ([category, count]) => ({
      category,
      count,
      percentage:
        totalCompletedAllTime > 0
          ? Math.round((count / totalCompletedAllTime) * 100)
          : 0,
      color: categoryColors[category] || '#64748B',
    })
  );

  const activeExecutionDays = activeDaysSet.size;
  const totalPlannedInHistory = trend30.reduce((acc, d) => acc + d.planned, 0);
  const completionRate =
    totalPlannedInHistory > 0
      ? Math.round((tasksCompleted30Days / totalPlannedInHistory) * 100)
      : activeExecutionDays > 0
      ? 100
      : 0;

  const consistency: ConsistencyAnalyticsData = {
    currentStreak,
    longestStreak: Math.max(currentStreak, longestStreak),
    tasksCompletedToday: completedTasks,
    tasksCompleted7Days,
    tasksCompleted30Days,
    activeExecutionDays,
    completionRate: Math.min(100, completionRate),
    categoryDistribution,
    dailyTrend14Days: trend14,
    dailyTrend30Days: trend30,
    missedDaysCount,
  };

  // --------------------------------------------------------------------------
  // 7. EXECUTION HISTORY (Past 7 Days Detail)
  // --------------------------------------------------------------------------
  const history: ExecutionHistoryDay[] = [];

  for (let i = 1; i <= 7; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dIso = getUtcDateIso(d);

    // Find progress events for that date
    const dayEvents = recentProgressEvents.filter((e) => {
      const evDate = getUtcDateIso(e.createdAt);
      return evDate === dIso;
    });

    const completedInDay = dayEvents.filter(
      (e) =>
        e.eventType === 'EXECUTION_TASK_COMPLETED' ||
        e.eventType === 'PROBLEM_SOLVED' ||
        e.eventType === 'QUIZ_COMPLETED' ||
        e.eventType === 'REVISION_DONE'
    );

    const skippedInDay = dayEvents.filter((e) => e.eventType === 'EXECUTION_TASK_SKIPPED');

    const tasksCount = Math.max(completedInDay.length + skippedInDay.length, 2);
    const compCount = completedInDay.length;
    const pct = Math.round((compCount / tasksCount) * 100);

    const categoriesCompleted = Array.from(
      new Set(
        completedInDay.map((e) => {
          if (e.eventType === 'PROBLEM_SOLVED') return 'DSA';
          if (e.eventType === 'QUIZ_COMPLETED') return 'Core CS';
          if (e.eventType === 'REVISION_DONE') return 'Revision';
          return 'Execution';
        })
      )
    );

    if (compCount > 0 || skippedInDay.length > 0) {
      history.push({
        date: dIso,
        dateLabel: formatShortDate(d),
        tasksPlanned: tasksCount,
        tasksCompleted: compCount,
        tasksSkipped: skippedInDay.length,
        completionPercentage: pct,
        categoriesCompleted,
        status: compCount >= tasksCount ? 'PERFECT' : compCount > 0 ? 'PARTIAL' : 'MISSED',
        tasks: completedInDay.map((e, idx) => ({
          taskId: `hist-${dIso}-${idx}`,
          title: `Completed ${e.eventType.replace('_', ' ').toLowerCase()}`,
          category: e.eventType.split('_')[0],
          isCompleted: true,
          isSkipped: false,
          completedAt: e.createdAt.toISOString(),
        })),
      });
    }
  }

  // --------------------------------------------------------------------------
  // 8. UPCOMING WORKLOAD (Scheduled vs Pending based on Real DB Data)
  // --------------------------------------------------------------------------
  const upcoming: UpcomingExecutionItem[] = [];

  // A. Scheduled revisions
  for (const rev of upcomingRevisions) {
    upcoming.push({
      id: `upcoming-rev-${rev.id}`,
      title: `Spaced Revision: ${rev.problem.title}`,
      category: 'Revision',
      dateLabel: formatShortDate(rev.dueAt),
      estimatedMinutes: 5,
      state: 'SCHEDULED',
      reason: `Automated SM-2 interval scheduled for ${formatShortDate(rev.dueAt)}.`,
      deepLinkUrl: '/dashboard/revision',
    });
  }

  // B. Pending target company problems
  for (const prob of unsolvedCompanyProblems.slice(1, 3)) {
    upcoming.push({
      id: `upcoming-dsa-${prob.id}`,
      title: `Algorithmic Pattern: ${prob.title}`,
      category: 'DSA',
      dateLabel: 'Upcoming',
      estimatedMinutes: prob.difficulty === 'HARD' ? 45 : 30,
      state: 'PENDING',
      reason: `Tagged problem for ${prob.companyProblems[0]?.company?.name || 'Target Company'}.`,
      deepLinkUrl: `/dashboard/dsa/problem/${prob.slug}`,
    });
  }

  // C. In-progress milestones
  const pendingMilestones = milestones.filter((m) => m.status === 'IN_PROGRESS');
  for (const m of pendingMilestones.slice(0, 2)) {
    upcoming.push({
      id: `upcoming-milestone-${m.id}`,
      title: m.title,
      category: 'Milestone',
      dateLabel: 'In Progress',
      estimatedMinutes: 20,
      state: 'PENDING',
      reason: m.description,
      deepLinkUrl: '/dashboard/readiness',
    });
  }

  return {
    summary,
    tasks: reconciledTasks,
    consistency,
    history,
    upcoming,
  };
}

// ----------------------------------------------------------------------------
// EXPLICIT TASK MUTATION & AUDITING HELPERS
// ----------------------------------------------------------------------------

export async function recordTaskCompletion(
  userId: string,
  taskId: string,
  category: string,
  dateIso?: string
): Promise<void> {
  const date = dateIso || getUtcDateIso();

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'EXECUTION_TASK_COMPLETED',
      metadata: JSON.stringify({
        taskId,
        category,
        date,
        completedAt: new Date().toISOString(),
      }),
    },
  });

  // Increment or record today's streak event
  const todayDate = new Date(date + 'T00:00:00.000Z');
  await prisma.streakEvent.upsert({
    where: {
      userId_date_activityType: {
        userId,
        date: todayDate,
        activityType: 'EXECUTION',
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      date: todayDate,
      activityType: 'EXECUTION',
      count: 1,
    },
  });
}

export async function recordTaskReopening(
  userId: string,
  taskId: string,
  dateIso?: string
): Promise<void> {
  const date = dateIso || getUtcDateIso();

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'EXECUTION_TASK_REOPENED',
      metadata: JSON.stringify({
        taskId,
        date,
        reopenedAt: new Date().toISOString(),
      }),
    },
  });
}

export async function recordTaskSkip(
  userId: string,
  taskId: string,
  reason?: string,
  dateIso?: string
): Promise<void> {
  const date = dateIso || getUtcDateIso();

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'EXECUTION_TASK_SKIPPED',
      metadata: JSON.stringify({
        taskId,
        date,
        reason: reason || 'Deferred by student',
        skippedAt: new Date().toISOString(),
      }),
    },
  });
}
