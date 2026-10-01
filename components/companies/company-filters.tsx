'use client';

import React from 'react';
import { Search, X, Star, Filter, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export interface CompanyFilterState {
  searchQuery: string;
  targetOnly: boolean;
  status: 'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COVERED';
  tier: string;
  hasAssessments: boolean;
  hasCoreCS: boolean;
}

interface CompanyFiltersProps {
  filters: CompanyFilterState;
  onFilterChange: (newFilters: CompanyFilterState) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  targetCount: number;
}

export function CompanyFilters({
  filters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
  targetCount,
}: CompanyFiltersProps) {
  const isFiltered =
    filters.searchQuery.trim().length > 0 ||
    filters.targetOnly ||
    filters.status !== 'ALL' ||
    filters.tier !== 'ALL' ||
    filters.hasAssessments ||
    filters.hasCoreCS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search & Target Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by company name or pattern..."
            aria-label="Search companies"
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[44px]"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Segments */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Target Only Pill */}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, targetOnly: !filters.targetOnly })}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border ${
              filters.targetOnly
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filters.targetOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
              }`}
            />
            <span>Targets Only</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filters.targetOnly ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {targetCount}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Controls Row */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="company-status-select" className="text-slate-500 font-medium">
              Status:
            </label>
            <select
              id="company-status-select"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  status: e.target.value as CompanyFilterState['status'],
                })
              }
              className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="ALL">All Status</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COVERED">Covered</option>
            </select>
          </div>

          {/* Tier Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="company-tier-select" className="text-slate-500 font-medium">
              Tier:
            </label>
            <select
              id="company-tier-select"
              value={filters.tier}
              onChange={(e) => onFilterChange({ ...filters, tier: e.target.value })}
              className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="ALL">All Tiers</option>
              <option value="Tier-1 Tech">Tier-1 Tech</option>
              <option value="Product">Product</option>
              <option value="Enterprise">Enterprise</option>
              <option value="High-Impact IT">High-Impact IT</option>
            </select>
          </div>

          {/* Capabilities Checkboxes */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 min-h-[38px]">
            <input
              type="checkbox"
              checked={filters.hasAssessments}
              onChange={(e) => onFilterChange({ ...filters, hasAssessments: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Has Mock OA</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 min-h-[38px]">
            <input
              type="checkbox"
              checked={filters.hasCoreCS}
              onChange={(e) => onFilterChange({ ...filters, hasCoreCS: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Has Core CS</span>
          </label>
        </div>

        {/* Counter and Clear Filters */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredCount}</strong> of{' '}
            <strong className="text-slate-900">{totalCount}</strong>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors min-h-[36px] flex items-center"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
