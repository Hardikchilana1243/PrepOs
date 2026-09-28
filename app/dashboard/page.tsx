import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  getPrimaryDashboardData,
  getPreparationPillarsData,
} from '@/lib/services/dashboard';
import { ReadinessCard } from '@/components/dashboard/readiness-card';
import { TodayMissionCard } from '@/components/dashboard/today-mission-card';
import { DSAProgressCard } from '@/components/dashboard/dsa-progress-card';
import { CoreCSCard } from '@/components/dashboard/core-cs-card';
import { CompanyCard } from '@/components/dashboard/company-card';
import { RevisionCard } from '@/components/dashboard/revision-card';
import { toggleMissionAction } from './actions';
import { Flame, GraduationCap, Code } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function PreparationPillarsSection({ userId }: { userId: string }) {
  const pillars = await getPreparationPillarsData(userId);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DSAProgressCard dsaProgress={pillars.dsaProgress} />
      <CoreCSCard coreCsProgress={pillars.coreCsProgress} />
      <RevisionCard revisionSummary={pillars.revisionSummary} />
      <CompanyCard companies={pillars.companyHighlights} />
    </div>
  );
}

function PreparationPillarsFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 h-48 flex flex-col justify-between shadow-sm"
        >
          <div className="space-y-3">
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-7 w-20 bg-slate-100 rounded" />
            <div className="h-2 w-full bg-slate-100 rounded-full" />
          </div>
          <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Primary level 1 action & PRS readiness (fast, prioritized server payload)
  const primaryData = await getPrimaryDashboardData(user.id);
  const { profile, readiness, todayMissions } = primaryData;

  const firstName = user.name ? user.name.split(' ')[0] : 'Candidate';

  return (
    <div className="space-y-6">
      {/* 1. Student Greeting & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Good day, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let&apos;s make some progress today.
          </p>
        </div>

        {/* Student Profile Quick Attributes */}
        {profile && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-xs text-slate-600 shadow-subtle">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Class of {profile.gradYear}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-xs text-slate-600 shadow-subtle">
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>{profile.preferredLang}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{profile.streakDays} Day Streak</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Level 1: Action (Today's Plan) & Level 2: Compact Readiness (PRS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <TodayMissionCard
            missions={todayMissions}
            onToggleMission={toggleMissionAction}
          />
        </div>
        <div className="lg:col-span-5">
          <ReadinessCard readiness={readiness} />
        </div>
      </div>

      {/* 3. Level 2: Pillars of Preparation (DSA, Core CS, Revision, Companies) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Preparation Pillars
          </h2>
        </div>
        <Suspense fallback={<PreparationPillarsFallback />}>
          <PreparationPillarsSection userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}
