'use client';

// ============================================================================
// NOTIFICATION AUDIT HISTORY (PHASE 6.16)
// Chronological Audit Log of Notification Events & Student Preferences
// ============================================================================

import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Bell, Check, X, Sliders } from 'lucide-react';
import { NotificationHistoryItem } from '@/lib/services/notification-engine';

interface NotificationHistoryProps {
  history: NotificationHistoryItem[];
}

export function NotificationHistory({ history }: NotificationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'NOTIFICATION_PREFERENCE_UPDATED':
        return <Sliders className="w-3.5 h-3.5 text-indigo-500" />;
      case 'REMINDER_ELIGIBLE':
        return <Bell className="w-3.5 h-3.5 text-blue-500" />;
      case 'REMINDER_DISMISSED':
        return <X className="w-3.5 h-3.5 text-slate-400" />;
      case 'REMINDER_OPENED':
        return <Check className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[44px]"
      >
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Notification Audit Trail
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {history.length} event{history.length === 1 ? '' : 's'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
              No reminder activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {history.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getEventIcon(item.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {item.dateLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
