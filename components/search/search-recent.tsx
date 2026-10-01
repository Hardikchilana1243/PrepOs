'use client';

// ============================================================================
// PREPOS SEARCH RECENT COMPONENT
// Manages student recent search destinations with local persistence
// ============================================================================

import React, { useEffect, useState } from 'react';
import { History, X, ArrowUpRight } from 'lucide-react';
import { SearchResultItem } from '@/lib/services/global-search';

const STORAGE_KEY = 'prepos_recent_destinations_v1';

export function getRecentDestinations(): SearchResultItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentDestination(item: SearchResultItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentDestinations();
    const updated = [item, ...current.filter((i) => i.id !== item.id)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage write failures
  }
}

interface SearchRecentProps {
  onSelect: (item: SearchResultItem) => void;
}

export function SearchRecent({ onSelect }: SearchRecentProps) {
  const [recent, setRecent] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    setRecent(getRecentDestinations());
  }, []);

  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecent([]);
    } catch {
      // Ignore
    }
  };

  if (recent.length === 0) return null;

  return (
    <div className="p-3 border-b border-slate-100 bg-white space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <History className="w-3 h-3 text-slate-400" />
          <span>Recent Destinations</span>
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="text-[10px] text-slate-400 hover:text-slate-700 underline font-medium"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {recent.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
          >
            <span>{item.title}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
