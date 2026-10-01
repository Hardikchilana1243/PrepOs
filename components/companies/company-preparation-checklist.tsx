import React from 'react';
import Link from 'next/link';
import {
  ListChecks,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  Code2,
  Brain,
  Target,
  RotateCw,
} from 'lucide-react';
import { PreparationChecklistItem } from '@/lib/services/companies';

interface CompanyPreparationChecklistProps {
  companyName: string;
  checklist: PreparationChecklistItem[];
}

export function CompanyPreparationChecklist({
  companyName,
  checklist,
}: CompanyPreparationChecklistProps) {
  const completedCount = checklist.filter((item) => item.status === 'COMPLETED').length;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Preparation Action Plan — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic milestone checklist derived directly from active curriculum database records
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
          {completedCount} / {checklist.length} Milestones Met
        </span>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.map((item, idx) => {
          let StatusIcon = Circle;
          let statusBadge = (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              To Do
            </span>
          );

          if (item.status === 'COMPLETED') {
            StatusIcon = CheckCircle2;
            statusBadge = (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Completed
              </span>
            );
          } else if (item.status === 'IN_PROGRESS') {
            StatusIcon = Clock;
            statusBadge = (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                In Progress
              </span>
            );
          }

          let CategoryIcon = Code2;
          if (item.category === 'CORE_CS') CategoryIcon = Brain;
          if (item.category === 'ASSESSMENT') CategoryIcon = Target;
          if (item.category === 'REVISION') CategoryIcon = RotateCw;

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="mt-0.5 sm:mt-0 shrink-0">
                  <StatusIcon
                    className={`w-5 h-5 ${
                      item.status === 'COMPLETED'
                        ? 'text-emerald-600'
                        : item.status === 'IN_PROGRESS'
                        ? 'text-blue-600'
                        : 'text-slate-300'
                    }`}
                  />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      0{idx + 1}.
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {item.title}
                    </h3>
                    {statusBadge}
                    {item.badge && (
                      <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 flex justify-end">
                <Link
                  href={item.ctaHref}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-blue-600 hover:text-blue-700 shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>{item.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
