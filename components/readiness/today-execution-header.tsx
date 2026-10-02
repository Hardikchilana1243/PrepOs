'use client';

// ============================================================================
// PREPOS TODAY EXECUTION HEADER (PHASE 6.15)
// Hierarchy: Placement Readiness → Critical Gaps → Today's Execution → Execute
// ============================================================================

import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { TodayExecutionSummary } from '@/lib/services/daily-execution';
import { regenerateDailyPlanAction } from '@/app/dashboard/readiness/actions';

interface TodayExecutionHeaderProps {
  summary: TodayExecutionSummary;
}

export function TodayExecutionHeader({ summary }: TodayExecutionHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const handleRegenerate = () => {
    startTransition(async () => {
      try {
        await regenerateDailyPlanAction();
        setMsg('Plan refreshed with latest database activity.');
        setTimeout(() => setMsg(null), 3000);
      } catch {
        setMsg('Failed to refresh plan.');
        setTimeout(() => setMsg(null), 3000);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 mb-6">
      {/* Primary Workflow Hierarchy Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
        <span className="text-slate-400">Placement Readiness</span>
        <span>→</span>
        <span className="text-slate-400">Critical Gaps</span>
        <span>→</span>
        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
          Today's Execution
        </span>
        <span>→</span>
        <span className="text-slate-400">Execute</span>
        <span>→</span>
        <span className="text-slate-400">Completion</span>
        <span>→</span>
        <span className="text-slate-400">Consistency</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Date */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Today's Placement Execution
              </h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                <span>{summary.date}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Deterministic Daily Workload</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Pills & Refresh Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{summary.currentStreak} Day Streak</span>
          </div>

          {/* Tasks Completed / Total */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {summary.completedTasks} / {summary.totalTasks} Tasks ({summary.completionPercentage}%)
            </span>
          </div>

          {/* Remaining Time */}
          {summary.estimatedRemainingMinutes > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>~{summary.estimatedRemainingMinutes}m left</span>
            </div>
          )}

          {/* Overdue Alert */}
          {summary.overdueWorkloadCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{summary.overdueWorkloadCount} Overdue</span>
            </div>
          )}

          {/* Refresh Action */}
          <button
            onClick={handleRegenerate}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh plan from latest database state"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isPending ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}
    </div>
  );
}
