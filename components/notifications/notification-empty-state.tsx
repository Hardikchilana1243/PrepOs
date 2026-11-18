'use client';

// ============================================================================
// NOTIFICATION EMPTY STATE (PHASE 6.16)
// Factual Empty States for Notification Categories & Cleared Inboxes
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, BellOff, Filter, ArrowRight } from 'lucide-react';

interface NotificationEmptyStateProps {
  type: 'ALL_CLEARED' | 'NO_UNREAD' | 'FILTER_EMPTY';
  categoryLabel?: string;
  onResetFilter?: () => void;
}

export function NotificationEmptyState({
  type,
  categoryLabel,
  onResetFilter,
}: NotificationEmptyStateProps) {
  if (type === 'NO_UNREAD') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          All Caught Up!
        </h3>
        <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
          You have reviewed all incoming placement preparation notifications. Pending daily execution tasks and scheduled spaced revision remain accessible in their respective workspaces.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/dashboard/readiness"
            className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Readiness Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View All Notifications
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'FILTER_EMPTY') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200">
        <div className="p-3 rounded-full bg-slate-100 text-slate-500 mb-3">
          <Filter className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          No {categoryLabel || 'Filtered'} Notifications
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          There are currently no active notifications under the selected category.
        </p>
        {onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="mt-4 min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>
    );
  }

  // ALL_CLEARED
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
      <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
        <BellOff className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900">
        You&apos;re all caught up. No active placement reminders.
      </h3>
      <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
        PrepOS generates reminders strictly when you have real pending daily tasks, SM-2 cards due for review, or unattempted mock assessments.
      </p>
      <div className="mt-5">
        <Link
          href="/dashboard"
          className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
