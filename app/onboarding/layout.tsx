import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  if (user.profile) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
