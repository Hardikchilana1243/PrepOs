// ============================================================================
// PREPOS WEEKLY PREPARATION PLAN SERVICE
// Deterministic Aggregation of Weekly Targets, Progress & Adaptive Tasks
// ============================================================================

import prisma from '../db';
import {
  getAdaptivePreparationData,
  AdaptivePlanTask,
  TaskPriority,
} from './adaptive-preparation';

export interface WeeklyTarget {
  id: string;
  pillar: 'DSA' | 'CORE_CS' | 'REVISION' | 'ASSESSMENT';
  title: string;
  current: number;
  target: number;
  remaining: number;
  unit: string;
  isCompleted: boolean;
  completionPct: number;
  actionHref: string;
  actionText: string;
}

export interface WeeklyPlanData {
  weekStartFormatted: string;
  weekEndFormatted: string;
  overallWeeklyPct: number;
  currentStreak: number;
  targets: WeeklyTarget[];
  overdueTasks: AdaptivePlanTask[];
  todayTasks: AdaptivePlanTask[];
  allWeeklyTasks: AdaptivePlanTask[];
  completedCount: number;
  remainingCount: number;
}

/**
 * Calculates start and end of current UTC week (Monday 00:00 to Sunday 23:59:59)
 */
export function getUtcWeekRange(referenceDate = new Date()): { startOfWeek: Date; endOfWeek: Date } {
  const d = new Date(referenceDate);
  const day = d.getUTCDay(); // 0 is Sun, 1 is Mon...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diffToMonday, 0, 0, 0, 0));
  const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 23, 59, 59, 999));
  return { startOfWeek: monday, endOfWeek: sunday };
}

