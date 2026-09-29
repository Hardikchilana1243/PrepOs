'use client';

import React from 'react';
import { Play, CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { ClientQuiz } from '@/lib/services/core-cs';

interface QuizRowProps {
  quiz: ClientQuiz;
  attemptsCount: number;
  bestScorePct: number | null;
  onStartQuiz: (quizSlug: string) => void;
}

export function QuizRow({
  quiz,
  attemptsCount,
  bestScorePct,
  onStartQuiz,
}: QuizRowProps) {
  const isAttempted = attemptsCount > 0;
  const isCleared = bestScorePct !== null && bestScorePct >= 70;

  const getStatusIcon = () => {
    if (isCleared) {
      return (
        <span title="Benchmark Cleared" className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="w-4 h-4 fill-emerald-50 text-emerald-600 shrink-0" />
          <span className="sr-only">Benchmark Cleared</span>
        </span>
      );
    }
    if (isAttempted) {
      return (
        <span title="Attempted" className="flex items-center gap-1 text-amber-500">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="sr-only">Attempted</span>
        </span>
      );
    }
    return (
      <span title="Unattempted" className="flex items-center gap-1 text-slate-300">
        <Circle className="w-4 h-4 shrink-0" />
        <span className="sr-only">Unattempted</span>
      </span>
    );
  };

  return (
    <div
      className={`py-3 px-3.5 rounded-lg border transition-colors flex items-center justify-between gap-3 text-xs ${
        isAttempted
          ? 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Left: Status + Title + Metadata */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0">{getStatusIcon()}</div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900 tracking-tight truncate">
              {quiz.title}
            </h3>

            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider shrink-0">
              {quiz.subjectTitle}
            </span>

            {bestScorePct !== null && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${
                  isCleared
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                Best: {bestScorePct}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
            <span>{quiz.totalQuestions} Questions</span>
            <span>•</span>
            <span>{quiz.durationMin} Minutes</span>
            <span>•</span>
            <span>{attemptsCount} {attemptsCount === 1 ? 'attempt' : 'attempts'}</span>
          </div>
        </div>
      </div>

      {/* Right: Direct Start Action CTA */}
      <button
        type="button"
        onClick={() => onStartQuiz(quiz.slug)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span>{isAttempted ? 'Retake' : 'Start'}</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
