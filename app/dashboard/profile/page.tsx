import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getReadinessScore } from '@/lib/services/readiness-score';
import { ProfileEditor } from '@/components/profile/profile-editor';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const [dbUser, readiness, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    }),
    getReadinessScore(user.id),
    prisma.readinessScoreHistory.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: 15,
    }),
  ]);

  if (!dbUser || !dbUser.profile) {
    redirect('/onboarding');
  }

  const profileData = {
    name: dbUser.name || 'Candidate',
    email: dbUser.email,
    gradYear: dbUser.profile.gradYear,
    targetDegree: dbUser.profile.targetDegree,
    targetRoleTier: dbUser.profile.targetRoleTier,
    preferredLang: dbUser.profile.preferredLang,
    streakDays: dbUser.profile.streakDays,
    prsScore: readiness.totalScore,
  };

  const formattedHistory = history.map((h) => ({
    id: h.id,
    score: h.score,
    recordedAt: new Date(h.recordedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Candidate Profile & PRS Metrics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your graduation timeline, primary coding language, target recruiter tiers, and examine server-evaluated score records.
        </p>
      </div>

      <ProfileEditor profile={profileData} history={formattedHistory} />
    </div>
  );
}
