'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Code2,
  Cpu,
  Building2,
  RotateCcw,
  User,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: 'Navigation' | 'DSA Problem' | 'Company Hub' | 'Core CS Drill';
  url: string;
  hint?: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'nav-dash', title: 'Dashboard', category: 'Navigation', url: '/dashboard', hint: 'Overview & Today\'s Mission' },
  { id: 'nav-dsa', title: 'DSA Roadmap', category: 'Navigation', url: '/dashboard/dsa', hint: '14 Modules & 20 Problems' },
  { id: 'nav-corecs', title: 'Core CS Drills', category: 'Navigation', url: '/dashboard/core-cs', hint: 'DBMS & OS MCQs' },
  { id: 'nav-companies', title: 'Company Hubs', category: 'Navigation', url: '/dashboard/companies', hint: '10 Placement Recruiter Hubs' },
  { id: 'nav-revision', title: 'Revision Queue', category: 'Navigation', url: '/dashboard/revision', hint: 'SuperMemo Spaced Repetition' },
  { id: 'nav-profile', title: 'Candidate Profile & PRS Audit', category: 'Navigation', url: '/dashboard/profile', hint: 'Target Role & Preferences' },
  // Problems
  { id: 'prob-1', title: 'Array Element Frequency Counter', category: 'DSA Problem', url: '/dashboard/dsa/problem/array-element-frequency-counter', hint: 'HashMap • Easy' },
  { id: 'prob-2', title: 'Two Sum in Sorted Sequence', category: 'DSA Problem', url: '/dashboard/dsa/problem/two-sum-target-search', hint: 'Two Pointers • Easy' },
  { id: 'prob-3', title: 'Maximum Subarray Running Sum', category: 'DSA Problem', url: '/dashboard/dsa/problem/max-subarray-sum-range', hint: 'Kadane • Easy' },
  { id: 'prob-4', title: 'Reverse Singly Linked List', category: 'DSA Problem', url: '/dashboard/dsa/problem/reverse-singly-chain', hint: 'Pointers • Easy' },
  { id: 'prob-5', title: 'Search in Rotated Sorted Array', category: 'DSA Problem', url: '/dashboard/dsa/problem/search-in-rotated-range', hint: 'Binary Search • Medium' },
  // Companies
  { id: 'comp-amzn', title: 'Amazon Placement Hub', category: 'Company Hub', url: '/dashboard/companies?company=amazon', hint: 'Sliding Window, Trees' },
  { id: 'comp-msft', title: 'Microsoft Placement Hub', category: 'Company Hub', url: '/dashboard/companies?company=microsoft', hint: 'Strings, Linked Lists' },
  { id: 'comp-goog', title: 'Google Placement Hub', category: 'Company Hub', url: '/dashboard/companies?company=google', hint: 'Dynamic Programming, Graphs' },
  { id: 'comp-tcs', title: 'TCS Placement Hub', category: 'Company Hub', url: '/dashboard/companies?company=tcs', hint: 'Array Manipulation, Math' },
  // Core CS
  { id: 'quiz-dbms', title: 'DBMS Placement Speed Drill', category: 'Core CS Drill', url: '/dashboard/core-cs?quiz=dbms-placement-quiz', hint: '10 MCQs • ACID, Indexing' },
  { id: 'quiz-os', title: 'Operating Systems Concurrency Drill', category: 'Core CS Drill', url: '/dashboard/core-cs?quiz=os-placement-quiz', hint: '10 MCQs • Paging, Mutex' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.hint?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a problem, topic, company, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching resources found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.url)}
                className="w-full p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                    {item.category === 'DSA Problem' ? (
                      <Code2 className="w-4 h-4" />
                    ) : item.category === 'Company Hub' ? (
                      <Building2 className="w-4 h-4" />
                    ) : item.category === 'Core CS Drill' ? (
                      <Cpu className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                      {item.title}
                    </div>
                    {item.hint && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.hint}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with click or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
