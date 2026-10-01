'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Building2,
  Star,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  Code2,
  Target,
  Brain,
  Layers,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';
import { CompanySummary } from '@/lib/services/companies';
import { toggleTargetCompanyAction } from '@/app/dashboard/companies/actions';

export interface CompanyCardData {
  id: string;
  slug: string;
  name: string;
  tier: string;
  logoUrl?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  isTarget?: boolean;
  topPattern?: string;
  problemCount?: number;
  solvedCount?: number;
  mappedProblemsCount?: number;
  solvedProblemsCount?: number;
  hasCoreCS?: boolean;
  coreCSQuizzesCount?: number;
  coreCSQuizzesPassed?: number;
  assessmentCount?: number;
  assessmentsCount?: number;
  assessmentAttempted?: boolean;
  assessmentsPassed?: number;
  hasAssessments?: boolean;
  coveragePct?: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  preparationStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED';
}

export interface CompanyCardProps {
  company: CompanySummary | CompanyCardData;
  onTargetToggle?: (slug: string, newTarget: boolean) => void;
  isSelected?: boolean;
  onSelect?: (slug: string) => void;
}

export function CompanyCard({
  company,
  onTargetToggle,
  isSelected,
  onSelect,
}: CompanyCardProps) {
  const [isTarget, setIsTarget] = useState(Boolean(company.isTarget));
  const [isPending, startTransition] = useTransition();

  const mappedProblems =
    company.mappedProblemsCount ?? (company as CompanyCardData).problemCount ?? 0;
  const solvedProblems =
    company.solvedProblemsCount ?? (company as CompanyCardData).solvedCount ?? 0;
  const totalAssessments =
    company.assessmentsCount ?? (company as CompanyCardData).assessmentCount ?? 0;
  const passedAssessments = company.assessmentsPassed ?? 0;
  const hasCoreCS = Boolean(company.hasCoreCS);
  const coreCSQuizzesPassed = company.coreCSQuizzesPassed ?? 0;
  const coreCSQuizzesCount = company.coreCSQuizzesCount ?? 0;

  const coveragePct =
    company.coveragePct !== undefined
      ? company.coveragePct
      : mappedProblems > 0
      ? Math.round((solvedProblems / mappedProblems) * 100)
      : 0;

  const status =
    company.preparationStatus ??
    ((company as CompanyCardData).status === 'COMPLETED'
      ? 'COVERED'
      : (company as CompanyCardData).status === 'IN_PROGRESS'
      ? 'IN_PROGRESS'
      : 'NOT_STARTED');

  const handleToggleTarget = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isTarget;
    setIsTarget(nextState);
    if (onTargetToggle) {
      onTargetToggle(company.slug, nextState);
    }

    startTransition(async () => {
      const res = await toggleTargetCompanyAction(company.slug, nextState);
      if (!res.success) {
        setIsTarget(!nextState);
        if (onTargetToggle) {
          onTargetToggle(company.slug, !nextState);
        }
      }
    });
  };

  const getStatusBadge = () => {
    if (status === 'COVERED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Covered</span>
        </span>
      );
    }
    if (status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        <Circle className="w-2.5 h-2.5 text-slate-400" />
        <span>Not Started</span>
      </span>
    );
  };

  return (
    <div
      onClick={onSelect ? () => onSelect(company.slug) : undefined}
      className={`group rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
        isSelected
          ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-subtle'
      }`}
    >
      <div>
        {/* Top Bar: Company Name, Tier, and Target Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {company.tier}
              </span>
              {getStatusBadge()}
            </div>

            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors truncate">
              {company.name}
            </h3>
          </div>

          {/* Interactive Target Star Button */}
          <button
            type="button"
            onClick={handleToggleTarget}
            disabled={isPending}
            title={isTarget ? 'Remove from Target Companies' : 'Mark as Target Company'}
            aria-label={
              isTarget
                ? `Remove ${company.name} from targets`
                : `Mark ${company.name} as target`
            }
            className={`p-2 rounded-xl transition-all shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isTarget
                ? 'bg-amber-50 text-amber-600 border border-amber-300 hover:bg-amber-100'
                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Star
              className={`w-4 h-4 transition-transform ${
                isTarget ? 'fill-amber-500 text-amber-500 scale-105' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Primary Verified Pattern */}
        {company.topPattern && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
            <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">Top Pattern:</span>
            <span className="truncate text-slate-600">{company.topPattern}</span>
          </div>
        )}

        {/* Grid of Available Capabilities */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {/* DSA Problems */}
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
              <Code2 className="w-3 h-3 text-blue-600" />
              <span>DSA Solved</span>
            </div>
            <div className="mt-1 font-mono font-bold text-slate-900 text-xs">
              {solvedProblems} / {mappedProblems}
            </div>
          </div>

          {/* OA Simulations */}
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
              <Target className="w-3 h-3 text-indigo-600" />
              <span>OA Simulations</span>
            </div>
            <div className="mt-1 font-mono font-bold text-slate-900 text-xs">
              {totalAssessments > 0 ? (
                <span>
                  {passedAssessments}/{totalAssessments} Passed
                </span>
              ) : (
                <span className="text-slate-400 font-sans font-normal">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Core CS Indicator where supported */}
        {hasCoreCS && (
          <div className="mt-2 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-indigo-50/40 border border-indigo-100/70 text-indigo-900">
            <span className="flex items-center gap-1 font-medium">
              <Brain className="w-3 h-3 text-indigo-600" />
              <span>Core CS Screening:</span>
            </span>
            <span className="font-mono font-bold text-indigo-800">
              {coreCSQuizzesPassed}/{coreCSQuizzesCount} Diagnostics
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Transparent Coverage & Open Company CTA */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
        {/* Coverage Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Preparation Coverage</span>
            <span className="font-mono font-bold text-slate-800">{coveragePct}%</span>
          </div>
          <ProgressBar value={coveragePct} size="sm" color="blue" />
        </div>

        {/* Action Link */}
        <Link
          href={`/dashboard/companies/${company.slug}`}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 group/btn shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>Open Company</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
