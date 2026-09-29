import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface RevisionCardProps {
  revisionSummary: {
    dueCount: number;
    nextRevisionTitle: string | null;
  };
}

export function RevisionCard({ revisionSummary }: RevisionCardProps) {
  const { dueCount, nextRevisionTitle } = revisionSummary;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Spaced Revision
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full font-mono ${
              dueCount > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {dueCount} Due
          </span>
        </div>

        {/* Status Content */}
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Memory Retention
          </div>
          {dueCount > 0 ? (
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{dueCount} item(s) due today</span>
              </div>
              {nextRevisionTitle && (
                <p className="text-xs text-amber-800 mt-1 truncate font-medium">
                  Next: {nextRevisionTitle}
                </p>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Queue is clear! Up to date with SM-2 intervals.</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/revision"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          <span>{dueCount > 0 ? 'Review due items' : 'Open revision queue'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
