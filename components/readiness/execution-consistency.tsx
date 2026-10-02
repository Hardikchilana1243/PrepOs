'use client';

// ============================================================================
// PREPOS CONSISTENCY ANALYTICS & TREND VISUALIZATION (PHASE 6.15)
// Deterministic Historical Metrics, Streaks, Category Spread & SVG Chart
// ============================================================================

import React, { useState } from 'react';
import {
  Flame,
  Calendar,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';
import { ConsistencyAnalyticsData } from '@/lib/services/daily-execution';

interface ExecutionConsistencyProps {
  consistency: ConsistencyAnalyticsData;
}

export function ExecutionConsistency({ consistency }: ExecutionConsistencyProps) {
  const [trendRange, setTrendRange] = useState<'14' | '30'>('14');

  const trendData = trendRange === '14' ? consistency.dailyTrend14Days : consistency.dailyTrend30Days;
  const maxTasksInTrend = Math.max(1, ...trendData.map((d) => Math.max(d.planned, d.completed)));

  return (
    <div id="consistency-analytics" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Consistency Analytics & Execution Discipline
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Deterministic historical metrics calculated strictly from verified database execution events.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTrendRange('14')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              trendRange === '14'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTrendRange('30')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              trendRange === '30'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* 6 Key Consistency KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* Current Streak */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
          <div className="flex items-center justify-between text-2xs font-bold text-amber-800 uppercase tracking-wider mb-1">
            <span>Current Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-950">{consistency.currentStreak}d</div>
          <div className="text-2xs text-amber-700 mt-0.5">Consecutive active</div>
        </div>

        {/* Longest Streak */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            <span>Best Streak</span>
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900">{consistency.longestStreak}d</div>
          <div className="text-2xs text-slate-500 mt-0.5">All-time record</div>
        </div>

        {/* 7-Day Completed */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70">
          <div className="flex items-center justify-between text-2xs font-bold text-blue-800 uppercase tracking-wider mb-1">
            <span>Past 7 Days</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-950">{consistency.tasksCompleted7Days}</div>
          <div className="text-2xs text-blue-700 mt-0.5">Tasks verified</div>
        </div>

        {/* 30-Day Completed */}
        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
          <div className="flex items-center justify-between text-2xs font-bold text-indigo-800 uppercase tracking-wider mb-1">
            <span>Past 30 Days</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-950">{consistency.tasksCompleted30Days}</div>
          <div className="text-2xs text-indigo-700 mt-0.5">Total completed</div>
        </div>

        {/* Active Days */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
          <div className="flex items-center justify-between text-2xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span>Active Days</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-950">{consistency.activeExecutionDays}</div>
          <div className="text-2xs text-emerald-700 mt-0.5">Days with activity</div>
        </div>

        {/* Completion Rate */}
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/70">
          <div className="flex items-center justify-between text-2xs font-bold text-purple-800 uppercase tracking-wider mb-1">
            <span>Completion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-950">{consistency.completionRate}%</div>
          <div className="text-2xs text-purple-700 mt-0.5">Planned vs Done</div>
        </div>
      </div>

      {/* SVG Daily Trend Chart */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-4 md:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {trendRange}-Day Daily Execution Trend
            </span>
            <span className="text-2xs text-slate-400 font-medium">
              (Bar height = Completed Tasks · Background = Planned)
            </span>
          </div>
          <div className="flex items-center gap-3 text-2xs font-medium text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Active Streak Day</span>
            </div>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="overflow-x-auto pb-1">
          <div
            className="grid gap-1.5 items-end h-32 pt-4"
            style={{
              gridTemplateColumns: `repeat(${trendData.length}, minmax(${trendRange === '30' ? '20px' : '36px'}, 1fr))`,
            }}
          >
            {trendData.map((d) => {
              const completedHeightPct =
                maxTasksInTrend > 0 ? Math.round((d.completed / maxTasksInTrend) * 100) : 0;
              const plannedHeightPct =
                maxTasksInTrend > 0 ? Math.round((d.planned / maxTasksInTrend) * 100) : 0;

              return (
                <div key={d.date} className="group relative flex flex-col items-center h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-2 bg-slate-900 text-white text-2xs rounded-lg py-1 px-2 whitespace-nowrap z-20 shadow-md transition-opacity">
                    <p className="font-bold">{d.dateLabel} ({d.dayOfWeek})</p>
                    <p>{d.completed} of {d.planned} tasks done ({d.percentage}%)</p>
                    {d.active && <p className="text-amber-400 font-medium">Active streak recorded</p>}
                  </div>

                  {/* Active Flame Pill if active day */}
                  {d.active ? (
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500 mb-1 flex-shrink-0" />
                  ) : (
                    <div className="w-3 h-3 mb-1" />
                  )}

                  {/* Bar container */}
                  <div className="w-full bg-slate-200 rounded-t-md relative flex items-end justify-center overflow-hidden h-20">
                    <div
                      className="w-full bg-blue-600 hover:bg-blue-500 transition-all rounded-t-md"
                      style={{ height: `${Math.max(d.completed > 0 ? 15 : 0, completedHeightPct)}%` }}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-[10px] text-slate-500 font-medium mt-1 truncate max-w-full">
                    {d.dateLabel.split(' ')[1] || d.dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Distribution Spread */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Preparation Domain Distribution
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {consistency.categoryDistribution.map((cat) => (
            <div key={cat.category} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>{cat.category}</span>
                <span className="text-2xs font-bold text-slate-400">{cat.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </div>
              <p className="text-2xs text-slate-500 font-medium">
                {cat.count} verified item{cat.count === 1 ? '' : 's'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Compliance & Objective Labeling Note */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-2xs text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Deterministic Consistency Invariant:</strong> Consistency analytics quantify daily execution discipline, spaced recall retention, and preparation habit frequency. They do NOT fabricate placement probability or grant artificial interview readiness. Official placement readiness remains exclusively evaluated by the authoritative 4-factor Placement Readiness Score (PRS).
        </span>
      </div>
    </div>
  );
}
