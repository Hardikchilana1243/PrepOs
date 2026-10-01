'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT COMPANY PREPARATION SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Building2, Layers } from 'lucide-react';

interface ReportCompanyProps {
  company: PlacementReadinessReport['companyPrepReport'];
}

export function ReportCompany({ company }: ReportCompanyProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>Section 4: Target Company Preparation Alignment</span>
        </h3>
        <span className="text-xs font-mono font-bold text-slate-800">
          Score: {company.score} / 100
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Target Recruiter</span>
          <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
            {company.targetCompanyName || 'Not Selected'}
          </div>
          <span className="text-[10px] text-slate-500">Tier: {company.targetRoleTier}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Interview Patterns</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {company.patternsCovered} <span className="text-xs font-normal text-slate-400">/ {company.totalPatterns}</span>
          </div>
          <span className="text-[10px] text-slate-500">Verified archetypes</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Target Problems Solved</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {company.companyProblemsSolved} <span className="text-xs font-normal text-slate-400">/ {company.totalCompanyProblems}</span>
          </div>
          <span className="text-[10px] text-slate-500">Company-specific curriculum</span>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Company Readiness Highlights
        </span>
        <ul className="space-y-1 text-xs text-slate-600">
          {company.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
