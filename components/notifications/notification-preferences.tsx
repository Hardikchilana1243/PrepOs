'use client';

// ============================================================================
// NOTIFICATION PREFERENCE CENTER (PHASE 6.16)
// Student-Controlled Configuration Panel for Placement Reminders
// Pure Factual Explanations - Zero Manipulative Language - Server Synchronized
// ============================================================================

import React, { useState, useTransition } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  Globe,
  Moon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  NotificationPreferences as NotificationPreferencesType,
  UpdatePreferencesInput,
} from '@/lib/services/notification-preferences';
import { NotificationHistoryItem } from '@/lib/services/notification-engine';
import {
  updateNotificationPreferencesAction,
  resetNotificationPreferencesAction,
} from '@/app/dashboard/readiness/actions';
import { getDetectedClientTimezone } from '@/lib/services/browser-notification';

import { NotificationToggleRow } from './notification-toggle-row';
import { NotificationTimeSelector } from './notification-time-selector';
import { NotificationDaySelector } from './notification-day-selector';
import { NotificationStatus } from './notification-status';
import { NotificationHistory } from './notification-history';

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesType;
  history?: NotificationHistoryItem[];
  onSaved?: (updated: NotificationPreferencesType) => void;
}

const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export function NotificationPreferences({
  preferences: initialPrefs,
  history = [],
  onSaved,
}: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<NotificationPreferencesType>(initialPrefs);
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const input: UpdatePreferencesInput = {
          dailyExecutionEnabled: prefs.dailyExecutionEnabled,
          revisionDueEnabled: prefs.revisionDueEnabled,
          revisionOverdueEnabled: prefs.revisionOverdueEnabled,
          incompleteDailyEnabled: prefs.incompleteDailyEnabled,
          preferredTime: prefs.preferredTime,
          timezone: prefs.timezone,
          preferredWeekdays: prefs.preferredWeekdays,
          maxRemindersPerDay: prefs.maxRemindersPerDay,
          quietHoursEnabled: prefs.quietHoursEnabled,
          quietHoursStart: prefs.quietHoursStart,
          quietHoursEnd: prefs.quietHoursEnd,
        };

        const res = await updateNotificationPreferencesAction(input);
        if (res.success && res.preferences) {
          setPrefs(res.preferences);
          setSuccessMessage('Reminder preferences saved successfully.');
          onSaved?.(res.preferences);
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to save notification preferences.');
      }
    });
  };

  const handleReset = () => {
    if (!confirm('Reset all placement reminder preferences to standard defaults?')) {
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await resetNotificationPreferencesAction();
        if (res.success && res.preferences) {
          setPrefs(res.preferences);
          setSuccessMessage('Preferences restored to default settings.');
          onSaved?.(res.preferences);
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to reset preferences.');
      }
    });
  };

  const handleDetectTimezone = () => {
    const detected = getDetectedClientTimezone();
    if (detected) {
      setPrefs((prev) => ({ ...prev, timezone: detected }));
    }
  };

  return (
    <div id="notification-preferences" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Placement Reminder Preferences
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure how and when PrepOS alerts you about pending placement preparation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleReset}
            className="min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isPending ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Browser Notification Status Banner */}
      <NotificationStatus />

      {/* Reminder Types Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Reminder Signals
        </h3>

        <div className="space-y-2">
          <NotificationToggleRow
            id="toggle-daily-exec"
            label="Daily Execution Reminder"
            description="Receive a reminder when today's placement tasks remain incomplete."
            checked={prefs.dailyExecutionEnabled}
            onChange={(checked) =>
              setPrefs((prev) => ({ ...prev, dailyExecutionEnabled: checked }))
            }
            badge="Phase 6.15"
          />

          <NotificationToggleRow
            id="toggle-rev-due"
            label="Revision Due Reminder"
            description="Receive a reminder when SM-2 spaced repetition items are scheduled for review."
            checked={prefs.revisionDueEnabled}
            onChange={(checked) =>
              setPrefs((prev) => ({ ...prev, revisionDueEnabled: checked }))
            }
            badge="SM-2"
          />

          <NotificationToggleRow
            id="toggle-rev-overdue"
            label="Overdue Revision Reminder"
            description="Receive an alert when revision items remain overdue beyond their scheduled date."
            checked={prefs.revisionOverdueEnabled}
            onChange={(checked) =>
              setPrefs((prev) => ({ ...prev, revisionOverdueEnabled: checked }))
            }
            badge="High Priority"
          />

          <NotificationToggleRow
            id="toggle-incomplete-daily"
            label="Incomplete Daily Execution Follow-Up"
            description="Receive a follow-up check later in the day if your planned preparation tasks remain unfinished."
            checked={prefs.incompleteDailyEnabled}
            onChange={(checked) =>
              setPrefs((prev) => ({ ...prev, incompleteDailyEnabled: checked }))
            }
          />
        </div>
      </div>

      {/* Schedule & Timing Configuration */}
      <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Delivery Schedule & Timezone
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <NotificationTimeSelector
              value={prefs.preferredTime}
              onChange={(time) => setPrefs((prev) => ({ ...prev, preferredTime: time }))}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Max reminders per day:
              </span>
              <select
                value={prefs.maxRemindersPerDay}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    maxRemindersPerDay: parseInt(e.target.value, 10),
                  }))
                }
                aria-label="Maximum reminders per day"
                className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 min-h-[44px]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} reminder{n === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timezone Selector */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium">Selected Timezone:</span>
              </div>
              <button
                type="button"
                onClick={handleDetectTimezone}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline min-h-[36px] flex items-center"
              >
                Detect Browser
              </button>
            </div>

            <select
              value={prefs.timezone}
              onChange={(e) => setPrefs((prev) => ({ ...prev, timezone: e.target.value }))}
              aria-label="Select timezone"
              className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 min-h-[44px]"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
              {!COMMON_TIMEZONES.includes(prefs.timezone) && (
                <option value={prefs.timezone}>{prefs.timezone}</option>
              )}
            </select>
          </div>
        </div>

        {/* Days of Week */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <NotificationDaySelector
            selectedDays={prefs.preferredWeekdays}
            onChange={(days) => setPrefs((prev) => ({ ...prev, preferredWeekdays: days }))}
          />
        </div>
      </div>

      {/* Quiet Hours Configuration */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quiet Hours
        </h3>

        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Mute Notifications During Quiet Hours
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Suppress reminders during your selected rest period.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={prefs.quietHoursEnabled}
              aria-label="Toggle quiet hours"
              onClick={() =>
                setPrefs((prev) => ({
                  ...prev,
                  quietHoursEnabled: !prev.quietHoursEnabled,
                  quietHoursStart: prev.quietHoursStart || '22:00',
                  quietHoursEnd: prev.quietHoursEnd || '08:00',
                }))
              }
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 min-h-[44px] min-w-[44px] items-center justify-center ${
                prefs.quietHoursEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  prefs.quietHoursEnabled ? 'translate-x-2.5' : '-translate-x-2.5'
                }`}
              />
            </button>
          </div>

          {prefs.quietHoursEnabled && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">From:</span>
                <input
                  type="time"
                  value={prefs.quietHoursStart || '22:00'}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                  }
                  aria-label="Quiet hours start"
                  className="text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">To:</span>
                <input
                  type="time"
                  value={prefs.quietHoursEnd || '08:00'}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                  }
                  aria-label="Quiet hours end"
                  className="text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 min-h-[44px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Audit History */}
      <NotificationHistory history={history} />
    </div>
  );
}