export async function getWeeklyPlanData(userId: string): Promise<WeeklyPlanData> {
  const now = new Date();
  const { startOfWeek, endOfWeek } = getUtcWeekRange(now);

  // 1. Fetch user activity counts for current week in parallel
  const [
    profile,
    dsaSolvedThisWeek,
    quizzesAttemptedThisWeek,
    revisionsCompletedThisWeek,
    oaAttemptedThisWeek,
    adaptiveData,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { streakDays: true },
    }),
    prisma.userProgress.count({
      where: {
        userId,
        isSolved: true,
        updatedAt: { gte: startOfWeek },
      },
    }),
    prisma.quizAttempt.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    }),
    prisma.revision.count({
      where: {
        userId,
        completedAt: { gte: startOfWeek },
      },
    }),
    prisma.assessmentAttempt.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
        status: { in: ['SUBMITTED', 'EVALUATING', 'EVALUATED', 'EXPIRED'] },
      },
    }),
    getAdaptivePreparationData(userId),
  ]);

  const streakDays = profile?.streakDays ?? 0;

  // 2. Define deterministic weekly targets
  // Academic placement benchmark: 5 DSA problems, 2 Core CS quizzes, 5 Spaced reviews, 1 Mock OA
  const dsaTargetCount = 5;
  const coreCsTargetCount = 2;
  const revisionTargetCount = 5;
  const oaTargetCount = 1;

  const dsaRemaining = Math.max(0, dsaTargetCount - dsaSolvedThisWeek);
  const coreCsRemaining = Math.max(0, coreCsTargetCount - quizzesAttemptedThisWeek);
  const revisionRemaining = Math.max(0, revisionTargetCount - revisionsCompletedThisWeek);
  const oaRemaining = Math.max(0, oaTargetCount - oaAttemptedThisWeek);

  const targets: WeeklyTarget[] = [
    {
      id: 'target-dsa',
      pillar: 'DSA',
      title: 'DSA Roadmap Problems',
      current: dsaSolvedThisWeek,
      target: dsaTargetCount,
      remaining: dsaRemaining,
      unit: 'problems',
      isCompleted: dsaRemaining === 0,
      completionPct: Math.min(100, Math.round((dsaSolvedThisWeek / dsaTargetCount) * 100)),
      actionHref: '/dashboard/dsa',
      actionText: dsaRemaining === 0 ? 'Review Problems' : 'Solve Next Problem',
    },
    {
      id: 'target-corecs',
      pillar: 'CORE_CS',
      title: 'Core CS Speed Drills',
      current: quizzesAttemptedThisWeek,
      target: coreCsTargetCount,
      remaining: coreCsRemaining,
      unit: 'quizzes',
      isCompleted: coreCsRemaining === 0,
      completionPct: Math.min(100, Math.round((quizzesAttemptedThisWeek / coreCsTargetCount) * 100)),
      actionHref: '/dashboard/core-cs',
      actionText: coreCsRemaining === 0 ? 'Review Fundamentals' : 'Start Diagnostic Drill',
    },
    {
      id: 'target-revision',
      pillar: 'REVISION',
      title: 'Spaced Repetition Recall',
      current: revisionsCompletedThisWeek,
      target: revisionTargetCount,
      remaining: revisionRemaining,
      unit: 'reviews',
      isCompleted: revisionRemaining === 0,
      completionPct: Math.min(100, Math.round((revisionsCompletedThisWeek / revisionTargetCount) * 100)),
      actionHref: '/dashboard/revision',
      actionText: revisionRemaining === 0 ? 'View Queue' : 'Review Recall Cards',
    },
    {
      id: 'target-oa',
      pillar: 'ASSESSMENT',
      title: 'Full Mock OA Simulation',
      current: oaAttemptedThisWeek,
      target: oaTargetCount,
      remaining: oaRemaining,
      unit: 'simulation',
      isCompleted: oaRemaining === 0,
      completionPct: Math.min(100, Math.round((oaAttemptedThisWeek / oaTargetCount) * 100)),
      actionHref: '/dashboard/assessments',
      actionText: oaRemaining === 0 ? 'View Performance' : 'Take Mock OA',
    },
  ];

  // Overall weekly target percentage
  const totalTargetPoints = dsaTargetCount + coreCsTargetCount + revisionTargetCount + oaTargetCount;
  const totalCompletedPoints =
    Math.min(dsaTargetCount, dsaSolvedThisWeek) +
    Math.min(coreCsTargetCount, quizzesAttemptedThisWeek) +
    Math.min(revisionTargetCount, revisionsCompletedThisWeek) +
    Math.min(oaTargetCount, oaAttemptedThisWeek);

  const overallWeeklyPct = Math.round((totalCompletedPoints / totalTargetPoints) * 100);

  // 3. Assemble Overdue & Today Tasks
  const overdueTasks: AdaptivePlanTask[] = [];
  const todayTasks = adaptiveData.todayPlan;

  // If there are overdue revisions, highlight as an overdue priority task
  const overdueRevisionTask = todayTasks.find(
    (t) => t.area === 'REVISION' && t.priority === 'CRITICAL'
  );
  if (overdueRevisionTask) {
    overdueTasks.push(overdueRevisionTask);
  }

  // 4. Synthesize complete weekly action items list
  const allWeeklyTasks: AdaptivePlanTask[] = [...todayTasks];

  // Add remaining weekly milestone tasks if not already covered in today's plan
  if (dsaRemaining > 0 && !allWeeklyTasks.some((t) => t.area === 'DSA')) {
    allWeeklyTasks.push({
      id: 'weekly-dsa-quota',
      area: 'DSA',
      title: `Complete weekly DSA target (${dsaRemaining} problem(s) remaining)`,
      reason: `Target is 5 problems/week to maintain campus placement readiness velocity.`,
      estimatedMinutes: 25 * dsaRemaining,
      href: '/dashboard/dsa',
      priority: dsaRemaining > 2 ? 'HIGH' : 'MEDIUM',
      metricImpact: 'DSA Mastery & Weekly Quota',
      unlockText: 'Keeps weekly algorithmic velocity on track.',
      isCompleted: false,
    });
  }

  if (coreCsRemaining > 0 && !allWeeklyTasks.some((t) => t.area === 'CORE_CS')) {
    allWeeklyTasks.push({
      id: 'weekly-corecs-quota',
      area: 'CORE_CS',
      title: `Complete weekly Core CS benchmark (${coreCsRemaining} drill(s) remaining)`,
      reason: `Regular MCQ speed drills solidify DBMS & OS memory recall.`,
      estimatedMinutes: 10 * coreCsRemaining,
      href: '/dashboard/core-cs',
      priority: 'MEDIUM',
      metricImpact: 'Core CS Score',
      unlockText: 'Prevents forgetting foundational system concepts.',
      isCompleted: false,
    });
  }

  if (oaRemaining > 0 && !allWeeklyTasks.some((t) => t.area === 'ASSESSMENT')) {
    allWeeklyTasks.push({
      id: 'weekly-oa-quota',
      area: 'ASSESSMENT',
      title: 'Complete 1 Mock OA Simulation this week',
      reason: 'Regular timed assessment practice prevents exam fatigue during placement season.',
      estimatedMinutes: 60,
      href: '/dashboard/assessments',
      priority: 'HIGH',
      metricImpact: 'Mock OA Stamina',
      unlockText: 'Ensures exam-condition readiness and speed accuracy.',
      isCompleted: false,
    });
  }

  // Also include completed weekly items for history
  if (dsaRemaining === 0) {
    allWeeklyTasks.push({
      id: 'weekly-dsa-done',
      area: 'DSA',
      title: `Weekly DSA Target Met (${dsaSolvedThisWeek}/${dsaTargetCount} Solved)`,
      reason: 'All targeted algorithms for this week solved and verified.',
      estimatedMinutes: 0,
      href: '/dashboard/dsa',
      priority: 'RECOMMENDED',
      metricImpact: 'Weekly Goal Complete',
      unlockText: 'Curriculum pace maintained.',
      isCompleted: true,
    });
  }

  if (coreCsRemaining === 0) {
    allWeeklyTasks.push({
      id: 'weekly-corecs-done',
      area: 'CORE_CS',
      title: `Weekly Core CS Target Met (${quizzesAttemptedThisWeek}/${coreCsTargetCount} Quizzes)`,
      reason: 'Weekly diagnostic drill quota completed.',
      estimatedMinutes: 0,
      href: '/dashboard/core-cs',
      priority: 'RECOMMENDED',
      metricImpact: 'Weekly Goal Complete',
      unlockText: 'Screening thresholds maintained.',
      isCompleted: true,
    });
  }

  if (oaRemaining === 0) {
    allWeeklyTasks.push({
      id: 'weekly-oa-done',
      area: 'ASSESSMENT',
      title: 'Weekly Mock OA Simulation Cleared',
      reason: 'Timed simulation completed within this calendar week.',
      estimatedMinutes: 0,
      href: '/dashboard/assessments',
      priority: 'RECOMMENDED',
      metricImpact: 'Weekly Goal Complete',
      unlockText: 'Screening stamina proven.',
      isCompleted: true,
    });
  }

  const completedCount = allWeeklyTasks.filter((t) => t.isCompleted).length;
  const remainingCount = allWeeklyTasks.filter((t) => !t.isCompleted).length;

  // Format week dates for display (e.g. "Oct 12 – Oct 18")
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const weekStartFormatted = formatter.format(startOfWeek);
  const weekEndFormatted = formatter.format(endOfWeek);

  return {
    weekStartFormatted,
    weekEndFormatted,
    overallWeeklyPct,
    currentStreak: streakDays,
    targets,
    overdueTasks,
    todayTasks,
    allWeeklyTasks,
    completedCount,
    remainingCount,
  };
}
