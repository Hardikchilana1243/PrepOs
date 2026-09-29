import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  getPrimaryDashboardData,
  getPreparationPillarsData,
} from '@/lib/services/dashboard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TodayMissionCard } from '@/components/dashboard/today-mission-card';
import { ReadinessCard } from '@/components/dashboard/readiness-card';
import { DSAProgressCard } from '@/components/dashboard/dsa-progress-card';
import { CoreCSCard } from '@/components/dashboard/core-cs-card';
import { CompanyCard } from '@/components/dashboard/company-card';
import { RevisionCard } from '@/components/dashboard/revision-card';
import { DiagnosticFocusCard } from '@/components/dashboard/diagnostic-focus-card';
import { QuickActionsBar } from '@/components/dashboard/quick-actions-bar';
import { toggleMissionAction } from './actions';
import { PRSComponents } from '@/lib/services/readiness-score';

export const dynamic = 'force-dynamic';

async function PreparationPillarsSection({
  userId,
  readiness,
}: {
  userId: string;
  readiness: PRSComponents;
}) {
  const pillars = await getPreparationPillarsData(userId);

  return (
    <div className="space-y-6">
      {/* 4 Preparation Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DSAProgressCard dsaProgress={pillars.dsaProgress} />
        <CoreCSCard coreCsProgress={pillars.coreCsProgress} />
        <RevisionCard revisionSummary={pillars.revisionSummary} />
        <CompanyCard companies={pillars.companyHighlights} />
      </div>

      {/* Diagnostic Focus / Weak Areas / Recommended Next Action */}
      <DiagnosticFocusCard
        readiness={readiness}
        dsaProgress={pillars.dsaProgress}
        coreCsProgress={pillars.coreCsProgress}
        revisionSummary={pillars.revisionSummary}
      />
    </div>
  );
}

function PreparationPillarsFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Pillars Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-5 h-52 flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-12 bg-slate-100 rounded" />
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full" />
              <div className="h-10 bg-slate-50 rounded-lg mt-4" />
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Focus Action Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 h-24 shadow-2xs flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-36 bg-slate-100 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-28 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Primary server payload: fast, prioritized level 1 action & readiness index
  const primaryData = await getPrimaryDashboardData(user.id);
  const { profile, readiness, todayMissions } = primaryData;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. TOP: Student Context & Workspace Header */}
      <DashboardHeader userName={user.name} profile={profile} />

      {/* 2. PRIMARY & SECONDARY: Today's Mission & Placement Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Primary Action (Dominant width & prominence) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <TodayMissionCard
            missions={todayMissions}
            onToggleMission={toggleMissionAction}
          />
        </div>

        {/* Secondary: Readiness Index & Diagnostic Breakdown */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <ReadinessCard readiness={readiness} />
        </div>
      </div>

      {/* 3. PREPARATION PILLARS & DIAGNOSTIC FOCUS */}
      <section aria-labelledby="pillars-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="pillars-heading"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Preparation Pillars
          </h2>
          <span className="text-xs text-slate-400">
            Curriculum tracking across Core CS, DSA, and OAs
          </span>
        </div>

        <Suspense fallback={<PreparationPillarsFallback />}>
          <PreparationPillarsSection userId={user.id} readiness={readiness} />
        </Suspense>
      </section>

      {/* 4. WORKSPACE SHORTCUTS */}
      <QuickActionsBar />
    </div>
  );
}
