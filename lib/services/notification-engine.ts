// ============================================================================
// PREPOS NOTIFICATION ELIGIBILITY ENGINE & REMINDER SERVICE (PHASE 6.16)
// Authoritative Engine Driving Deterministic Placement Reminders
// Strictly Derived from Real Database Workload & Student Preferences
// ============================================================================

import prisma from '../db';
import {
  getNotificationPreferences,
  isWithinQuietHours,
  NotificationPreferences,
} from './notification-preferences';
import { getDailyExecutionData } from './daily-execution';

// ----------------------------------------------------------------------------
// INTERFACES & NOTIFICATION TYPES
// ----------------------------------------------------------------------------

export type NotificationType =
  | 'DAILY_EXECUTION'
  | 'REVISION_DUE'
  | 'REVISION_OVERDUE'
  | 'EXECUTION_INCOMPLETE';

export interface PlacementNotification {
  id: string; // e.g. "rem-daily_execution-2026-10-02"
  type: NotificationType;
  title: string;
  message: string;
  sourceCount: number;
  generatedAt: string; // ISO 8601
  deepLinkUrl: string;
  actionLabel: string;
  eligibilityReason: string;
  isRead: boolean;
  isDismissed: boolean;
  dateIso: string;
}

export interface NotificationEvaluationOptions {
  referenceDate?: Date;
  ignoreTimeWindow?: boolean; // When true, evaluates for today regardless of specific HH:mm
}

export interface NotificationHistoryItem {
  id: string;
  eventType: string;
  title: string;
  description: string;
  timestamp: Date;
  dateLabel: string;
  metadata: Record<string, any>;
}

// ----------------------------------------------------------------------------
// TIMEZONE & CALENDAR HELPERS
// ----------------------------------------------------------------------------

export interface LocalTimeDetails {
  dateIso: string; // "YYYY-MM-DD"
  timeHHMM: string; // "HH:mm"
  weekday: number; // 1 (Mon) - 7 (Sun)
}

export function getLocalTimeDetails(date: Date, timezone: string): LocalTimeDetails {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value || '1970';
    const month = parts.find((p) => p.type === 'month')?.value || '01';
    const day = parts.find((p) => p.type === 'day')?.value || '01';
    let hour = parts.find((p) => p.type === 'hour')?.value || '00';
    // Format hour "24" to "00" if present
    if (hour === '24') hour = '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '00';

    const dateIso = `${year}-${month}-${day}`;
    const timeHHMM = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    // Compute weekday for this local calendar day
    const localDate = new Date(`${dateIso}T12:00:00Z`);
    // getUTCDay: 0=Sun, 1=Mon, ..., 6=Sat -> Convert to 1=Mon ... 7=Sun
    const rawDay = localDate.getUTCDay();
    const weekday = rawDay === 0 ? 7 : rawDay;

    return { dateIso, timeHHMM, weekday };
  } catch {
    // Fallback to UTC if timezone formatting errors
    const dateIso = date.toISOString().split('T')[0];
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const rawDay = date.getUTCDay();
    const weekday = rawDay === 0 ? 7 : rawDay;
    return { dateIso, timeHHMM: `${hours}:${minutes}`, weekday };
  }
}

// ----------------------------------------------------------------------------
// NOTIFICATION ELIGIBILITY ENGINE
// Evaluates real underlying database work against student preferences
// ----------------------------------------------------------------------------

/**
 * Deterministically evaluates eligible placement notifications for a student.
 * Guarantees zero synthetic notifications: returns items ONLY when authentic pending work exists.
 */
