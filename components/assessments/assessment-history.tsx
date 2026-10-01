'use client';

// ============================================================================
// PREPOS ASSESSMENT HISTORY COMPONENT
// Chronological list of student attempts with score %, duration, and direct report links
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, AlertCircle, Clock, ArrowRight, Eye } from 'lucide-react';
import { HistoricalAttemptItem } from '@/lib/services/assessment';

interface AssessmentHistoryProps {
  attempts: HistoricalAttemptItem[];
  assessmentSlug: string;
  currentAttemptId?: string;
  passingScorePct: number;
}

export function AssessmentHistory({
  attempts,
  assessmentSlug,
  currentAttemptId,
  passingScorePct,
}: AssessmentHistoryProps) {
  if (!attempts || attempts.length === 0) {
    return null;
  }

  // Reverse to show latest first
  const sortedAttempts = [...attempts].reverse();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Sitting History & Prior Attempts ({attempts.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Cutoff Benchmark: {passingScorePct}%
        </span>
      </div>

      {/* Attempt List */}
      <div className="space-y-2.5">
        {sortedAttempts.map((att) => {
          const isCurrent = att.id === currentAttemptId;
          const minutesUsed = Math.floor(att.durationTakenSec / 60);
          const secondsUsed = att.durationTakenSec % 60;

          return (
            <div
              key={att.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-100'
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    att.passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  #{att.attemptNumber}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Attempt #{att.attemptNumber}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.2 rounded font-mono">
                        Current Report
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-full inline-flex items-center gap-1 ${
                        att.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {att.passed ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Passed</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                          <span>Needs Review</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(att.completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {/* Right Side: Score & Action Link */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                    {att.scorePct}% ({att.totalScore}/{att.maxPossibleScore} pts)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{minutesUsed}m {secondsUsed}s</span>
                  </div>
                </div>

                {!isCurrent ? (
                  <Link
                    href={`/dashboard/assessments/${assessmentSlug}/attempt/${att.id}/result`}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>Inspect</span>
                  </Link>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 px-3 py-1.5">
                    Viewing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
