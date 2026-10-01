'use client';

// ============================================================================
// PREPOS REVISION QUEUE COMPONENT
// Complete Spaced Repetition Command Center with Hierarchy, Filters, & Actions
// ============================================================================

import React, { useState, useTransition, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  History,
  BarChart3,
  List,
} from 'lucide-react';
import { recordRevisionReviewAction } from '@/app/dashboard/revision/actions';
import {
  RevisionDashboardData,
  RevisionQueueItem,
  RevisionSummary,
  RevisionAnalytics as RevisionAnalyticsType,
} from '@/lib/services/revision';
import { RevisionHeader } from './revision-header';
import { RevisionStats } from './revision-stats';
import { RevisionFilters, RevisionFilterValues, DueStateFilter } from './revision-filters';
import { RevisionSection } from './revision-section';
import { RevisionItemRow } from './revision-item-row';
import { RevisionSession } from './revision-session';
import { RevisionAnalytics } from './revision-analytics';
import { RevisionHistory } from './revision-history';
import { RevisionEmptyState } from './revision-empty-state';

interface RevisionQueueProps {
  data?: RevisionDashboardData;
  initialItems?: RevisionQueueItem[];
}

export function RevisionQueue({ data, initialItems }: RevisionQueueProps) {
  // Use data items or fallback to initialItems
  const startingItems = data?.items || initialItems || [];
  const [items, setItems] = useState<RevisionQueueItem[]>(startingItems);

  // Filter State
  const [filters, setFilters] = useState<RevisionFilterValues>({
    search: '',
    sourceType: 'ALL',
    dueState: 'ALL',
    difficulty: 'ALL',
    topic: 'ALL',
    bookmarkedOnly: false,
  });

  const [viewMode, setViewMode] = useState<'HIERARCHY' | 'LIST'>('HIERARCHY');
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'ANALYTICS' | 'HISTORY'>('QUEUE');
  const [activeSessionItem, setActiveSessionItem] = useState<RevisionQueueItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Available topics across items
  const availableTopics = useMemo(() => {
    if (data?.topics && data.topics.length > 0) return data.topics;
    const tSet = new Set<string>();
    items.forEach((i) => {
      if (i.topicTitle) tSet.add(i.topicTitle);
    });
    return Array.from(tSet).sort();
  }, [data?.topics, items]);

  // Dynamically compute authoritative summary from items state
  const summary: RevisionSummary = useMemo(() => {
    let dueTodayCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;
    let completedTodayCount = 0;
    let reviewedTotalCount = 0;

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    items.forEach((item) => {
      if (item.completedAt) {
        reviewedTotalCount++;
        const cDate = new Date(item.completedAt);
        if (cDate >= todayMidnight) {
          completedTodayCount++;
        }
      } else {
        if (item.daysOverdue > 0) {
          overdueCount++;
        } else if (item.isDue) {
          dueTodayCount++;
        } else {
          upcomingCount++;
        }
      }
    });

    return {
      dueTodayCount,
      overdueCount,
      upcomingCount,
      completedTodayCount,
      remainingTodayCount: dueTodayCount + overdueCount,
      totalTracked: items.length,
      streakDays: data?.summary?.streakDays ?? 0,
      reviewedTotalCount,
    };
  }, [items, data?.summary?.streakDays]);

  // Multi-faceted filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTopic = item.topicTitle.toLowerCase().includes(q);
        const matchesSubject = item.subjectTitle?.toLowerCase().includes(q);
        const matchesCompany = item.companyName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesSubject && !matchesCompany) return false;
      }

      // 2. Source Type
      if (filters.sourceType !== 'ALL') {
        if (filters.sourceType === 'COMPANY') {
          if (!item.companySlug && item.sourceType !== 'COMPANY') return false;
        } else if (item.sourceType !== filters.sourceType) {
          return false;
        }
      }

      // 3. Due Schedule State
      if (filters.dueState === 'DUE_TODAY') {
        if (!item.isDue || item.completedAt || item.daysOverdue > 0) return false;
      } else if (filters.dueState === 'OVERDUE') {
        if (item.daysOverdue <= 0 || item.completedAt) return false;
      } else if (filters.dueState === 'UPCOMING') {
        if (item.isDue || item.daysOverdue > 0 || item.completedAt) return false;
      } else if (filters.dueState === 'REVIEWED') {
        if (!item.completedAt) return false;
      }

      // 4. Difficulty
      if (filters.difficulty !== 'ALL') {
        if (item.difficulty?.toUpperCase() !== filters.difficulty) return false;
      }

      // 5. Topic
      if (filters.topic !== 'ALL') {
        if (item.topicTitle !== filters.topic) return false;
      }

      // 6. Bookmarked Only
      if (filters.bookmarkedOnly && !item.isBookmarked) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  // Partition filtered items into hierarchy sections
  const { overdueItems, dueTodayItems, upcomingItems, reviewedItems } = useMemo(() => {
    const overdue: RevisionQueueItem[] = [];
    const dueToday: RevisionQueueItem[] = [];
    const upcoming: RevisionQueueItem[] = [];
    const reviewed: RevisionQueueItem[] = [];

    filteredItems.forEach((item) => {
      if (item.completedAt) {
        reviewed.push(item);
      } else if (item.daysOverdue > 0) {
        overdue.push(item);
      } else if (item.isDue) {
        dueToday.push(item);
      } else {
        upcoming.push(item);
      }
    });

    return {
      overdueItems: overdue,
      dueTodayItems: dueToday,
      upcomingItems: upcoming,
      reviewedItems: reviewed,
    };
  }, [filteredItems]);

  const handleFilterUpdate = (updates: Partial<RevisionFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      sourceType: 'ALL',
      dueState: 'ALL',
      difficulty: 'ALL',
      topic: 'ALL',
      bookmarkedOnly: false,
    });
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.sourceType !== 'ALL' ||
    filters.dueState !== 'ALL' ||
    filters.difficulty !== 'ALL' ||
    filters.topic !== 'ALL' ||
    filters.bookmarkedOnly;

  // Server-Authoritative SM-2 Review Handler
  const handleRateReview = async (
    revisionId: string,
    rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
  ) => {
    return new Promise<{ nextIntervalDays: number; nextDue: Date }>((resolve, reject) => {
      startTransition(async () => {
        setNotification(null);
        try {
          const res = await recordRevisionReviewAction(revisionId, rating);
          const nextDueDate = new Date(res.nextDue);
          const nextDueStr = nextDueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          setItems((prev) =>
            prev.map((i) =>
              i.id === revisionId
                ? {
                    ...i,
                    isDue: false,
                    daysOverdue: 0,
                    intervalDays: res.nextIntervalDays,
                    dueAt: nextDueStr,
                    dueAtRaw: nextDueDate.toISOString(),
                    confidence: rating,
                    completedAt: new Date().toISOString(),
                    reviewCount: i.reviewCount + 1,
                  }
                : i
            )
          );

          setNotification({
            text: `Authoritative review recorded as "${rating}". SM-2 interval scheduled to ${
              res.nextIntervalDays
            } day${res.nextIntervalDays > 1 ? 's' : ''}. Placement Readiness Score recalculated.`,
            type: 'success',
          });

          resolve(res);
        } catch (err) {
          setNotification({
            text: 'Failed to record revision review on server. Please try again.',
            type: 'error',
          });
          reject(err);
        }
      });
    });
  };

  // Find next due item for continuous review session flow
  const handleNextDueItem = () => {
    const nextItem =
      overdueItems.find((i) => i.id !== activeSessionItem?.id) ||
      dueTodayItems.find((i) => i.id !== activeSessionItem?.id);
    if (nextItem) {
      setActiveSessionItem(nextItem);
    } else {
      setActiveSessionItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          role="status"
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-subtle animate-in fade-in duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[11px] underline hover:no-underline font-medium text-slate-500 hover:text-slate-800 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <RevisionHeader summary={summary} />

      {/* Daily Metrics Stats Bar */}
      <RevisionStats summary={summary} />

      {/* Workspace Tabs: Active Queue, Analytics, Recent History */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'QUEUE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Revision Queue</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-current">
              {filteredItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'ANALYTICS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Retention Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'HISTORY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Review Log</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Revision Queue View */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          {/* Multi-faceted Filter Bar */}
          <RevisionFilters
            filters={filters}
            onFilterChange={handleFilterUpdate}
            onResetFilters={handleResetFilters}
            availableTopics={availableTopics}
            totalItems={items.length}
            filteredCount={filteredItems.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {filteredItems.length === 0 ? (
            <RevisionEmptyState
              isFiltered={isFiltered}
              filterType={filters.dueState}
              onResetFilters={handleResetFilters}
            />
          ) : viewMode === 'HIERARCHY' ? (
            /* Structured Hierarchy: Due Today -> Overdue -> Upcoming -> Recently Reviewed */
            <div className="space-y-5">
              {/* 1. Overdue Items (High Priority) */}
              {overdueItems.length > 0 && (
                <RevisionSection
                  title="Overdue Recall"
                  icon={AlertCircle}
                  badgeCount={overdueItems.length}
                  badgeVariant="rose"
                  description="Scheduled review date has passed. Recall these immediately to prevent memory decay."
                  items={overdueItems}
                  onOpenWorkspace={(item) => setActiveSessionItem(item)}
                  defaultExpanded={true}
                />
              )}

              {/* 2. Due Today Items */}
              {dueTodayItems.length > 0 && (
                <RevisionSection
                  title="Due Today"
                  icon={Clock}
                  badgeCount={dueTodayItems.length}
                  badgeVariant="amber"
                  description="Optimally timed for today's active recall session to reinforce retention."
                  items={dueTodayItems}
                  onOpenWorkspace={(item) => setActiveSessionItem(item)}
                  defaultExpanded={true}
                />
              )}

              {/* 3. Upcoming Items */}
              {upcomingItems.length > 0 && (
                <RevisionSection
                  title="Upcoming Scheduled Recall"
                  icon={Calendar}
                  badgeCount={upcomingItems.length}
                  badgeVariant="slate"
                  description="Future review dates determined by past rating intervals. No action required today."
                  items={upcomingItems}
                  onOpenWorkspace={(item) => setActiveSessionItem(item)}
                  defaultExpanded={overdueItems.length === 0 && dueTodayItems.length === 0}
                />
              )}

              {/* 4. Recently Reviewed Items */}
              {reviewedItems.length > 0 && (
                <RevisionSection
                  title="Recently Reviewed"
                  icon={CheckCircle2}
                  badgeCount={reviewedItems.length}
                  badgeVariant="emerald"
                  description="Items successfully reviewed and rescheduled into future intervals."
                  items={reviewedItems}
                  onOpenWorkspace={(item) => setActiveSessionItem(item)}
                  defaultExpanded={false}
                />
              )}
            </div>
          ) : (
            /* Flat List Queue Mode */
            <div className="space-y-2.5">
              {filteredItems.map((item) => (
                <RevisionItemRow
                  key={item.id}
                  item={item}
                  onOpenWorkspace={(selected) => setActiveSessionItem(selected)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Retention Analytics */}
      {activeTab === 'ANALYTICS' && data?.analytics && (
        <RevisionAnalytics analytics={data.analytics} />
      )}

      {/* Tab 3: History Log */}
      {activeTab === 'HISTORY' && data?.analytics?.recentActivity && (
        <RevisionHistory activity={data.analytics.recentActivity} />
      )}

      {/* Interactive Review Session Modal */}
      {activeSessionItem && (
        <RevisionSession
          item={activeSessionItem}
          isOpen={Boolean(activeSessionItem)}
          onClose={() => setActiveSessionItem(null)}
          onRate={handleRateReview}
          onNextDueItem={handleNextDueItem}
          isPending={isPending}
        />
      )}
    </div>
  );
}
