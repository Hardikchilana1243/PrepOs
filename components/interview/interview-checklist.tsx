import React from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { InterviewChecklistItem } from '@/lib/services/interview';

interface InterviewChecklistProps {
  checklist: InterviewChecklistItem[];
}

export function InterviewChecklist({ checklist }: InterviewChecklistProps) {
  const completedCount = checklist.filter((i) => i.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / Math.max(1, checklist.length)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span>Interview Readiness Checklist</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative, database-verified pre-interview requirements. Every item is derived strictly from real activity records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-sm font-extrabold text-slate-900">
              {completedCount} of {checklist.length} Verified
            </div>
            <div className="text-[11px] text-slate-500 font-medium">{progressPct}% Complete</div>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
            <svg className="w-12 h-12 -rotate-90 absolute">
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-slate-100"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={119.38}
                strokeDashoffset={119.38 - (119.38 * progressPct) / 100}
                className="text-emerald-500 transition-all duration-500"
              />
            </svg>
            <span className="text-xs font-black text-slate-900">{progressPct}%</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {checklist.map((item) => {
          const getStatusBadge = () => {
            switch (item.status) {
              case 'COMPLETED':
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </span>
                );
              case 'IN_PROGRESS':
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full shrink-0">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>In Progress</span>
                  </span>
                );
              case 'REMAINING':
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                    <Circle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Remaining</span>
                  </span>
                );
              default:
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Not Available</span>
                  </span>
                );
            }
          };

          return (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                  {getStatusBadge()}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                  Evidence: <span className="font-semibold text-slate-700">{item.evidence}</span>
                </div>
              </div>

              <Link
                href={item.ctaUrl}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors"
              >
                <span>{item.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
