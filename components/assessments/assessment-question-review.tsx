'use client';

// ============================================================================
// PREPOS ASSESSMENT QUESTION REVIEW COMPONENT
// Detailed question inspection: options, correct answers, testcase verdicts, code, deep links
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Code2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { QuestionReviewItem } from '@/lib/services/assessment-scoring';

interface AssessmentQuestionReviewProps {
  question: QuestionReviewItem;
  questionNumber: number;
  totalQuestions: number;
  companySlug?: string;
}

export function AssessmentQuestionReview({
  question,
  questionNumber,
  totalQuestions,
  companySlug,
}: AssessmentQuestionReviewProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!question.codeSnippet) return;
    try {
      await navigator.clipboard.writeText(question.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard write failure
    }
  };

  const isMCQ = question.type === 'MCQ';
  const isCorrect = question.isCorrect;
  const isAttempted = question.isAttempted;

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-sm ${
        isCorrect
          ? 'border-emerald-200/90'
          : isAttempted
          ? 'border-rose-200/90'
          : 'border-slate-200/90'
      }`}
    >
      {/* Question Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCorrect
                ? 'bg-emerald-100 text-emerald-700'
                : isAttempted
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : isAttempted ? (
              <XCircle className="w-5 h-5 text-rose-600" />
            ) : (
              <span className="text-xs font-mono font-bold">#{questionNumber}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-slate-700">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {isMCQ ? 'Core CS MCQ' : 'Algorithmic Coding'}
              </span>
              {question.topicTitle && (
                <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                  • {question.topicTitle}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {isCorrect ? (
                <span className="text-emerald-700 font-semibold">Correct Evaluation</span>
              ) : isAttempted ? (
                <span className="text-rose-700 font-semibold">Needs Review</span>
              ) : (
                <span className="text-slate-500">Unattempted Question</span>
              )}
            </div>
          </div>
        </div>

        {/* Marks pill */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isAttempted
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {question.marksAwarded} / {question.marks} Points
          </span>
        </div>
      </div>

      {/* Question Statement */}
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {question.title}
          </h4>
        </div>

        {/* MCQ Question Details */}
        {isMCQ && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student's Selected Answer */}
              <div
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isAttempted
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                } space-y-1.5`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Your Answer
                </div>
                <div
                  className={`text-xs sm:text-sm font-semibold ${
                    isCorrect
                      ? 'text-emerald-800'
                      : isAttempted
                      ? 'text-rose-800'
                      : 'text-slate-500 italic'
                  }`}
                >
                  {question.selectedOptionText || 'No option selected (Skipped)'}
                </div>
                {!isCorrect && isAttempted && (
                  <div className="text-[10px] text-rose-600 font-mono">
                    -0.5 points deducted (Negative marking)
                  </div>
                )}
              </div>

              {/* Authoritative Correct Answer (Only Revealed Post-Evaluation) */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Correct Answer Key
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-900">
                  {question.correctOptionText || 'Verified Correct Option'}
                </div>
                <div className="text-[10px] text-emerald-700 font-mono">
                  Standard campus recruitment answer key
                </div>
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Placement Concept & Explanation</span>
                </div>
                <p className="leading-relaxed text-slate-700">{question.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Coding Question Details */}
        {!isMCQ && (
          <div className="space-y-4">
            {/* Verdict & Testcases Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Execution Verdict
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                  {question.statusVerdict || (isCorrect ? 'ACCEPTED' : 'WRONG_ANSWER')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Testcases Passed
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                  {question.passedTests ?? 0} / {question.totalTests ?? 0}{' '}
                  <span className="text-[11px] text-slate-500 font-normal">
                    (
                    {question.totalTests && question.totalTests > 0
                      ? Math.round(((question.passedTests ?? 0) / question.totalTests) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Language Used
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                  {question.codeLanguage || 'C++'}
                </div>
              </div>
            </div>

            {/* Submitted Source Code Display */}
            {question.codeSnippet ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Submitted Source Code</span>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto max-h-72">
                  <pre className="text-xs font-mono text-slate-100 leading-relaxed">
                    {question.codeSnippet}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 italic text-center">
                No code draft submitted for this problem.
              </div>
            )}
          </div>
        )}

        {/* Deep Links & Action Shortcuts */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {!isMCQ && question.problemSlug && (
              <Link
                href={`/dashboard/dsa/problem/${question.problemSlug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Practice in DSA Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            {isMCQ && (
              <Link
                href="/dashboard/core-cs"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Review Core CS Concept Hub</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            <Link
              href="/dashboard/revision"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Queue for Revision</span>
            </Link>
          </div>

          {companySlug && (
            <Link
              href={`/dashboard/companies/${companySlug}`}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <span>Back to Company Hub</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
