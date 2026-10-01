'use client';

// ============================================================================
// PREPOS ASSESSMENT STATS COMPONENT
// Scorecard summary: overall percentage, marks, pass/fail status, cutoff, time
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Building2,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { AssessmentResultSummary } from '@/lib/services/assessment-scoring';
import { HistoricalAttemptItem } from '@/lib/services/assessment';

interface AssessmentStatsProps {
  result: AssessmentResultSummary;
  historicalAttempts?: HistoricalAttemptItem[];
}

export function AssessmentStats({ result, historicalAttempts = [] }: AssessmentStatsProps) {
  const minutesUsed = Math.floor(result.durationTakenSec / 60);
  const secondsUsed = result.durationTakenSec % 60;
  const timeFormatted = `${minutesUsed}m ${secondsUsed}s`;

  const totalQuestions = result.questions.length;
  const correctQuestions = result.questions.filter((q) => q.isCorrect).length;
  const accuracyPct = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

  // Best score across historical attempts
  const allAttempts = historicalAttempts.length > 0
    ? historicalAttempts
    : [
        {
          id: result.attemptId,
          attemptNumber: 1,
          scorePct: result.scorePct,
          totalScore: result.totalScore,
          maxPossibleScore: result.maxPossibleScore,
          passed: result.passed,
          durationTakenSec: result.durationTakenSec,
          completedAt: new Date(result.submittedAt || result.startedAt),
        },
      ];

  const bestScorePct = Math.max(...allAttempts.map((a) => a.scorePct));
  const attemptsCount = allAttempts.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
      {/* Top Banner: Status, Title, Company & Large Score */}
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

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Link
                href={`/dashboard/companies/${result.companySlug}`}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>{result.companyName} Hub</span>
              </Link>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  result.passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {result.passed ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>PASSED (Target Met)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>NEEDS PRACTICE</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {result.assessmentTitle}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Attempt ID: {result.attemptId.slice(0, 8)}... • Evaluated via Authoritative Server Grading
            </p>
          </div>
        </div>

        {/* Large Score Metric */}
        <div className="text-center md:text-right shrink-0 bg-slate-50 border border-slate-200/80 px-6 py-4 rounded-2xl min-w-[180px]">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
            {result.scorePct}%
          </div>
          <div className="text-xs text-slate-500 font-medium font-mono mt-0.5">
            {result.totalScore} / {result.maxPossibleScore} Points Earned
          </div>
        </div>
      </div>

      {/* Grid of Diagnostic Scorecard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Time Taken */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Time Taken
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
            {timeFormatted}
          </div>
          <div className="text-[10px] text-slate-500">
            of {result.durationMin}m limit ({Math.round((result.durationTakenSec / (result.durationMin * 60)) * 100)}% used)
          </div>
        </div>

        {/* Passing Benchmark Cutoff */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Cutoff Benchmark
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
            {result.passingScorePct}%
          </div>
          <div className="text-[10px] text-slate-500">
            {result.scorePct >= result.passingScorePct ? (
              <span className="text-emerald-600 font-semibold">
                +{result.scorePct - result.passingScorePct}% above cutoff
              </span>
            ) : (
              <span className="text-amber-600 font-semibold">
                -{result.passingScorePct - result.scorePct}% below cutoff
              </span>
            )}
          </div>
        </div>

        {/* Question Accuracy */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <FileCheck className="w-3 h-3" />
            Accuracy
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
            {correctQuestions} / {totalQuestions} Solved
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {accuracyPct}% accuracy rate
          </div>
        </div>

        {/* Attempts & Progression */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Best Performance
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
            {bestScorePct}% Best
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {attemptsCount} {attemptsCount === 1 ? 'total sitting' : 'total sittings'}
          </div>
        </div>
      </div>
    </div>
  );
}
