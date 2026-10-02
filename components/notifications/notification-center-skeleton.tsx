'use client';

// ============================================================================
// NOTIFICATION SKELETON (PHASE 6.16)
// Geometry-Matched Loading State for Reminder Center & Preferences
// ============================================================================

import React from 'react';

export function NotificationCenterSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5">
            <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-48 h-3 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
        <div className="w-20 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="space-y-2.5">
        <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800/40" />
        <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800/40" />
      </div>
    </div>
  );
}

export function NotificationPreferencesSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="w-44 h-5 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-64 h-3.5 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="w-28 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="space-y-3">
        <div className="w-32 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800/50" />
        <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800/50" />
        <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800/50" />
      </div>
    </div>
  );
}
