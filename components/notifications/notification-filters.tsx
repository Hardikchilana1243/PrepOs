'use client';

// ============================================================================
// NOTIFICATION FILTERS (PHASE 6.16)
// Category Filter Pills with Active Indicators and Counts
// ============================================================================

import React from 'react';
import { NotificationCategoryFilter } from '@/lib/services/notifications';

interface NotificationFiltersProps {
  categories: NotificationCategoryFilter[];
  activeFilter: string;
  onSelectFilter: (filterId: string) => void;
}

export function NotificationFilters({
  categories,
  activeFilter,
  onSelectFilter,
}: NotificationFiltersProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold no-scrollbar">
      {categories.map((cat) => {
        const isActive = activeFilter === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectFilter(cat.id)}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg border whitespace-nowrap inline-flex items-center gap-2 transition-all ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive
                  ? 'bg-blue-500/40 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
