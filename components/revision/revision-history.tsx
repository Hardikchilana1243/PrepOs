'use client';

// ============================================================================
// PREPOS REVISION HISTORY COMPONENT
// Feed of recent review events derived strictly from real database records
// ============================================================================

import React from 'react';
import { History, CheckCircle2, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface ReviewActivityItem {
  id: string;
  title: string;
  confidence: string;
  nextIntervalDays: number;
  timestamp: string;
}

interface RevisionHistoryProps {
  activity: ReviewActivityItem[];
}

export function RevisionHistory({ activity }: RevisionHistoryProps) {
  if (activity.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 text-center shadow-xs space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-900">No Review History Recorded Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Complete due items in your active recall queue to build your persisted retention log and keep track of interval progression.
        </p>
      </div>
    );
  }

  const getRatingBadge = (confidence: string) => {
    switch (confidence.toUpperCase()) {
      case 'AGAIN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HARD':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'GOOD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Review History</h3>
            <p className="text-[11px] text-slate-500">
              Persisted SM-2 completion log from your study sessions
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Last {activity.length} event{activity.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
        {activity.map((item) => {
          const formattedDate = new Date(item.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-semibold text-slate-900 truncate max-w-sm sm:max-w-md">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRatingBadge(
                    item.confidence
                  )}`}
                >
                  {item.confidence}
                </span>

                <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                  +{item.nextIntervalDays}d
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
