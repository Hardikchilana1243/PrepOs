'use client';

// ============================================================================
// PREPOS REVISION RESULT COMPONENT
// Post-review feedback banner showing authoritative SM-2 interval & next review
// ============================================================================

import React from 'react';
import { CheckCircle2, Calendar, TrendingUp, ArrowRight, RotateCcw } from 'lucide-react';

interface RevisionResultProps {
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  nextIntervalDays: number;
  nextDue: Date | string;
  onNext?: () => void;
  onClose: () => void;
}

export function RevisionResult({
  rating,
  nextIntervalDays,
  nextDue,
  onNext,
  onClose,
}: RevisionResultProps) {
  const formattedNextDue =
    typeof nextDue === 'string'
      ? new Date(nextDue).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : nextDue.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

  const getRatingBadge = () => {
    switch (rating) {
      case 'AGAIN':
        return { text: 'Again (Reset)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HARD':
        return { text: 'Hard (Short Delay)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'GOOD':
        return { text: 'Good (Optimal Retention)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'EASY':
        return { text: 'Easy (Long Interval)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  const badge = getRatingBadge();

  return (
    <div className="p-5 rounded-2xl bg-white border border-emerald-200/90 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Review Authoritatively Logged</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}
            >
              {badge.text}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            SuperMemo SM-2 interval calculated and persisted in the database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Next Interval
          </span>
          <div className="text-lg font-bold font-mono text-slate-900">
            +{nextIntervalDays} {nextIntervalDays === 1 ? 'day' : 'days'}
          </div>
          <p className="text-[11px] text-slate-500">Interval extended based on your recall rating.</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Scheduled Next Review
          </span>
          <div className="text-lg font-bold font-mono text-blue-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{formattedNextDue}</span>
          </div>
          <p className="text-[11px] text-slate-500">Scheduled right before the estimated memory drop.</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-900">
        <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Placement Readiness Score (PRS) and daily revision streak event updated automatically.
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Close
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Review Next Due Item</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
