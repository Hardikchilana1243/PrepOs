import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getPlacementReadinessReport } from '@/lib/services/readiness-report';
import { ReportView } from '@/components/readiness/report/report-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Placement Readiness Dossier | PrepOS',
  description:
    'Authoritative Placement Readiness Dossier compiling verified DSA problem solutions, Core CS benchmarks, and mock assessment metrics for recruiters and campus placement cells.',
};

export default async function ReadinessReportPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Authoritative server-side report generation scoped strictly to authenticated student
  const report = await getPlacementReadinessReport(user.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReportView report={report} />
    </main>
  );
}
