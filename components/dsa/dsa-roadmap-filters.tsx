'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface DSARoadmapFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  availableCompanies: string[];
  availableTopics: { slug: string; title: string }[];
  statusCounts: {
    solved: number;
    attempted: number;
    bookmarked: number;
    unsolved: number;
  };
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function DSARoadmapFilters({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  selectedCompany,
  onCompanyChange,
  selectedTopic,
  onTopicChange,
  availableCompanies,
  availableTopics,
  statusCounts,
  totalCount,
  filteredCount,
  onClearFilters,
}: DSARoadmapFiltersProps) {
  const isFilterActive =
    Boolean(searchQuery.trim()) ||
    selectedDifficulty !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedCompany !== 'ALL' ||
    selectedTopic !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      {/* Top Row: Search Input + Status Counter + Clear Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search problems by title, topic, or company..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Match Count & Clear Filter Action */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-xs text-slate-500 font-mono">
            Showing <span className="font-semibold text-slate-800">{filteredCount}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalCount}</span>
          </span>

          {isFilterActive && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Difficulty:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'EASY', label: 'Easy' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'HARD', label: 'Hard' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onDifficultyChange(item.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedDifficulty === item.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Status:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'UNSOLVED', label: `Todo (${statusCounts.unsolved})` },
            { id: 'ATTEMPTED', label: `Attempted (${statusCounts.attempted})` },
            { id: 'SOLVED', label: `Solved (${statusCounts.solved})` },
            { id: 'BOOKMARKED', label: `Saved (${statusCounts.bookmarked})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onStatusChange(item.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedStatus === item.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Company & Topic Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter Dropdown */}
          {availableCompanies.length > 0 && (
            <select
              value={selectedCompany}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              aria-label="Filter by company"
            >
              <option value="ALL">All Companies</option>
              {availableCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Topic Filter Dropdown */}
          {availableTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => onTopicChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              aria-label="Filter by topic"
            >
              <option value="ALL">All Topics</option>
              {availableTopics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
