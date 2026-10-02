'use client';

// ============================================================================
// PREPOS UPCOMING EXECUTION WORKLOAD (PHASE 6.15)
// Deterministic Scheduled & Pending Workload Preview
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { CalendarClock, ArrowRight, Clock, Calendar, CheckSquare } from 'lucide-react';
import { UpcomingExecutionItem } from '@/lib/services/daily-execution';

interface ExecutionUpcomingProps {
  upcoming: UpcomingExecutionItem[];
}

export function ExecutionUpcoming({ upcoming }: ExecutionUpcomingProps) {
  if (upcoming.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              Upcoming Execution Workload
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Deterministic upcoming spaced revisions and pending target milestones.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {upcoming.length} Item{upcoming.length === 1 ? '' : 's'} Ahead
        </span>
      </div>

      {/* Grid of upcoming items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcoming.map((item) => {
          const isScheduled = item.state === 'SCHEDULED';

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>

                  {/* Explicit Scheduled vs Pending Pill */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                      isScheduled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.state}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {item.reason}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                <div className="flex items-center gap-2 text-2xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.dateLabel}</span>
                  <span className="text-slate-300">•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{item.estimatedMinutes}m</span>
                </div>

                <Link
                  href={item.deepLinkUrl}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <span>Preview</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
