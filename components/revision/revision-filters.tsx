'use client';

import React from 'react';
import { Search, Filter, Layers } from 'lucide-react';

export type RevisionFilterType =
  | 'ALL'
  | 'DUE_TODAY'
  | 'OVERDUE'
  | 'UPCOMING'
  | 'COMPLETED'
  | 'DSA_ONLY'
  | 'CORE_CS_ONLY';

interface RevisionFiltersProps {
  activeFilter: RevisionFilterType;
  onFilterChange: (filter: RevisionFilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    dueToday: number;
    overdue: number;
    upcoming: number;
    completed: number;
    dsaOnly: number;
    coreCsOnly: number;
  };
}

export function RevisionFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
}: RevisionFiltersProps) {
  const filterTabs: { id: RevisionFilterType; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Items', count: counts.all },
    { id: 'DUE_TODAY', label: 'Due Today', count: counts.dueToday },
    { id: 'OVERDUE', label: 'Overdue', count: counts.overdue },
    { id: 'UPCOMING', label: 'Upcoming', count: counts.upcoming },
    { id: 'COMPLETED', label: 'Completed', count: counts.completed },
    { id: 'DSA_ONLY', label: 'DSA Algorithms', count: counts.dsaOnly },
    { id: 'CORE_CS_ONLY', label: 'Core CS Concepts', count: counts.coreCsOnly },
  ];

  return (
    <div className="space-y-3">
      {/* Search and Quick Counter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search revision items by title, topic, or subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-subtle transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-slate-800">{counts.all}</span> items in queue
        </div>
      </div>

      {/* Filter Tabs Scrollable Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
