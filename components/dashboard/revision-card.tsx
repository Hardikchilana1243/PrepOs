import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowUpRight, Sparkles, Clock } from 'lucide-react';

interface RevisionCardProps {
  revisionSummary: {
    dueCount: number;
    nextRevisionTitle: string | null;
  };
}

export function RevisionCard({ revisionSummary }: RevisionCardProps) {
  const { dueCount, nextRevisionTitle } = revisionSummary;

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Spaced Revision Queue</span>
          </div>
          <Link
            href="/dashboard/revision"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
          >
            Queue <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dueCount > 0 ? (
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {dueCount} <span className="text-sm font-normal text-slate-400">due for revision</span>
              </div>
            </div>
            {nextRevisionTitle && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-0.5">
                  Due Today:
                </span>
                <span className="text-slate-200 font-medium">{nextRevisionTitle}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center">
            <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-300">
              No revisions due yet.
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Complete problems and quizzes to build your automated spaced-repetition queue.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Algorithm: SuperMemo SM-2</span>
        <span className="font-mono text-slate-500">Day 7 Cadence</span>
      </div>
    </div>
  );
}
