'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Bookmark,
  Clock,
  Building2,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { InterviewPracticeItem } from '@/lib/services/interview';
import { toggleInterviewBookmarkAction } from '@/app/dashboard/interview/actions';

interface InterviewPracticeListProps {
  items: InterviewPracticeItem[];
}

export function InterviewPracticeList({ items }: InterviewPracticeListProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(items.filter((i) => i.isBookmarked).map((i) => i.id))
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleBookmark = async (e: React.MouseEvent, problemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setTogglingId(problemId);
    try {
      const result = await toggleInterviewBookmarkAction(problemId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (result.isBookmarked) {
          next.add(problemId);
        } else {
          next.delete(problemId);
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Matching Interview Questions</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No questions match the current combination of company, topic, difficulty, or review filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
      {items.map((item) => {
        const isBookmarked = bookmarkedIds.has(item.id);
        const diffBadgeClasses = {
          EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200/60',
          HARD: 'bg-rose-50 text-rose-700 border-rose-200/60',
        }[item.difficulty];

        return (
          <div
            key={item.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
          >
            {/* Left side: Status + Title + Metadata */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="pt-0.5 shrink-0">
                {item.isSolved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : item.isAttempted ? (
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={item.practiceUrl}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate"
                  >
                    {item.title}
                  </Link>

                  {/* Difficulty Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadgeClasses}`}
                  >
                    {item.difficulty}
                  </span>

                  {/* Topic Badge */}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.topic}
                  </span>

                  {/* Review Badge */}
                  {item.needsReview && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      Needs Review
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {/* Company Association */}
                  {item.companyNames.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.companyNames.join(', ')}</span>
                    </div>
                  )}

                  {/* Estimated Time */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{item.expectedTimeMin} min interview</span>
                  </div>

                  {/* Last Attempt Info */}
                  {item.lastAttemptDate && (
                    <span>Last attempted: {item.lastAttemptDate}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
              {/* Bookmark Toggle */}
              {item.category === 'DSA' && (
                <button
                  type="button"
                  onClick={(e) => handleToggleBookmark(e, item.id)}
                  disabled={togglingId === item.id}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                  className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                    isBookmarked
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-700' : ''}`}
                  />
                </button>
              )}

              {/* Direct Practice CTA */}
              <Link
                href={item.practiceUrl}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors whitespace-nowrap"
              >
                <span>Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
