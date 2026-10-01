'use client';

// ============================================================================
// PREPOS READINESS HEADER COMPONENT
// Placement readiness cockpit header with PRS badge, target tier, and streak
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Flame,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PlacementReadinessCockpit } from '@/lib/services/readiness-cockpit';

interface ReadinessHeaderProps {
  overallPRS: PlacementReadinessCockpit['overallPRS'];
  targetCompanyName: string;
  targetCompanySlug: string;
  targetRoleTier: string;
  gradYear?: number;
  targetDegree?: string;
}

export function ReadinessHeader({
  overallPRS,
  targetCompanyName,
  targetCompanySlug,
  targetRoleTier,
  gradYear = 2026,
  targetDegree = 'B.Tech / B.E.',
}: ReadinessHeaderProps) {
  const getTierBadgeStyle = (tier: PlacementReadinessCockpit['overallPRS']['tier']) => {
    switch (tier) {
      case 'TIER_1_READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPETITIVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FOUNDATION_BUILDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EARLY_STAGE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
      {/* Top Metadata Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Placement Readiness Score (PRS v1)</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border font-mono ${getTierBadgeStyle(
              overallPRS.tier
            )}`}
          >
            {overallPRS.tierLabel}
          </span>

          {overallPRS.streakDays > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{overallPRS.streakDays} Day Streak</span>
            </span>
          )}
        </div>

        {overallPRS.lastUpdated && (
          <span className="text-xs text-slate-400 font-mono">
            Calibrated: {overallPRS.lastUpdated}
          </span>
        )}
      </div>

      {/* Main Title & Target Placement Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Placement Readiness Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data-driven placement intelligence synthesizing your verified algorithmic problem solving,
            Core CS diagnostics, mock OA performance, and spaced recall habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Target Recruiter Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Target Placement
              </div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{targetCompanyName}</span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] text-purple-700 font-semibold font-mono">
                  {targetRoleTier.replace('_', ' ')}
                </span>
              </div>
            </div>
            <Link
              href={`/dashboard/companies/${targetCompanySlug}`}
              className="ml-2 text-slate-400 hover:text-purple-700 p-1 transition-colors"
              title="Open Target Company Hub"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Dossier Report CTA */}
          <Link
            href="/dashboard/readiness/report"
            className="px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Generate Readiness Dossier</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
