import React from 'react';
import { Search, Filter, RotateCcw, Bookmark, AlertCircle, Check } from 'lucide-react';

export interface InterviewFilterState {
  searchQuery: string;
  selectedCompany: string;
  selectedTopic: string;
  selectedDifficulty: string;
  selectedCategory: string;
  solvedFilter: 'ALL' | 'SOLVED' | 'UNSOLVED';
  bookmarkedOnly: boolean;
  needsReviewOnly: boolean;
}

interface InterviewFiltersProps {
  filterState: InterviewFilterState;
  onChange: (newState: InterviewFilterState) => void;
  availableCompanies: string[];
  availableTopics: string[];
  totalResultsCount: number;
}

export function InterviewFilters({
  filterState,
  onChange,
  availableCompanies,
  availableTopics,
  totalResultsCount,
}: InterviewFiltersProps) {
  const handleReset = () => {
    onChange({
      searchQuery: '',
      selectedCompany: 'ALL',
      selectedTopic: 'ALL',
      selectedDifficulty: 'ALL',
      selectedCategory: 'ALL',
      solvedFilter: 'ALL',
      bookmarkedOnly: false,
      needsReviewOnly: false,
    });
  };

  const hasActiveFilters =
    filterState.searchQuery !== '' ||
    filterState.selectedCompany !== 'ALL' ||
    filterState.selectedTopic !== 'ALL' ||
    filterState.selectedDifficulty !== 'ALL' ||
    filterState.selectedCategory !== 'ALL' ||
    filterState.solvedFilter !== 'ALL' ||
    filterState.bookmarkedOnly ||
    filterState.needsReviewOnly;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* 1. Search Bar & Reset Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search interview questions, topics, companies..."
            value={filterState.searchQuery}
            onChange={(e) => onChange({ ...filterState, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* 2. Dropdowns and Filter Chips Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Company Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Company Association
          </label>
          <select
            value={filterState.selectedCompany}
            onChange={(e) => onChange({ ...filterState, selectedCompany: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[44px]"
          >
            <option value="ALL">All Companies</option>
            {availableCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Topic Domain
          </label>
          <select
            value={filterState.selectedTopic}
            onChange={(e) => onChange({ ...filterState, selectedTopic: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[44px]"
          >
            <option value="ALL">All Topics</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Buttons */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Difficulty Tier
          </label>
          <div className="grid grid-cols-4 gap-1 min-h-[44px] p-1 bg-slate-50 border border-slate-200 rounded-xl">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onChange({ ...filterState, selectedDifficulty: diff })}
                className={`text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center ${
                  filterState.selectedDifficulty === diff
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Solved Status Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Completion State
          </label>
          <div className="grid grid-cols-3 gap-1 min-h-[44px] p-1 bg-slate-50 border border-slate-200 rounded-xl">
            {(['ALL', 'SOLVED', 'UNSOLVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChange({ ...filterState, solvedFilter: st })}
                className={`text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center ${
                  filterState.solvedFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'SOLVED' ? 'Solved' : 'Unsolved'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Toggle Chips Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Bookmarked Filter */}
          <button
            type="button"
            onClick={() =>
              onChange({ ...filterState, bookmarkedOnly: !filterState.bookmarkedOnly })
            }
            className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border ${
              filterState.bookmarkedOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${filterState.bookmarkedOnly ? 'fill-indigo-700' : ''}`} />
            <span>Bookmarked Only</span>
          </button>

          {/* Needs Review Filter */}
          <button
            type="button"
            onClick={() =>
              onChange({ ...filterState, needsReviewOnly: !filterState.needsReviewOnly })
            }
            className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border ${
              filterState.needsReviewOnly
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Needs Review</span>
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{totalResultsCount}</span> questions
        </div>
      </div>
    </div>
  );
}
