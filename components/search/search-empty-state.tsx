'use client';

// ============================================================================
// PREPOS SEARCH EMPTY STATE COMPONENT
// Contextual empty state for zero-results and initial search suggestions
// ============================================================================

import React from 'react';
import { SearchX, Sparkles, Code2, Building2, Cpu, Target, RotateCcw } from 'lucide-react';

interface SearchEmptyStateProps {
  query?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export function SearchEmptyState({ query, onSuggestionClick }: SearchEmptyStateProps) {
  if (query && query.trim().length > 0) {
    return (
      <div className="py-12 px-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
          <SearchX className="w-6 h-6" />
        </div>

        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-slate-900">
            No matching resources for &ldquo;{query}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn&apos;t find any problems, topics, recruiters, or assessments matching your search terms.
          </p>
        </div>

        {onSuggestionClick && (
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Suggested Search Terms
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
              {['Two Sum', 'Amazon', 'DBMS ACID', 'Sliding Window', 'Dynamic Programming', 'Mock OA'].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSuggestionClick(term)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-medium transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-8 px-6 text-center space-y-4">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600 border border-blue-100">
        <Sparkles className="w-5 h-5" />
      </div>

      <div className="space-y-1 max-w-xs mx-auto">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
          Preparation Command Center
        </h3>
        <p className="text-[11px] text-slate-500">
          Quickly search across algorithms, Core CS diagnostics, recruiters, or type a command.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-lg mx-auto text-left">
        <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-[11px]">
            <Code2 className="w-3.5 h-3.5" />
            <span>DSA Problems</span>
          </div>
          <p className="text-[10px] text-slate-500">Search by title or topic</p>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-[11px]">
            <Cpu className="w-3.5 h-3.5" />
            <span>Core CS</span>
          </div>
          <p className="text-[10px] text-slate-500">DBMS & OS diagnostics</p>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-[11px]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Companies</span>
          </div>
          <p className="text-[10px] text-slate-500">Recruiter hiring patterns</p>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
            <Target className="w-3.5 h-3.5" />
            <span>Assessments</span>
          </div>
          <p className="text-[10px] text-slate-500">Timed OA simulations</p>
        </div>
      </div>
    </div>
  );
}
