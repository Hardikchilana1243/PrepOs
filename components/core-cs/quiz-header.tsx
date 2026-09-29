'use client';

import React from 'react';
import { ArrowLeft, Clock, HelpCircle } from 'lucide-react';

interface QuizHeaderProps {
  quizTitle: string;
  subjectTitle: string;
  timeLeft: number;
  currentIdx: number;
  totalCount: number;
  answeredCount: number;
  onExit: () => void;
}

export function QuizHeader({
  quizTitle,
  subjectTitle,
  timeLeft,
  currentIdx,
  totalCount,
  answeredCount,
  onExit,
}: QuizHeaderProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
  const isUrgent = timeLeft < 120; // under 2 minutes

  return (
    <div className="pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Subject and Quiz Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Exit Quiz"
          aria-label="Exit quiz and return to hub"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {subjectTitle}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Speed Drill
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            {quizTitle}
          </h2>
        </div>
      </div>

      {/* Progress & Live Timer */}
      <div className="flex items-center gap-4 self-start sm:self-center shrink-0">
        {/* Answered counter */}
        <div className="text-right text-xs font-mono">
          <div className="font-semibold text-slate-800">
            {answeredCount} / {totalCount} answered
          </div>
          <div className="text-[11px] text-slate-400">
            Question {currentIdx + 1} of {totalCount}
          </div>
        </div>

        {/* Live Timer Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
            isUrgent
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : 'bg-slate-100 text-slate-800 border-slate-200'
          }`}
          title="Remaining test time"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{timeFormatted}</span>
        </div>
      </div>
    </div>
  );
}
