'use client';

// ============================================================================
// PREPOS REVISION ANALYTICS COMPONENT
// Derived strictly from real database records (no synthetic scores or predictions)
// ============================================================================

import React from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Code2,
  Brain,
  Target,
  Building2,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { RevisionAnalytics as RevisionAnalyticsType } from '@/lib/services/revision';

interface RevisionAnalyticsProps {
  analytics: RevisionAnalyticsType;
}

export function RevisionAnalytics({ analytics }: RevisionAnalyticsProps) {
  const { dueVsCompleted, sourceDistribution, intervalDistribution, dailyTrend } = analytics;

  // Interval Distribution Total
  const totalInIntervals =
    intervalDistribution.learning +
    intervalDistribution.earlyRetention +
    intervalDistribution.intermediate +
    intervalDistribution.longTerm;

  const totalSources =
    sourceDistribution.dsa +
    sourceDistribution.coreCs +
    sourceDistribution.assessment;

  // Daily Trend calculation for SVG visualization
  const maxDailyCount = Math.max(1, ...dailyTrend.map((d) => d.count));
  const hasTrendData = dailyTrend.some((d) => d.count > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Interval Stage Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Memory Retention Stages</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {totalInIntervals} cards
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              SM-2 interval distribution indicating memory stabilization
            </p>
          </div>

          {totalInIntervals > 0 ? (
            <div className="space-y-2.5">
              {/* Learning (1-3d) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Learning (1–3 days)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {intervalDistribution.learning}{' '}
                    <span className="text-slate-400 font-normal">
                      ({Math.round((intervalDistribution.learning / totalInIntervals) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(intervalDistribution.learning / totalInIntervals) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Early Retention (4-7d) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Early Retention (4–7 days)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {intervalDistribution.earlyRetention}{' '}
                    <span className="text-slate-400 font-normal">
                      ({Math.round((intervalDistribution.earlyRetention / totalInIntervals) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(intervalDistribution.earlyRetention / totalInIntervals) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Intermediate (8-14d) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Intermediate (8–14 days)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {intervalDistribution.intermediate}{' '}
                    <span className="text-slate-400 font-normal">
                      ({Math.round((intervalDistribution.intermediate / totalInIntervals) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(intervalDistribution.intermediate / totalInIntervals) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Long-Term (>14d) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Long-Term Retention (&gt;14 days)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {intervalDistribution.longTerm}{' '}
                    <span className="text-slate-400 font-normal">
                      ({Math.round((intervalDistribution.longTerm / totalInIntervals) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(intervalDistribution.longTerm / totalInIntervals) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              No spaced retention items active yet.
            </div>
          )}
        </div>

        {/* 2. Source Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>Revision Source Breakdown</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {totalSources} items
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Coverage across DSA algorithms, Core CS subjects, and OA mistakes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold">
                <Code2 className="w-3.5 h-3.5" />
                <span>DSA Algorithms</span>
              </div>
              <div className="text-xl font-bold font-mono text-blue-900">
                {sourceDistribution.dsa}
              </div>
              <div className="text-[10px] text-blue-600">Solved patterns</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold">
                <Brain className="w-3.5 h-3.5" />
                <span>Core CS</span>
              </div>
              <div className="text-xl font-bold font-mono text-indigo-900">
                {sourceDistribution.coreCs}
              </div>
              <div className="text-[10px] text-indigo-600">Quiz diagnostic misses</div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-700 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>OA Mistakes</span>
              </div>
              <div className="text-xl font-bold font-mono text-purple-900">
                {sourceDistribution.assessment}
              </div>
              <div className="text-[10px] text-purple-600">Evaluated test gaps</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Linked</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {sourceDistribution.company}
              </div>
              <div className="text-[10px] text-slate-500">Target company tagged</div>
            </div>
          </div>
        </div>

        {/* 3. Daily Activity Velocity Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Daily Review Velocity</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Past 14 Days</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Real review completions logged in your database streak log
            </p>
          </div>

          {hasTrendData ? (
            <div className="space-y-3">
              <div className="flex items-end gap-1.5 h-24 pt-2 px-1">
                {dailyTrend.map((d, idx) => {
                  const heightPercent = Math.max(12, Math.round((d.count / maxDailyCount) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          d.count > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-100'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                        {d.date}: {d.count} revs
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1 border-t border-slate-100 pt-1">
                <span>{dailyTrend[0]?.date || '14d ago'}</span>
                <span>Today</span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="text-xs font-bold text-slate-700">No Review Velocity Logged Yet</div>
              <p className="text-[11px] text-slate-500">
                Complete items due in your queue today to populate your 14-day study rhythm graph.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
