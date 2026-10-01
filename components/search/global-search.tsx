'use client';

// ============================================================================
// PREPOS GLOBAL SEARCH TRIGGER COMPONENT
// Header trigger button with keyboard shortcut badge (⌘K / Ctrl+K)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface GlobalSearchProps {
  onOpen: () => void;
  className?: string;
}

export function GlobalSearch({ onOpen, className = '' }: GlobalSearchProps) {
  const [shortcutText, setShortcutText] = useState('⌘K');

  useEffect(() => {
    // Detect OS for shortcut display: Ctrl+K on Windows/Linux, ⌘K on macOS
    if (typeof window !== 'undefined') {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
      setShortcutText(isMac ? '⌘K' : 'Ctrl+K');
    }
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Command Center Search (Shortcut: Ctrl+K)"
      className={`flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs hover:border-slate-300 hover:text-slate-800 hover:bg-slate-100/70 transition-all shadow-subtle min-h-[36px] ${className}`}
    >
      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="truncate max-w-[180px] sm:max-w-xs text-left">
        Search problems, topics, companies...
      </span>
      <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs shrink-0 ml-1">
        {shortcutText}
      </kbd>
    </button>
  );
}
