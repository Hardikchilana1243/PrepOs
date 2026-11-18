'use client';

// ============================================================================
// NOTIFICATION SUMMARY METRICS (PHASE 6.16)
// Transparent KPI Cards Reflecting Authentic Underlying Database Counts
// ============================================================================

import React from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  CalendarDays,
  RotateCcw,
  Target,
} from 'lucide-react';
import { NotificationCenterSummary } from '@/lib/services/notifications';

interface NotificationSummaryProps {
  summary: NotificationCenterSummary;
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
}

export function NotificationSummary({
  summary,
  selectedFilter,
  onSelectFilter,
}: NotificationSummaryProps) {
  const cards = [
    {
      id: 'UNREAD',
      label: 'Unread Alerts',
      count: summary.unreadCount,
      icon: Bell,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      activeBg: 'ring-2 ring-blue-500 bg-blue-50/50',
    },
    {
      id: 'OVERDUE',
      label: 'Overdue Recall',
      count: summary.overdueCount,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      activeBg: 'ring-2 ring-rose-500 bg-rose-50/50',
    },
    {
      id: 'DUE_TODAY',
      label: 'Due Today',
      count: summary.dueTodayCount,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      activeBg: 'ring-2 ring-amber-500 bg-amber-50/50',
    },
    {
      id: 'DAILY_EXECUTION',
      label: 'Daily Tasks',
      count: summary.dailyExecutionCount,
      icon: CalendarDays,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      activeBg: 'ring-2 ring-indigo-500 bg-indigo-50/50',
    },
    {
      id: 'ASSESSMENT',
      label: 'Mock OA',
      count: summary.assessmentCount,
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      activeBg: 'ring-2 ring-purple-500 bg-purple-50/50',
    },
    {
      id: 'ALL',
      label: 'Total Active',
      count: summary.totalActive,
      icon: RotateCcw,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      activeBg: 'ring-2 ring-slate-500 bg-slate-100/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`p-3.5 rounded-xl border border-slate-200/80 bg-white text-left transition-all hover:border-slate-300 min-h-[44px] flex flex-col justify-between ${
              isSelected ? card.activeBg : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-semibold text-slate-500 truncate">
                {card.label}
              </span>
              <div className={`p-1 rounded-md ${card.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
}
