'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT PRIORITY ACTIONS SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Zap, CheckSquare } from 'lucide-react';

interface ReportActionsProps {
  actions: PlacementReadinessReport['priorityActions'];
}

export function ReportActions({ actions }: ReportActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-slate-900" />
          <span>Section 8: Prioritized Placement Preparation Tasks</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">
          {actions.length} High-Impact Steps
        </span>
      </div>

      <div className="space-y-2.5">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3 text-xs"
          >
            <div className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              #{act.priorityOrder}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white text-slate-700 border-slate-200 uppercase tracking-wider">
                  {act.badgeText}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  {act.category}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-xs">{act.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">{act.rationale}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
