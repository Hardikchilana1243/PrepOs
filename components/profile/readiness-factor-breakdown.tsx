import React from 'react';
import Link from 'next/link';
import { Code2, Brain, Target, RotateCcw, ArrowRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface FactorBreakdownProps {
  dsaScore: number;
  coreCsScore: number;
  oaScore: number;
  consistencyScore: number;
  isBaselineOnly: boolean;
}

export function ReadinessFactorBreakdown({
  dsaScore,
  coreCsScore,
  oaScore,
  consistencyScore,
  isBaselineOnly,
}: FactorBreakdownProps) {
  const factors = [
    {
      id: 'dsa',
      name: 'DSA Problem Mastery',
      weight: 40,
      score: dsaScore,
      contribution: Math.round(dsaScore * 0.4),
      maxContribution: 40,
      icon: Code2,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      href: '/dashboard/dsa',
      ctaLabel: 'Solve Algorithms',
      explanation:
        'Derived from verified solutions across DSA Roadmap modules and algorithmic patterns.',
    },
    {
      id: 'core_cs',
      name: 'Core CS Fundamentals',
      weight: 30,
      score: coreCsScore,
      contribution: Math.round(coreCsScore * 0.3),
      maxContribution: 30,
      icon: Brain,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      href: '/dashboard/core-cs',
      ctaLabel: 'Attempt Diagnostics',
      explanation:
        'Calculated from average percentage scores across DBMS and Operating Systems diagnostic quizzes.',
    },
    {
      id: 'oa',
      name: 'Mock OA Simulations',
      weight: 15,
      score: oaScore,
      contribution: Math.round((oaScore > 0 ? oaScore : 20) * 0.15),
      maxContribution: 15,
      icon: Target,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      href: '/dashboard/assessments',
      ctaLabel: 'Take Mock OA',
      explanation:
        'Evaluated from full-length timed assessments containing both coding challenges and MCQ sections.',
    },
    {
      id: 'consistency',
      name: 'Study Consistency & Revision',
      weight: 15,
      score: consistencyScore,
      contribution: Math.round(Math.max(10, consistencyScore) * 0.15),
      maxContribution: 15,
      icon: RotateCcw,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      href: '/dashboard/revision',
      ctaLabel: 'Review Spaced Queue',
      explanation:
        'Derived from daily activity streaks and on-time recall completions in the SM-2 revision queue.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            PRS v1 Four-Factor Breakdown
          </h2>
          <p className="text-xs text-slate-500">
            Authoritative weights calibrated against campus placement screening models.
          </p>
        </div>

        {isBaselineOnly && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full self-start sm:self-center">
            Baseline Mode Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${f.iconBg} ${f.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs">{f.name}</span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    Weight: {f.weight}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-500">Mastery Index:</span>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-slate-900">{f.score}%</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({f.contribution} / {f.maxContribution} pts)
                    </span>
                  </div>
                </div>

                <ProgressBar value={f.score} size="sm" color="blue" />

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  {f.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <Link
                  href={f.href}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
                >
                  <span>{f.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
