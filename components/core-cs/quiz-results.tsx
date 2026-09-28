'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { QuizSubmissionResult, GradedQuestionReview } from '@/lib/services/progress';

interface QuizResultsProps {
  result: QuizSubmissionResult;
  onExit: () => void;
  onRetake?: () => void;
}

export function QuizResults({ result, onExit, onRetake }: QuizResultsProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT'>('ALL');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>(() => {
    // Default expand incorrect questions
    const initial: Record<string, boolean> = {};
    result.gradedQuestions.forEach((q) => {
      if (!q.isCorrect) initial[q.questionId] = true;
    });
    return initial;
  });

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

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
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-subtle transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Core CS Hub</span>
        </button>

        {onRetake && (
          <button
            onClick={onRetake}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Drill</span>
          </button>
        )}
      </div>

      {/* Main Score & Performance Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${
                result.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  {result.subjectTitle}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    result.passed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  {result.passed ? 'Screening Benchmark Cleared' : 'Needs Review'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {result.quizTitle} Diagnostic Results
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official server-graded technical assessment • PRS 30% Core CS calibrated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shrink-0 font-mono">
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-slate-900">{result.scorePercentage}%</div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Accuracy</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-emerald-600">
                {result.correctQuestions} / {result.totalQuestions}
              </div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Correct MCQs</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-slate-700">{timeFormatted}</div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Elapsed Time</div>
            </div>
          </div>
        </div>

        {/* Dynamic Strong vs Needs Review Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Demonstrated Strengths</span>
            </div>
            {result.strongTopics.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                {result.strongTopics.map((topic, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 italic">
                Review the mistakes below to build your core foundation.
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Concepts Needing Review</span>
            </div>
            {result.weakTopics.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                {result.weakTopics.map((topic, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-amber-700 font-semibold">
                Perfect score! Zero weak topics detected in this diagnostic.
              </p>
            )}
          </div>
        </div>

        {/* Readiness Score Notification Callout */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-blue-800">Placement Readiness Updated: </span>
            This assessment has been graded on the server. Your Core CS proficiency component (weighted at 30% of your overall PRS) and your daily preparation streak have been recalculated.
          </div>
        </div>
      </div>

      {/* Mistake Review Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Detailed Question & Mistake Review</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review answers, explanations, and placement traps to prevent recurring errors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Questions ({result.totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('INCORRECT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterMode === 'INCORRECT'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Missed Questions ({incorrectQuestions.length})</span>
            </button>
          </div>
        </div>

        {displayedQuestions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No questions match the current filter.
          </div>
        ) : (
          <div className="space-y-4">
            {displayedQuestions.map((q, idx) => {
              const isExpanded = expandedQuestions[q.questionId] ?? true;

              return (
                <div
                  key={q.questionId}
                  className={`rounded-2xl border transition-all ${
                    q.isCorrect
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  {/* Question Header Bar */}
                  <div
                    onClick={() => toggleExpand(q.questionId)}
                    className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5 ${
                          q.isCorrect
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {q.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {q.topicTitle}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                          {q.questionText}
                        </div>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Body: Answers & Explanation */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-3.5 border-t border-slate-200/60 mt-1">
                      {/* Answers Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Candidate Selected Option */}
                        <div
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            q.isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                              : 'bg-red-50/80 border-red-300 text-red-900'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span>Your Selection</span>
                            {q.isCorrect ? (
                              <span className="text-emerald-700 font-semibold">Correct</span>
                            ) : (
                              <span className="text-red-700 font-semibold">Incorrect</span>
                            )}
                          </div>
                          <div className="font-medium pt-0.5">{q.selectedOptionText}</div>
                        </div>

                        {/* Official Correct Option */}
                        <div className="p-3 rounded-xl border bg-emerald-50/80 border-emerald-300 text-emerald-900 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            <span>Official Correct Answer</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="font-medium pt-0.5">{q.correctOptionText}</div>
                        </div>
                      </div>

                      {/* Explanation Card */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-subtle">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Placement Conceptual Explanation</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-sans">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Return to Core CS Hub
          </button>

          {onRetake && (
            <button
              onClick={onRetake}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake This Diagnostic</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
