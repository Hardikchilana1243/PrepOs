'use client';

// ============================================================================
// PREPOS EXECUTION PROGRESS (PHASE 6.15)
// Real-Time Visual Progress Meter & Workload Statistics
// ============================================================================

import React from 'react';
import { TodayExecutionSummary } from '@/lib/services/daily-execution';
import { CheckCircle2, Clock, Flame, AlertTriangle, TrendingUp } from 'lucide-react';

interface ExecutionProgressProps {
  summary: TodayExecutionSummary;
}

export function ExecutionProgress({ summary }: ExecutionProgressProps) {
  const isComplete = summary.completionPercentage === 100 && summary.totalTasks > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Daily Execution Completion Rate
          </h3>
        </div>
        <span className="text-sm font-black text-slate-900">
          {summary.completedTasks} of {summary.totalTasks} Tasks Done ({summary.completionPercentage}%)
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70 mb-5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500'
          }`}
          style={{ width: `${Math.max(4, summary.completionPercentage)}%` }}
        />
      </div>

      {/* 4 Execution Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Tasks Done */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900">
            {summary.completedTasks}
            <span className="text-xs text-slate-400 font-normal ml-1">/ {summary.totalTasks}</span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">
            {summary.remainingTasks === 0 ? 'Workload cleared' : `${summary.remainingTasks} remaining`}
          </p>
        </div>

        {/* Metric 2: Remaining Time */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Workload Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900">
            ~{summary.estimatedRemainingMinutes}
            <span className="text-xs text-slate-400 font-normal ml-1">mins</span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">Estimated focused effort</p>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900">
            {summary.currentStreak}
            <span className="text-xs text-slate-400 font-normal ml-1">days</span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">Continuous execution</p>
        </div>

        {/* Metric 4: Overdue Carry-Over */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Overdue Items</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                summary.overdueWorkloadCount > 0 ? 'text-rose-500' : 'text-slate-400'
              }`}
            />
          </div>
          <div
            className={`text-lg md:text-xl font-bold ${
              summary.overdueWorkloadCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {summary.overdueWorkloadCount}
            <span className="text-xs text-slate-400 font-normal ml-1">items</span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">
            {summary.overdueWorkloadCount > 0 ? 'Lapsed intervals' : 'Schedule current'}
          </p>
        </div>
      </div>
    </div>
  );
}
