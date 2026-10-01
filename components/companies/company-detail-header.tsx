'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Star,
  ExternalLink,
  Code2,
  Target,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';
import { toggleTargetCompanyAction } from '@/app/dashboard/companies/actions';

interface CompanyDetailHeaderProps {
  company: {
    slug: string;
    name: string;
    tier: string;
    description: string | null;
    websiteUrl: string | null;
    isTarget: boolean;
  };
  coverage: {
    coveragePct: number;
    completedItems: number;
    totalItems: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED';
  };
  metrics: {
    totalProblems: number;
    solvedProblems: number;
    attemptedProblems: number;
    totalAssessments: number;
    passedAssessments: number;
    hasCoreCS: boolean;
    totalQuizzes: number;
    passedQuizzes: number;
  };
}

export function CompanyDetailHeader({ company, coverage, metrics }: CompanyDetailHeaderProps) {
  const [isTarget, setIsTarget] = useState(company.isTarget);
  const [isPending, startTransition] = useTransition();

  const handleToggleTarget = () => {
    const nextState = !isTarget;
    setIsTarget(nextState);

    startTransition(async () => {
      const res = await toggleTargetCompanyAction(company.slug, nextState);
      if (!res.success) {
        setIsTarget(!nextState);
      }
    });
  };

  return (
    <header className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Bar: Back Link & Target Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <Link
          href="/dashboard/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100/80 -ml-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Company Hubs</span>
        </Link>

        {/* Target Status Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTarget}
          disabled={isPending}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border min-h-[40px] ${
            isTarget
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Star
            className={`w-4 h-4 ${
              isTarget ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
            }`}
          />
          <span>{isTarget ? 'Target Firm' : 'Add to Targets'}</span>
        </button>
      </div>

      {/* Company Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {company.tier}
            </span>
            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 transition-colors"
              >
                <span>Official Careers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {company.name} Placement Preparation Hub
          </h1>

          {company.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {company.description}
            </p>
          )}
        </div>

        {/* Aggregate Coverage Progress Gauge */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-right space-y-2 shrink-0 md:min-w-[220px]">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Target Coverage:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {coverage.coveragePct}%
            </span>
          </div>
          <ProgressBar value={coverage.coveragePct} size="sm" color="blue" />
          <div className="text-[10px] text-slate-500 text-left">
            {coverage.completedItems} of {coverage.totalItems} mapped items completed
          </div>
        </div>
      </div>

      {/* Key Numbers Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {/* Mapped DSA Solved */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
            <Code2 className="w-3.5 h-3.5 text-blue-600" />
            <span>DSA Problems</span>
          </div>
          <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
            {metrics.solvedProblems} / {metrics.totalProblems} Solved
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.attemptedProblems > 0 ? `${metrics.attemptedProblems} attempted` : 'None in-progress'}
          </div>
        </div>

        {/* Mock OA Status */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mock OA Tests</span>
          </div>
          <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
            {metrics.totalAssessments > 0 ? (
              <span>
                {metrics.passedAssessments} / {metrics.totalAssessments} Passed
              </span>
            ) : (
              <span className="text-slate-400 font-sans font-normal">None Available</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.totalAssessments > 0 ? `${metrics.totalAssessments} simulation(s)` : 'Curriculum only'}
          </div>
        </div>

        {/* Core CS Status */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>Core CS Screening</span>
          </div>
          <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
            {metrics.hasCoreCS ? (
              <span>
                {metrics.passedQuizzes} / {metrics.totalQuizzes} Cleared
              </span>
            ) : (
              <span className="text-slate-400 font-sans font-normal">Not Required</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.hasCoreCS ? '≥70% benchmark' : 'Algorithmic focus'}
          </div>
        </div>

        {/* Target Status */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Target Status</span>
          </div>
          <div className="mt-1 font-bold text-slate-900 text-sm">
            {isTarget ? (
              <span className="text-amber-700">Target Company</span>
            ) : (
              <span className="text-slate-600">Untargeted</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            {isTarget ? 'Saved to personal targets' : 'Click above to track'}
          </div>
        </div>
      </div>
    </header>
  );
}
