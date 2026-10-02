'use client';

// ============================================================================
// NOTIFICATION TOGGLE ROW (PHASE 6.16)
// Accessible Toggle Control with Descriptive Factual Copy & 44px+ Hit Target
// ============================================================================

import React from 'react';

interface NotificationToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
}

export function NotificationToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
}: NotificationToggleRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
      <div className="flex-1 pr-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor={id}
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer select-none"
          >
            {label}
          </label>
          {badge && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>

      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950 min-h-[44px] min-w-[44px] items-center justify-center ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : checked
            ? 'bg-indigo-600'
            : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-2.5' : '-translate-x-2.5'
          }`}
        />
      </button>
    </div>
  );
}
