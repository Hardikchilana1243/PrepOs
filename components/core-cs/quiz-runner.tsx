'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';
import { submitQuizAction } from '@/app/dashboard/actions';
import { QuizSubmissionResult } from '@/lib/services/progress';
import { QuizResults } from './quiz-results';

interface QuestionOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

interface Question {
  id: string;
  questionText: string;
  orderIndex: number;
  topicTitle?: string;
  options: QuestionOption[];
}

interface Quiz {
  id: string;
  title: string;
  slug: string;
  durationMin: number;
  subjectTitle: string;
  subjectSlug: string;
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
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Live countdown timer
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const currentQ = quiz.questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = quiz.questions.length;
  const unansweredCount = totalCount - answeredCount;

  const handleSelectOption = (optionId: string) => {
    if (result || isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const triggerSubmission = () => {
    setShowSubmitModal(false);
    startTransition(async () => {
      const timeSpent = Math.max(1, quiz.durationMin * 60 - timeLeft);
      const res = await submitQuizAction(quiz.id, selectedAnswers, timeSpent);
      setResult(res);
    });
  };

  const handleRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setTimeLeft(quiz.durationMin * 60);
    setCurrentIdx(0);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = timeLeft < 120; // under 2 mins

  if (result) {
    return (
      <QuizResults
        result={result}
        onExit={onExit}
        onRetake={handleRetake}
      />
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-8 max-w-3xl mx-auto shadow-sm space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Exit Diagnostic"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              {quiz.subjectTitle} • Speed Drill
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              {quiz.title}
            </h2>
          </div>
        </div>

        {/* Live Timer */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-colors ${
            isUrgent
              ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
          <span>{timeFormatted}</span>
        </div>
      </div>

      {/* Progress & Jump Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700">
            Question {currentIdx + 1} of {totalCount}
            {currentQ.topicTitle && (
              <span className="ml-2 font-normal text-slate-400">• {currentQ.topicTitle}</span>
            )}
          </span>
          <span className="font-mono text-slate-600">
            {answeredCount} / {totalCount} Answered
          </span>
        </div>

        {/* Jump Bar Badges */}
        <div className="flex flex-wrap gap-1.5">
          {quiz.questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                    : isAnswered
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Statement */}
      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
        <div className="text-sm font-semibold text-slate-900 leading-relaxed">
          {currentQ.questionText}
        </div>

        {/* Options List */}
        <div className="space-y-2.5 pt-1">
          {currentQ.options.map((opt, oIdx) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            const letter = optionLetters[oIdx] || `${oIdx + 1}`;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-xs ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="font-medium leading-relaxed">{opt.optionText}</span>
                </div>

                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation & Submission Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((p) => p - 1)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1.5 shadow-subtle transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIdx < totalCount - 1 ? (
            <button
              onClick={() => setCurrentIdx((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center gap-1.5 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={() => {
                if (unansweredCount > 0) {
                  setShowSubmitModal(true);
                } else {
                  triggerSubmission();
                }
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Server-Side...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Diagnostic</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal if Unanswered Questions Exist */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Unanswered Questions</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered MCQs will be graded as incorrect. Are you ready to submit?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Continue Quiz
              </button>
              <button
                onClick={triggerSubmission}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
