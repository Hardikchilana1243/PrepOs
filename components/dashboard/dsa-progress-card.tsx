import React from 'react';
import Link from 'next/link';
import { Code2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ProgressBar, DifficultyBadge } from '@/components/ui/student-os';

interface DSAProgressCardProps {
  dsaProgress: {
    solvedCount: number;
    totalCount: number;
    progressPct: number;
    nextProblem: {
      title: string;
      slug: string;
      difficulty: string;
    } | null;
  };
}

export function DSAProgressCard({ dsaProgress }: DSAProgressCardProps) {
  const { solvedCount, totalCount, progressPct, nextProblem } = dsaProgress;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              DSA Roadmap
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {solvedCount} / {totalCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Overall Curriculum</span>
            <span className="font-semibold text-slate-800 font-mono">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} size="sm" color="blue" />
        </div>

        {/* Next Recommendation */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Next Problem
          </div>
          {nextProblem ? (
            <Link
              href={`/dashboard/dsa/problem/${nextProblem.slug}`}
              className="group block p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                  {nextProblem.title}
                </span>
                <DifficultyBadge difficulty={nextProblem.difficulty} size="sm" />
              </div>
            </Link>
          ) : (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>All DSA problems solved!</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/dsa"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <span>Open DSA Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
