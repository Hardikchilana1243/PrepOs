import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (user) {
    if (user.profile) {
      redirect('/dashboard');
    } else {
      redirect('/onboarding');
    }
  }

  return <>{children}</>;
}
