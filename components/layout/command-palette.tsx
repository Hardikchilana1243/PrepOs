'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Target,
  Sparkles,
  LayoutDashboard,
  CornerDownLeft,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: 'Preparation' | 'Navigation' | 'DSA' | 'Core CS' | 'Companies' | 'Assessments' | 'Revision & Profile';
  url: string;
  hint: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Preparation
  { id: 'prep-plan', title: 'Preparation Plan', category: 'Preparation', url: '/dashboard/plan', hint: 'Adaptive Study Orchestration & Weekly Targets' },
  { id: 'prep-rec', title: 'Recommended Next Step', category: 'Preparation', url: '/dashboard/plan', hint: 'Highest-Impact Placement Task' },

  // Navigation
  { id: 'nav-dash', title: 'Dashboard', category: 'Navigation', url: '/dashboard', hint: 'Overview & Today\'s Missions' },
  { id: 'nav-plan', title: 'Preparation Plan Route', category: 'Navigation', url: '/dashboard/plan', hint: 'Adaptive Engine & Quotas' },
  { id: 'nav-dsa', title: 'DSA Roadmap', category: 'Navigation', url: '/dashboard/dsa', hint: '14 Modules & 20 Problems' },
  { id: 'nav-corecs', title: 'Core CS Learning Hub', category: 'Navigation', url: '/dashboard/core-cs', hint: 'DBMS & Operating Systems' },
  { id: 'nav-revision', title: 'Spaced Revision Queue', category: 'Navigation', url: '/dashboard/revision', hint: 'SM-2 Active Recall' },
  { id: 'nav-companies', title: 'Company Preparation Hubs', category: 'Navigation', url: '/dashboard/companies', hint: '10 Recruiter Hubs & Patterns' },
  { id: 'nav-assessments', title: 'Mock OA Simulations', category: 'Navigation', url: '/dashboard/assessments', hint: 'Timed Placement Assessments' },
  { id: 'nav-profile', title: 'Readiness Command Center', category: 'Navigation', url: '/dashboard/profile', hint: 'PRS v1 Score & Profile Settings' },

  // DSA Problems
  { id: 'prob-1', title: 'Array Element Frequency Counter', category: 'DSA', url: '/dashboard/dsa/problem/array-element-frequency-counter', hint: 'Arrays & Hashing • Easy' },
  { id: 'prob-2', title: 'Two Sum in Sorted Sequence', category: 'DSA', url: '/dashboard/dsa/problem/two-sum-target-search', hint: 'Two Pointers • Easy' },
  { id: 'prob-3', title: 'Maximum Subarray Running Sum', category: 'DSA', url: '/dashboard/dsa/problem/max-subarray-sum-range', hint: 'Prefix Sums • Easy' },
  { id: 'prob-4', title: 'Longest Contiguous Substring Without Repeats', category: 'DSA', url: '/dashboard/dsa/problem/longest-substring-without-repeating', hint: 'Sliding Window • Medium' },
  { id: 'prob-5', title: 'Valid Parentheses and Bracket Pairs', category: 'DSA', url: '/dashboard/dsa/problem/valid-parentheses-matching', hint: 'Stack • Easy' },
  { id: 'prob-6', title: 'Search in Rotated Sorted Array', category: 'DSA', url: '/dashboard/dsa/problem/search-in-rotated-range', hint: 'Binary Search • Medium' },
  { id: 'prob-7', title: 'Reverse Singly Linked List', category: 'DSA', url: '/dashboard/dsa/problem/reverse-singly-chain', hint: 'Linked Lists • Easy' },
  { id: 'prob-8', title: 'Invert Binary Tree', category: 'DSA', url: '/dashboard/dsa/problem/invert-binary-tree-structure', hint: 'Binary Trees • Easy' },
  { id: 'prob-9', title: 'Validate Binary Search Tree Invariant', category: 'DSA', url: '/dashboard/dsa/problem/validate-bst-property', hint: 'BST • Medium' },
  { id: 'prob-10', title: 'Climbing Stairs Dynamic Programming', category: 'DSA', url: '/dashboard/dsa/problem/climbing-stairs-memoization', hint: 'Dynamic Programming • Easy' },

  // Core CS Subjects & Topics
  { id: 'cs-dbms-hub', title: 'DBMS Screening Diagnostic', category: 'Core CS', url: '/dashboard/core-cs?subject=dbms', hint: '10 MCQs • ACID, B+ Trees, Normalization' },
  { id: 'cs-os-hub', title: 'Operating Systems Screening Diagnostic', category: 'Core CS', url: '/dashboard/core-cs?subject=os', hint: '10 MCQs • Paging, Deadlocks, Mutex' },
  { id: 'cs-dbms-trans', title: 'Transactions & ACID Isolation Levels', category: 'Core CS', url: '/dashboard/core-cs?subject=dbms', hint: 'DBMS Concept • Placement Essential' },
  { id: 'cs-os-sched', title: 'CPU Process Scheduling Algorithms', category: 'Core CS', url: '/dashboard/core-cs?subject=os', hint: 'OS Concept • Round Robin & Priority' },

  // Companies
  { id: 'comp-amzn', title: 'Amazon Placement Hub', category: 'Companies', url: '/dashboard/companies?company=amazon', hint: 'Tier-1 Tech • Sliding Window, Trees' },
  { id: 'comp-goog', title: 'Google Placement Hub', category: 'Companies', url: '/dashboard/companies?company=google', hint: 'Tier-1 Tech • DP, Graphs' },
  { id: 'comp-msft', title: 'Microsoft Placement Hub', category: 'Companies', url: '/dashboard/companies?company=microsoft', hint: 'Tier-1 Tech • Strings, Binary Search' },
  { id: 'comp-uber', title: 'Uber Placement Hub', category: 'Companies', url: '/dashboard/companies?company=uber', hint: 'Tier-1 Tech • System Algorithms' },
  { id: 'comp-flpk', title: 'Flipkart Placement Hub', category: 'Companies', url: '/dashboard/companies?company=flipkart', hint: 'Product • Hash Tables & DP' },
  { id: 'comp-gold', title: 'Goldman Sachs Placement Hub', category: 'Companies', url: '/dashboard/companies?company=goldman-sachs', hint: 'Product • Math & Arrays' },
  { id: 'comp-tcs', title: 'TCS Placement Hub', category: 'Companies', url: '/dashboard/companies?company=tcs', hint: 'High-Impact IT • Core Logic' },

  // Assessments
  { id: 'oa-amzn', title: 'Amazon SDE-1 OA Simulation', category: 'Assessments', url: '/dashboard/assessments/amazon-sde-oa', hint: '60 mins • Coding & Core CS MCQ' },
  { id: 'oa-hub', title: 'All Mock OA Simulations', category: 'Assessments', url: '/dashboard/assessments', hint: 'Timed Exam Directory' },

  // Revision & Profile
  { id: 'rev-queue', title: 'Active Recall Spaced Queue', category: 'Revision & Profile', url: '/dashboard/revision', hint: 'SM-2 Recall Intervals' },
  { id: 'prof-prs', title: 'Placement Readiness Score (PRS)', category: 'Revision & Profile', url: '/dashboard/profile', hint: '4-Factor Breakdown: 40/30/15/15' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter items
  const filtered = SEARCH_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.hint.toLowerCase().includes(q)
    );
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Arrow key handling
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].url);
      }
    }
  };

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category: SearchItem['category']) => {
    switch (category) {
      case 'Preparation':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      case 'Navigation':
        return <LayoutDashboard className="w-4 h-4 text-blue-600" />;
      case 'DSA':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'Core CS':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'Companies':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'Assessments':
        return <Target className="w-4 h-4 text-emerald-600" />;
      default:
        return <RotateCcw className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global Command Palette"
        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a problem, company, concept, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching resources found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-left ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 ring-1 ring-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.hint}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
            <span>•</span>
            <span>esc to close</span>
          </div>

          <span className="hidden sm:inline">{filtered.length} resources</span>
        </div>
      </div>
    </div>
  );
}
