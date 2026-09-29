import React from 'react';
import { Building2, Target, CheckCircle2, Layers, Award } from 'lucide-react';

interface CompanyHubHeaderProps {
  totalCompanies: number;
  totalAssessments: number;
  totalCompanyProblems: number;
  completedCompanies: number;
  inProgressCompanies: number;
}

export function CompanyHubHeader({
  totalCompanies,
  totalAssessments,
  totalCompanyProblems,
  completedCompanies,
  inProgressCompanies,
}: CompanyHubHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="space-y-2 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            Verified Placement Hubs
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">• Tier 1 & Product Tracks</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Company Preparation Hubs
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Master company-specific interview patterns, solve tagged algorithmic problems, and calibrate
          against full-length Online Assessment simulations verified from campus recruitment cycles.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
          <div className="text-xl font-bold text-slate-900">{totalCompanies}</div>
          <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
            Companies
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
          <div className="text-xl font-bold text-blue-600">{totalCompanyProblems}</div>
          <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
            Tagged DSA
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
          <div className="text-xl font-bold text-indigo-600">{totalAssessments}</div>
          <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
            OA Mocks
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
          <div className="text-xl font-bold text-emerald-600">{completedCompanies}</div>
          <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
            Prepared
          </div>
        </div>
      </div>
    </div>
  );
}