export async function evaluateNotificationEligibility(
  userId: string,
  options?: NotificationEvaluationOptions
): Promise<PlacementNotification[]> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated userId is required to evaluate notifications.');
  }

  const now = options?.referenceDate ?? new Date();
  const ignoreTimeWindow = options?.ignoreTimeWindow ?? false;

  // 1. Fetch Student Preferences and Authoritative Daily Execution Data
  const [preferences, dailyExecution, revisions] = await Promise.all([
    getNotificationPreferences(userId),
    getDailyExecutionData(userId),
    prisma.revision.findMany({
      where: { userId },
      select: {
        id: true,
        dueAt: true,
        completedAt: true,
      },
    }),
  ]);

  // 2. Resolve Local Time Details in User's Configured Timezone
  const { dateIso, timeHHMM, weekday } = getLocalTimeDetails(now, preferences.timezone);

  // 3. Check Quiet Hours
  const inQuietHours =
    preferences.quietHoursEnabled &&
    isWithinQuietHours(
      timeHHMM,
      preferences.quietHoursStart,
      preferences.quietHoursEnd
    );

  // If in quiet hours and not ignoring time window, suppress all notifications
  if (inQuietHours && !ignoreTimeWindow) {
    return [];
  }

  const notifications: PlacementNotification[] = [];

  // 4. Compute Authentic SM-2 Spaced Revision Counts
  let dueRevisionsCount = 0;
  let overdueRevisionsCount = 0;

  for (const rev of revisions) {
    if (rev.completedAt) continue;
    const dueTime = new Date(rev.dueAt).getTime();
    if (dueTime <= now.getTime()) {
      const diffMs = now.getTime() - dueTime;
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      if (diffDays >= 1) {
        overdueRevisionsCount++;
      } else {
        dueRevisionsCount++;
      }
    }
  }

  const isPreferredWeekday = preferences.preferredWeekdays.includes(weekday);

  // --------------------------------------------------------------------------
  // A. REVISION_OVERDUE (Highest urgency factual reminder)
  // --------------------------------------------------------------------------
  if (preferences.revisionOverdueEnabled && overdueRevisionsCount > 0) {
    notifications.push({
      id: `rem-revision_overdue-${dateIso}`,
      type: 'REVISION_OVERDUE',
      title: 'Overdue Spaced Revision',
      message: `${overdueRevisionsCount} revision item${
        overdueRevisionsCount > 1 ? 's are' : ' is'
      } overdue for active recall.`,
      sourceCount: overdueRevisionsCount,
      generatedAt: now.toISOString(),
      deepLinkUrl: '/dashboard/revision',
      actionLabel: 'Review Overdue',
      eligibilityReason:
        'Authentic SM-2 spaced repetition items have exceeded their scheduled recall window.',
      isRead: false,
      isDismissed: false,
      dateIso,
    });
  }

  // --------------------------------------------------------------------------
  // B. REVISION_DUE
  // --------------------------------------------------------------------------
  if (preferences.revisionDueEnabled && dueRevisionsCount > 0) {
    notifications.push({
      id: `rem-revision_due-${dateIso}`,
      type: 'REVISION_DUE',
      title: 'Spaced Revision Due',
      message: `${dueRevisionsCount} revision item${
        dueRevisionsCount > 1 ? 's are' : ' is'
      } scheduled for recall today.`,
      sourceCount: dueRevisionsCount,
      generatedAt: now.toISOString(),
      deepLinkUrl: '/dashboard/revision',
      actionLabel: 'Review Queue',
      eligibilityReason:
        'Authentic SM-2 spaced repetition items are scheduled for review today.',
      isRead: false,
      isDismissed: false,
      dateIso,
    });
  }

  // --------------------------------------------------------------------------
  // C. DAILY_EXECUTION
  // --------------------------------------------------------------------------
  const remainingDailyTasks = dailyExecution.summary.remainingTasks;
  const isTimeForDaily = ignoreTimeWindow || timeHHMM >= preferences.preferredTime;

  if (
    preferences.dailyExecutionEnabled &&
    remainingDailyTasks > 0 &&
    isPreferredWeekday &&
    isTimeForDaily
  ) {
    notifications.push({
      id: `rem-daily_execution-${dateIso}`,
      type: 'DAILY_EXECUTION',
      title: "Today's Placement Execution",
      message: `${remainingDailyTasks} placement task${
        remainingDailyTasks > 1 ? 's remain' : ' remains'
      } incomplete in today's execution plan.`,
      sourceCount: remainingDailyTasks,
      generatedAt: now.toISOString(),
      deepLinkUrl: '/dashboard/readiness#today-execution',
      actionLabel: 'View Tasks',
      eligibilityReason:
        "Today's daily placement plan contains incomplete tasks and matches your reminder schedule.",
      isRead: false,
      isDismissed: false,
      dateIso,
    });
  }

  // --------------------------------------------------------------------------
  // D. EXECUTION_INCOMPLETE (Follow-up reminder when tasks remain later in the day)
  // --------------------------------------------------------------------------
  const isLaterInDay = ignoreTimeWindow || timeHHMM >= '17:00';
  if (
    preferences.incompleteDailyEnabled &&
    remainingDailyTasks > 0 &&
    isPreferredWeekday &&
    isLaterInDay &&
    // Only generate if different from or complementing morning reminder
    (dailyExecution.summary.completedTasks > 0 || isLaterInDay)
  ) {
    notifications.push({
      id: `rem-execution_incomplete-${dateIso}`,
      type: 'EXECUTION_INCOMPLETE',
      title: 'Incomplete Daily Execution',
      message: `${remainingDailyTasks} daily task${
        remainingDailyTasks > 1 ? 's' : ''
      } in today's plan still require completion.`,
      sourceCount: remainingDailyTasks,
      generatedAt: now.toISOString(),
      deepLinkUrl: '/dashboard/readiness#today-execution',
      actionLabel: 'Resume Plan',
      eligibilityReason:
        "Today's execution plan remains incomplete as the preparation day progresses.",
      isRead: false,
      isDismissed: false,
      dateIso,
    });
  }

  return notifications;
}

