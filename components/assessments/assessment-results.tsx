'use client';

// ============================================================================
// PREPOS ASSESSMENT RESULTS COMPONENT
// Comprehensive Diagnostic Performance Report (Score, Sections, Weaknesses & Mistake Review)
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
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
  Code2,
} from 'lucide-react';
import { AssessmentResultSummary } from '@/lib/services/assessment-scoring';
import { ProgressBar } from '@/components/ui/student-os';

interface AssessmentResultsProps {
  result: AssessmentResultSummary;
  onRetake?: () => void;
}

export function AssessmentResults({ result, onRetake }: AssessmentResultsProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT'>('ALL');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>(() => {
    // Default expand incorrect / partially solved questions
    const initial: Record<string, boolean> = {};
    result.questions.forEach((q) => {
      if (!q.isCorrect) initial[q.questionId] = true;
    });
    return initial;
  });

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const incorrectQuestions = result.questions.filter((q) => !q.isCorrect);
  const displayedQuestions = filterMode === 'INCORRECT' ? incorrectQuestions : result.questions;

  const minutesUsed = Math.floor(result.durationTakenSec / 60);
  const secondsUsed = result.durationTakenSec % 60;
  const timeFormatted = `${minutesUsed}m ${secondsUsed}s`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/companies?company=${result.companySlug}`}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-subtle transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {result.companyName} Hub</span>
        </Link>

        {onRetake && (
          <button
            onClick={onRetake}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </button>
        )}
      </div>

      {/* Main Score & Performance Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4 text-center md:text-left">
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
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {result.companyName} Placement Assessment
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    result.passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {result.passed ? 'PASSED (Target Met)' : 'NEEDS PRACTICE'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {result.assessmentTitle}
              </h1>
            </div>
          </div>

          {/* Large Percentage Metric */}
          <div className="text-center md:text-right shrink-0 bg-slate-50 border border-slate-200/80 px-6 py-3.5 rounded-2xl">
            <div className="text-3xl font-extrabold font-mono tracking-tight text-slate-900">
              {result.scorePct}%
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {result.totalScore} / {result.maxPossibleScore} Points Earned
            </div>
          </div>
        </div>

        {/* Diagnostic Metrics Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Time Taken
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{timeFormatted}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              of {result.durationMin}m allowed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Passing Target
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 font-mono">
              {result.passingScorePct}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Campus Cutoff
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Questions Solved
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 font-mono">
              {result.questions.filter((q) => q.isCorrect).length} / {result.questions.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Accuracy: {Math.round((result.questions.filter((q) => q.isCorrect).length / result.questions.length) * 100)}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PRS OA Component
            </div>
            <div className="text-sm sm:text-base font-bold text-blue-600 mt-1 font-mono">
              {result.scorePct}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              15% Overall Weight
            </div>
          </div>
        </div>

        {/* Section-by-Section Performance Breakdown */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Section-by-Section Performance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sections.map((sec) => (
              <div
                key={sec.sectionId}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sec.type === 'CODING' ? (
                      <Code2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    )}
                    <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {sec.score} / {sec.maxScore} pts ({sec.scorePct}%)
                  </span>
                </div>

                <ProgressBar value={sec.scorePct} size="sm" color={sec.scorePct >= 60 ? 'emerald' : 'amber'} />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Questions Attempted: {sec.questionsAttempted} of {sec.totalQuestions}</span>
                  <span>Fully Correct: {sec.questionsCorrect}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Strengths & Focus Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Validated Strengths</span>
            </div>
            {result.strengths.length > 0 ? (
              <ul className="text-xs text-emerald-900 space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700">Review placement questions below to establish your strengths.</p>
            )}
          </div>

          {/* Weak / Focus Areas */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Recommended Focus Areas</span>
            </div>
            {result.weakAreas.length > 0 ? (
              <ul className="text-xs text-amber-900 space-y-1">
                {result.weakAreas.map((w, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700">No major weakness patterns detected in this sitting!</p>
            )}
          </div>
        </div>
      </div>

      {/* Mistake Review & Solution Breakdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Detailed Question Review</span>
            </h2>
            <p className="text-xs text-slate-500">
              Analyze your submitted source code, testcase verdicts, and MCQ answer keys.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle shrink-0">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({result.questions.length})
            </button>
            <button
              onClick={() => setFilterMode('INCORRECT')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'INCORRECT'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Review ({incorrectQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3">
          {displayedQuestions.map((q, idx) => {
            const isExpanded = expandedQuestions[q.questionId];

            return (
              <div
                key={q.questionId}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  q.isCorrect
                    ? 'bg-white border-slate-200/90'
                    : 'bg-white border-rose-200/90'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(q.questionId)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="shrink-0">
                      {q.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-0.5">
                        <span>{q.type === 'CODING' ? 'Algorithmic Problem' : 'Core CS MCQ'}</span>
                        <span>•</span>
                        <span>{q.topicTitle || 'Placement Pattern'}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {q.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        q.isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {q.marksAwarded} / {q.marks} pts
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                    {q.type === 'MCQ' ? (
                      /* MCQ Review */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Your Chosen Answer
                            </span>
                            <div className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {q.selectedOptionText || 'No option selected'}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Correct Placement Answer
                            </span>
                            <div className="font-semibold text-emerald-700">
                              {q.correctOptionText}
                            </div>
                          </div>
                        </div>

                        {q.explanation && (
                          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 text-slate-700 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                              <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                              <span>Placement Diagnostic Explanation</span>
                            </div>
                            <p className="leading-relaxed text-slate-700">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Coding Review */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-600 font-semibold">
                            Verdict: {q.statusVerdict || (q.isCorrect ? 'ACCEPTED' : 'WRONG_ANSWER')}
                          </span>
                          <span className="text-slate-600">
                            Tests Passed: {q.passedTests ?? 0} / {q.totalTests ?? 0}
                          </span>
                        </div>

                        {q.codeSnippet && (
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Submitted Source Code ({q.codeLanguage || 'C++'})
                            </div>
                            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-64">
                              {q.codeSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
