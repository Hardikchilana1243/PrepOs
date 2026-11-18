import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getNotificationCenterData } from '@/lib/services/notifications';
import { NotificationCenter } from '@/components/notifications/notification-center';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Placement Reminders & Notification Center | PrepOS',
  description:
    'Authoritative, database-backed placement preparation notifications, SM-2 spaced repetition reminders, daily execution alerts, and mock assessment schedules.',
};

export default async function NotificationsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const notificationData = await getNotificationCenterData(user.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotificationCenter initialData={notificationData} />
    </main>
  );
}
