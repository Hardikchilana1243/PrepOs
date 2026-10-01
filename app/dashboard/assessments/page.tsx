import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getAssessmentCatalogData } from '@/lib/services/assessment';
import { AssessmentCatalog } from '@/components/assessments/assessment-catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mock Assessments | PrepOS',
  description:
    'Experience realistic online placement assessments. Timed countdowns, multi-section coding and Core CS evaluations, hidden test cases, and authoritative grading.',
};

export default async function AssessmentsHubPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const catalogData = await getAssessmentCatalogData(user.id);

  return (
    <div className="py-2">
      <AssessmentCatalog initialData={catalogData} />
    </div>
  );
}
