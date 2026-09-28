import React from 'react';
import Link from 'next/link';
import { PRSComponents } from '@/lib/services/readiness-score';
import { ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface ReadinessCardProps {
  readiness: PRSComponents;
}

export function ReadinessCard({ readiness }: ReadinessCardProps) {
  const { totalScore, dsaScore, coreCsScore, oaScore, consistencyScore, isBaselineOnly } = readiness;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Placement Readiness
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {isBaselineOnly ? 'Initial Baseline' : 'Active Index'}
          </span>
        </div>

        {/* Score Display */}
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
            {totalScore}
          </span>
          <span className="text-sm font-medium text-slate-400">/ 100</span>
          {!isBaselineOnly && (
            <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-1">
          Server-evaluated index evaluating DSA mastery, Core CS drills, and consistency.
        </p>

        {/* Components Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">DSA Mastery</span>
              <span className="font-semibold text-slate-800 font-mono">{dsaScore}%</span>
            </div>
            <ProgressBar value={dsaScore} size="sm" color="blue" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Core CS</span>
              <span className="font-semibold text-slate-800 font-mono">{coreCsScore}%</span>
            </div>
            <ProgressBar value={coreCsScore} size="sm" color="indigo" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">OA Simulations</span>
              <span className="font-semibold text-slate-800 font-mono">
                {oaScore > 0 ? `${oaScore}%` : '—'}
              </span>
            </div>
            <ProgressBar value={oaScore} size="sm" color="amber" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Consistency</span>
              <span className="font-semibold text-slate-800 font-mono">{consistencyScore}%</span>
            </div>
            <ProgressBar value={consistencyScore} size="sm" color="emerald" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/profile"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group"
        >
          <span>View readiness details & history</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
