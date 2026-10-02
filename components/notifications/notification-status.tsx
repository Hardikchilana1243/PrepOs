'use client';

// ============================================================================
// NOTIFICATION STATUS & PERMISSION BANNER (PHASE 6.16)
// Transparent Permission Control - Explicit Student Opt-In Only
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  browserNotificationAdapter,
  BrowserPermissionState,
} from '@/lib/services/browser-notification';

interface NotificationStatusProps {
  onPermissionChange?: (permission: BrowserPermissionState) => void;
}

export function NotificationStatus({ onPermissionChange }: NotificationStatusProps) {
  const [permission, setPermission] = useState<BrowserPermissionState>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const current = browserNotificationAdapter.getPermission();
    setPermission(current);
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const res = await browserNotificationAdapter.requestPermission();
      setPermission(res);
      onPermissionChange?.(res);
    } finally {
      setIsRequesting(false);
    }
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold">Browser Notifications Enabled</span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Eligible placement reminders can trigger native desktop or device alerts.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
          Active
        </span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2.5">
          <BellOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold">Browser Alerts Blocked</span>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              Notifications were blocked in your browser settings. In-app dashboard reminders remain active.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
          Blocked
        </span>
      </div>
    );
  }

  if (permission === 'unsupported') {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          Native browser notifications are not supported in this environment. In-dashboard reminder center is active.
        </span>
      </div>
    );
  }

  // Default state: not yet requested
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
      <div className="flex items-start gap-2.5">
        <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
            Enable Optional Browser Notifications
          </span>
          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
            Receive native desktop alerts when scheduled daily tasks or SM-2 revisions are due.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isRequesting}
        onClick={handleRequestPermission}
        className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 self-start sm:self-center"
      >
        <Bell className="w-3.5 h-3.5" />
        <span>{isRequesting ? 'Requesting...' : 'Allow Browser Alerts'}</span>
      </button>
    </div>
  );
}
