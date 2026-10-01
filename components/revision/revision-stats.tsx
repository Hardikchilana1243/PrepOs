'use client';

// ============================================================================
// PREPOS REVISION STATS COMPONENT
// Daily revision summary metrics: Due Today, Overdue, Completed Today, Total, Streak
// ============================================================================

import React from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
  Layers,
} from 'lucide-react';
import { RevisionSummary } from '@/lib/services/revision';

interface RevisionStatsProps {
  summary: RevisionSummary;
}

export function RevisionStats({ summary }: RevisionStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Due Today */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Due Today
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
          {summary.dueTodayCount}
        </div>
        <div className="text-[10px] text-slate-500 font-sans">
          {summary.dueTodayCount === 0 ? 'All caught up' : 'Scheduled for today'}
        </div>
      </div>

      {/* 2. Overdue */}
      <div
        className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
          summary.overdueCount > 0
            ? 'bg-rose-50/50 border-rose-200'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              summary.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            Overdue
          </span>
          <AlertCircle
            className={`w-3.5 h-3.5 ${
              summary.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'
            }`}
          />
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold font-mono ${
            summary.overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'
          }`}
        >
          {summary.overdueCount}
        </div>
        <div className="text-[10px] text-slate-500 font-sans">
          {summary.overdueCount > 0 ? 'Memory decay hazard' : 'Zero overdue items'}
        </div>
      </div>

      {/* 3. Completed Today */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Reviewed Today
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
          {summary.completedTodayCount}
        </div>
        <div className="text-[10px] text-slate-500 font-sans">
          Intervals extended
        </div>
      </div>

      {/* 4. Total In Retention Schedule */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            In Schedule
          </span>
          <Layers className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-blue-600">
          {summary.totalTracked}
        </div>
        <div className="text-[10px] text-slate-500 font-sans">
          Active recall cards
        </div>
      </div>

      {/* 5. Revision Streak */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Streak
          </span>
          <Flame
            className={`w-3.5 h-3.5 ${
              summary.streakDays > 0 ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
            }`}
          />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
          {summary.streakDays}{' '}
          <span className="text-xs font-sans font-normal text-slate-500">
            {summary.streakDays === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-sans">
          {summary.streakDays >= 7
            ? 'Solid consistency habit'
            : summary.streakDays > 0
            ? 'Daily study rhythm'
            : 'Start reviewing today'}
        </div>
      </div>
    </div>
  );
}
