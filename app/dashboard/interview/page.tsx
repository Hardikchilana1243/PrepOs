import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getInterviewWorkspaceData } from '@/lib/services/interview';
import { InterviewView } from '@/components/interview/interview-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Interview Preparation & Practice Workspace | PrepOS',
  description: 'Deterministic interview preparation workspace with algorithmic challenges, Core CS drills, and company tracks.',
};

export default async function InterviewPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const data = await getInterviewWorkspaceData(user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <InterviewView data={data} />
    </div>
  );
}
