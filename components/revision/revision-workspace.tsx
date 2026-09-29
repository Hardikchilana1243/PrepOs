'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  Brain,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';

export interface RevisionDetailItem {
  id: string;
  sourceType: 'DSA' | 'CORE_CS';
  title: string;
  topicTitle: string;
  subjectTitle?: string;
  difficulty?: string;
  slug?: string;
  statement?: string | null;
  hint?: string | null;
  expectedTimeComplexity?: string | null;
  expectedSpaceComplexity?: string | null;
  explanation?: string | null;
  intervalDays: number;
  confidence: string;
  dueAt: string;
  isDue: boolean;
  daysOverdue?: number;
}

interface RevisionWorkspaceProps {
  item: RevisionDetailItem;
  isOpen: boolean;
  onClose: () => void;
  onRate: (revisionId: string, rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => Promise<void>;
  isPending: boolean;
}

export function RevisionWorkspace({
  item,
  isOpen,
  onClose,
  onRate,
  isPending,
}: RevisionWorkspaceProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revision-modal-title"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Workspace Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {item.sourceType === 'DSA' ? 'DSA Algorithm Recall' : 'Core CS Concept Review'}
              </span>
              <span className="text-xs text-slate-500 font-medium">{item.topicTitle}</span>
            </div>
            <h2 id="revision-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {item.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.difficulty && <DifficultyBadge difficulty={item.difficulty} size="sm" />}
            <button
              onClick={onClose}
              disabled={isPending}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close review workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700">
          {/* Recall Prompt / Statement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Recall Objective
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Current Interval: {item.intervalDays} day{item.intervalDays > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 leading-relaxed font-sans">
              {item.statement ? (
                <p className="whitespace-pre-line">{item.statement}</p>
              ) : (
                <p>
                  Recall the optimal algorithmic pattern, time complexity, and edge cases for{' '}
                  <strong className="text-slate-900 font-bold">{item.title}</strong> without looking at the solution.
                </p>
              )}
            </div>
          </div>

          {/* Optional Hint Toggle */}
          {item.hint && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Hide Algorithmic Hint' : 'Need a Hint?'}</span>
              </button>

              {showHint && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed animate-in fade-in duration-150">
                  <div className="font-semibold text-indigo-800 mb-0.5">Key Intuition:</div>
                  {item.hint}
                </div>
              )}
            </div>
          )}

          {/* Reveal Solution / Verification Area */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {!showAnswer ? (
              <div className="text-center py-6 px-4 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 space-y-3">
                <Brain className="w-8 h-8 text-blue-500 mx-auto opacity-70" />
                <div className="text-xs text-slate-600 max-w-sm mx-auto">
                  Attempt to recall the core pattern, time complexity, and data structures in your mind before revealing.
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Solution & Rationale</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Solution Reference
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAnswer(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Hide</span>
                  </button>
                </div>

                {/* Complexity & Pattern Details */}
                {(item.expectedTimeComplexity || item.expectedSpaceComplexity) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Time</div>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                        {item.expectedTimeComplexity || 'O(N)'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Space</div>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                        {item.expectedSpaceComplexity || 'O(1)'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation Content */}
                {item.explanation && (
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-slate-800 leading-relaxed space-y-1">
                    <div className="font-semibold text-emerald-900">Technical Rationale:</div>
                    <p className="whitespace-pre-line">{item.explanation}</p>
                  </div>
                )}

                {/* Direct Link to Problem Workspace */}
                {item.slug && item.sourceType === 'DSA' && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/dashboard/dsa/problem/${item.slug}`}
                      target="_blank"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>Open in Coding Workspace</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Workspace Footer: SM-2 Rating Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Rate Your Recall (SM-2 Interval Scheduling)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Server-authoritative calculation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              disabled={isPending || item.sourceType !== 'DSA'}
              onClick={() => onRate(item.id, 'AGAIN')}
              className="p-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold flex flex-col items-center justify-center transition-all disabled:opacity-50 min-h-[44px]"
            >
              <span>Again</span>
              <span className="text-[10px] font-mono font-normal text-rose-500">1 day</span>
            </button>

            <button
              type="button"
              disabled={isPending || item.sourceType !== 'DSA'}
              onClick={() => onRate(item.id, 'HARD')}
              className="p-2.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 text-xs font-semibold flex flex-col items-center justify-center transition-all disabled:opacity-50 min-h-[44px]"
            >
              <span>Hard</span>
              <span className="text-[10px] font-mono font-normal text-amber-500">2 days</span>
            </button>

            <button
              type="button"
              disabled={isPending || item.sourceType !== 'DSA'}
              onClick={() => onRate(item.id, 'GOOD')}
              className="p-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold flex flex-col items-center justify-center transition-all disabled:opacity-50 min-h-[44px]"
            >
              <span>Good</span>
              <span className="text-[10px] font-mono font-normal text-blue-500">
                {Math.max(7, Math.round(item.intervalDays * 1.5))} days
              </span>
            </button>

            <button
              type="button"
              disabled={isPending || item.sourceType !== 'DSA'}
              onClick={() => onRate(item.id, 'EASY')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex flex-col items-center justify-center transition-all disabled:opacity-50 min-h-[44px]"
            >
              <span>Easy</span>
              <span className="text-[10px] font-mono font-normal text-emerald-500">
                {Math.max(14, item.intervalDays * 2)} days
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
