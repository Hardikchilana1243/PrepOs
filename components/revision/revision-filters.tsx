'use client';

// ============================================================================
// PREPOS REVISION FILTERS COMPONENT
// Multi-faceted filtering: Search, Source, Due Status, Difficulty, Topic, Bookmarks
// ============================================================================

import React from 'react';
import {
  Search,
  Filter,
  X,
  Code2,
  Brain,
  Target,
  Building2,
  Bookmark,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';
import { RevisionSourceType } from '@/lib/services/revision';

export type DueStateFilter = 'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING' | 'REVIEWED';

export interface RevisionFilterValues {
  search: string;
  sourceType: 'ALL' | RevisionSourceType;
  dueState: DueStateFilter;
  difficulty: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  bookmarkedOnly: boolean;
}

interface RevisionFiltersProps {
  filters: RevisionFilterValues;
  onFilterChange: (updates: Partial<RevisionFilterValues>) => void;
  onResetFilters: () => void;
  availableTopics: string[];
  totalItems: number;
  filteredCount: number;
  viewMode: 'HIERARCHY' | 'LIST';
  onViewModeChange: (mode: 'HIERARCHY' | 'LIST') => void;
}

export function RevisionFilters({
  filters,
  onFilterChange,
  onResetFilters,
  availableTopics,
  totalItems,
  filteredCount,
  viewMode,
  onViewModeChange,
}: RevisionFiltersProps) {
  const isFiltered =
    Boolean(filters.search) ||
    filters.sourceType !== 'ALL' ||
    filters.dueState !== 'ALL' ||
    filters.difficulty !== 'ALL' ||
    filters.topic !== 'ALL' ||
    filters.bookmarkedOnly;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search revision items by title, topic, or company..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter & View Mode Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium font-mono">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalItems}
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('HIERARCHY')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'HIERARCHY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Organize by Due Today, Overdue, Upcoming, Reviewed"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sections</span>
            </button>
            <button
              onClick={() => onViewModeChange('LIST')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View all in flat list"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flat Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Source Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Source Pillar
          </label>
          <select
            value={filters.sourceType}
            onChange={(e) => onFilterChange({ sourceType: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Sources</option>
            <option value="DSA">DSA Algorithms</option>
            <option value="CORE_CS">Core CS Concepts</option>
            <option value="ASSESSMENT">Assessment Mistakes</option>
            <option value="COMPANY">Company Focus</option>
          </select>
        </div>

        {/* Due State Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Due Schedule
          </label>
          <select
            value={filters.dueState}
            onChange={(e) => onFilterChange({ dueState: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Schedules</option>
            <option value="DUE_TODAY">Due Today</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="REVIEWED">Completed / Reviewed</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Difficulty Tier
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange({ difficulty: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Topic Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Topic Focus
          </label>
          <select
            value={filters.topic}
            onChange={(e) => onFilterChange({ topic: e.target.value })}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 truncate"
          >
            <option value="ALL">All Topics</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Bookmarked Toggle Button */}
        <div className="space-y-1 col-span-2 sm:col-span-1 flex flex-col justify-end">
          <button
            type="button"
            onClick={() => onFilterChange({ bookmarkedOnly: !filters.bookmarkedOnly })}
            className={`w-full py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[34px] ${
              filters.bookmarkedOnly
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                filters.bookmarkedOnly ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
              }`}
            />
            <span>{filters.bookmarkedOnly ? 'Bookmarked Only' : 'Bookmarks'}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Filters:</span>

            {filters.sourceType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                Source: {filters.sourceType}
                <button
                  onClick={() => onFilterChange({ sourceType: 'ALL' })}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.dueState !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                Schedule: {filters.dueState.replace('_', ' ')}
                <button
                  onClick={() => onFilterChange({ dueState: 'ALL' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.difficulty !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                {filters.difficulty}
                <button
                  onClick={() => onFilterChange({ difficulty: 'ALL' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.topic !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                Topic: {filters.topic}
                <button
                  onClick={() => onFilterChange({ topic: 'ALL' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.bookmarkedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                Bookmarked Only
                <button
                  onClick={() => onFilterChange({ bookmarkedOnly: false })}
                  className="hover:text-amber-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
