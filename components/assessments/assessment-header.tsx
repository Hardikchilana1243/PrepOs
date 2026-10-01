import React from 'react';
import { Target, Clock, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface AssessmentHeaderProps {
  totalAssessments: number;
  attemptedCount: number;
  passedCount: number;
  averageScorePct: number;
}

export function AssessmentHeader({
  totalAssessments,
  attemptedCount,
  passedCount,
  averageScorePct,
}: AssessmentHeaderProps) {
  return (
    <header className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              Online Assessment Engine
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Timed Campus OA Simulations
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Company Mock Assessments
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Experience realistic campus recruitment online assessments under authenticated conditions.
            Features authoritative server countdown timers, multi-section formats (Coding & Core CS),
            automated evaluation against secret test suites, and transparent diagnostic scoring.
          </p>
        </div>

        {/* High-Density Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          {/* Total Available */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-slate-900">{totalAssessments}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Simulations
            </div>
          </div>

          {/* Attempted Count */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-blue-700">{attemptedCount}</div>
            <div className="text-[10px] text-blue-600 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Attempted
            </div>
          </div>

          {/* Cleared Count */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-emerald-700">{passedCount}</div>
            <div className="text-[10px] text-emerald-700 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Cleared
            </div>
          </div>

          {/* Average Score */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-indigo-700">{averageScorePct}%</div>
            <div className="text-[10px] text-indigo-600 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Avg Score
            </div>
          </div>
        </div>
      </div>

      {/* Authoritative System Invariant Banner */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-800">Authoritative Examination Protocol:</span>
          <span className="text-slate-500 text-[11px]">
            Server clock controls expiry • Hidden test cases remain protected • Auto-evaluation upon submission
          </span>
        </div>

        <div className="text-right text-[11px] font-mono text-slate-400">
          {attemptedCount > 0 ? `${passedCount} of ${attemptedCount} attempted simulations passed` : 'Zero synthetic scores'}
        </div>
      </div>
    </header>
  );
}
