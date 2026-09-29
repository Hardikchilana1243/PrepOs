'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { recordRevisionReviewAction } from '@/app/dashboard/actions';
import { RevisionHeader } from './revision-header';
import { RevisionFilters, RevisionFilterType } from './revision-filters';
import { RevisionRow } from './revision-row';
import { RevisionWorkspace, RevisionDetailItem } from './revision-workspace';
import { RevisionEmptyState } from './revision-empty-state';

export interface RevisionQueueItem {
  id: string;
  sourceType: 'DSA' | 'CORE_CS';
  problemId?: string;
  problemTitle: string;
  problemSlug?: string;
  difficulty?: string;
  topicTitle: string;
  subjectTitle?: string;
  statement?: string | null;
  hints?: string[];
  expectedTimeComplexity?: string | null;
  expectedSpaceComplexity?: string | null;
  explanation?: string | null;
  intervalDays: number;
  confidence: string;
  dueAt: string;
  dueAtRaw: string;
  isDue: boolean;
  daysOverdue: number;
  completedAt?: string | null;
}

interface RevisionQueueProps {
  initialItems: RevisionQueueItem[];
}

export function RevisionQueue({ initialItems }: RevisionQueueProps) {
  const [items, setItems] = useState<RevisionQueueItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<RevisionFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkspaceItem, setActiveWorkspaceItem] = useState<RevisionDetailItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Compute counts for filters and header
  const counts = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let completed = 0;
    let dsaOnly = 0;
    let coreCsOnly = 0;

    items.forEach((item) => {
      if (item.completedAt) completed++;
      if (item.daysOverdue > 0) overdue++;
      else if (item.isDue) dueToday++;
      else if (!item.completedAt) upcoming++;

      if (item.sourceType === 'DSA') dsaOnly++;
      else coreCsOnly++;
    });

    return {
      all: items.length,
      dueToday,
      overdue,
      upcoming,
      completed,
      dsaOnly,
      coreCsOnly,
    };
  }, [items]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Filter Tab Matching
      if (activeFilter === 'DUE_TODAY' && !item.isDue) return false;
      if (activeFilter === 'OVERDUE' && item.daysOverdue <= 0) return false;
      if (activeFilter === 'UPCOMING' && (item.isDue || item.daysOverdue > 0 || item.completedAt)) return false;
      if (activeFilter === 'COMPLETED' && !item.completedAt) return false;
      if (activeFilter === 'DSA_ONLY' && item.sourceType !== 'DSA') return false;
      if (activeFilter === 'CORE_CS_ONLY' && item.sourceType !== 'CORE_CS') return false;

      // 2. Search Query Matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.problemTitle.toLowerCase().includes(q);
        const matchesTopic = item.topicTitle.toLowerCase().includes(q);
        const matchesSubject = item.subjectTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesSubject) return false;
      }

      return true;
    });
  }, [items, activeFilter, searchQuery]);

  // Handle SM-2 Review Rating
  const handleRate = async (revisionId: string, rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    startTransition(async () => {
      setNotification(null);
      try {
        const res = await recordRevisionReviewAction(revisionId, rating);
        const nextDueStr = new Date(res.nextDue).toLocaleDateString('en-US', {
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
                  confidence: rating,
                  completedAt: new Date().toISOString(),
                }
              : i
          )
        );

        setNotification({
          text: `Revision logged as ${rating}! SM-2 interval scheduled to ${res.nextIntervalDays} day${
            res.nextIntervalDays > 1 ? 's' : ''
          }. Placement Readiness Score updated.`,
          type: 'success',
        });

        setActiveWorkspaceItem(null);
      } catch (err) {
        setNotification({
          text: 'Failed to record revision review. Please try again.',
          type: 'error',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-subtle animate-in fade-in duration-150 ${
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
            <span>{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[11px] underline hover:no-underline font-medium text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Real Metrics & Actions */}
      <RevisionHeader
        dueCount={counts.dueToday}
        overdueCount={counts.overdue}
        totalTracked={counts.all}
        completedRecentCount={counts.completed}
      />

      {/* Search and Filters */}
      <RevisionFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* Revision Items Sheet */}
      {filteredItems.length > 0 ? (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <RevisionRow
              key={item.id}
              item={{
                id: item.id,
                sourceType: item.sourceType,
                title: item.problemTitle,
                topicTitle: item.topicTitle,
                subjectTitle: item.subjectTitle,
                difficulty: item.difficulty,
                slug: item.problemSlug,
                statement: item.statement,
                hint: item.hints?.[0] ?? null,
                expectedTimeComplexity: item.expectedTimeComplexity,
                expectedSpaceComplexity: item.expectedSpaceComplexity,
                explanation: item.explanation,
                intervalDays: item.intervalDays,
                confidence: item.confidence,
                dueAt: item.dueAt,
                isDue: item.isDue,
                daysOverdue: item.daysOverdue,
              }}
              onOpenWorkspace={(detail) => setActiveWorkspaceItem(detail)}
            />
          ))}
        </div>
      ) : (
        <RevisionEmptyState filterType={activeFilter} />
      )}

      {/* Interactive Review Workspace Modal */}
      {activeWorkspaceItem && (
        <RevisionWorkspace
          item={activeWorkspaceItem}
          isOpen={Boolean(activeWorkspaceItem)}
          onClose={() => setActiveWorkspaceItem(null)}
          onRate={handleRate}
          isPending={isPending}
        />
      )}
    </div>
  );
}
