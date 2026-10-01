'use client';

// ============================================================================
// PREPOS REVISION SESSION WORKSPACE COMPONENT
// Distraction-free review workspace modal with active recall & SM-2 ratings
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  Brain,
  CheckCircle2,
  Code2,
  Target,
  Building2,
  Calendar,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';
import { RevisionQueueItem } from '@/lib/services/revision';
import { RevisionRating } from './revision-rating';
import { RevisionResult } from './revision-result';

interface RevisionSessionProps {
  item: RevisionQueueItem;
  isOpen: boolean;
  onClose: () => void;
  onRate: (
    revisionId: string,
    rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
  ) => Promise<{ nextIntervalDays: number; nextDue: Date }>;
  onNextDueItem?: () => void;
  isPending: boolean;
}

export function RevisionSession({
  item,
  isOpen,
  onClose,
  onRate,
  onNextDueItem,
  isPending,
}: RevisionSessionProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
    nextIntervalDays: number;
    nextDue: Date;
  } | null>(null);

  if (!isOpen) return null;

  const handleRateSubmit = async (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    try {
      const res = await onRate(item.id, rating);
      setReviewResult({
        rating,
        nextIntervalDays: res.nextIntervalDays,
        nextDue: res.nextDue,
      });
    } catch {
      // Error handled by parent toast/transition
    }
  };

  const getSourceLabel = () => {
    switch (item.sourceType) {
      case 'DSA':
        return 'DSA Algorithmic Pattern';
      case 'CORE_CS':
        return 'Core CS Concept Review';
      case 'ASSESSMENT':
        return 'OA Placement Screening Mistake';
      default:
        return 'Recall Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revision-session-title"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Workspace Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {getSourceLabel()}
              </span>

              {item.companyName && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>{item.companyName}</span>
                </span>
              )}

              <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                {item.topicTitle}
              </span>
            </div>

            <h2
              id="revision-session-title"
              className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1"
            >
              {item.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.difficulty && <DifficultyBadge difficulty={item.difficulty} size="sm" />}
            <button
              onClick={onClose}
              disabled={isPending}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close revision session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700">
          {/* Active Recall Objective Prompt */}
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
                  <strong className="text-slate-900 font-bold">{item.title}</strong> in your mind before
                  revealing the reference.
                </p>
              )}
            </div>
          </div>

          {/* Optional Intuition Hint Toggle */}
          {item.hints && item.hints.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Hide Algorithmic Intuition' : 'Need an Intuition Hint?'}</span>
              </button>

              {showHint && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed animate-in fade-in duration-150 space-y-1">
                  <div className="font-semibold text-indigo-800">Key Intuition:</div>
                  <p>{item.hints[0]}</p>
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
                  Attempt to recall the pattern, complexity guarantees, and potential pitfalls before revealing.
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-colors min-h-[44px]"
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
                    <span>Hide Reference</span>
                  </button>
                </div>

                {/* Target Complexities */}
                {(item.expectedTimeComplexity || item.expectedSpaceComplexity) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Target Time Complexity
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                        {item.expectedTimeComplexity || 'O(N)'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Target Space Complexity
                      </div>
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

                {/* Deep-link to problem workspace / assessment review */}
                <div className="pt-1 flex flex-wrap items-center justify-end gap-3 text-xs">
                  {item.slug && item.sourceType === 'DSA' && (
                    <Link
                      href={`/dashboard/dsa/problem/${item.slug}`}
                      target="_blank"
                      className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 p-1.5 hover:underline"
                    >
                      <Code2 className="w-4 h-4" />
                      <span>Open Problem in Coding Workspace</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {item.assessmentSlug && item.sourceType === 'ASSESSMENT' && (
                    <Link
                      href={`/dashboard/assessments/${item.assessmentSlug}`}
                      target="_blank"
                      className="font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1.5 p-1.5 hover:underline"
                    >
                      <Target className="w-4 h-4" />
                      <span>Open Assessment Detailed Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Footer: Post-Review Banner OR Rating Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/90 shrink-0">
          {reviewResult ? (
            <RevisionResult
              rating={reviewResult.rating}
              nextIntervalDays={reviewResult.nextIntervalDays}
              nextDue={reviewResult.nextDue}
              onNext={onNextDueItem}
              onClose={onClose}
            />
          ) : (
            <RevisionRating
              currentIntervalDays={item.intervalDays}
              onRate={handleRateSubmit}
              isPending={isPending}
              disabled={item.sourceType !== 'DSA'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
