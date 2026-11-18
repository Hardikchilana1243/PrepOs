'use client';

// ============================================================================
// NOTIFICATION GROUP (PHASE 6.16)
// Chronological & Urgency Grouping Wrapper
// ============================================================================

import React from 'react';
import { PlacementNotificationItem } from '@/lib/services/notifications';
import { NotificationRow } from './notification-row';

interface NotificationGroupProps {
  title: string;
  description?: string;
  notifications: PlacementNotificationItem[];
  badgeColor?: string;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotificationGroup({
  title,
  description,
  notifications,
  badgeColor = 'bg-slate-100 text-slate-700',
  onRead,
  onDismiss,
}: NotificationGroupProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {title}
          </h2>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${badgeColor}`}>
            {notifications.length}
          </span>
        </div>
        {description && (
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {description}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <NotificationRow
            key={notif.id}
            notification={notif}
            onRead={onRead}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}
