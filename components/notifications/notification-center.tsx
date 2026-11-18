'use client';

// ============================================================================
// NOTIFICATION & REMINDER CENTER MASTER VIEW (PHASE 6.16)
// Complete Placement Notification Center Hierarchy:
// Notifications → Due Today → Overdue → Daily Execution → Revision Reminders
// → Assessment Reminders → Readiness Alerts → History → Preferences
// ============================================================================

import React, { useState } from 'react';
import {
  NotificationCenterData,
  PlacementNotificationItem,
} from '@/lib/services/notifications';
import { NotificationHeader } from './notification-header';
import { NotificationSummary } from './notification-summary';
import { NotificationFilters } from './notification-filters';
import { NotificationGroup } from './notification-group';
import { NotificationEmptyState } from './notification-empty-state';
import { NotificationPreferences } from './notification-preferences';
import { NotificationHistory } from './notification-history';

interface NotificationCenterProps {
  initialData: NotificationCenterData;
}

export function NotificationCenter({ initialData }: NotificationCenterProps) {
  const [data, setData] = useState<NotificationCenterData>(initialData);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showPreferences, setShowPreferences] = useState(false);

  // Optimistic handler for marking single item read
  const handleItemRead = (id: string) => {
    setData((prev) => {
      const updated = prev.notifications.map((n) =>
        n.id === id ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() } : n
      );
      const unreadCount = updated.filter((n) => n.status === 'UNREAD').length;
      return {
        ...prev,
        notifications: updated,
        summary: { ...prev.summary, unreadCount },
        categories: prev.categories.map((c) =>
          c.id === 'UNREAD' ? { ...c, count: unreadCount } : c
        ),
      };
    });
  };

  // Optimistic handler for marking all items read
  const handleMarkAllRead = () => {
    setData((prev) => {
      const updated = prev.notifications.map((n) => ({
        ...n,
        status: 'READ' as const,
        readAt: new Date().toISOString(),
      }));
      return {
        ...prev,
        notifications: updated,
        summary: { ...prev.summary, unreadCount: 0 },
        categories: prev.categories.map((c) =>
          c.id === 'UNREAD' ? { ...c, count: 0 } : c
        ),
      };
    });
  };

  // Optimistic handler for dismissing an item
  const handleItemDismiss = (id: string) => {
    setData((prev) => {
      const filtered = prev.notifications.filter((n) => n.id !== id);
      const unreadCount = filtered.filter((n) => n.status === 'UNREAD').length;
      return {
        ...prev,
        notifications: filtered,
        summary: {
          ...prev.summary,
          totalActive: filtered.length,
          unreadCount,
        },
        categories: prev.categories.map((c) => {
          if (c.id === 'ALL') return { ...c, count: filtered.length };
          if (c.id === 'UNREAD') return { ...c, count: unreadCount };
          return c;
        }),
      };
    });
  };

  // Filter notifications according to selected tab
  const filteredNotifications = data.notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return n.status === 'UNREAD';
    if (activeFilter === 'DUE_TODAY') return n.category === 'DUE_TODAY';
    if (activeFilter === 'OVERDUE') return n.category === 'OVERDUE';
    if (activeFilter === 'DAILY_EXECUTION') return n.category === 'DAILY_EXECUTION';
    if (activeFilter === 'ASSESSMENT') return n.category === 'ASSESSMENT';
    if (activeFilter === 'CORE_CS') return n.category === 'CORE_CS';
    if (activeFilter === 'READINESS') return n.category === 'READINESS';
    return true;
  });

  // Partition into hierarchical groups
  const overdueGroup = filteredNotifications.filter((n) => n.category === 'OVERDUE');
  const dueTodayGroup = filteredNotifications.filter((n) => n.category === 'DUE_TODAY');
  const dailyExecGroup = filteredNotifications.filter((n) => n.category === 'DAILY_EXECUTION');
  const otherGroup = filteredNotifications.filter(
    (n) =>
      n.category !== 'OVERDUE' &&
      n.category !== 'DUE_TODAY' &&
      n.category !== 'DAILY_EXECUTION'
  );

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header with Breadcrumbs & Actions */}
      <NotificationHeader
        unreadCount={data.summary.unreadCount}
        totalCount={data.summary.totalActive}
        onMarkAllRead={handleMarkAllRead}
        onOpenPreferences={() => setShowPreferences(!showPreferences)}
      />

      {/* 2. Key Metrics Summary Grid */}
      <NotificationSummary
        summary={data.summary}
        selectedFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* 3. Filter Navigation Tabs */}
      <NotificationFilters
        categories={data.categories}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* 4. Grouped Notification Feed or Empty State */}
      {data.summary.totalActive === 0 ? (
        <NotificationEmptyState type="ALL_CLEARED" />
      ) : filteredNotifications.length === 0 ? (
        <NotificationEmptyState
          type={activeFilter === 'UNREAD' ? 'NO_UNREAD' : 'FILTER_EMPTY'}
          categoryLabel={data.categories.find((c) => c.id === activeFilter)?.label}
          onResetFilter={() => setActiveFilter('ALL')}
        />
      ) : activeFilter !== 'ALL' && activeFilter !== 'UNREAD' ? (
        // Single flat list when specific category filter is chosen
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <NotificationGroup
              key={notif.id}
              title={notif.categoryLabel}
              notifications={[notif]}
              onRead={handleItemRead}
              onDismiss={handleItemDismiss}
            />
          ))}
        </div>
      ) : (
        // Hierarchical grouped presentation (Due Today → Overdue → Daily Execution → Other)
        <div className="space-y-6">
          <NotificationGroup
            title="Overdue Recall"
            description="Algorithmic items that have exceeded their SM-2 review window"
            notifications={overdueGroup}
            badgeColor="bg-rose-100 text-rose-700"
            onRead={handleItemRead}
            onDismiss={handleItemDismiss}
          />

          <NotificationGroup
            title="Due Today"
            description="Scheduled memory recall intervals for today"
            notifications={dueTodayGroup}
            badgeColor="bg-amber-100 text-amber-700"
            onRead={handleItemRead}
            onDismiss={handleItemDismiss}
          />

          <NotificationGroup
            title="Daily Placement Execution"
            description="Planned tasks to maintain preparation consistency"
            notifications={dailyExecGroup}
            badgeColor="bg-indigo-100 text-indigo-700"
            onRead={handleItemRead}
            onDismiss={handleItemDismiss}
          />

          <NotificationGroup
            title="Mock Assessments & Benchmark Drills"
            description="Unpassed assessments, Core CS diagnostics, and company requirements"
            notifications={otherGroup}
            badgeColor="bg-slate-100 text-slate-700"
            onRead={handleItemRead}
            onDismiss={handleItemDismiss}
          />
        </div>
      )}

      {/* 5. Notification Preferences (Embedded or Expandable) */}
      <section id="preferences" className="pt-4 border-t border-slate-200">
        <NotificationPreferences
          preferences={data.preferences}
          history={data.history}
          onSaved={(updated) => setData((prev) => ({ ...prev, preferences: updated }))}
        />
      </section>

      {/* 6. Notification Audit History */}
      <section id="history" className="pt-2">
        <NotificationHistory history={data.history} />
      </section>
    </div>
  );
}
