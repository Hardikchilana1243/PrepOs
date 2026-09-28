import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getCoreCSHubData } from '@/lib/services/core-cs';
import { CoreCSView } from '@/components/core-cs/core-cs-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    quiz?: string;
    subject?: string;
    topic?: string;
  };
}

export default async function CoreCSPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const hubData = await getCoreCSHubData(user.id);

  return (
    <CoreCSView
      data={hubData}
      initialQuizSlug={searchParams.quiz}
      initialSubject={searchParams.subject}
      initialTopic={searchParams.topic}
    />
  );
}
