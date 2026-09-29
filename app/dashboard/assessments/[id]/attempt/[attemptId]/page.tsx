import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getAssessmentWorkspaceData } from '@/lib/services/assessment';
import { AssessmentWorkspace } from '@/components/assessments/assessment-workspace';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
    attemptId: string;
  };
}

export default async function AssessmentAttemptWorkspacePage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  let workspaceData;
  try {
    workspaceData = await getAssessmentWorkspaceData(user.id, params.attemptId);
  } catch (err: any) {
    notFound();
  }

  // If already evaluated or submitted, redirect to result diagnostic
  if (workspaceData.status === 'EVALUATED' || workspaceData.status === 'SUBMITTED') {
    redirect(`/dashboard/assessments/${params.id}/attempt/${params.attemptId}/result`);
  }

  return <AssessmentWorkspace initialData={workspaceData} />;
}
