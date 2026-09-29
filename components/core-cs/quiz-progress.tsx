'use client';

import React from 'react';

interface QuizProgressProps {
  totalQuestions: number;
  currentIndex: number;
  selectedAnswers: Record<string, string>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
}

export function QuizProgress({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  questionIds,
  onSelectQuestion,
}: QuizProgressProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none" role="tablist" aria-label="Questions list">
      {Array.from({ length: totalQuestions }).map((_, idx) => {
        const qId = questionIds[idx];
        const isAnswered = Boolean(selectedAnswers[qId]);
        const isActive = idx === currentIndex;

        return (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Question ${idx + 1}${isAnswered ? ', Answered' : ', Not answered'}`}
            onClick={() => onSelectQuestion(idx)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono text-xs font-semibold flex items-center justify-center shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-300'
                : isAnswered
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
