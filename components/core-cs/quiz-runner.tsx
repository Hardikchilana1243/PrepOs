'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { submitQuizAction } from '@/app/dashboard/actions';
import { QuizSubmissionResult } from '@/lib/services/progress';

interface Question {
  id: string;
  questionText: string;
  orderIndex: number;
  options: {
    id: string;
    optionText: string;
    orderIndex: number;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  slug: string;
  durationMin: number;
  questions: Question[];
}

interface QuizRunnerProps {
  quiz: Quiz;
  onExit: () => void;
}

export function QuizRunner({ quiz, onExit }: QuizRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.durationMin * 60);
  const [isSubmitting, startTransition] = useTransition();
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);

  // Countdown timer
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const currentQ = quiz.questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optionId: string) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const timeSpent = quiz.durationMin * 60 - timeLeft;
      const res = await submitQuizAction(quiz.id, selectedAnswers, timeSpent);
      setResult(res);
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (result) {
    return (
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 md:p-8 max-w-2xl mx-auto shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${
              result.passed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {result.passed ? 'Screening Benchmark Cleared!' : 'Diagnostic Drill Completed'}
          </h2>
          <p className="text-xs text-slate-400">
            {quiz.title} • Server-evaluated placement diagnostic
          </p>
        </div>

        {/* Score Breakdown Box */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
          <div>
            <div className="text-2xl font-bold text-white">{result.scorePercentage}%</div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Final Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {result.correctQuestions} / {result.totalQuestions}
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Correct MCQs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {result.passed ? 'PASSED' : 'RETRY'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Benchmark Status</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-cyan-300">Placement Readiness Score Recalibrated: </span>
            Your Core CS component score and streak have been immediately updated in your permanent placement record.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onExit}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Return to Core CS Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 md:p-8 max-w-3xl mx-auto shadow-2xl space-y-6">
      {/* Top Bar: Title & Live Timer */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Placement Diagnostic Drill
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{quiz.title}</h2>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeFormatted}</span>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Question {currentIdx + 1} of {quiz.questions.length}
        </span>
        <span className="font-mono">
          {answeredCount} / {quiz.questions.length} answered
        </span>
      </div>

      {/* Question Number Badges Jump Bar */}
      <div className="flex flex-wrap gap-1.5">
        {quiz.questions.map((q, idx) => {
          const isAnswered = Boolean(selectedAnswers[q.id]);
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-7 h-7 rounded-lg text-[11px] font-mono font-bold transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                  : isAnswered
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question Statement */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-4">
        <div className="text-sm font-medium text-white leading-relaxed">
          {currentQ.questionText}
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-xs ${
                  isSelected
                    ? 'bg-blue-950/30 border-blue-500 text-blue-200 ring-1 ring-blue-500/20 shadow-md'
                    : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span>{opt.optionText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((p) => p - 1)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIdx < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <span>{isSubmitting ? 'Evaluating...' : 'Submit Diagnostic'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
