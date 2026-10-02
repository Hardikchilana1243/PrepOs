'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building2,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { InterviewMistakeItem } from '@/lib/services/interview';
import { addMistakeToRevisionAction } from '@/app/dashboard/interview/actions';

interface InterviewMistakesProps {
  mistakes: InterviewMistakeItem[];
}

export function InterviewMistakes({ mistakes }: InterviewMistakesProps) {
  const [addedRevisionIds, setAddedRevisionIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAddToRevision = async (problemId: string, mistakeId: string) => {
    setLoadingId(mistakeId);
    try {
      await addMistakeToRevisionAction(problemId);
      setAddedRevisionIds((prev) => new Set(prev).add(mistakeId));
    } catch (err) {
      console.error('Failed to add mistake to revision queue:', err);
    } finally {
      setLoadingId(null);
    }
  };

  if (mistakes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Zero Unresolved Interview Mistakes</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          You currently have no unrectified DSA submission errors, failed assessments, or overdue review items. Excellent preparation consistency!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Mistake Review &amp; Deficit Rectification</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted drills on previously failed questions, non-passing diagnostics, and active recall lapses.
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
          {mistakes.length} Identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mistakes.map((m) => {
          const isAdded = addedRevisionIds.has(m.id) || m.isInRevisionQueue;

          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 uppercase">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {m.source}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {m.title}
                    </h4>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                    {m.difficulty}
                  </span>
                </div>

                {/* Deficit / Error Diagnostic */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-700">{m.errorType}</span>
                  <span className="text-slate-400 text-[11px]">{m.failedAt} ({m.daysAgo}d ago)</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {m.topic && <span>Topic: <strong className="text-slate-700">{m.topic}</strong></span>}
                  {m.companyName && (
                    <div className="flex items-center gap-1 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                {m.canAddToRevision && m.problemId && (
                  <button
                    type="button"
                    onClick={() => handleAddToRevision(m.problemId!, m.id)}
                    disabled={isAdded || loadingId === m.id}
                    className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors border ${
                      isAdded
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>In Revision Queue</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to SM-2</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  href={m.practiceUrl}
                  className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Re-Attempt Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