// ----------------------------------------------------------------------------
// ACTIVE REMINDERS (With Dismissal & Read Tracking)
// ----------------------------------------------------------------------------

/**
 * Retrieves active placement reminders for the student dashboard.
 * Excludes dismissed reminders, resolves read/unread state, caps by maxRemindersPerDay,
 * and maintains an auditable REMINDER_ELIGIBLE history.
 */
export async function getActiveReminders(
  userId: string,
  options?: NotificationEvaluationOptions
): Promise<PlacementNotification[]> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated userId is required.');
  }

  const [preferences, eligibleNotifications] = await Promise.all([
    getNotificationPreferences(userId),
    evaluateNotificationEligibility(userId, options),
  ]);

  if (eligibleNotifications.length === 0) {
    return [];
  }

  const now = options?.referenceDate ?? new Date();
  const { dateIso } = getLocalTimeDetails(now, preferences.timezone);

  // Fetch today's reminder audit events for this student
  const todayEvents = await prisma.progressEvent.findMany({
    where: {
      userId,
      eventType: {
        in: ['REMINDER_ELIGIBLE', 'REMINDER_DISMISSED', 'REMINDER_OPENED'],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const dismissedSet = new Set<string>();
  const readSet = new Set<string>();
  const loggedEligibleSet = new Set<string>();

  for (const evt of todayEvents) {
    try {
      const meta = typeof evt.metadata === 'string' ? JSON.parse(evt.metadata) : evt.metadata;
      if (meta?.dateIso === dateIso || !meta?.dateIso) {
        if (evt.eventType === 'REMINDER_DISMISSED' && meta?.reminderId) {
          dismissedSet.add(meta.reminderId);
          dismissedSet.add(`${meta.type}-${dateIso}`);
        } else if (evt.eventType === 'REMINDER_OPENED' && meta?.reminderId) {
          readSet.add(meta.reminderId);
        } else if (evt.eventType === 'REMINDER_ELIGIBLE' && meta?.type) {
          loggedEligibleSet.add(`${meta.type}-${meta.dateIso || dateIso}`);
        }
      }
    } catch {
      // Ignore corrupt metadata
    }
  }

  // Filter out dismissed reminders and update read state
  const active: PlacementNotification[] = [];

  for (const notif of eligibleNotifications) {
    if (dismissedSet.has(notif.id) || dismissedSet.has(`${notif.type}-${dateIso}`)) {
      continue;
    }

    const isRead = readSet.has(notif.id);
    active.push({
      ...notif,
      isRead,
      isDismissed: false,
    });

    // Record REMINDER_ELIGIBLE audit event if not already logged today
    const dedupeKey = `${notif.type}-${dateIso}`;
    if (!loggedEligibleSet.has(dedupeKey)) {
      loggedEligibleSet.add(dedupeKey);
      // Asynchronously record event without blocking query
      prisma.progressEvent
        .create({
          data: {
            userId,
            eventType: 'REMINDER_ELIGIBLE',
            metadata: JSON.stringify({
              reminderId: notif.id,
              type: notif.type,
              title: notif.title,
              sourceCount: notif.sourceCount,
              dateIso,
              timestamp: now.toISOString(),
            }),
          },
        })
        .catch(() => {});
    }
  }

  // Cap at maxRemindersPerDay
  return active.slice(0, preferences.maxRemindersPerDay);
}

// ----------------------------------------------------------------------------
// REMINDER ACTIONS & AUDIT
// ----------------------------------------------------------------------------

/**
 * Dismisses a reminder for the given calendar day.
 */
export async function dismissReminder(
  userId: string,
  reminderId: string,
  reminderType: string,
  dateIso?: string
): Promise<void> {
  if (!userId || !reminderId) {
    throw new Error('Valid userId and reminderId are required to dismiss a reminder.');
  }

  const effectiveDate = dateIso || new Date().toISOString().split('T')[0];

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'REMINDER_DISMISSED',
      metadata: JSON.stringify({
        reminderId,
        type: reminderType,
        dateIso: effectiveDate,
        dismissedAt: new Date().toISOString(),
      }),
    },
  });
}

