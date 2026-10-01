'use client';

// ============================================================================
// PREPOS READINESS SCORE COMPONENT
// Prominent authoritative PRS gauge with 4-factor weighted breakdown
// ============================================================================

import React from 'react';
import { ShieldCheck, Info, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { PlacementReadinessCockpit } from '@/lib/services/readiness-cockpit';

interface ReadinessScoreProps {
  overallPRS: PlacementReadinessCockpit['overallPRS'];
}

export function ReadinessScore({ overallPRS }: ReadinessScoreProps) {
  const { score, tierLabel, dsaScore, coreCsScore, oaScore, consistencyScore, completionPct, isBaselineOnly } =
    overallPRS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        {/* Left: Overall Score Gauge */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white shadow-md p-2 text-center shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PRS Score
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white leading-none my-1">
              {score}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">/ 100 pts</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Readiness Status
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {tierLabel}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              {isBaselineOnly
                ? 'Your baseline placement score is active. Solve problems on the DSA Roadmap and take diagnostic drills to advance your PRS index.'
                : 'Weighted algorithmic, foundational, and exam calibration evaluating your real placement interview competitiveness.'}
            </p>
          </div>
        </div>

        {/* Right: Preparation Completion Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 min-w-[260px]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Overall Prep Completion</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Core Pillars Tracked</span>
            <span>Target: 100%</span>
          </div>
        </div>
      </div>

      {/* 4-Factor Weighted PRS Contribution Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            4-Factor PRS Index Breakdown
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Authoritative Weights: 40% • 30% • 15% • 15%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. DSA Component (40%) */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">DSA Problem Solving</span>
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                40% Weight
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {dsaScore}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, dsaScore)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">Verified Judge0 execution</div>
          </div>

          {/* 2. Core CS Component (30%) */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Core CS Foundations</span>
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                30% Weight
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {coreCsScore}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, coreCsScore)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">DBMS & OS diagnostic average</div>
          </div>

          {/* 3. Mock OA Component (15%) */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Mock Assessments</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                15% Weight
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {oaScore}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, oaScore)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">Timed Online Assessment marks</div>
          </div>

          {/* 4. Consistency Component (15%) */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Consistency & Recall</span>
              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                15% Weight
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {consistencyScore}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, consistencyScore)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">14-day study streak pace</div>
          </div>
        </div>
      </div>
    </div>
  );
}
