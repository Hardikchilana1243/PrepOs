'use client';

// ============================================================================
// PREPOS PLACEMENT TARGET TIMELINE COMPONENT
// Target company coverage, interview pattern completion & assessment tracking
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowRight,
  Code2,
  BookOpen,
  Clock,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { FinalReadinessExecutionData } from '@/lib/services/readiness-execution';

interface PlacementTargetsProps {
  placementTargets: FinalReadinessExecutionData['placementTargets'];
}

export function PlacementTargets({ placementTargets }: PlacementTargetsProps) {
  const { targets, hasTargetCompanies, summary } = placementTargets;

  return (
    <section id="targets" aria-labelledby="targets-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 id="targets-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Placement Target Timeline & Company Coverage
            </h2>
            <p className="text-xs text-slate-500">
              Pattern coverage and assessment alignment across your target recruiting firms
            </p>
          </div>
        </div>

        {hasTargetCompanies && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 self-start sm:self-auto">
            <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">
              {summary.totalTargetCount} Target Firms
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              Avg Coverage: {summary.averageCoveragePct}%
            </span>
          </div>
        )}
      </div>

      {!hasTargetCompanies ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No Target Companies Configured
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select target placement companies from our catalog of 10 major hiring firms (Amazon, Google, Microsoft, Flipkart, etc.) to track your tailored algorithmic pattern coverage.
            </p>
          </div>
          <div>
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Browse Company Hubs</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((company) => (
            <div
              key={company.companySlug}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900">
                        {company.companyName}
                      </h3>
                      {company.isPrimaryTarget && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {company.tier}
                    </span>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    {company.coveragePct}% Covered
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, company.coveragePct))}%` }}
                  />
                </div>

                {/* 3 Pillar Summary Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">DSA</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {company.solvedProblems}/{company.totalProblems}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Core CS</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {company.quizzesPassed}/{company.totalQuizzes}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Mock OA</span>
                    <span className={`font-bold text-xs ${company.assessmentCleared ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {company.assessmentCleared ? 'Cleared' : company.hasAssessment ? 'Ready' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={company.workspaceUrl}
                  className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors min-h-[44px]"
                >
                  <span>Open Target Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
