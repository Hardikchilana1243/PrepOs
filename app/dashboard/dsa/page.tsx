import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getDSARoadmapData } from '@/lib/services/dsa-roadmap';
import { DSARoadmapView } from '@/components/dsa/dsa-roadmap-view';

export const dynamic = 'force-dynamic';

interface DSAPageProps {
  searchParams?: {
    problem?: string;
  };
}

export default async function DSAPage({ searchParams }: DSAPageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // If a legacy query string ?problem=slug was provided, redirect to problem page
  if (searchParams?.problem) {
    redirect(`/dashboard/dsa/problem/${searchParams.problem}`);
  }

  const roadmapData = await getDSARoadmapData(user.id);

  return <DSARoadmapView data={roadmapData} />;
}
