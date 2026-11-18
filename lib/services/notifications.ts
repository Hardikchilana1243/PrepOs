// ============================================================================
// PREPOS NOTIFICATION & REMINDER SERVICE (PHASE 6.16)
// Authoritative, Database-Backed Smart Reminder & Notification Center
// Strictly Derived from Authentic Preparation Records (SM-2, Daily Execution,
// Mock Assessments, Core CS Diagnostics, Company Hubs, Placement Readiness)
// Zero AI/ML Predictions - Zero Synthetic Urgency - Multi-Tenant User Scoped
// ============================================================================

import prisma from '../db';
import { normalizeUtcMidnight } from '../utils/date';
import { getDailyExecutionData } from './daily-execution';
import { getPlacementExecutionData } from './readiness-execution';
import {
  getNotificationPreferences,
  NotificationPreferences,
} from './notification-preferences';
import {
  getNotificationHistory,
  NotificationHistoryItem,
} from './notification-engine';

// ----------------------------------------------------------------------------
// DOMAIN TYPES & ENUMS
// ----------------------------------------------------------------------------

export type NotificationCategory =
  | 'DUE_TODAY'
  | 'OVERDUE'
  | 'DAILY_EXECUTION'
  | 'REVISION'
  | 'ASSESSMENT'
  | 'CORE_CS'
  | 'COMPANY'
  | 'READINESS';

export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED' | 'EXPIRED';

export type NotificationUrgency = 'URGENT' | 'HIGH' | 'NORMAL' | 'INFO';

export interface PlacementNotificationItem {
  id: string; // Unique deterministic identifier e.g. "notif-rev-overdue-1"
  sourceRefId?: string; // Problem ID, Assessment ID, Quiz ID, or category ref
  category: NotificationCategory;
  categoryLabel: string;
  title: string;
  description: string;
  sourceCount?: number;
  status: NotificationStatus;
  urgency: NotificationUrgency;
  deepLinkUrl: string;
  actionLabel: string;
  createdAt: string; // ISO
  readAt?: string | null;
  dismissedAt?: string | null;
  eligibilityReason: string;
}

export interface NotificationCenterSummary {
  totalActive: number;
  unreadCount: number;
  dueTodayCount: number;
  overdueCount: number;
  dailyExecutionCount: number;
  revisionCount: number;
  assessmentCount: number;
  coreCsCount: number;
  readinessCount: number;
}

export interface NotificationCategoryFilter {
  id: string;
  label: string;
  count: number;
}

export interface NotificationCenterData {
  summary: NotificationCenterSummary;
  notifications: PlacementNotificationItem[];
  categories: NotificationCategoryFilter[];
  history: NotificationHistoryItem[];
  preferences: NotificationPreferences;
}

// ----------------------------------------------------------------------------
// LEGACY INTERFACE SUPPORT (Preserving Phase 1–5 AppShell Compatibility)
// ----------------------------------------------------------------------------

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: 'REVISION' | 'MISSION' | 'ASSESSMENT' | 'CALIBRATION' | 'BENCHMARK';
  severity: 'urgent' | 'info' | 'success';
  href: string;
  actionText: string;
  createdAt: string;
}

export async function getStudentNotifications(userId: string): Promise<StudentNotification[]> {
  const centerData = await getNotificationCenterData(userId);
  return centerData.notifications
    .filter((n) => n.status === 'UNREAD')
    .map((n) => {
    let type: StudentNotification['type'] = 'REVISION';
    if (n.category === 'ASSESSMENT') type = 'ASSESSMENT';
    else if (n.category === 'CORE_CS') type = 'BENCHMARK';
    else if (n.category === 'DAILY_EXECUTION') type = 'MISSION';

    let severity: StudentNotification['severity'] = 'info';
    if (n.urgency === 'URGENT') severity = 'urgent';
    else if (n.urgency === 'INFO') severity = 'success';

    return {
      id: n.id,
      title: n.title,
      message: n.description,
      type,
      severity,
      href: n.deepLinkUrl,
      actionText: n.actionLabel,
      createdAt: 'Today',
    };
  });
}

