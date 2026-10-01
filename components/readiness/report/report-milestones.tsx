'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT MILESTONES SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Trophy, CheckCircle2, Clock, Lock } from 'lucide-react';

interface ReportMilestonesProps {
  milestones: PlacementReadinessReport['milestones'];
}

export function ReportMilestones({ milestones }: ReportMilestonesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Section 6: Authenticated Placement Milestones Roadmap</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">
          {milestones.filter((m) => m.status === 'COMPLETED').length} / {milestones.length} Achieved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {milestones.map((m) => {
          const isCompleted = m.status === 'COMPLETED';
          const isInProgress = m.status === 'IN_PROGRESS';

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : isInProgress
                  ? 'bg-blue-50/30 border-blue-200'
                  : 'bg-slate-50/60 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs truncate">{m.title}</span>
                {isCompleted ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Achieved
                  </span>
                ) : isInProgress ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                    In Progress
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    Upcoming
                  </span>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px]">{m.description}</p>

              <div className="text-[10px] text-slate-400 font-mono pt-1">
                {isCompleted && m.completedAt && `Achieved: ${m.completedAt}`}
                {isInProgress && m.targetProgress && (
                  <span>
                    Current: {m.currentProgress ?? 0} / {m.targetProgress} (
                    {Math.round(((m.currentProgress ?? 0) / m.targetProgress) * 100)}%)
                  </span>
                )}
                {!isCompleted && !isInProgress && 'Prerequisite target required'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
