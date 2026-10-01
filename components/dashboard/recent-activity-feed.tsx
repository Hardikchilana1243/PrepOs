'use client';

// ============================================================================
// PREPOS RECENT ACTIVITY FEED COMPONENT
// Real-time persisted cross-pillar student activity feed with user isolation
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Code2,
  Cpu,
  Target,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { CrossPillarActivityItem } from '@/lib/services/global-search';

interface RecentActivityFeedProps {
  activities: CrossPillarActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 text-center shadow-xs space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Activity className="w-5 h-5" />
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">No Recent Activity Recorded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Solve algorithmic problems, complete diagnostic quizzes, or finish mock assessments to
          populate your real-time preparation event log.
        </p>
      </div>
    );
  }

  const getEventIcon = (type: CrossPillarActivityItem['type']) => {
    switch (type) {
      case 'PROBLEM_SOLVED':
      case 'DSA_SUBMISSION':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'QUIZ_COMPLETED':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'ASSESSMENT_SUBMITTED':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'REVISION_COMPLETED':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadgeStyle = (variant?: CrossPillarActivityItem['statusVariant']) => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Cross-Pillar Preparation Activity
            </h2>
            <p className="text-[11px] text-slate-500">
              Authenticated audit log across DSA, Core CS, OAs, and Spaced Recall
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400">
          Last {activities.length} event{activities.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((act) => {
          const dateStr = new Date(act.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={act.id}
              className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl transition-colors text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                  {getEventIcon(act.type)}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="font-bold text-slate-900 truncate">{act.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="truncate">{act.description}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono shrink-0">{dateStr}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {act.statusText && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadgeStyle(
                      act.statusVariant
                    )}`}
                  >
                    {act.statusText}
                  </span>
                )}

                {act.url && (
                  <Link
                    href={act.url}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Open Resource"
                    aria-label="Open Activity Resource"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
