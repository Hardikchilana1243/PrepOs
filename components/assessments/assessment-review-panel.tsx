'use client';

// ============================================================================
// PREPOS ASSESSMENT REVIEW PANEL COMPONENT
// Filterable question-by-question review workspace with jump navigation and search
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
  Code2,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { QuestionReviewItem } from '@/lib/services/assessment-scoring';
import { AssessmentQuestionReview } from './assessment-question-review';
import { AssessmentQuestionNavigation, QuestionNavItem } from './assessment-question-navigation';

type FilterTab = 'ALL' | 'INCORRECT' | 'CORRECT' | 'CODING' | 'MCQ';

interface AssessmentReviewPanelProps {
  questions: QuestionReviewItem[];
  companySlug?: string;
}

export function AssessmentReviewPanel({ questions, companySlug }: AssessmentReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Compute category counts
  const counts = useMemo(() => {
    return {
      all: questions.length,
      incorrect: questions.filter((q) => !q.isCorrect).length,
      correct: questions.filter((q) => q.isCorrect).length,
      coding: questions.filter((q) => q.type === 'CODING').length,
      mcq: questions.filter((q) => q.type === 'MCQ').length,
    };
  }, [questions]);

  // Filter questions according to active tab
  const filteredQuestions = useMemo(() => {
    switch (activeTab) {
      case 'INCORRECT':
        return questions.filter((q) => !q.isCorrect);
      case 'CORRECT':
        return questions.filter((q) => q.isCorrect);
      case 'CODING':
        return questions.filter((q) => q.type === 'CODING');
      case 'MCQ':
        return questions.filter((q) => q.type === 'MCQ');
      case 'ALL':
      default:
        return questions;
    }
  }, [questions, activeTab]);

  // Safe active index within filtered list
  const safeIdx = Math.min(activeQuestionIdx, Math.max(0, filteredQuestions.length - 1));
  const currentQuestion = filteredQuestions[safeIdx];

  // Map questions for Question Navigation Grid
  const navItems: QuestionNavItem[] = useMemo(() => {
    return filteredQuestions.map((q, idx) => ({
      id: q.questionId,
      orderIndex: idx,
      type: q.type,
      title: q.title,
      isCorrect: q.isCorrect,
      isAttempted: q.isAttempted,
      marksAwarded: q.marksAwarded,
      marks: q.marks,
    }));
  }, [filteredQuestions]);

  const handleNext = () => {
    if (safeIdx < filteredQuestions.length - 1) {
      setActiveQuestionIdx(safeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (safeIdx > 0) {
      setActiveQuestionIdx(safeIdx - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Question-by-Question Diagnostic Review</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect source code, hidden testcase pass rates, MCQ answer keys, and concept explanations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setActiveQuestionIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            onClick={() => {
              setActiveTab('INCORRECT');
              setActiveQuestionIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'INCORRECT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Needs Review ({counts.incorrect})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('CORRECT');
              setActiveQuestionIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'CORRECT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Correct ({counts.correct})</span>
          </button>

          {counts.coding > 0 && (
            <button
              onClick={() => {
                setActiveTab('CODING');
                setActiveQuestionIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === 'CODING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Coding ({counts.coding})</span>
            </button>
          )}

          {counts.mcq > 0 && (
            <button
              onClick={() => {
                setActiveTab('MCQ');
                setActiveQuestionIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'MCQ'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>MCQ ({counts.mcq})</span>
            </button>
          )}
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No questions in this filter view</h4>
          <p className="text-xs text-slate-500">
            {activeTab === 'INCORRECT'
              ? 'Excellent performance! You answered all questions correctly in this assessment.'
              : 'Try selecting a different filter tab above to view questions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Question Navigator */}
          <AssessmentQuestionNavigation
            questions={navItems}
            activeIndex={safeIdx}
            onSelectIndex={(newIdx) => setActiveQuestionIdx(newIdx)}
            mode="REVIEW"
            sectionTitle={`Reviewing ${filteredQuestions.length} ${
              activeTab === 'INCORRECT' ? 'Incorrect / Skipped' : activeTab === 'CORRECT' ? 'Correct' : ''
            } Questions`}
          />

          {/* Active Question Review Card */}
          {currentQuestion && (
            <div className="space-y-3">
              <AssessmentQuestionReview
                question={currentQuestion}
                questionNumber={safeIdx + 1}
                totalQuestions={filteredQuestions.length}
                companySlug={companySlug}
              />

              {/* Next / Previous Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrev}
                  disabled={safeIdx === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Question</span>
                </button>

                <span className="text-xs text-slate-500 font-mono">
                  {safeIdx + 1} of {filteredQuestions.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={safeIdx === filteredQuestions.length - 1}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
