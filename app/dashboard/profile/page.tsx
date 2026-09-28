import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getReadinessScore } from '@/lib/services/readiness-score';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { PageHeader } from '@/components/ui/student-os';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  if (!user.profile) {
    redirect('/onboarding');
  }

  const [readiness, history] = await Promise.all([
    getReadinessScore(user.id, {
      streakDays: user.profile.streakDays,
    }),
    prisma.readinessScoreHistory.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: 15,
      select: {
        id: true,
        score: true,
        recordedAt: true,
      },
    }),
  ]);

  const profileData = {
    name: user.name || 'Candidate',
    email: user.email,
    gradYear: user.profile.gradYear,
    targetDegree: user.profile.targetDegree,
    targetRoleTier: user.profile.targetRoleTier,
    preferredLang: user.profile.preferredLang,
    streakDays: user.profile.streakDays,
    prsScore: readiness.totalScore,
    dsaScore: readiness.dsaScore,
    coreCsScore: readiness.coreCsScore,
    oaScore: readiness.oaScore,
    consistencyScore: readiness.consistencyScore,
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
      <PageHeader
        title="Candidate Profile & Readiness Metrics"
        subtitle="Manage your graduation timeline, primary language, and review your verified server-side placement readiness score."
        tag="Level 4 — Analytics & Profile"
      />

      <ProfileEditor profile={profileData} history={formattedHistory} />
    </div>
  );
}
