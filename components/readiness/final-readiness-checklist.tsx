'use client';

// ============================================================================
// PREPOS FINAL READINESS CHECKLIST COMPONENT
// Verifiable readiness conditions backed strictly by authenticated database state
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FinalReadinessExecutionData, ReadinessChecklistItem } from '@/lib/services/readiness-execution';

interface FinalReadinessChecklistProps {
  finalChecklist: FinalReadinessExecutionData['finalChecklist'];
}

export function FinalReadinessChecklist({ finalChecklist }: FinalReadinessChecklistProps) {
  const { items, completedCount, totalCount, readinessStatus } = finalChecklist;

  const getStatusBadge = (status: ReadinessChecklistItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Completed',
        };
      case 'IN_PROGRESS':
        return {
          icon: Clock,
          color: 'text-amber-600',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'In Progress',
        };
      case 'REMAINING':
      default:
        return {
          icon: Circle,
          color: 'text-slate-400',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Remaining',
        };
    }
  };

  const getReadinessClassificationBadge = () => {
    switch (readinessStatus) {
      case 'READY_FOR_PLACEMENT':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'SUBSTANTIALLY_READY':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'ACTION_REQUIRED':
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  return (
    <section id="checklist" aria-labelledby="checklist-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 id="checklist-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Final Placement Readiness Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Verifiable pre-interview conditions derived exclusively from authenticated system records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getReadinessClassificationBadge()}`}>
            {readinessStatus.replace(/_/g, ' ')}
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono">
            {completedCount} / {totalCount} Satisfied
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
        {items.map((item) => {
          const cfg = getStatusBadge(item.status);
          const Icon = cfg.icon;

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-start gap-3.5 max-w-2xl">
                <Icon className={`w-5 h-5 ${cfg.color} shrink-0 mt-0.5`} />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {item.description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 inline-block">
                    Verified Evidence: {item.evidence}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center pt-2 md:pt-0">
                <Link
                  href={item.ctaUrl}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors min-h-[44px]"
                >
                  <span>{item.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
