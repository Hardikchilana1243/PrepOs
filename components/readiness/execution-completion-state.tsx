'use client';

// ============================================================================
// PREPOS EXECUTION COMPLETION STATE (PHASE 6.15)
// Factual Milestone State for 100% Completed Daily Workload
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Flame, ArrowRight, ShieldCheck, CalendarCheck } from 'lucide-react';
import { TodayExecutionSummary } from '@/lib/services/daily-execution';

interface ExecutionCompletionStateProps {
  summary: TodayExecutionSummary;
}

export function ExecutionCompletionState({ summary }: ExecutionCompletionStateProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white rounded-2xl border border-emerald-200/80 p-6 md:p-8 text-center my-6 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/20">
        <CalendarCheck className="w-7 h-7" />
      </div>

      <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
        Daily Placement Workload Fully Completed!
      </h3>

      <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
        All <strong className="text-slate-900 font-semibold">{summary.totalTasks} deterministic tasks</strong> planned for {summary.date} have been verified and reconciled in the database.
      </p>

      {/* Metrics Row */}
      <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 bg-white/80 backdrop-blur-xs rounded-xl border border-emerald-200/60 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{summary.completedTasks} Tasks Cleared</span>
        </div>

        <span className="text-slate-300">•</span>

        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{summary.currentStreak} Day Consistency Streak</span>
        </div>

        <span className="text-slate-300">•</span>

        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-800">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>PRS Consistency Maintained</span>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard/interview"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all min-h-[44px]"
        >
          <span>Practice Technical Interview</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/dashboard/readiness/report"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all min-h-[44px]"
        >
          <span>View Placement Dossier</span>
        </Link>
      </div>
    </div>
  );
}
