'use server';

// ============================================================================
// NOTIFICATION CENTER SERVER ACTIONS (PHASE 6.16)
// Strictly Scoped to Authenticated User Session & Server-Authoritative State
// ============================================================================

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import {
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from '@/lib/services/notifications';

/**
 * Server action to mark a single notification as read.
 */
export async function markNotificationReadAction(notificationId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!notificationId) {
    throw new Error('Notification ID is required');
  }

  await markNotificationRead(user.id, notificationId);

  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard');
  return { success: true, notificationId, read: true };
}

/**
 * Server action to mark all active notifications as read.
 */
export async function markAllNotificationsReadAction() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await markAllNotificationsRead(user.id);

  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard');
  return { success: true, allRead: true };
}

/**
 * Server action to dismiss a notification.
 */
export async function dismissNotificationAction(notificationId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!notificationId) {
    throw new Error('Notification ID is required');
  }

  await dismissNotification(user.id, notificationId);

  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard');
  return { success: true, notificationId, dismissed: true };
}
