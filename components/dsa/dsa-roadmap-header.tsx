'use client';

import React from 'react';
import { Code2, ChevronsUpDown, CheckCircle2 } from 'lucide-react';
import { ProgressBar, Badge } from '@/components/ui/student-os';
import { DifficultyStats } from '@/lib/services/dsa-roadmap';

interface DSARoadmapHeaderProps {
  totalProblems: number;
  solvedProblems: number;
  overallProgressPct: number;
  difficultyDistribution: {
    EASY: DifficultyStats;
    MEDIUM: DifficultyStats;
    HARD: DifficultyStats;
  };
  totalModules: number;
  completedModules: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function DSARoadmapHeader({
  totalProblems,
  solvedProblems,
  overallProgressPct,
  difficultyDistribution,
  totalModules,
  completedModules,
  onExpandAll,
  onCollapseAll,
}: DSARoadmapHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and placement description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Curriculum Sheet
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              {totalModules} Modules • {totalProblems} Core Problems
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            DSA Placement Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Master algorithmic patterns tested in software engineering interviews. Practice clean implementations, run real test cases, and build long-term retention.
          </p>
        </div>

        {/* Overall Solved Metric */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:min-w-[220px] self-start md:self-center shrink-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">Overall Progress</span>
            <div className="text-xs font-bold text-slate-900 font-mono">
              <span>{solvedProblems}</span>
              <span className="text-slate-400 font-normal"> / {totalProblems}</span>
              <span className="text-blue-600 ml-1.5 font-bold">({overallProgressPct}%)</span>
            </div>
          </div>
          <ProgressBar value={overallProgressPct} size="sm" color="blue" />

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Modules Complete:</span>
            <span className="font-semibold text-slate-700">
              {completedModules} / {totalModules}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown & Expand/Collapse Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Easy */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50/80 border border-emerald-200/70 text-xs">
            <span className="font-semibold text-emerald-800">Easy:</span>
            <span className="font-mono text-emerald-900 font-medium">
              {difficultyDistribution.EASY.solved} / {difficultyDistribution.EASY.total}
            </span>
          </div>

          {/* Medium */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50/80 border border-amber-200/70 text-xs">
            <span className="font-semibold text-amber-800">Medium:</span>
            <span className="font-mono text-amber-900 font-medium">
              {difficultyDistribution.MEDIUM.solved} / {difficultyDistribution.MEDIUM.total}
            </span>
          </div>

          {/* Hard */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50/80 border border-rose-200/70 text-xs">
            <span className="font-semibold text-rose-800">Hard:</span>
            <span className="font-mono text-rose-900 font-medium">
              {difficultyDistribution.HARD.solved} / {difficultyDistribution.HARD.total}
            </span>
          </div>
        </div>

        {/* Expand / Collapse Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={onExpandAll}
            className="text-xs text-slate-600 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Expand All
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={onCollapseAll}
            className="text-xs text-slate-600 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Collapse All
          </button>
        </div>
      </div>
    </div>
  );
}
