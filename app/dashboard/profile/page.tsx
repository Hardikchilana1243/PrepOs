import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getReadinessScore } from '@/lib/services/readiness-score';
import {
  getCachedUserSolvedCount,
  getCachedTotalProblemCount,
  getCachedUserQuizAttempts,
} from '@/lib/services/dashboard-queries';
import { ReadinessHeader } from '@/components/profile/readiness-header';
import { ReadinessNextStep } from '@/components/profile/readiness-next-step';
import { ReadinessFactorBreakdown } from '@/components/profile/readiness-factor-breakdown';
import { ReadinessStrengths } from '@/components/profile/readiness-strengths';
import { ReadinessGaps } from '@/components/profile/readiness-gaps';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { ReadinessHistory } from '@/components/profile/readiness-history';
import { ProfilePreparationLinks } from '@/components/profile/profile-preparation-links';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  if (!user.profile) {
    redirect('/onboarding');
  }

  const [
    readiness,
    history,
    solvedCount,
    totalProblems,
    quizAttempts,
    oaAttempts,
    revisionsDueCount,
  ] = await Promise.all([
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
    getCachedUserSolvedCount(user.id),
    getCachedTotalProblemCount(),
    getCachedUserQuizAttempts(user.id),
    prisma.assessmentAttempt.findMany({
      where: {
        userId: user.id,
        status: { in: ['SUBMITTED', 'EVALUATING', 'EVALUATED', 'EXPIRED'] },
      },
      select: {
        id: true,
        status: true,
        scorePct: true,
        passed: true,
      },
    }),
    prisma.revision.count({
      where: {
        userId: user.id,
        dueAt: { lte: new Date() },
        completedAt: null,
      },
    }),
  ]);

  const coreCsAvgScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + q.scorePct, 0) / quizAttempts.length)
      : 0;

  const oaPassedCount = oaAttempts.filter((a) => a.passed).length;

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

  const lastUpdated = history[0]
    ? new Date(history[0].recordedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Readiness Header */}
      <ReadinessHeader
        score={readiness.totalScore}
        gradYear={user.profile.gradYear}
        targetRoleTier={user.profile.targetRoleTier}
        targetDegree={user.profile.targetDegree}
        streakDays={user.profile.streakDays}
        lastUpdated={lastUpdated}
      />

      {/* 2. Deterministic Next Action */}
      <ReadinessNextStep
        revisionsDueCount={revisionsDueCount}
        quizAttemptsCount={quizAttempts.length}
        coreCsAvgScore={coreCsAvgScore}
        oaAttemptsCount={oaAttempts.length}
        dsaSolvedCount={solvedCount}
      />

      {/* 3. Four-Factor PRS v1 Breakdown */}
      <ReadinessFactorBreakdown
        dsaScore={readiness.dsaScore}
        coreCsScore={readiness.coreCsScore}
        oaScore={readiness.oaScore}
        consistencyScore={readiness.consistencyScore}
        isBaselineOnly={readiness.isBaselineOnly}
      />

      {/* 4. Strengths & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadinessStrengths
          dsaSolvedCount={solvedCount}
          totalProblems={totalProblems}
          coreCsAvgScore={coreCsAvgScore}
          quizAttemptsCount={quizAttempts.length}
          oaPassedCount={oaPassedCount}
          streakDays={user.profile.streakDays}
        />

        <ReadinessGaps
          dsaSolvedCount={solvedCount}
          totalProblems={totalProblems}
          quizAttemptsCount={quizAttempts.length}
          coreCsAvgScore={coreCsAvgScore}
          oaAttemptsCount={oaAttempts.length}
          revisionsDueCount={revisionsDueCount}
        />
      </div>

      {/* 5. Profile Settings & Readiness History Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <ProfileEditor
            profile={{
              name: user.name || 'Candidate',
              email: user.email,
              gradYear: user.profile.gradYear,
              targetDegree: user.profile.targetDegree,
              targetRoleTier: user.profile.targetRoleTier,
              preferredLang: user.profile.preferredLang,
              streakDays: user.profile.streakDays,
            }}
          />
        </div>

        <div className="lg:col-span-6">
          <ReadinessHistory
            history={formattedHistory}
            currentScore={readiness.totalScore}
          />
        </div>
      </div>

      {/* 6. Integrated Module Links */}
      <ProfilePreparationLinks />
    </div>
  );
}
