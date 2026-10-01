'use client';

// ============================================================================
// PREPOS SEARCH RESULT GROUP COMPONENT
// Semantic category container with section headers and item counts
// ============================================================================

import React from 'react';

interface SearchResultGroupProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

export function SearchResultGroup({ title, count, children }: SearchResultGroupProps) {
  if (count === 0) return null;

  return (
    <div className="space-y-1 pt-2 first:pt-0">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
          {count}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