/**
 * Marks a reminder as opened or read.
 */
export async function markReminderOpened(
  userId: string,
  reminderId: string,
  reminderType: string,
  dateIso?: string
): Promise<void> {
  if (!userId || !reminderId) {
    throw new Error('Valid userId and reminderId are required to mark a reminder opened.');
  }

  const effectiveDate = dateIso || new Date().toISOString().split('T')[0];

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'REMINDER_OPENED',
      metadata: JSON.stringify({
        reminderId,
        type: reminderType,
        dateIso: effectiveDate,
        openedAt: new Date().toISOString(),
      }),
    },
  });
}

/**
 * Retrieves the audit history of notification preferences and reminder events for an authenticated student.
 */
export async function getNotificationHistory(
  userId: string,
  limit: number = 20
): Promise<NotificationHistoryItem[]> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated userId is required.');
  }

  const events = await prisma.progressEvent.findMany({
    where: {
      userId,
      eventType: {
        in: [
          'NOTIFICATION_PREFERENCE_UPDATED',
          'REMINDER_ELIGIBLE',
          'REMINDER_DISMISSED',
          'REMINDER_OPENED',
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return events.map((evt) => {
    let meta: Record<string, any> = {};
    try {
      meta = typeof evt.metadata === 'string' ? JSON.parse(evt.metadata) : evt.metadata || {};
    } catch {
      meta = {};
    }

    let title = 'Notification Event';
    let description = 'Placement reminder activity recorded.';

    switch (evt.eventType) {
      case 'NOTIFICATION_PREFERENCE_UPDATED':
        title = 'Reminder Preferences Updated';
        description = `Configured daily reminders (Time: ${meta.preferredTime || '09:00'}, Timezone: ${
          meta.timezone || 'UTC'
        }).`;
        break;
      case 'REMINDER_ELIGIBLE':
        title = `Reminder Generated: ${meta.title || meta.type || 'Placement Work'}`;
        description = `Eligible based on ${meta.sourceCount || 1} pending preparation item(s).`;
        break;
      case 'REMINDER_DISMISSED':
        title = `Reminder Dismissed: ${meta.type || 'Reminder'}`;
        description = `Dismissed by student for ${meta.dateIso || 'today'}.`;
        break;
      case 'REMINDER_OPENED':
        title = `Reminder Opened: ${meta.type || 'Reminder'}`;
        description = `Student navigated to preparation workspace.`;
        break;
    }

    const dateLabel = new Date(evt.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: evt.id,
      eventType: evt.eventType,
      title,
      description,
      timestamp: evt.createdAt,
      dateLabel,
      metadata: meta,
    };
  });
}
