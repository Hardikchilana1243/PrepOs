'use client';

// ============================================================================
// NOTIFICATION ROW (PHASE 6.16)
// Accessible, Scan-Friendly Notification Row with Factual Details & Direct Actions
// ============================================================================

import React, { useTransition } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Clock,
  CalendarDays,
  Target,
  Cpu,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { PlacementNotificationItem } from '@/lib/services/notifications';
import {
  markNotificationReadAction,
  dismissNotificationAction,
} from '@/app/dashboard/notifications/actions';

interface NotificationRowProps {
  notification: PlacementNotificationItem;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotificationRow({
  notification,
  onRead,
  onDismiss,
}: NotificationRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = () => {
    startTransition(async () => {
      try {
        await markNotificationReadAction(notification.id);
        onRead?.(notification.id);
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    });
  };

  const handleDismiss = () => {
    startTransition(async () => {
      try {
        await dismissNotificationAction(notification.id);
        onDismiss?.(notification.id);
      } catch (err) {
        console.error('Failed to dismiss:', err);
      }
    });
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'OVERDUE':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: AlertTriangle,
        };
      case 'DUE_TODAY':
      case 'REVISION':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
        };
      case 'DAILY_EXECUTION':
        return {
          pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: CalendarDays,
        };
      case 'ASSESSMENT':
        return {
          pill: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Target,
        };
      case 'CORE_CS':
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Cpu,
        };
      case 'COMPANY':
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Building2,
        };
      case 'READINESS':
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: ShieldAlert,
        };
    }
  };

  const config = getCategoryConfig(notification.category);
  const CategoryIcon = config.icon;
  const isUnread = notification.status === 'UNREAD';

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
        isUnread
          ? 'bg-white border-blue-200 shadow-2xs'
          : 'bg-slate-50/70 border-slate-200/80 opacity-85'
      } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Left content */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-1 flex-shrink-0">
          {isUnread ? (
            <span
              className="block w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100"
              title="Unread"
              aria-label="Unread notification"
            />
          ) : (
            <span
              className="block w-2 h-2 rounded-full bg-slate-300"
              title="Read"
              aria-label="Read notification"
            />
          )}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${config.pill}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{notification.categoryLabel}</span>
            </span>

            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {notification.title}
            </h3>

            {notification.urgency === 'URGENT' && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                Urgent
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {notification.description}
          </p>

          <p className="text-[11px] text-slate-400">
            Eligibility reason: {notification.eligibilityReason}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
        {isUnread && (
          <button
            type="button"
            onClick={handleMarkRead}
            title="Mark as read"
            aria-label="Mark notification as read"
            className="min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mark Read</span>
          </button>
        )}

        <Link
          href={notification.deepLinkUrl}
          onClick={isUnread ? handleMarkRead : undefined}
          className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>{notification.actionLabel}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss notification"
          aria-label="Dismiss notification"
          className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
