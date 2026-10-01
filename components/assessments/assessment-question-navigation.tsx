'use client';

// ============================================================================
// PREPOS ASSESSMENT QUESTION NAVIGATION COMPONENT
// Jump controls, question number grid, and status indicators (Review & Exam modes)
// ============================================================================

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Flag,
  Circle,
  HelpCircle,
  Code2,
  BookOpen,
} from 'lucide-react';

export interface QuestionNavItem {
  id: string;
  orderIndex: number;
  type: 'CODING' | 'MCQ';
  title?: string;
  // Exam Mode states
  isAnswered?: boolean;
  isMarkedForReview?: boolean;
  // Review Mode states
  isCorrect?: boolean;
  isAttempted?: boolean;
  marksAwarded?: number;
  marks?: number;
}

interface AssessmentQuestionNavigationProps {
  questions: QuestionNavItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  mode: 'EXAM' | 'REVIEW';
  sectionTitle?: string;
}

export function AssessmentQuestionNavigation({
  questions,
  activeIndex,
  onSelectIndex,
  mode,
  sectionTitle,
}: AssessmentQuestionNavigationProps) {
  // Compute counts
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const markedCount = questions.filter((q) => q.isMarkedForReview).length;
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const incorrectCount = questions.filter((q) => q.isAttempted && !q.isCorrect).length;
  const unattemptedCount = questions.filter((q) => !q.isAttempted).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
      {/* Title & Progress Summary */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {sectionTitle || 'Question Navigation'}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            {mode === 'EXAM' ? (
              <span>
                {answeredCount} of {questions.length} answered ({questions.length - answeredCount} remaining)
              </span>
            ) : (
              <span>
                {correctCount} correct • {incorrectCount} incorrect • {unattemptedCount} skipped
              </span>
            )}
          </p>
        </div>

        {mode === 'EXAM' && markedCount > 0 && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
            <Flag className="w-3 h-3 fill-amber-500 text-amber-600" />
            <span>{markedCount} flagged</span>
          </span>
        )}
      </div>

      {/* Numbered Jump Buttons Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {questions.map((q, idx) => {
          const isActive = idx === activeIndex;

          let btnClass = '';
          let icon = null;

          if (mode === 'EXAM') {
            if (isActive) {
              btnClass = 'ring-2 ring-blue-600 ring-offset-1 bg-blue-600 text-white font-bold';
            } else if (q.isMarkedForReview) {
              btnClass = 'bg-amber-100 border-amber-300 text-amber-900 font-bold';
              icon = <Flag className="w-2.5 h-2.5 fill-amber-500 text-amber-600 absolute -top-1 -right-1" />;
            } else if (q.isAnswered) {
              btnClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold';
            } else {
              btnClass = 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
            }
          } else {
            // REVIEW mode
            if (isActive) {
              btnClass = 'ring-2 ring-blue-600 ring-offset-1 ';
            }
            if (q.isCorrect) {
              btnClass += 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
              icon = <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 absolute -top-1 -right-1" />;
            } else if (q.isAttempted && !q.isCorrect) {
              btnClass += 'bg-rose-50 border-rose-300 text-rose-800 font-bold';
              icon = <XCircle className="w-2.5 h-2.5 text-rose-600 absolute -top-1 -right-1" />;
            } else {
              btnClass += 'bg-slate-100 border-slate-200 text-slate-500';
            }
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectIndex(idx)}
              className={`relative h-10 rounded-xl border text-xs font-mono flex items-center justify-center transition-all ${btnClass}`}
              title={`Question ${idx + 1}: ${q.type === 'CODING' ? 'Coding Problem' : 'MCQ Question'}`}
            >
              <span>{idx + 1}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
        {mode === 'EXAM' ? (
          <>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300" />
              <span>Answered</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300" />
              <span>Unanswered</span>
            </span>
            <span className="flex items-center gap-1">
              <Flag className="w-3 h-3 fill-amber-500 text-amber-600" />
              <span>Marked for Review</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" />
              <span>Current</span>
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Correct ({correctCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>Needs Review ({incorrectCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-slate-400" />
              <span>Unattempted ({unattemptedCount})</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
