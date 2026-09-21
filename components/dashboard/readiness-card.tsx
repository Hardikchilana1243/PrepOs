import React from 'react';
import { PRSComponents } from '@/lib/services/readiness-score';
import { ShieldCheck, Activity, Award, Flame } from 'lucide-react';

interface ReadinessCardProps {
  readiness: PRSComponents;
}

export function ReadinessCard({ readiness }: ReadinessCardProps) {
  const { totalScore, dsaScore, coreCsScore, oaScore, consistencyScore, isBaselineOnly } = readiness;

  // Visual Gauge Coloration
  const scoreColor =
    totalScore >= 75
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : totalScore >= 45
      ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-800/80 p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Placement Readiness Score (PRS)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              v1.0
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Comprehensive Placement Index
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-evaluated algorithm evaluating DSA mastery, Core CS competence, and consistency.
          </p>
        </div>

        {/* Big Overall Score Badge */}
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className={`px-5 py-3 rounded-2xl border flex flex-col items-center justify-center ${scoreColor} shadow-inner`}>
            <div className="text-3xl md:text-4xl font-black font-mono tracking-tight leading-none">
              {totalScore}%
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider mt-1 text-slate-400 font-semibold">
              {isBaselineOnly ? 'Baseline Index' : 'Active Index'}
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Zero-State Note */}
      {isBaselineOnly && (
        <div className="my-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-cyan-300">Baseline Diagnostic Established: </span>
            You are currently at the initial placement baseline (20%). Complete Today&apos;s Mission to begin scaling your readiness.
          </div>
        </div>
      )}

      {/* Component Breakdown Progress Bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {/* 1. DSA Component */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">DSA Mastery</span>
            <span className="font-mono text-white font-bold">{dsaScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, dsaScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Weight: 40%</div>
        </div>

        {/* 2. Core CS Component */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Core CS Drills</span>
            <span className="font-mono text-white font-bold">{coreCsScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, coreCsScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Weight: 30%</div>
        </div>

        {/* 3. OA Component */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">OA Simulations</span>
            <span className="font-mono text-white font-bold">
              {oaScore > 0 ? `${oaScore}%` : '—'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, oaScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Weight: 15%</div>
        </div>

        {/* 4. Consistency Component */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Consistency</span>
            <span className="font-mono text-white font-bold">{consistencyScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, consistencyScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Weight: 15%</div>
        </div>
      </div>
    </div>
  );
}
