import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getRevisionDashboardData } from '@/lib/services/revision';
import { RevisionQueue } from '@/components/revision/revision-queue';

export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch complete revision dashboard data with authenticated user scoping
  const dashboardData = await getRevisionDashboardData(user.id);

  return (
    <div className="space-y-6">
      <RevisionQueue data={dashboardData} />
    </div>
  );
}
