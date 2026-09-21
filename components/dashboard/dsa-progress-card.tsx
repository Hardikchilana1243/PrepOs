import React from 'react';
import Link from 'next/link';
import { Code2, ArrowUpRight, CheckCircle } from 'lucide-react';

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
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>DSA Progress</span>
          </div>
          <Link
            href="/dashboard/dsa"
            className="text-xs font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            Roadmap <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl font-black font-mono text-white">
            {solvedCount} <span className="text-sm font-normal text-slate-500">/ {totalCount}</span>
          </div>
          <div className="text-xs font-mono font-bold text-blue-400">
            {progressPct}% Solved
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(solvedCount > 0 ? 5 : 0, progressPct)}%` }}
          />
        </div>
      </div>

      {/* Next Action Box */}
      <div className="mt-5 pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold mb-1">
          Continue Roadmap
        </div>
        {nextProblem ? (
          <Link
            href={`/dashboard/dsa?problem=${nextProblem.slug}`}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="truncate pr-2">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                {nextProblem.title}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Difficulty: {nextProblem.difficulty}
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0" />
          </Link>
        ) : (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>All 20 core problems solved! Excellent work.</span>
          </div>
        )}
      </div>
    </div>
  );
}
