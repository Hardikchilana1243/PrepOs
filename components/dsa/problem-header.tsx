'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ChevronRight,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';

interface ProblemHeaderProps {
  title: string;
  difficulty: string;
  moduleTitle: string;
  topicTitle: string;
  companies: string[];
  isSolved: boolean;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onToggleBookmark: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export function ProblemHeader({
  title,
  difficulty,
  moduleTitle,
  topicTitle,
  companies,
  isSolved,
  isBookmarked,
  isBookmarkPending,
  onToggleBookmark,
  isFocusMode,
  onToggleFocusMode,
}: ProblemHeaderProps) {
  return (
    <header className="pb-3 border-b border-slate-200/80 space-y-2">
      {/* Top Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap"
      >
        <Link
          href="/dashboard/dsa"
          className="hover:text-slate-900 inline-flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>DSA Roadmap</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 truncate max-w-[150px]">{moduleTitle}</span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 truncate max-w-[150px]">{topicTitle}</span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">
          {title}
        </span>
      </nav>

      {/* Main Title Row with Meta Badges & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          <DifficultyBadge difficulty={difficulty} size="sm" />

          {/* Solved Status */}
          {isSolved && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solved</span>
            </span>
          )}

          {/* Company Badges */}
          {companies.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {companies.slice(0, 3).map((comp) => (
                <span
                  key={comp}
                  className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-medium"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls (Bookmark & Focus Mode) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={onToggleBookmark}
            disabled={isBookmarkPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isBookmarked
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark problem'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-slate-400'
              }`}
            />
            <span className="hidden xs:inline">
              {isBookmarked ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Focus Mode Toggle */}
          <button
            type="button"
            onClick={onToggleFocusMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
            title={isFocusMode ? 'Exit focus mode' : 'Expand full width'}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xs:inline">Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xs:inline">Focus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
