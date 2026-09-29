import React from 'react';
import { Award, CheckCircle2, Clock, Layers } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface CompanyProgressProps {
  companyName: string;
  totalProblems: number;
  solvedProblems: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  assessmentPassed: boolean;
  latestScorePct?: number | null;
}

export function CompanyProgress({
  companyName,
  totalProblems,
  solvedProblems,
  easySolved,
  easyTotal,
  mediumSolved,
  mediumTotal,
  hardSolved,
  hardTotal,
  assessmentPassed,
  latestScorePct,
}: CompanyProgressProps) {
  const dsaCompletionPct =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Verified Student Progress — {companyName}
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-900">
          {solvedProblems}/{totalProblems} Problems Solved
        </span>
      </div>

      {/* Difficulty breakdown */}
      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
          <div className="text-[10px] uppercase font-bold text-emerald-700">Easy Solved</div>
          <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
            {easySolved} / {easyTotal}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
          <div className="text-[10px] uppercase font-bold text-amber-700">Medium Solved</div>
          <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
            {mediumSolved} / {mediumTotal}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100">
          <div className="text-[10px] uppercase font-bold text-rose-700">Hard Solved</div>
          <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
            {hardSolved} / {hardTotal}
          </div>
        </div>
      </div>

      {/* Overall Mapped Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Tagged Algorithmic Coverage</span>
          <span className="font-mono font-semibold text-slate-800">{dsaCompletionPct}%</span>
        </div>
        <ProgressBar value={dsaCompletionPct} size="sm" color="blue" />
      </div>

      {/* Assessment Audit Summary */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>OA Simulation Status:</span>
        {latestScorePct !== undefined && latestScorePct !== null ? (
          <span className="font-mono font-bold text-slate-800">
            {latestScorePct}% {assessmentPassed ? '(✓ Benchmark Cleared)' : '(Incomplete)'}
          </span>
        ) : (
          <span className="text-slate-400">Not Attempted</span>
        )}
      </div>
    </div>
  );
}
