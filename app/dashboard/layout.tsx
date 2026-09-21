import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { signOutAction } from '@/app/auth/actions';
import { AppShell } from '@/components/layout/app-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  if (!user.profile) {
    redirect('/onboarding');
  }

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
      }}
      onSignOut={signOutAction}
    >
      {children}
    </AppShell>
  );
}
