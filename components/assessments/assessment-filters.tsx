'use client';

// ============================================================================
// PREPOS ASSESSMENT FILTERS COMPONENT
// Multi-faceted filtering for assessment catalog (Search, Company, Difficulty, Status, Duration)
// ============================================================================

import React from 'react';
import {
  Search,
  Filter,
  X,
  Building2,
  BarChart3,
  Clock,
  Layers,
  CheckCircle2,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface AssessmentFilterValues {
  search: string;
  companySlug: string;
  difficulty: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  status: 'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  duration: 'ALL' | 'SHORT' | 'MEDIUM' | 'LONG';
  type: string;
}

interface CompanyOption {
  slug: string;
  name: string;
  isTarget?: boolean;
}

interface AssessmentFiltersProps {
  filters: AssessmentFilterValues;
  onFilterChange: (newFilters: Partial<AssessmentFilterValues>) => void;
  onResetFilters: () => void;
  availableCompanies: CompanyOption[];
  viewMode: 'GROUPED' | 'LIST';
  onViewModeChange: (mode: 'GROUPED' | 'LIST') => void;
  totalResults: number;
}

export function AssessmentFilters({
  filters,
  onFilterChange,
  onResetFilters,
  availableCompanies,
  viewMode,
  onViewModeChange,
  totalResults,
}: AssessmentFiltersProps) {
  const isFiltered =
    Boolean(filters.search) ||
    filters.companySlug !== 'ALL' ||
    filters.difficulty !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.duration !== 'ALL' ||
    filters.type !== 'ALL';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Row: Search + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search assessments by title, company, or syllabus..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

        {/* View Mode Toggle & Results Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium font-mono">
            {totalResults} {totalResults === 1 ? 'assessment' : 'assessments'}
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('GROUPED')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'GROUPED'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Organize by Company & Difficulty"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grouped</span>
            </button>
            <button
              onClick={() => onViewModeChange('LIST')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View all in flat list"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Company Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            Company
          </label>
          <select
            value={filters.companySlug}
            onChange={(e) => onFilterChange({ companySlug: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Companies</option>
            {availableCompanies.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.isTarget ? '★ ' : ''}
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-slate-400" />
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange({ difficulty: e.target.value as any })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Attempt Status Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-slate-400" />
            Attempt Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as any })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Attempted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Duration Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Duration
          </label>
          <select
            value={filters.duration}
            onChange={(e) => onFilterChange({ duration: e.target.value as any })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Durations</option>
            <option value="SHORT">&lt; 45 Mins</option>
            <option value="MEDIUM">45 - 90 Mins</option>
            <option value="LONG">&gt; 90 Mins</option>
          </select>
        </div>

        {/* Assessment Type Dropdown */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Structure Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Formats</option>
            <option value="Full-Length Simulation">Full-Length Simulation</option>
            <option value="Coding + Core CS MCQ">Coding + Core CS</option>
            <option value="Algorithmic Coding Only">Coding Only</option>
            <option value="Core CS Screening Only">Core CS Only</option>
          </select>
        </div>
      </div>

      {/* Active Filters Pill Bar & Reset */}
      {isFiltered && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Active Filters:</span>
            {filters.companySlug !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                {availableCompanies.find((c) => c.slug === filters.companySlug)?.name || filters.companySlug}
                <button
                  onClick={() => onFilterChange({ companySlug: 'ALL' })}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.difficulty !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                Difficulty: {filters.difficulty}
                <button
                  onClick={() => onFilterChange({ difficulty: 'ALL' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                Status: {filters.status.replace('_', ' ')}
                <button
                  onClick={() => onFilterChange({ status: 'ALL' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.duration !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                Duration: {filters.duration}
                <button
                  onClick={() => onFilterChange({ duration: 'ALL' })}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.type !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                Type: {filters.type}
                <button
                  onClick={() => onFilterChange({ type: 'ALL' })}
                  className="hover:text-slate-900"
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
            <span>Reset All</span>
          </button>
        </div>
      )}
    </div>
  );
}
