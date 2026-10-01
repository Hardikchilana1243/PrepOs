'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT SPACED REVISION & RETENTION HEALTH
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { RotateCcw, Flame } from 'lucide-react';

interface ReportRevisionProps {
  revision: PlacementReadinessReport['spacedRevisionReport'];
}

export function ReportRevision({ revision }: ReportRevisionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <span>Section 5: Spaced Repetition & Long-Term Memory (SM-2)</span>
        </h3>
        <span className="text-xs font-mono font-bold text-slate-800">
          Score: {revision.score} / 100
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Retention Health</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {revision.retentionHealthPct}%
          </div>
          <span className="text-[10px] text-slate-500">On-time recall consistency</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Active Schedule</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {revision.inScheduleCount} <span className="text-xs font-normal text-slate-400">Cards</span>
          </div>
          <span className="text-[10px] text-slate-500">In SM-2 learning intervals</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Due Today</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {revision.dueTodayCount}
          </div>
          <span className="text-[10px] text-slate-500">Scheduled for review</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Study Streak</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{revision.streakDays} Days</span>
          </div>
          <span className="text-[10px] text-slate-500">Overdue items: {revision.overdueCount}</span>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Memory Retention Highlights
        </span>
        <ul className="space-y-1 text-xs text-slate-600">
          {revision.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
