'use client';

// ============================================================================
// REMINDER CENTER (PHASE 6.16)
// Compact In-App Notification Center Displaying Ground-Truth Placement Reminders
// Factual Counts Only - Dismiss & Deep-Link Interaction with Optimistic Updates
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { PlacementNotification } from '@/lib/services/notification-engine';
import {
  dismissReminderAction,
  markReminderOpenedAction,
} from '@/app/dashboard/readiness/actions';

interface ReminderCenterProps {
  reminders: PlacementNotification[];
  onOpenPreferences?: () => void;
}

export function ReminderCenter({ reminders: initialReminders, onOpenPreferences }: ReminderCenterProps) {
  const [reminders, setReminders] = useState<PlacementNotification[]>(initialReminders);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const handleDismiss = async (reminder: PlacementNotification) => {
    setDismissingId(reminder.id);
    // Optimistic removal
    setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
    try {
      await dismissReminderAction(reminder.id, reminder.type, reminder.dateIso);
    } catch {
      // Revert if error
      setReminders(initialReminders);
    } finally {
      setDismissingId(null);
    }
  };

  const handleOpen = async (reminder: PlacementNotification) => {
    // Optimistic mark read
    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? { ...r, isRead: true } : r))
    );
    try {
      await markReminderOpenedAction(reminder.id, reminder.type, reminder.dateIso);
    } catch {
      // Non-fatal
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'REVISION_OVERDUE':
        return {
          pill: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
          label: 'Overdue Recall',
        };
      case 'REVISION_DUE':
        return {
          pill: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          label: 'Revision Due',
        };
      case 'EXECUTION_INCOMPLETE':
        return {
          pill: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          label: 'Plan Incomplete',
        };
      case 'DAILY_EXECUTION':
      default:
        return {
          pill: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
          label: 'Daily Tasks',
        };
    }
  };

  return (
    <div id="reminders" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Placement Reminder Center
              </h3>
              {reminders.length > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  {reminders.length} Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Factual preparation alerts based on your real pending tasks
            </p>
          </div>
        </div>

        {onOpenPreferences && (
          <button
            type="button"
            onClick={onOpenPreferences}
            className="min-h-[44px] px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preferences</span>
          </button>
        )}
      </div>

      {/* Reminder List or Empty State */}
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            You&apos;re all caught up. No active placement reminders.
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Reminders are generated only when you have authentic pending daily tasks or SM-2 spaced revision items.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reminders.map((reminder) => {
            const style = getTypeStyle(reminder.type);
            const isDismissing = dismissingId === reminder.id;

            return (
              <div
                key={reminder.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border transition-all ${
                  reminder.isRead
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-80'
                    : 'border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-xs'
                } ${isDismissing ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {!reminder.isRead && (
                      <span className="block w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.pill}`}
                      >
                        {style.label}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {reminder.title}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        ({reminder.sourceCount} item{reminder.sourceCount === 1 ? '' : 's'})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {reminder.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={reminder.deepLinkUrl}
                    onClick={() => handleOpen(reminder)}
                    className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>{reminder.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDismiss(reminder)}
                    aria-label={`Dismiss ${reminder.title}`}
                    className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
