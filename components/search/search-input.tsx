'use client';

// ============================================================================
// PREPOS SEARCH INPUT COMPONENT
// Keyboard-first, debounced search bar with clear button and loading spinner
// ============================================================================

import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function SearchInput({
  query,
  onChange,
  onClear,
  onKeyDown,
  isLoading,
  placeholder = 'Search problems, topics, companies, or commands (Ctrl+K)...',
}: SearchInputProps) {
  return (
    <div className="relative flex items-center p-3 sm:p-4 border-b border-slate-100 bg-white">
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0 ml-1 mr-3" />
      ) : (
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-3" />
      )}

      <input
        autoFocus
        type="text"
        role="searchbox"
        aria-label="Global Search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none font-sans min-h-[36px]"
      />

      {query && (
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Clear search input"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
