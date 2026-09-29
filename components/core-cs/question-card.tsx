'use client';

import React from 'react';
import { ClientMCQQuestion } from '@/lib/services/core-cs';

interface QuestionCardProps {
  question: ClientMCQQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}: QuestionCardProps) {
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Question Header & Meta */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            Q{questionNumber} / {totalQuestions}
          </span>
          {question.topicTitle && (
            <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
              {question.topicTitle}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          Single Choice MCQ
        </span>
      </div>

      {/* Question Text */}
      <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed font-sans">
        {question.questionText}
      </div>

      {/* Options List */}
      <div className="space-y-2.5 pt-1" role="radiogroup" aria-label="Question options">
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const letter = optionLetters[idx] || `${idx + 1}`;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectOption(option.id)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60 ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-medium ring-1 ring-indigo-500/20 shadow-2xs'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              {/* Option Letter Circle */}
              <div
                className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <div className="min-w-0 flex-1 leading-snug pt-0.5">
                {option.optionText}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
