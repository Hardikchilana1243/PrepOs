import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/services/dashboard';
import { ReadinessCard } from '@/components/dashboard/readiness-card';
import { TodayMissionCard } from '@/components/dashboard/today-mission-card';
import { DSAProgressCard } from '@/components/dashboard/dsa-progress-card';
import { CoreCSCard } from '@/components/dashboard/core-cs-card';
import { CompanyCard } from '@/components/dashboard/company-card';
import { RevisionCard } from '@/components/dashboard/revision-card';
import { toggleMissionAction } from './actions';
import { Flame, Sparkles, GraduationCap, Code } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const data = await getDashboardData(user.id);
  const { profile, readiness, todayMissions, dsaProgress, coreCsProgress, companyHighlights, revisionSummary } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner / Student Greeting */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPERATING SYSTEM FOR SDE PLACEMENT READINESS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, {user.name || 'Candidate'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every problem solved and drill completed directly recalibrates your verified Placement Readiness Score.
          </p>
        </div>

        {/* Student Target Quick Badges */}
        {profile && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Class of {profile.gradYear}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">{profile.preferredLang}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{profile.streakDays} Day Streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Section: Placement Readiness Score & Today's Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ReadinessCard readiness={readiness} />
        </div>
        <div className="lg:col-span-5">
          <TodayMissionCard
            missions={todayMissions}
            onToggleMission={toggleMissionAction}
          />
        </div>
      </div>

      {/* Core Preparation Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DSAProgressCard dsaProgress={dsaProgress} />
        <CoreCSCard coreCsProgress={coreCsProgress} />
        <CompanyCard companies={companyHighlights} />
        <RevisionCard revisionSummary={revisionSummary} />
      </div>
    </div>
  );
}
