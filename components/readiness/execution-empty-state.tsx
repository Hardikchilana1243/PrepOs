'use client';

// ============================================================================
// PREPOS EXECUTION EMPTY STATE (PHASE 6.15)
// Honest, Deterministic Empty & Low-Workload Representations
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Inbox, ArrowRight, Sparkles, Filter } from 'lucide-react';

interface ExecutionEmptyStateProps {
  type: 'NO_TASKS' | 'NO_COMPLETED_YET' | 'ALL_TASKS_COMPLETED';
}

export function ExecutionEmptyState({ type }: ExecutionEmptyStateProps) {
  if (type === 'ALL_TASKS_COMPLETED') {
    return (
      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-8 text-center my-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">
          Zero Active Tasks Remaining
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          All planned tasks for today have been completed or marked done. Great execution consistency!
        </p>
        <Link
          href="/dashboard/interview"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
        >
          <span>Explore Interview Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (type === 'NO_COMPLETED_YET') {
    return (
      <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-8 text-center my-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Filter className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">
          No Tasks Completed Yet Today
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Switch to the "Active" tab and select a task to begin your daily placement preparation session.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-8 text-center my-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-900 mb-1">
        No Pending Tasks In Execution Queue
      </h4>
      <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
        There are currently no overdue revisions or critical deficits detected in your profile. You can explore full DSA tracks or take a diagnostic quiz to generate new execution goals.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/dashboard/dsa"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs"
        >
          <span>Solve DSA Problems</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/dashboard/core-cs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
        >
          <span>Take Core CS Diagnostic</span>
        </Link>
      </div>
    </div>
  );
}
