'use client';

// ============================================================================
// NOTIFICATION HEADER (PHASE 6.16)
// Masthead with Clear Breadcrumbs, Unread Counts, and Global Actions
// ============================================================================

import React, { useTransition } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Sliders, ChevronRight } from 'lucide-react';
import { markAllNotificationsReadAction } from '@/app/dashboard/notifications/actions';

interface NotificationHeaderProps {
  unreadCount: number;
  totalCount: number;
  onMarkAllRead?: () => void;
  onOpenPreferences?: () => void;
}

export function NotificationHeader({
  unreadCount,
  totalCount,
  onMarkAllRead,
  onOpenPreferences,
}: NotificationHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllNotificationsReadAction();
        onMarkAllRead?.();
      } catch (err) {
        console.error('Failed to mark all as read:', err);
      }
    });
  };

  return (
    <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      {/* Breadcrumb Hierarchy */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">
          Notifications &amp; Reminders
        </span>
      </nav>

      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Placement Reminder Center
            </h1>
            {unreadCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {unreadCount} Unread
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                All Caught Up
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Deterministic reminders generated strictly from your authentic SM-2 revision queue, daily execution plan, mock assessment drills, and placement benchmarks.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleMarkAllRead}
              className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>{isPending ? 'Updating...' : 'Mark All Read'}</span>
            </button>
          )}

          {onOpenPreferences && (
            <button
              type="button"
              onClick={onOpenPreferences}
              className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Preferences</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
