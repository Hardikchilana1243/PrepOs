'use client';

// ============================================================================
// PREPOS REVISION ITEM ROW COMPONENT
// Dense, high-scanability item row with source badges, intervals, and direct CTAs
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Brain,
  Code2,
  Target,
  Building2,
  Bookmark,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';
import { RevisionQueueItem } from '@/lib/services/revision';
import { toggleRevisionBookmarkAction } from '@/app/dashboard/revision/actions';

interface RevisionItemRowProps {
  item: RevisionQueueItem;
  onOpenWorkspace: (item: RevisionQueueItem) => void;
}

export function RevisionItemRow({ item, onOpenWorkspace }: RevisionItemRowProps) {
  const [isBookmarked, setIsBookmarked] = useState(item.isBookmarked);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);

  const handleToggleBookmark = async () => {
    if (!item.problemId || isTogglingBookmark) return;
    setIsTogglingBookmark(true);
    // Optimistic toggle
    setIsBookmarked(!isBookmarked);
    try {
      const res = await toggleRevisionBookmarkAction(item.problemId);
      setIsBookmarked(res.isBookmarked);
    } catch {
      // Revert on error
      setIsBookmarked(item.isBookmarked);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  const getSourceBadge = () => {
    switch (item.sourceType) {
      case 'DSA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Code2 className="w-3 h-3" />
            <span>DSA Algorithm</span>
          </span>
        );
      case 'CORE_CS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Brain className="w-3 h-3" />
            <span>Core CS</span>
          </span>
        );
      case 'ASSESSMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            <Target className="w-3 h-3" />
            <span>OA Mistake</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <span>Recall Item</span>
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    if (item.completedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reviewed</span>
        </span>
      );
    }
    if (item.daysOverdue > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>{item.daysOverdue}d Overdue</span>
        </span>
      );
    }
    if (item.isDue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Due Today</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>In {item.intervalDays}d</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Item Details */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {getSourceBadge()}

          {item.companyName && (
            <Link
              href={`/dashboard/companies/${item.companySlug}`}
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title={`Target Company: ${item.companyName}`}
            >
              <Building2 className="w-3 h-3 text-slate-500" />
              <span>{item.companyName}</span>
            </Link>
          )}

          <span className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
            {item.topicTitle}
          </span>

          {item.difficulty && <DifficultyBadge difficulty={item.difficulty} size="sm" />}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
          {item.title}
        </h3>

        {/* Repetition State Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-0.5">
          <span>Interval: {item.intervalDays}d</span>
          <span>•</span>
          <span>Target Date: {item.dueAt}</span>
          {item.reviewCount > 0 && (
            <>
              <span>•</span>
              <span>Repetition #{item.reviewCount}</span>
            </>
          )}
          {item.confidence && (
            <>
              <span>•</span>
              <span className="capitalize font-sans font-medium text-slate-600">
                Confidence: {item.confidence.toLowerCase()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Action CTA & Status */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        {getStatusBadge()}

        {/* Bookmark button if problemId present */}
        {item.problemId && (
          <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={isTogglingBookmark}
            className={`p-2 rounded-xl border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isBookmarked ? 'Bookmarked item' : 'Bookmark for priority review'}
            aria-label="Toggle bookmark"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
              }`}
            />
          </button>
        )}

        {/* Primary Action Button */}
        {item.sourceType === 'DSA' ? (
          <button
            type="button"
            onClick={() => onOpenWorkspace(item)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors min-h-[40px] ${
              item.isDue || item.daysOverdue > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{item.isDue || item.daysOverdue > 0 ? 'Review Recall' : 'Inspect'}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        ) : item.sourceType === 'CORE_CS' ? (
          <Link
            href="/dashboard/core-cs"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Practice Quiz</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        ) : (
          <Link
            href={`/dashboard/assessments/${item.assessmentSlug || ''}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Open Assessment</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
