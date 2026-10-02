'use client';

// ============================================================================
// NOTIFICATION DAY SELECTOR (PHASE 6.16)
// Multi-Select Day Pills for Configured Placement Preparation Windows
// ============================================================================

import React from 'react';
import { CalendarDays } from 'lucide-react';

interface NotificationDaySelectorProps {
  selectedDays: number[]; // 1 = Mon ... 7 = Sun
  onChange: (days: number[]) => void;
  disabled?: boolean;
}

const DAYS = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
  { id: 7, label: 'Sun', full: 'Sunday' },
];

export function NotificationDaySelector({
  selectedDays,
  onChange,
  disabled = false,
}: NotificationDaySelectorProps) {
  const toggleDay = (dayId: number) => {
    if (disabled) return;
    if (selectedDays.includes(dayId)) {
      // Keep at least one day selected
      if (selectedDays.length > 1) {
        onChange(selectedDays.filter((d) => d !== dayId));
      }
    } else {
      onChange([...selectedDays, dayId].sort((a, b) => a - b));
    }
  };

  const setAllDays = () => !disabled && onChange([1, 2, 3, 4, 5, 6, 7]);
  const setWeekdays = () => !disabled && onChange([1, 2, 3, 4, 5]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium">Active Reminder Days:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={setAllDays}
            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline min-h-[36px] px-2 flex items-center"
          >
            All Days
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            type="button"
            disabled={disabled}
            onClick={setWeekdays}
            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline min-h-[36px] px-2 flex items-center"
          >
            Mon–Fri
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleDay(day.id)}
              aria-label={`Toggle ${day.full}`}
              aria-pressed={isSelected}
              className={`min-h-[44px] rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{day.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