// ----------------------------------------------------------------------------
// CORE NOTIFICATION AGGREGATION ENGINE
// ----------------------------------------------------------------------------

/**
 * Compiles complete notification center data for an authenticated student.
 * Aggregates only authentic records from SM-2, Daily Execution, Mock OA, Core CS,
 * Company Hubs, and Readiness Cockpit.
 */
export async function getNotificationCenterData(
  userId: string
): Promise<NotificationCenterData> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated userId is required to fetch notifications.');
  }

  const now = new Date();
  const todayDateIso = now.toISOString().split('T')[0];

  // 1. Parallel Fetch of Authoritative Subsystems & Audit State
  const [
    dailyData,
    executionData,
    preferences,
    notificationHistory,
    revisions,
    unpassedAssessments,
    unattemptedAssessments,
    diagnosticQuizzes,
    sub70QuizAttempts,
    targetCompanies,
    unsolvedCompanyProblems,
    auditEvents,
  ] = await Promise.all([
    // Daily Execution Engine (Phase 6.15)
    getDailyExecutionData(userId),
    // Final Readiness Command Center (Phase 6.14)
    getPlacementExecutionData(userId),
    // Notification Preferences (Phase 6.16)
    getNotificationPreferences(userId),
    // Audit History
    getNotificationHistory(userId, 15),
    // Spaced Revision Records (Phase 6.9)
    prisma.revision.findMany({
      where: { userId },
      select: {
        id: true,
        problemId: true,
        dueAt: true,
        completedAt: true,
        intervalDays: true,
        problem: { select: { title: true, slug: true } },
      },
    }),
    // Evaluated Unpassed Mock Assessments
    prisma.assessmentAttempt.findMany({
      where: {
        userId,
        status: 'EVALUATED',
        passed: false,
      },
      take: 2,
      select: {
        id: true,
        scorePct: true,
        assessment: { select: { id: true, title: true, slug: true, durationMin: true } },
      },
    }),
    // Published Assessments Not Yet Attempted
    prisma.assessment.findMany({
      where: {
        status: 'PUBLISHED',
        attempts: { none: { userId } },
      },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        durationMin: true,
      },
    }),
    // Core CS Quizzes with Score Deficits (< 70% or unattempted)
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
        subject: { select: { title: true } },
      },
    }),
    // Core CS Diagnostic Quiz Attempts Below 70% Screening Benchmark
    prisma.quizAttempt.findMany({
      where: {
        userId,
        scorePct: { lt: 70 },
      },
      orderBy: { completedAt: 'desc' },
      take: 2,
      select: {
        id: true,
        scorePct: true,
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationMin: true,
            subject: { select: { title: true } },
          },
        },
      },
    }),
    // Target Companies Selected by Student
    prisma.progressEvent.findMany({
      where: { userId, eventType: 'TARGET_COMPANY_SET' },
      take: 2,
      select: { metadata: true },
    }),
    // Remaining Target-Company DSA Problems
    prisma.problem.findMany({
      where: {
        companyProblems: { some: {} },
        userProgress: { none: { userId, isSolved: true } },
      },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        companyProblems: {
          take: 1,
          select: { company: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    // Recent Notification State Events (Read, Dismissed)
    prisma.progressEvent.findMany({
      where: {
        userId,
        eventType: {
          in: [
            'NOTIFICATION_READ',
            'NOTIFICATION_DISMISSED',
            'ALL_NOTIFICATIONS_READ',
            'REMINDER_DISMISSED',
            'REMINDER_OPENED',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  // 2. Build Read & Dismissed Sets from Audit Events
  const readSet = new Set<string>();
  const dismissedSet = new Set<string>();
  let allReadAt: Date | null = null;

  for (const evt of auditEvents) {
    try {
      const meta = typeof evt.metadata === 'string' ? JSON.parse(evt.metadata) : evt.metadata;
      if (evt.eventType === 'ALL_NOTIFICATIONS_READ') {
        const evtDate = evt.createdAt ? new Date(evt.createdAt) : null;
        if (evtDate && (!allReadAt || evtDate > allReadAt)) {
          allReadAt = evtDate;
        }
      } else if (evt.eventType === 'NOTIFICATION_READ' && meta?.notificationId) {
        readSet.add(meta.notificationId);
      } else if (evt.eventType === 'NOTIFICATION_DISMISSED' && meta?.notificationId) {
        dismissedSet.add(meta.notificationId);
      } else if (evt.eventType === 'REMINDER_DISMISSED' && meta?.reminderId) {
        dismissedSet.add(meta.reminderId);
      } else if (evt.eventType === 'REMINDER_OPENED' && meta?.reminderId) {
        readSet.add(meta.reminderId);
      }
    } catch {
      // Ignore parse errors
    }
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  function isItemRead(notifId: string, itemTimestamp?: Date): boolean {
    if (readSet.has(notifId)) return true;
    if (!allReadAt) return false;
    if (itemTimestamp) {
      return itemTimestamp <= allReadAt;
    }
    return allReadAt.getTime() >= todayStart.getTime();
  }

  const notifications: PlacementNotificationItem[] = [];

  // --------------------------------------------------------------------------
  // A. SM-2 SPACED REVISION SIGNALS (Phase 6.9)
  // --------------------------------------------------------------------------
  let dueRevisionsCount = 0;
  let overdueRevisionsCount = 0;
  const overdueTitles: string[] = [];
  const dueTitles: string[] = [];

  for (const rev of revisions) {
    if (rev.completedAt) continue;
    const dueTime = new Date(rev.dueAt).getTime();
    if (dueTime <= now.getTime()) {
      const diffDays = Math.floor((now.getTime() - dueTime) / 86400000);
      if (diffDays >= 1) {
        overdueRevisionsCount++;
        if (rev.problem?.title && overdueTitles.length < 2) {
          overdueTitles.push(rev.problem.title);
        }
      } else {
        dueRevisionsCount++;
        if (rev.problem?.title && dueTitles.length < 2) {
          dueTitles.push(rev.problem.title);
        }
      }
    }
  }

  // 1. Overdue SM-2 Revisions
  if (preferences.revisionOverdueEnabled && overdueRevisionsCount > 0) {
    const notifId = `notif-revision-overdue-${todayDateIso}`;
    const desc =
      overdueTitles.length > 0
        ? `${overdueRevisionsCount} problem${
            overdueRevisionsCount > 1 ? 's are' : ' is'
          } overdue for active recall (${overdueTitles.join(', ')}${
            overdueRevisionsCount > 2 ? '...' : ''
          }).`
        : `${overdueRevisionsCount} spaced repetition problem${
            overdueRevisionsCount > 1 ? 's are' : ' is'
          } overdue for active recall.`;

    notifications.push({
      id: notifId,
      category: 'OVERDUE',
      categoryLabel: 'Overdue Recall',
      title: 'Spaced Recall Overdue',
      description: desc,
      sourceCount: overdueRevisionsCount,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'URGENT',
      deepLinkUrl: '/dashboard/revision',
      actionLabel: 'Review Overdue',
      createdAt: now.toISOString(),
      eligibilityReason: 'Authentic SM-2 items have exceeded their recall window.',
    });
  }

  // 2. Due Today SM-2 Revisions
  if (preferences.revisionDueEnabled && dueRevisionsCount > 0) {
    const notifId = `notif-revision-due-${todayDateIso}`;
    const desc =
      dueTitles.length > 0
        ? `${dueRevisionsCount} problem${
            dueRevisionsCount > 1 ? 's are' : ' is'
          } scheduled for interval review today (${dueTitles.join(', ')}).`
        : `${dueRevisionsCount} problem${
            dueRevisionsCount > 1 ? 's are' : ' is'
          } scheduled for interval review today.`;

    notifications.push({
      id: notifId,
      category: 'DUE_TODAY',
      categoryLabel: 'Due Today',
      title: 'Spaced Revision Due',
      description: desc,
      sourceCount: dueRevisionsCount,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'HIGH',
      deepLinkUrl: '/dashboard/revision',
      actionLabel: 'Start Review',
      createdAt: now.toISOString(),
      eligibilityReason: 'Authentic SM-2 spaced repetition items are scheduled for review today.',
    });
  }

  // --------------------------------------------------------------------------
  // B. DAILY EXECUTION SIGNALS (Phase 6.15)
  // --------------------------------------------------------------------------
  const remainingDaily = dailyData.summary.remainingTasks;
  const completedDaily = dailyData.summary.completedTasks;
  const totalDaily = dailyData.summary.totalTasks;

  if (preferences.dailyExecutionEnabled && remainingDaily > 0) {
    const notifId = `notif-daily-execution-${todayDateIso}`;
    notifications.push({
      id: notifId,
      category: 'DAILY_EXECUTION',
      categoryLabel: 'Daily Plan',
      title: "Today's Placement Execution",
      description: `${remainingDaily} of ${totalDaily} daily placement task${
        totalDaily > 1 ? 's' : ''
      } remain incomplete for today (${dailyData.summary.estimatedRemainingMinutes}m estimated).`,
      sourceCount: remainingDaily,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'HIGH',
      deepLinkUrl: '/dashboard/readiness#today-execution',
      actionLabel: 'Execute Tasks',
      createdAt: now.toISOString(),
      eligibilityReason: "Today's daily placement plan contains incomplete tasks.",
    });
  } else if (totalDaily > 0 && remainingDaily === 0) {
    const notifId = `notif-daily-completed-${todayDateIso}`;
    notifications.push({
      id: notifId,
      category: 'DAILY_EXECUTION',
      categoryLabel: 'Daily Plan',
      title: 'Daily Placement Workload Finished',
      description: `All ${completedDaily} planned tasks completed for today. Current consistency streak: ${dailyData.summary.currentStreak} day(s).`,
      sourceCount: completedDaily,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'INFO',
      deepLinkUrl: '/dashboard/readiness#consistency-analytics',
      actionLabel: 'View Consistency',
      createdAt: now.toISOString(),
      eligibilityReason: 'All daily execution tasks have been marked complete.',
    });
  }

  // --------------------------------------------------------------------------
  // C. MOCK ASSESSMENT DRILL SIGNALS (Phase 5)
  // --------------------------------------------------------------------------
  // 1. Unpassed Assessment Needing Retake
  if (unpassedAssessments.length > 0) {
    const unpassed = unpassedAssessments[0];
    const notifId = `notif-assessment-retake-${unpassed.id}`;
    notifications.push({
      id: notifId,
      sourceRefId: unpassed.assessment?.id,
      category: 'ASSESSMENT',
      categoryLabel: 'Mock Assessment',
      title: 'Assessment Retake Recommended',
      description: `Previous attempt on "${unpassed.assessment?.title}" scored ${unpassed.scorePct}%. Retake the timed drill to clear the screening benchmark.`,
      sourceCount: 1,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'HIGH',
      deepLinkUrl: `/dashboard/assessments/${unpassed.assessment?.slug || ''}`,
      actionLabel: 'Retake Assessment',
      createdAt: now.toISOString(),
      eligibilityReason: 'Previous attempt did not achieve passing placement score.',
    });
  } else if (unattemptedAssessments.length > 0) {
    const unattempted = unattemptedAssessments[0];
    const notifId = `notif-assessment-new-${unattempted.id}`;
    notifications.push({
      id: notifId,
      sourceRefId: unattempted.id,
      category: 'ASSESSMENT',
      categoryLabel: 'Mock Assessment',
      title: 'Mock Assessment Available',
      description: `"${unattempted.title}" (${unattempted.durationMin} mins) is unattempted. Practice timed interview conditions.`,
      sourceCount: 1,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'NORMAL',
      deepLinkUrl: `/dashboard/assessments/${unattempted.slug}`,
      actionLabel: 'Start Drill',
      createdAt: now.toISOString(),
      eligibilityReason: 'Published mock assessment ready in the assessment catalog.',
    });
  }

  // --------------------------------------------------------------------------
  // D. CORE CS DIAGNOSTIC SIGNALS (Phase 4)
  // --------------------------------------------------------------------------
  if (diagnosticQuizzes.length > 0) {
    const quiz = diagnosticQuizzes[0];
    const notifId = `notif-corecs-deficit-${quiz.id}`;
    notifications.push({
      id: notifId,
      sourceRefId: quiz.id,
      category: 'CORE_CS',
      categoryLabel: 'Core CS',
      title: 'Core CS Benchmark Deficit',
      description: `Diagnostic for "${quiz.title}" (${quiz.subject?.title}) is below the 70% placement screening benchmark.`,
      sourceCount: diagnosticQuizzes.length,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'NORMAL',
      deepLinkUrl: '/dashboard/core-cs',
      actionLabel: 'Take Diagnostic',
      createdAt: now.toISOString(),
      eligibilityReason: 'Subject score has not reached the 70% placement threshold.',
    });
  } else if (sub70QuizAttempts.length > 0) {
    const attempt = sub70QuizAttempts[0];
    const quiz = attempt.quiz;
    const notifId = `notif-corecs-deficit-${quiz.id}`;
    notifications.push({
      id: notifId,
      sourceRefId: quiz.id,
      category: 'CORE_CS',
      categoryLabel: 'Core CS',
      title: 'Core CS Benchmark Deficit',
      description: `Diagnostic attempt for "${quiz.title}" (${quiz.subject?.title}) scored ${attempt.scorePct}%, below the 70% placement screening benchmark.`,
      sourceCount: sub70QuizAttempts.length,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'NORMAL',
      deepLinkUrl: '/dashboard/core-cs',
      actionLabel: 'Retake Diagnostic',
      createdAt: now.toISOString(),
      eligibilityReason: 'Diagnostic quiz score is below the authoritative 70% benchmark.',
    });
  }

  // --------------------------------------------------------------------------
  // E. TARGET COMPANY PREPARATION SIGNALS (Phase 6.7)
  // --------------------------------------------------------------------------
  if (targetCompanies.length > 0) {
    let companySlug = 'amazon';
    try {
      const meta = JSON.parse(targetCompanies[0].metadata as string);
      if (meta?.companySlug) companySlug = meta.companySlug;
    } catch {}

    const notifId = `notif-company-target-${companySlug}-${todayDateIso}`;
    notifications.push({
      id: notifId,
      category: 'COMPANY',
      categoryLabel: 'Target Company',
      title: 'Target Company Track Active',
      description: `Continue verified problem patterns and OA simulation for your target track.`,
      sourceCount: 1,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'NORMAL',
      deepLinkUrl: `/dashboard/companies/${companySlug}`,
      actionLabel: 'Open Company Hub',
      createdAt: now.toISOString(),
      eligibilityReason: 'Target company preparation track is configured.',
    });
  } else if (unsolvedCompanyProblems.length > 0) {
    const targetProb = unsolvedCompanyProblems[0];
    const company = targetProb.companyProblems[0]?.company;
    const companySlug = company?.slug || 'amazon';
    const companyName = company?.name || 'Target Company';
    const notifId = `notif-company-target-${companySlug}-${todayDateIso}`;
    notifications.push({
      id: notifId,
      category: 'COMPANY',
      categoryLabel: 'Target Company',
      title: `Target Track: ${companyName}`,
      description: `Target-company DSA problem "${targetProb.title}" (${targetProb.difficulty}) remains unsolved for ${companyName} preparation.`,
      sourceCount: unsolvedCompanyProblems.length,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'NORMAL',
      deepLinkUrl: `/dashboard/companies/${companySlug}`,
      actionLabel: 'Solve Problem',
      createdAt: now.toISOString(),
      eligibilityReason: 'Target-company DSA problems remaining for interview readiness.',
    });
  }

  // --------------------------------------------------------------------------
  // F. PLACEMENT READINESS & DOSSIER SIGNALS (Phases 6.12–6.14)
  // --------------------------------------------------------------------------
  if (executionData.criticalGaps.length > 0) {
    const gap = executionData.criticalGaps[0];
    const notifId = `notif-readiness-gap-${(gap.category || gap.id || 'gap').toLowerCase()}`;
    notifications.push({
      id: notifId,
      category: 'READINESS',
      categoryLabel: 'Readiness Alert',
      title: gap.title || `Critical Gap: ${gap.category}`,
      description: gap.description || gap.reason,
      sourceCount: 1,
      status: dismissedSet.has(notifId)
        ? 'DISMISSED'
        : isItemRead(notifId)
        ? 'READ'
        : 'UNREAD',
      urgency: 'HIGH',
      deepLinkUrl: gap.ctaUrl || '/dashboard/readiness',
      actionLabel: gap.ctaText || 'Review Gap',
      createdAt: now.toISOString(),
      eligibilityReason: gap.reason || 'Placement benchmark deficit detected.',
    });
  }

  // Filter out dismissed notifications for active view
  const activeNotifications = notifications.filter((n) => n.status !== 'DISMISSED');

  // Compute Summary Metrics
  const unreadCount = activeNotifications.filter((n) => n.status === 'UNREAD').length;
  const summary: NotificationCenterSummary = {
    totalActive: activeNotifications.length,
    unreadCount,
    dueTodayCount: activeNotifications.filter((n) => n.category === 'DUE_TODAY').length,
    overdueCount: activeNotifications.filter((n) => n.category === 'OVERDUE').length,
    dailyExecutionCount: activeNotifications.filter((n) => n.category === 'DAILY_EXECUTION').length,
    revisionCount: activeNotifications.filter(
      (n) => n.category === 'REVISION' || n.category === 'DUE_TODAY' || n.category === 'OVERDUE'
    ).length,
    assessmentCount: activeNotifications.filter((n) => n.category === 'ASSESSMENT').length,
    coreCsCount: activeNotifications.filter((n) => n.category === 'CORE_CS').length,
    readinessCount: activeNotifications.filter((n) => n.category === 'READINESS').length,
  };

  const categories: NotificationCategoryFilter[] = [
    { id: 'ALL', label: 'All', count: activeNotifications.length },
    { id: 'UNREAD', label: 'Unread', count: unreadCount },
    { id: 'DUE_TODAY', label: 'Due Today', count: summary.dueTodayCount },
    { id: 'OVERDUE', label: 'Overdue', count: summary.overdueCount },
    { id: 'DAILY_EXECUTION', label: 'Daily Tasks', count: summary.dailyExecutionCount },
    { id: 'ASSESSMENT', label: 'Mock OA', count: summary.assessmentCount },
    { id: 'CORE_CS', label: 'Core CS', count: summary.coreCsCount },
    { id: 'READINESS', label: 'Readiness Gaps', count: summary.readinessCount },
  ];

  return {
    summary,
    notifications: activeNotifications,
    categories,
    history: notificationHistory,
    preferences,
  };
}

/**
 * Returns the unread notification count for an authenticated student.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) return 0;
  const data = await getNotificationCenterData(userId);
  return data.summary.unreadCount;
}

// ----------------------------------------------------------------------------
// MUTATION HELPERS (Zero Domain Model Mutation Guaranteed)
// ----------------------------------------------------------------------------

/**
 * Marks a specific notification as read.
 * Writes strictly to ProgressEvent - never mutates underlying preparation records.
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) {
    throw new Error('Valid userId and notificationId are required.');
  }

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'NOTIFICATION_READ',
      metadata: JSON.stringify({
        notificationId,
        readAt: new Date().toISOString(),
      }),
    },
  });
}

/**
 * Marks all active notifications as read.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Valid userId is required.');
  }

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'ALL_NOTIFICATIONS_READ',
      metadata: JSON.stringify({
        readAt: new Date().toISOString(),
      }),
    },
  });
}

/**
 * Dismisses a notification from the active view.
 * Persists strictly into ProgressEvent.
 */
export async function dismissNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) {
    throw new Error('Valid userId and notificationId are required.');
  }

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'NOTIFICATION_DISMISSED',
      metadata: JSON.stringify({
        notificationId,
        dismissedAt: new Date().toISOString(),
      }),
    },
  });
}
