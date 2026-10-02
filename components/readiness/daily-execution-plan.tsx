'use client';

// ============================================================================
// PREPOS TODAY'S EXECUTION PLAN COMPONENT
// Daily actionable checklist generated entirely from pending database work
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import { FinalReadinessExecutionData, DailyExecutionTask } from '@/lib/services/readiness-execution';

interface DailyExecutionPlanProps {
  plan: FinalReadinessExecutionData['dailyExecutionPlan'];
}

export function DailyExecutionPlan({ plan }: DailyExecutionPlanProps) {
  const { date, items, totalPendingTasks } = plan;

  const totalMinutes = items.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  const getUrgencyBadge = (urgency: DailyExecutionTask['urgency']) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NORMAL':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <section id="daily-plan" aria-labelledby="plan-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 id="plan-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Today&apos;s Execution Plan
            </h2>
            <p className="text-xs text-slate-500">
              Personalized daily study tasks derived strictly from real pending database records for {date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{totalMinutes} mins total</span>
          </span>
          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold">
            {totalPendingTasks} Pending
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-emerald-950">
            Today&apos;s Immediate Queue is Clear
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
            No overdue items or pending daily reviews are waiting in your queue. You can continue advancing on the DSA roadmap or take an upcoming mock assessment.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {items.map((task, index) => (
            <div
              key={task.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getUrgencyBadge(
                        task.urgency
                      )}`}
                    >
                      {task.urgency}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      {task.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {task.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0">
                <span className="text-xs font-mono text-slate-400 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {task.estimatedMinutes}m
                </span>

                <Link
                  href={task.ctaUrl}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors min-h-[44px]"
                >
                  <span>{task.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
