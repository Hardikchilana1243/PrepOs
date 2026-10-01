'use client';

// ============================================================================
// PREPOS SEARCH DIALOG / COMMAND PALETTE COMPONENT
// Unified keyboard-first modal command center with debouncing & state management
// ============================================================================

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResultItem } from '@/lib/services/global-search';
import { searchGlobalAction } from '@/app/dashboard/search/actions';
import { SearchInput } from './search-input';
import { SearchResults } from './search-results';
import { SearchEmptyState } from './search-empty-state';
import { SearchRecent, saveRecentDestination } from './search-recent';
import { SearchQuickActions } from './search-quick-actions';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Initial load when opened with empty query
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setIsSearching(true);
      searchGlobalAction('')
        .then((res) => {
          setItems(res);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }
  }, [isOpen]);

  // Debounced search on query change
  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await searchGlobalAction(query);
          setItems(res);
          setSelectedIndex(0);
        } catch {
          // Keep previous items or empty
        } finally {
          setIsSearching(false);
        }
      });
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, isOpen]);

  // Global Keyboard shortcuts when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keyboard navigation inside input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelectItem(items[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    saveRecentDestination(item);
    onClose();
    router.push(item.url);
  };

  const handleSelectActionUrl = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Unified Preparation Command Center"
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <SearchInput
          query={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          onKeyDown={handleInputKeyDown}
          isLoading={isSearching || isPending}
          placeholder="Search DSA, Core CS, companies, assessments, or type a command..."
        />

        {/* Recent Destinations (shown when query is empty) */}
        {!query && <SearchRecent onSelect={handleSelectItem} />}

        {/* Scrollable Results Area */}
        <div ref={resultsContainerRef} className="overflow-y-auto flex-1 min-h-[160px] max-h-[50vh]">
          {items.length === 0 && !isSearching ? (
            <SearchEmptyState query={query} onSuggestionClick={(term) => setQuery(term)} />
          ) : (
            <SearchResults
              items={items}
              selectedIndex={selectedIndex}
              onSelect={handleSelectItem}
              onHighlight={setSelectedIndex}
            />
          )}
        </div>

        {/* Quick Actions Shortcuts (when query is empty or no match) */}
        {!query && <SearchQuickActions onSelectAction={handleSelectActionUrl} />}

        {/* Command Palette Keyboard Legend Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2 sm:gap-3">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
            <span>•</span>
            <span>esc to close</span>
          </div>

          <span className="hidden sm:inline">
            {items.length} resource{items.length === 1 ? '' : 's'} available
          </span>
        </div>
      </div>
    </div>
  );
}
