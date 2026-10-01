'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT CORE CS FOUNDATIONS SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportCoreCsProps {
  coreCs: PlacementReadinessReport['coreCsReport'];
}

export function ReportCoreCs({ coreCs }: ReportCoreCsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Section 2: Core Computer Science Foundations</span>
        </h3>
        <span className="text-xs font-mono font-bold text-slate-800">
          Score: {coreCs.score} / 100
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Diagnostics</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {coreCs.quizAttemptsCount} <span className="text-xs font-normal text-slate-400">Completed</span>
          </div>
          <span className="text-[10px] text-slate-500">{coreCs.subjectsAttempted} / {coreCs.totalSubjects} domains tested</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Diagnostic Average</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {coreCs.avgScorePct}%
          </div>
          <span className="text-[10px] text-slate-500">Benchmark cutoff: 70%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Peak Score</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {coreCs.bestScorePct}%
          </div>
          <span className="text-[10px] text-slate-500">Highest diagnostic result</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Benchmark Status</span>
          <div className="text-sm font-bold mt-1.5 flex items-center gap-1.5">
            {coreCs.benchmarkMet ? (
              <span className="text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>BENCHMARK MET</span>
              </span>
            ) : (
              <span className="text-amber-700 inline-flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>ATTENTION NEEDED</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500">{coreCs.missedConceptsCount} concepts flagged</span>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Technical Concepts Audit
        </span>
        <ul className="space-y-1 text-xs text-slate-600">
          {coreCs.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
