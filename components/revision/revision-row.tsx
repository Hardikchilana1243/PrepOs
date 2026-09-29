'use client';

import React from 'react';
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
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';
import { RevisionDetailItem } from './revision-workspace';

interface RevisionRowProps {
  item: RevisionDetailItem;
  onOpenWorkspace: (item: RevisionDetailItem) => void;
}

export function RevisionRow({ item, onOpenWorkspace }: RevisionRowProps) {
  const getStatusBadge = () => {
    if (item.daysOverdue && item.daysOverdue > 0) {
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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Scheduled</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Item Details */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {item.sourceType === 'DSA' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              <Code2 className="w-3 h-3" />
              DSA Algorithm
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Brain className="w-3 h-3" />
              Core CS
            </span>
          )}

          <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
            {item.topicTitle}
          </span>

          {item.difficulty && <DifficultyBadge difficulty={item.difficulty} size="sm" />}
        </div>

        <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
          {item.title}
        </h3>

        {/* Interval and Repetition State */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-0.5">
          <span>Interval: {item.intervalDays}d</span>
          <span>•</span>
          <span>Target Date: {item.dueAt}</span>
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

        <button
          type="button"
          onClick={() => onOpenWorkspace(item)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors min-h-[40px] ${
            item.isDue || (item.daysOverdue && item.daysOverdue > 0)
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{item.isDue ? 'Review Recall' : 'Inspect'}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
