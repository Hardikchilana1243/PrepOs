import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getProblemDetailData } from '@/lib/services/dsa-roadmap';
import { ProblemWorkspace } from '@/components/dsa/problem-workspace';

export const dynamic = 'force-dynamic';

interface ProblemPageProps {
  params: {
    slug: string;
  };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const data = await getProblemDetailData(user.id, params.slug);

  if (!data) {
    notFound();
  }

  return <ProblemWorkspace key={data.problem.id} problem={data.problem} userState={data.userState} />;
}
