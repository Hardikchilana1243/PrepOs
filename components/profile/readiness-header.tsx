import React from 'react';
import { ShieldCheck, Flame, GraduationCap, Award, Calendar, Clock } from 'lucide-react';

interface ReadinessHeaderProps {
  score: number;
  gradYear: number;
  targetRoleTier: string;
  targetDegree: string;
  streakDays: number;
  lastUpdated?: string | null;
}

export function ReadinessHeader({
  score,
  gradYear,
  targetRoleTier,
  targetDegree,
  streakDays,
  lastUpdated,
}: ReadinessHeaderProps) {
  const getReadinessBand = (s: number) => {
    if (s >= 85) {
      return {
        label: 'Tier-1 Ready',
        description: 'Screening criteria met for top-tier product and tech giants.',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        scoreColor: 'text-emerald-600',
      };
    }
    if (s >= 70) {
      return {
        label: 'Benchmark Cleared',
        description: 'Solid foundation for high-growth tech firms and campus day-1 recruitment.',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        scoreColor: 'text-blue-600',
      };
    }
    if (s >= 40) {
      return {
        label: 'Calibration Required',
        description: 'Core concepts established; complete remaining problem topics and mock OAs.',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        scoreColor: 'text-amber-600',
      };
    }
    return {
      label: 'Early Preparation',
      description: 'Initial baseline phase; complete diagnostic quizzes and start solving DSA modules.',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      scoreColor: 'text-slate-800',
    };
  };

  const band = getReadinessBand(score);

  const getTierLabel = (tier: string) => {
    if (tier === 'PRODUCT_TIER_1') return 'Tier-1 Product';
    if (tier === 'TECH_TIER_2') return 'Tier-2 Tech & Fintech';
    return 'IT Services & Drives';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      {/* Left Details */}
      <div className="space-y-2 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${band.badgeBg}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {band.label}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{streakDays} Day Streak</span>
          </span>

          {lastUpdated && (
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              • Calibrated {lastUpdated}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Placement Readiness Command Center
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {band.description} Your Placement Readiness Score (PRS v1) is verified on the server
          across coding algorithms, core computer science, and mock assessments.
        </p>

        {/* Candidate Target Attributes */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 font-mono">
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Class of {gradYear}
          </span>
          <span>•</span>
          <span>{targetDegree}</span>
          <span>•</span>
          <span className="font-semibold text-slate-700">{getTierLabel(targetRoleTier)}</span>
        </div>
      </div>

      {/* Right Score Gauge */}
      <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 text-center shrink-0 min-w-[180px]">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Placement Readiness
        </div>
        <div className="flex items-baseline justify-center gap-1 my-1">
          <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${band.scoreColor}`}>
            {score}
          </span>
          <span className="text-base font-semibold text-slate-400 font-mono">/100</span>
        </div>
        <div className="text-[11px] font-medium text-slate-500">
          PRS v1 Algorithm
        </div>
      </div>
    </div>
  );
}
