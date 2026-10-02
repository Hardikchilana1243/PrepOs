'use client';

// ============================================================================
// PREPOS EXECUTION HISTORY (PHASE 6.15)
// Chronological Audit Log of Historical Daily Execution Sessions
// ============================================================================

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Inbox,
  XCircle,
  Tag,
} from 'lucide-react';
import { ExecutionHistoryDay } from '@/lib/services/daily-execution';

interface ExecutionHistoryProps {
  history: ExecutionHistoryDay[];
}

export function ExecutionHistory({ history }: ExecutionHistoryProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  return (
    <div id="execution-history" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              Daily Execution History
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Chronological daily breakdown of planned tasks and verified activity completions.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {history.length} Day{history.length === 1 ? '' : 's'} Recorded
        </span>
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-slate-200/60 my-2">
          <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            No Historical Execution Records Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As you execute daily placement preparation tasks, each day's completion record and consistency metrics will be preserved here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((day) => {
            const isExpanded = expandedDate === day.date;
            const isPerfect = day.status === 'PERFECT';

            return (
              <div
                key={day.date}
                className={`rounded-xl border transition-all ${
                  isPerfect
                    ? 'border-emerald-200/70 bg-emerald-50/10'
                    : 'border-slate-200/70 bg-white'
                }`}
              >
                {/* Header row / Accordion toggle */}
                <button
                  onClick={() => toggleExpand(day.date)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 text-left hover:bg-slate-50/50 rounded-xl transition-colors min-h-[44px]"
                >
                  {/* Left: Date & Status */}
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{day.date}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-2xs font-bold uppercase ${
                            isPerfect
                              ? 'bg-emerald-100 text-emerald-800'
                              : day.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {day.status} ({day.completionPercentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {day.tasksCompleted} of {day.tasksPlanned} tasks completed
                        {day.tasksSkipped > 0 && ` · ${day.tasksSkipped} skipped`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Categories */}
                  <div className="flex flex-wrap items-center gap-1.5 pl-7 sm:pl-0">
                    {day.categoriesCompleted.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{cat}</span>
                      </span>
                    ))}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && day.tasks.length > 0 && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Verified Task Activity:
                    </p>
                    <div className="space-y-1.5">
                      {day.tasks.map((t) => (
                        <div
                          key={t.taskId}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-medium text-slate-800">{t.title}</span>
                          </div>
                          <span className="text-2xs text-slate-400 font-mono">
                            {t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : 'Verified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
