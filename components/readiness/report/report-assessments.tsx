'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT MOCK ASSESSMENTS SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Target, CheckCircle2, Clock } from 'lucide-react';

interface ReportAssessmentsProps {
  assessment: PlacementReadinessReport['mockAssessmentsReport'];
}

export function ReportAssessments({ assessment }: ReportAssessmentsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600" />
          <span>Section 3: Mock Online Assessments (OA)</span>
        </h3>
        <span className="text-xs font-mono font-bold text-slate-800">
          Score: {assessment.score} / 100
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Simulations Attempted</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {assessment.attemptsCount}
          </div>
          <span className="text-[10px] text-slate-500">Timed exam conditions</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Passed Benchmark</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {assessment.passedCount} <span className="text-xs font-normal text-slate-400">Passed</span>
          </div>
          <span className="text-[10px] text-slate-500">Exceeded hiring cutoff</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Average Score</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {assessment.avgScorePct}%
          </div>
          <span className="text-[10px] text-slate-500">Weighted accuracy</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Peak Simulation</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {assessment.bestScorePct}%
          </div>
          <span className="text-[10px] text-slate-500">Highest OA score</span>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Exam Performance Highlights
        </span>
        <ul className="space-y-1 text-xs text-slate-600">
          {assessment.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
