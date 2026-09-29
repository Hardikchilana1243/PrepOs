import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Code2, Brain, Building2, Target, ArrowRight } from 'lucide-react';

interface RevisionEmptyStateProps {
  filterType: string;
}

export function RevisionEmptyState({ filterType }: RevisionEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-sm space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          {filterType === 'DUE_TODAY' || filterType === 'OVERDUE'
            ? 'Queue is Clear — No Items Due'
            : 'No Revision Items Match This Filter'}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your active recall queue is completely up to date. Every problem you solve on the DSA
          Roadmap is scheduled into this queue using the SuperMemo SM-2 algorithm.
        </p>
      </div>

      {/* Recommended Preparation Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
        <Link
          href="/dashboard/dsa"
          className="p-4 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/30 transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
            <span className="flex items-center gap-1.5 text-blue-600">
              <Code2 className="w-4 h-4" />
              DSA Roadmap
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-slate-500">
            Solve new patterns to populate upcoming recall intervals.
          </p>
        </Link>

        <Link
          href="/dashboard/core-cs"
          className="p-4 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Brain className="w-4 h-4" />
              Core CS Hub
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-slate-500">
            Take diagnostic drills in DBMS and Operating Systems.
          </p>
        </Link>

        <Link
          href="/dashboard/companies"
          className="p-4 rounded-xl border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/30 transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
            <span className="flex items-center gap-1.5 text-purple-600">
              <Building2 className="w-4 h-4" />
              Company Hubs
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-slate-500">
            Practice company-specific interview patterns and OA drills.
          </p>
        </Link>
      </div>
    </div>
  );
}
