'use client';

// ============================================================================
// NOTIFICATION TIME SELECTOR (PHASE 6.16)
// 24-Hour Time Format Selector with Common Intervals & Custom Input
// ============================================================================

import React from 'react';
import { Clock } from 'lucide-react';

interface NotificationTimeSelectorProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  disabled?: boolean;
}

const COMMON_TIMES = [
  { label: '07:00 AM (Early Morning)', value: '07:00' },
  { label: '08:00 AM (Morning)', value: '08:00' },
  { label: '09:00 AM (Standard Start)', value: '09:00' },
  { label: '10:00 AM (Mid Morning)', value: '10:00' },
  { label: '13:00 PM (Afternoon)', value: '13:00' },
  { label: '17:00 PM (Late Afternoon)', value: '17:00' },
  { label: '19:00 PM (Evening)', value: '19:00' },
  { label: '21:00 PM (Night Review)', value: '21:00' },
];

export function NotificationTimeSelector({
  value,
  onChange,
  disabled = false,
}: NotificationTimeSelectorProps) {
  const isCommon = COMMON_TIMES.some((t) => t.value === value);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-medium">Daily Preferred Time:</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={isCommon ? value : 'custom'}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value !== 'custom') {
              onChange(e.target.value);
            }
          }}
          aria-label="Select preferred reminder time"
          className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
        >
          {COMMON_TIMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
          {!isCommon && <option value="custom">Custom ({value})</option>}
        </select>

        <input
          type="time"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          aria-label="Custom time input"
          className="text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
        />
      </div>
    </div>
  );
}
