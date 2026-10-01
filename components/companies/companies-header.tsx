import React from 'react';
import { Building2, Star, Target, Code2, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface CompaniesHeaderProps {
  totalCompanies: number;
  totalTargetCount: number;
  totalProblemsCount: number;
  totalAssessmentsCount: number;
  overallCoveragePct: number;
  totalCoveredCount: number;
}

export function CompaniesHeader({
  totalCompanies,
  totalTargetCount,
  totalProblemsCount,
  totalAssessmentsCount,
  overallCoveragePct,
  totalCoveredCount,
}: CompaniesHeaderProps) {
  return (
    <header className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              Verified Recruiter Hubs
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Campus Placement Tracks & Simulations
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Company Preparation Hubs
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Target specific tech firms with deterministic preparation workspaces. Understand verified
            algorithmic patterns, track problem completion against authentic recruitment questions, and
            calibrate with timed Online Assessment simulations.
          </p>
        </div>

        {/* High-Density Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          {/* Total Companies */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-slate-900">{totalCompanies}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Firms Cataloged
            </div>
          </div>

          {/* Target Companies */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-amber-700 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
              <span>{totalTargetCount}</span>
            </div>
            <div className="text-[10px] text-amber-700 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Target Firms
            </div>
          </div>

          {/* Tagged Problems */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-blue-700">{totalProblemsCount}</div>
            <div className="text-[10px] text-blue-600 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Tagged DSA
            </div>
          </div>

          {/* Fully Covered Companies */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center font-mono">
            <div className="text-lg sm:text-xl font-bold text-emerald-700">{totalCoveredCount}</div>
            <div className="text-[10px] text-emerald-700 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Fully Covered
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Coverage Indicator */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-800">Aggregate Company Preparation Coverage:</span>
          <span className="font-mono font-bold text-slate-900">{overallCoveragePct}%</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            (Calculated across all mapped DSA problems, assessments, and diagnostic quizzes)
          </span>
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <ProgressBar value={overallCoveragePct} size="sm" color="blue" />
        </div>
      </div>
    </header>
  );
}
