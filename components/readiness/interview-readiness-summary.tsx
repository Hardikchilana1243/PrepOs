import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Target,
} from 'lucide-react';
import { InterviewReadinessSummary } from '@/lib/services/interview';

interface InterviewReadinessSummaryCardProps {
  summary: InterviewReadinessSummary;
}

export function InterviewReadinessSummaryCard({ summary }: InterviewReadinessSummaryCardProps) {
  const getStatusBadge = () => {
    switch (summary.interviewStatus) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interview Ready</span>
          </span>
        );
      case 'SUBSTANTIALLY_READY':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Substantially Prepared</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Action Required</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Interview Preparation &amp; Practice Alignment</span>
            </h3>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-500">
            Real-time synchronization with your dedicated technical interview drills, company tracks, and mistake rectifications.
          </p>
        </div>

        <Link
          href={summary.ctaUrl}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <span>Open Interview Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Practice Sessions
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary.sessionsCompleted}
          </div>
          <div className="text-[10px] text-slate-400">Audited completed</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Active Mistakes
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary.recentMistakesCount}
          </div>
          <div className="text-[10px] text-slate-400">Identified for review</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Company Coverage
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary.targetCompanyCoveragePct}%
          </div>
          <div className="text-[10px] text-slate-400">Target interview patterns</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Interview Checklist
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary.checklistCompletedCount} / {summary.checklistTotalCount}
          </div>
          <div className="text-[10px] text-slate-400">Conditions verified</div>
        </div>
      </div>
    </div>
  );
}
