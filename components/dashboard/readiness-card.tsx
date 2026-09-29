import React from 'react';
import Link from 'next/link';
import { PRSComponents } from '@/lib/services/readiness-score';
import { ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface ReadinessCardProps {
  readiness: PRSComponents;
}

export function ReadinessCard({ readiness }: ReadinessCardProps) {
  const {
    totalScore,
    dsaScore,
    coreCsScore,
    oaScore,
    consistencyScore,
    isBaselineOnly,
  } = readiness;

  // Determine readiness tier band
  const getReadinessTier = (score: number) => {
    if (score >= 70) {
      return {
        label: 'Placement Ready',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        summary: 'Competitive for Tier 1 campus & off-campus hiring drives.',
      };
    }
    if (score >= 40) {
      return {
        label: 'Competitive',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        summary: 'Solid foundation. Expand problem volume and take timed mock OAs.',
      };
    }
    return {
      label: 'Developing',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      summary: 'Focus on completing foundational DSA topics and core diagnostic drills.',
    };
  };

  const tier = getReadinessTier(totalScore);

  return (
    <section
      aria-labelledby="readiness-score-heading"
      className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <h2
              id="readiness-score-heading"
              className="text-base font-bold text-slate-900 tracking-tight"
            >
              Placement Readiness Index
            </h2>
          </div>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
              isBaselineOnly
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {isBaselineOnly ? 'Initial Baseline' : 'PRS v1'}
          </span>
        </div>

        {/* Score & Tier Band */}
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalScore}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${tier.color}`}
          >
            {tier.label}
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {isBaselineOnly
            ? 'Initial baseline score of 20 points. Solve problems and quizzes to calibrate your real-time score.'
            : tier.summary}
        </p>

        {/* 4 Factor Formula Breakdown */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Score Breakdown
            </span>
            <span
              className="text-[10px] text-slate-400 flex items-center gap-0.5"
              title="Formula: 40% DSA + 30% Core CS + 15% OA + 15% Consistency"
            >
              <span>Weighted formula</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 1. DSA Component (40%) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">
                  DSA Mastery{' '}
                  <span className="text-[10px] text-slate-400">(40%)</span>
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {dsaScore}%
                </span>
              </div>
              <ProgressBar value={dsaScore} size="sm" color="blue" />
            </div>

            {/* 2. Core CS Component (30%) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">
                  Core CS Fundamentals{' '}
                  <span className="text-[10px] text-slate-400">(30%)</span>
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {coreCsScore}%
                </span>
              </div>
              <ProgressBar value={coreCsScore} size="sm" color="indigo" />
            </div>

            {/* 3. OA Component (15%) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">
                  Mock OA Simulations{' '}
                  <span className="text-[10px] text-slate-400">(15%)</span>
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {oaScore > 0 ? `${oaScore}%` : '0%'}
                </span>
              </div>
              <ProgressBar value={oaScore} size="sm" color="amber" />
            </div>

            {/* 4. Consistency Component (15%) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">
                  Study Consistency{' '}
                  <span className="text-[10px] text-slate-400">(15%)</span>
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {consistencyScore}%
                </span>
              </div>
              <ProgressBar value={consistencyScore} size="sm" color="emerald" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/profile"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <span>View complete readiness metrics</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
