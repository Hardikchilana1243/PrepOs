'use server';

// ============================================================================
// PREPOS PLACEMENT READINESS & DAILY EXECUTION SERVER ACTIONS (PHASE 6.15)
// Strictly Scoped to Authenticated User Session & Server-Authoritative State
// ============================================================================

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import {
  recordTaskCompletion,
  recordTaskReopening,
  recordTaskSkip,
} from '@/lib/services/daily-execution';
import {
  updateNotificationPreferences,
  resetNotificationPreferences,
  UpdatePreferencesInput,
} from '@/lib/services/notification-preferences';
import {
  dismissReminder,
  markReminderOpened,
} from '@/lib/services/notification-engine';
import prisma from '@/lib/db';

/**
 * Server action to mark a daily placement execution task as completed.
 */
export async function completeExecutionTaskAction(
  taskId: string,
  category: string,
  dateIso?: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!taskId) {
    throw new Error('Task ID is required');
  }

  await recordTaskCompletion(user.id, taskId, category, dateIso);

  revalidatePath('/dashboard/readiness');
  revalidatePath('/dashboard');
  return { success: true, taskId, completed: true };
}

/**
 * Server action to reopen an execution task that was incorrectly marked completed.
 */
export async function reopenExecutionTaskAction(
  taskId: string,
  dateIso?: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!taskId) {
    throw new Error('Task ID is required');
  }

  await recordTaskReopening(user.id, taskId, dateIso);

  revalidatePath('/dashboard/readiness');
  revalidatePath('/dashboard');
  return { success: true, taskId, reopened: true };
}

/**
 * Server action to explicitly skip a task in today's execution plan.
 */
export async function skipExecutionTaskAction(
  taskId: string,
  reason?: string,
  dateIso?: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!taskId) {
    throw new Error('Task ID is required');
  }

  await recordTaskSkip(user.id, taskId, reason, dateIso);

  revalidatePath('/dashboard/readiness');
  revalidatePath('/dashboard');
  return { success: true, taskId, skipped: true };
}

/**
 * Server action to regenerate today's daily execution plan with updated pending tasks.
 */
export async function regenerateDailyPlanAction() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const todayIso = new Date().toISOString().split('T')[0];

  // Remove existing today's plan events so a clean deterministic plan is re-evaluated
  await prisma.progressEvent.deleteMany({
    where: {
      userId: user.id,
      eventType: 'EXECUTION_PLAN_GENERATED',
      metadata: {
        contains: `"date":"${todayIso}"`,
      },
    },
  });

  revalidatePath('/dashboard/readiness');
  revalidatePath('/dashboard');
  return { success: true, date: todayIso };
}

// ----------------------------------------------------------------------------
// NOTIFICATION & REMINDER SERVER ACTIONS (PHASE 6.16)
// ----------------------------------------------------------------------------

/**
 * Server action to update student's notification preferences.
 */
export async function updateNotificationPreferencesAction(input: UpdatePreferencesInput) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, input);

  revalidatePath('/dashboard/readiness');
  revalidatePath('/dashboard');
  return { success: true, preferences: updated };
}

/**
 * Server action to toggle daily execution reminder setting.
 */
export async function toggleDailyExecutionReminderAction(enabled: boolean) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, {
    dailyExecutionEnabled: Boolean(enabled),
  });

  revalidatePath('/dashboard/readiness');
  return { success: true, dailyExecutionEnabled: updated.dailyExecutionEnabled };
}

/**
 * Server action to toggle revision due reminder setting.
 */
export async function toggleRevisionDueReminderAction(enabled: boolean) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, {
    revisionDueEnabled: Boolean(enabled),
  });

  revalidatePath('/dashboard/readiness');
  return { success: true, revisionDueEnabled: updated.revisionDueEnabled };
}

/**
 * Server action to toggle overdue revision reminder setting.
 */
export async function toggleRevisionOverdueReminderAction(enabled: boolean) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, {
    revisionOverdueEnabled: Boolean(enabled),
  });

  revalidatePath('/dashboard/readiness');
  return { success: true, revisionOverdueEnabled: updated.revisionOverdueEnabled };
}

/**
 * Server action to toggle incomplete daily execution reminder setting.
 */
export async function toggleIncompleteDailyReminderAction(enabled: boolean) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, {
    incompleteDailyEnabled: Boolean(enabled),
  });

  revalidatePath('/dashboard/readiness');
  return { success: true, incompleteDailyEnabled: updated.incompleteDailyEnabled };
}

/**
 * Server action to update preferred reminder time.
 */
export async function updateReminderTimeAction(time: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, {
    preferredTime: time,
  });

  revalidatePath('/dashboard/readiness');
  return { success: true, preferredTime: updated.preferredTime };
}

/**
 * Server action to update preferred timezone.
 */
export async function updateTimezoneAction(timezone: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updated = await updateNotificationPreferences(user.id, {
    timezone,
  });

  revalidatePath('/dashboard/readiness');
  return { success: true, timezone: updated.timezone };
}

/**
 * Server action to dismiss an active placement reminder.
 */
export async function dismissReminderAction(
  reminderId: string,
  reminderType: string,
  dateIso?: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!reminderId) {
    throw new Error('Reminder ID is required');
  }

  await dismissReminder(user.id, reminderId, reminderType, dateIso);

  revalidatePath('/dashboard/readiness');
  return { success: true, reminderId, dismissed: true };
}

/**
 * Server action to mark an active placement reminder as opened/read.
 */
export async function markReminderOpenedAction(
  reminderId: string,
  reminderType: string,
  dateIso?: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!reminderId) {
    throw new Error('Reminder ID is required');
  }

  await markReminderOpened(user.id, reminderId, reminderType, dateIso);

  revalidatePath('/dashboard/readiness');
  return { success: true, reminderId, opened: true };
}

/**
 * Server action to reset notification preferences to default.
 */
export async function resetNotificationPreferencesAction() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const reset = await resetNotificationPreferences(user.id);

  revalidatePath('/dashboard/readiness');
  return { success: true, preferences: reset };
}

