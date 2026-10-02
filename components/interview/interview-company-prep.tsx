import React from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { CompanyInterviewPrepItem } from '@/lib/services/interview';

interface InterviewCompanyPrepProps {
  companies: CompanyInterviewPrepItem[];
}

export function InterviewCompanyPrep({ companies }: InterviewCompanyPrepProps) {
  const targetCompanies = companies.filter((c) => c.isTarget);
  const displayCompanies = targetCompanies.length > 0 ? targetCompanies : companies.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Target Company Interview Tracks</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified interview coding patterns, technical screening requirements, and timed OA simulations.
          </p>
        </div>

        <Link
          href="/dashboard/companies"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          <span>All Company Hubs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayCompanies.map((comp) => (
          <div
            key={comp.companyId}
            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors ${
              comp.isTarget ? 'border-purple-200 ring-2 ring-purple-500/10' : 'border-slate-200/90'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">{comp.name}</h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full inline-block">
                    {comp.tier}
                  </span>
                </div>

                {comp.isTarget && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Target</span>
                  </span>
                )}
              </div>

              {/* Verified Patterns */}
              {comp.patterns.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Pattern
                  </span>
                  <div className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2">
                    {comp.patterns[0]}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Coverage</span>
                  <span className="text-slate-900 font-bold">
                    {comp.solvedProblemsCount} / {comp.mappedProblemsCount} ({comp.coveragePct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      comp.coveragePct >= 70
                        ? 'bg-emerald-500'
                        : comp.coveragePct >= 30
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, comp.coveragePct)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                href={comp.hubUrl}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Open Company Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
