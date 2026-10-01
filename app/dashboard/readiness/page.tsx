import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { getPlacementReadinessCockpitData } from '@/lib/services/readiness-cockpit';
import { ReadinessView } from '@/components/readiness/readiness-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Placement Readiness Command Center | PrepOS',
  description:
    'Authoritative placement readiness cockpit analyzing your DSA execution, Core CS mastery, target company alignment, and mock assessment metrics.',
};

export default async function ReadinessPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch complete authoritative placement cockpit data scoped to authenticated student
  const [cockpitData, profile] = await Promise.all([
    getPlacementReadinessCockpitData(user.id),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { gradYear: true, targetDegree: true },
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReadinessView
        data={cockpitData}
        studentMeta={{
          gradYear: profile?.gradYear ?? undefined,
          targetDegree: profile?.targetDegree ?? undefined,
        }}
      />
    </main>
  );
}
