'use client';

import React from 'react';
import { Flame, GraduationCap, Code2, Target, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string | null;
  profile: {
    gradYear: number;
    targetDegree: string;
    targetRoleTier: string;
    preferredLang: string;
    streakDays: number;
  } | null;
}

export function DashboardHeader({ userName, profile }: DashboardHeaderProps) {
  const firstName = userName ? userName.trim().split(' ')[0] : 'Candidate';

  const tierLabel = {
    PRODUCT_TIER_1: 'Product Tier 1',
    TECH_TIER_2: 'Tech Tier 2',
    SERVICE_TIER_3: 'Services Tier 3',
  }[profile?.targetRoleTier || ''] || 'SWE Placement';

  // Format today's date cleanly (e.g., "Tuesday, Sep 29")
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="pb-2 border-b border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Contextual Greeting & Workspace Context */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayFormatted}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-semibold">{tierLabel} Track</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Focus on today&apos;s mission to maintain streak momentum and calibrate your placement readiness.
          </p>
        </div>

        {/* Student Placement Attributes */}
        {profile && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {/* Streak Counter */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-semibold text-amber-800 shadow-2xs"
              title={`${profile.streakDays} day preparation streak`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-mono">{profile.streakDays}</span>
              <span className="font-normal text-amber-700">Day Streak</span>
            </div>

            {/* Target Graduation */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
              title={`Graduation Year: ${profile.gradYear}`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>&apos;{String(profile.gradYear).slice(-2)}</span>
            </div>

            {/* Primary Language */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
              title={`Preferred Language: ${profile.preferredLang}`}
            >
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{profile.preferredLang}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
