import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Brain,
  Target,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface CategoryCoverage {
  category: 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'REVISION';
  title: string;
  total: number;
  completed: number;
  remaining: number;
  progressPct: number;
  ctaLabel: string;
  ctaHref: string;
  detail: string;
}

interface CompanyReadinessCardProps {
  companyName: string;
  overallCoveragePct: number;
  totalItems: number;
  completedItems: number;
  remainingItems: number;
  dsa: {
    total: number;
    solved: number;
    remaining: number;
    coveragePct: number;
  };
  coreCs: {
    hasMapping: boolean;
    total: number;
    cleared: number;
    remaining: number;
    coveragePct: number;
  };
  assessments: {
    hasAssessments: boolean;
    total: number;
    passed: number;
    remaining: number;
    coveragePct: number;
  };
  revision: {
    hasScheduled: boolean;
    total: number;
    dueCount: number;
    coveragePct: number;
  };
}

export function CompanyReadinessCard({
  companyName,
  overallCoveragePct,
  totalItems,
  completedItems,
  remainingItems,
  dsa,
  coreCs,
  assessments,
  revision,
}: CompanyReadinessCardProps) {
  const categories: CategoryCoverage[] = [];

  // 1. DSA
  categories.push({
    category: 'DSA',
    title: 'Algorithmic Problem Solving',
    total: dsa.total,
    completed: dsa.solved,
    remaining: dsa.remaining,
    progressPct: dsa.coveragePct,
    ctaLabel: dsa.solved === dsa.total && dsa.total > 0 ? 'Review Solved' : 'Solve Problems',
    ctaHref: '#problems-section',
    detail: `${dsa.solved} of ${dsa.total} verified DSA problems solved.`,
  });

  // 2. Core CS (Only if mapped)
  if (coreCs.hasMapping) {
    categories.push({
      category: 'CORE_CS',
      title: 'Core CS Foundations',
      total: coreCs.total,
      completed: coreCs.cleared,
      remaining: coreCs.remaining,
      progressPct: coreCs.coveragePct,
      ctaLabel: coreCs.cleared === coreCs.total ? 'Review Core CS' : 'Practice Diagnostics',
      ctaHref: '/dashboard/core-cs',
      detail: `${coreCs.cleared} of ${coreCs.total} diagnostics cleared at ≥70% benchmark.`,
    });
  }

  // 3. Mock OA (Only if mapped)
  if (assessments.hasAssessments) {
    categories.push({
      category: 'ASSESSMENT',
      title: 'Mock Online Assessments',
      total: assessments.total,
      completed: assessments.passed,
      remaining: assessments.remaining,
      progressPct: assessments.coveragePct,
      ctaLabel: assessments.passed === assessments.total ? 'Retake / Review' : 'Start Simulation',
      ctaHref: '#assessments-section',
      detail: `${assessments.passed} of ${assessments.total} timed OA simulations passed.`,
    });
  }

  // 4. Spaced Revision (Only if scheduled problems exist)
  if (revision.hasScheduled) {
    const revisionCompleted = revision.total - revision.dueCount;
    categories.push({
      category: 'REVISION',
      title: 'Spaced Memory Retention',
      total: revision.total,
      completed: revisionCompleted,
      remaining: revision.dueCount,
      progressPct: revision.coveragePct,
      ctaLabel: revision.dueCount === 0 ? 'View Queue' : 'Solve Due Drills',
      ctaHref: '/dashboard/revision',
      detail:
        revision.dueCount === 0
          ? `All ${revision.total} problem retention intervals up to date.`
          : `${revision.dueCount} problem revision(s) due today.`,
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Deterministic Coverage
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Zero Synthetic Scores
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {companyName} Preparation Coverage
          </h2>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono font-bold text-slate-900 text-lg leading-none">
              {overallCoveragePct}%
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
              Coverage
            </div>
          </div>
          <div className="w-28 sm:w-36">
            <ProgressBar value={overallCoveragePct} size="md" color="blue" />
          </div>
        </div>
      </div>

      {/* Preparation Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          let Icon = Code2;
          let iconColor = 'text-blue-600 bg-blue-50 border-blue-200';
          if (cat.category === 'CORE_CS') {
            Icon = Brain;
            iconColor = 'text-purple-600 bg-purple-50 border-purple-200';
          } else if (cat.category === 'ASSESSMENT') {
            Icon = Target;
            iconColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
          } else if (cat.category === 'REVISION') {
            Icon = Clock;
            iconColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
          }

          return (
            <div
              key={cat.category}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.title}</h3>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-800">
                    {cat.completed}/{cat.total}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{cat.detail}</p>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Category Progress</span>
                    <span className="font-mono font-semibold text-slate-700">{cat.progressPct}%</span>
                  </div>
                  <ProgressBar value={cat.progressPct} size="sm" color="blue" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {cat.remaining > 0 ? `${cat.remaining} remaining` : '✓ All completed'}
                </span>

                <Link
                  href={cat.ctaHref}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 group transition-colors"
                >
                  <span>{cat.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
