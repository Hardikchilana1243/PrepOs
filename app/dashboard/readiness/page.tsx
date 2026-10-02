import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { getPlacementExecutionData } from '@/lib/services/readiness-execution';
import { getDailyExecutionData } from '@/lib/services/daily-execution';
import { getInterviewReadinessSummary } from '@/lib/services/interview';
import { getNotificationPreferences } from '@/lib/services/notification-preferences';
import { getActiveReminders, getNotificationHistory } from '@/lib/services/notification-engine';
import { ReadinessView } from '@/components/readiness/readiness-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Placement Execution & Daily Consistency Command Center | PrepOS',
  description:
    'Authoritative placement execution cockpit analyzing your DSA gaps, Core CS benchmarks, target company coverage, daily study tasks, and verifiable placement credentials.',
};

export default async function ReadinessPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch complete authoritative placement execution & reminder data scoped to authenticated student
  const [
    executionData,
    dailyExecution,
    profile,
    interviewSummary,
    notificationPreferences,
    activeReminders,
    notificationHistory,
  ] = await Promise.all([
    getPlacementExecutionData(user.id),
    getDailyExecutionData(user.id),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { gradYear: true, targetDegree: true },
    }),
    getInterviewReadinessSummary(user.id),
    getNotificationPreferences(user.id),
    getActiveReminders(user.id),
    getNotificationHistory(user.id, 10),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReadinessView
        executionData={executionData}
        dailyExecution={dailyExecution}
        interviewSummary={interviewSummary}
        notificationPreferences={notificationPreferences}
        activeReminders={activeReminders}
        notificationHistory={notificationHistory}
        studentMeta={{
          gradYear: profile?.gradYear ?? undefined,
          targetDegree: profile?.targetDegree ?? undefined,
        }}
      />
    </main>
  );
}
