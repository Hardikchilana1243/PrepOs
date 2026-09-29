'use client';

import React from 'react';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { GradedQuestionReview } from '@/lib/services/progress';

interface ExplanationPanelProps {
  gradedQuestion: GradedQuestionReview;
  questionNumber: number;
}

export function ExplanationPanel({
  gradedQuestion,
  questionNumber,
}: ExplanationPanelProps) {
  const isCorrect = gradedQuestion.isCorrect;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 space-y-3.5 text-xs transition-colors ${
        isCorrect
          ? 'bg-emerald-50/20 border-emerald-200/80'
          : 'bg-rose-50/20 border-rose-200/80'
      }`}
    >
      {/* Top Question Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-500">
            Q{questionNumber}.
          </span>
          <span className="font-semibold text-slate-900 leading-snug">
            {gradedQuestion.questionText}
          </span>
        </div>

        <div className="shrink-0">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Correct (+1)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Incorrect (0)</span>
            </span>
          )}
        </div>
      </div>

      {/* Answer Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Your Answer */}
        <div
          className={`p-2.5 rounded-lg border space-y-1 ${
            isCorrect
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/60 border-rose-200 text-rose-950'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Your Selected Answer:
          </span>
          <div className="font-medium leading-snug">
            {gradedQuestion.selectedOptionText || 'No answer selected'}
          </div>
        </div>

        {/* Expected Correct Answer */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 text-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
            Correct Answer:
          </span>
          <div className="font-semibold text-emerald-900 leading-snug">
            {gradedQuestion.correctOptionText}
          </div>
        </div>
      </div>

      {/* Technical Placement Explanation */}
      {gradedQuestion.explanation && (
        <div className="p-3 rounded-lg bg-white border border-slate-200/90 space-y-1 text-slate-700 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Technical Explanation & Concept:</span>
          </div>
          <div className="font-sans text-xs pt-0.5 whitespace-pre-line">
            {gradedQuestion.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
