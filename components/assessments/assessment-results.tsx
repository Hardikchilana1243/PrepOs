'use client';

// ============================================================================
// PREPOS ASSESSMENT RESULTS COMPONENT
// Redesigned Performance Scorecard & Diagnostic Review Workspace (Phases 6.2–6.8)
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  Building2,
  Layers,
} from 'lucide-react';
import { AssessmentResultSummary } from '@/lib/services/assessment-scoring';
import { HistoricalAttemptItem } from '@/lib/services/assessment';
import { AssessmentStats } from './assessment-stats';
import { AssessmentSectionBreakdown } from './assessment-section-breakdown';
import { AssessmentPerformanceChart } from './assessment-performance-chart';
import { AssessmentHistory } from './assessment-history';
import { AssessmentReviewPanel } from './assessment-review-panel';

interface AssessmentResultsProps {
  result: AssessmentResultSummary;
  historicalAttempts?: HistoricalAttemptItem[];
  onRetake?: () => void;
}

export function AssessmentResults({
  result,
  historicalAttempts = [],
  onRetake,
}: AssessmentResultsProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 px-4 sm:px-6">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/companies/${result.companySlug}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{result.companyName} Hub</span>
          </Link>

          <Link
            href="/dashboard/assessments"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Assessments</span>
          </Link>
        </div>

        <Link
          href={`/dashboard/assessments/${result.assessmentSlug}`}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 transition-all shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Simulation</span>
        </Link>
      </div>

      {/* 1. Overall Scorecard & Metrics Summary */}
      <AssessmentStats result={result} historicalAttempts={historicalAttempts} />

      {/* 2. Section Breakdown & Strengths/Weaknesses */}
      <AssessmentSectionBreakdown
        sections={result.sections}
        strengths={result.strengths}
        weakAreas={result.weakAreas}
        passingScorePct={result.passingScorePct}
      />

      {/* 3. Performance Trend Trajectory (SVG) */}
      <AssessmentPerformanceChart
        attempts={historicalAttempts}
        passingScorePct={result.passingScorePct}
      />

      {/* 4. Prior Sittings History */}
      {historicalAttempts.length > 0 && (
        <AssessmentHistory
          attempts={historicalAttempts}
          assessmentSlug={result.assessmentSlug}
          currentAttemptId={result.attemptId}
          passingScorePct={result.passingScorePct}
        />
      )}

      {/* 5. Detailed Question Diagnostic Review */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <AssessmentReviewPanel
          questions={result.questions}
          companySlug={result.companySlug}
        />
      </div>
    </div>
  );
}
