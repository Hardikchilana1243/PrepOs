import React from 'react';
import Link from 'next/link';
import { Target, CheckCircle2, Clock, Code2, Brain, ArrowRight, ShieldCheck } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface PreparationOverviewProps {
  companyName: string;
  tier: string;
  totalModules: number;
  completedItems: number;
  totalItems: number;
  progressPct: number;
  nextAction: {
    title: string;
    type: 'DSA' | 'ASSESSMENT' | 'CORE_CS';
    href: string;
    label: string;
  };
}

export function CompanyPreparationOverview({
  companyName,
  tier,
  totalModules,
  completedItems,
  totalItems,
  progressPct,
  nextAction,
}: PreparationOverviewProps) {
  return (
    <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Preparation Overview
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            {companyName} Target Readiness
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-slate-900">{progressPct}%</div>
            <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">Completed</div>
          </div>
          <div className="w-24">
            <ProgressBar value={progressPct} size="sm" color="blue" />
          </div>
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Curriculum Modules</div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">{totalModules} Active</div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Completed Drills</div>
          <div className="font-bold text-emerald-600 text-sm mt-0.5 font-mono">
            {completedItems} / {totalItems}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Remaining Items</div>
          <div className="font-bold text-slate-700 text-sm mt-0.5 font-mono">
            {Math.max(0, totalItems - completedItems)}
          </div>
        </div>
      </div>

      {/* Direct Next Action CTA */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Target className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-blue-900">Recommended Next Step: </span>
            <span className="text-blue-800">{nextAction.title}</span>
          </div>
        </div>

        <Link
          href={nextAction.href}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <span>{nextAction.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
