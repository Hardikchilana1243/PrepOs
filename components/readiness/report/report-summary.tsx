'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT EXECUTIVE SUMMARY & PRS BREAKDOWN
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Layers, ShieldCheck, HelpCircle } from 'lucide-react';

interface ReportSummaryProps {
  summary: PlacementReadinessReport['readinessSummary'];
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  const { prsScore, prsTierLabel, completionPct, breakdown, isBaselineOnly } = summary;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <span>Executive Summary & Placement Readiness Score (PRS)</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500">Authoritative Formula v1</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Hero */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Placement Readiness Index
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
              {isBaselineOnly ? 'Baseline Calibration' : 'Evaluated Score'}
            </span>
          </div>

          <div>
            <div className="text-4xl font-extrabold font-mono tracking-tight leading-none">
              {prsScore}
              <span className="text-sm text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="text-xs font-semibold text-blue-400 mt-1.5">
              Status: {prsTierLabel}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2">
            Formula: 0.4*DSA + 0.3*CoreCS + 0.15*OA + 0.15*Consistency
          </div>
        </div>

        {/* 4 Factor Component Breakdown */}
        <div className="md:col-span-2 bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Dimensional Score Weights & Progress
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600">
              Prep Completion: {completionPct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">DSA Mastery</span>
                <span className="font-mono font-bold text-blue-600">{breakdown.dsaScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${breakdown.dsaScore}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">40% Total Weight</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Core CS Foundations</span>
                <span className="font-mono font-bold text-indigo-600">{breakdown.coreCsScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${breakdown.coreCsScore}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">30% Total Weight</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Mock Assessments</span>
                <span className="font-mono font-bold text-emerald-600">{breakdown.oaScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.oaScore}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">15% Total Weight</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Consistency & Recall</span>
                <span className="font-mono font-bold text-amber-600">{breakdown.consistencyScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${breakdown.consistencyScore}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">15% Total Weight</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
