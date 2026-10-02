import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getInterviewSessionData } from '@/lib/services/interview';
import { InterviewSession } from '@/components/interview/interview-session';

export const dynamic = 'force-dynamic';

interface InterviewSessionPageProps {
  params: {
    id: string;
  };
}

export default async function InterviewSessionPage({ params }: InterviewSessionPageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const data = await getInterviewSessionData(user.id, params.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <InterviewSession key={data.problem.id} problem={data.problem} userState={data.userState} />
    </div>
  );
}
