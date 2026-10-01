'use client';

// ============================================================================
// PREPOS READINESS MILESTONES COMPONENT
// Tracks real student preparation achievements: Completed, In Progress, Upcoming
// ============================================================================

import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Lock,
  Code2,
  Cpu,
  Target,
  RotateCcw,
  Flame,
  Award,
} from 'lucide-react';
import { ReadinessMilestone } from '@/lib/services/readiness-cockpit';

interface ReadinessMilestonesProps {
  milestones: ReadinessMilestone[];
}

export function ReadinessMilestones({ milestones }: ReadinessMilestonesProps) {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING'>('ALL');

  const filteredMilestones = milestones.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length;
  const inProgressCount = milestones.filter((m) => m.status === 'IN_PROGRESS').length;
  const upcomingCount = milestones.filter((m) => m.status === 'UPCOMING').length;

  const getCategoryIcon = (category: ReadinessMilestone['category']) => {
    switch (category) {
      case 'DSA':
        return <Code2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      case 'ASSESSMENT':
        return <Target className="w-3.5 h-3.5 text-emerald-600" />;
      case 'REVISION':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case 'CONSISTENCY':
      default:
        return <Flame className="w-3.5 h-3.5 text-orange-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4" id="milestones">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Placement Readiness Milestones
            </h2>
            <p className="text-xs text-slate-500">
              Verified milestones unlocked through your authentic preparation activity
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {(
            [
              { key: 'ALL', label: `All (${milestones.length})` },
              { key: 'COMPLETED', label: `Completed (${completedCount})` },
              { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
              { key: 'UPCOMING', label: `Upcoming (${upcomingCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMilestones.map((m) => {
          const isCompleted = m.status === 'COMPLETED';
          const isInProgress = m.status === 'IN_PROGRESS';
          const isUpcoming = m.status === 'UPCOMING';

          return (
            <div
              key={m.id}
              className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : isInProgress
                  ? 'bg-white border-blue-200/90 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-80'
              }`}
            >
              <div className="space-y-2">
                {/* Top Status & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {getCategoryIcon(m.category)}
                    <span>{m.category}</span>
                  </span>

                  {isCompleted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  )}

                  {isInProgress && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-300 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>In Progress</span>
                    </span>
                  )}

                  {isUpcoming && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Upcoming</span>
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>

              {/* Progress Indicator or Completion Date */}
              <div className="pt-2 border-t border-slate-200/60 text-xs">
                {isCompleted && (
                  <div className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Achieved {m.completedAt ? `on ${m.completedAt}` : 'in prep history'}</span>
                  </div>
                )}

                {isInProgress && m.targetProgress && m.targetProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <span>Progress</span>
                      <span>
                        {m.currentProgress ?? 0} / {m.targetProgress} (
                        {Math.round(((m.currentProgress ?? 0) / m.targetProgress) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((m.currentProgress ?? 0) / m.targetProgress) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isUpcoming && (
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Unlocked when prerequisite targets are reached</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
