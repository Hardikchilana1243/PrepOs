'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { QuizSubmissionResult } from '@/lib/services/progress';
import { ExplanationPanel } from './explanation-panel';

interface QuizResultsProps {
  result: QuizSubmissionResult;
  onExit: () => void;
  onRetake?: () => void;
}

export function QuizResults({ result, onExit, onRetake }: QuizResultsProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT'>('ALL');

  const incorrectQuestions = result.gradedQuestions.filter((q) => !q.isCorrect);
  const displayedQuestions =
    filterMode === 'INCORRECT' ? incorrectQuestions : result.gradedQuestions;

  const minutes = Math.floor(result.durationSec / 60);
  const seconds = result.durationSec % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Core CS Hub</span>
        </button>

        {onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Drill</span>
          </button>
        )}
      </div>

      {/* Main Score & Performance Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 ${
                result.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              <Award className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {result.subjectTitle}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    result.passed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  {result.passed ? 'Screening Benchmark Cleared' : 'Needs Review'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {result.quizTitle} Results
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated server-side • 30% Core CS placement readiness index updated
              </p>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shrink-0 font-mono text-xs">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {result.scorePercentage}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase">Accuracy</div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                {result.correctQuestions} / {result.totalQuestions}
              </div>
              <div className="text-[10px] text-slate-400 uppercase">Correct</div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-700">
                {timeFormatted}
              </div>
              <div className="text-[10px] text-slate-400 uppercase">Time</div>
            </div>
          </div>
        </div>

        {/* Dynamic Strengths vs Weak Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Demonstrated Strengths */}
          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Demonstrated Strengths</span>
            </div>
            {result.strongTopics.length > 0 ? (
              <ul className="space-y-1 text-xs text-emerald-950 font-medium">
                {result.strongTopics.map((topic, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 italic">
                Attempt more questions to establish topic mastery vectors.
              </p>
            )}
          </div>

          {/* Topics to Review */}
          <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Review Topics</span>
            </div>
            {result.weakTopics.length > 0 ? (
              <ul className="space-y-1 text-xs text-amber-950 font-medium">
                {result.weakTopics.map((topic, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-amber-700 font-medium">
                Excellent! No weak conceptual areas flagged in this attempt.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Question-by-Question Detailed Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Detailed Question Review & Explanations
            </h3>
            <p className="text-xs text-slate-500">
              Review correct answers, conceptual models, and technical rationales.
            </p>
          </div>

          {/* Filter toggle: All vs Incorrect */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({result.gradedQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('INCORRECT')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterMode === 'INCORRECT'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incorrect ({incorrectQuestions.length})
            </button>
          </div>
        </div>

        {/* List of Explanations */}
        <div className="space-y-3">
          {displayedQuestions.map((q, idx) => (
            <ExplanationPanel
              key={q.questionId}
              gradedQuestion={q}
              questionNumber={idx + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
