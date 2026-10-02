'use client';

// ============================================================================
// PREPOS READINESS ACTIVITY TIMELINE COMPONENT
// Chronological stream of authenticated preparation events & milestones
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Code2,
  BookOpen,
  Clock,
  Repeat,
  ShieldCheck,
  Building2,
  ArrowRight,
  History,
} from 'lucide-react';
import { FinalReadinessExecutionData, ReadinessActivityEvent } from '@/lib/services/readiness-execution';

interface ReadinessActivityProps {
  activityTimeline: FinalReadinessExecutionData['activityTimeline'];
}

export function ReadinessActivity({ activityTimeline }: ReadinessActivityProps) {
  const { events } = activityTimeline;

  const getEventIcon = (type: ReadinessActivityEvent['type']) => {
    switch (type) {
      case 'DSA_SUBMISSION':
        return Code2;
      case 'QUIZ_ATTEMPT':
        return BookOpen;
      case 'ASSESSMENT_ATTEMPT':
        return Clock;
      case 'REVISION_REVIEW':
        return Repeat;
      case 'DOSSIER_GENERATED':
      case 'VERIFICATION_ACCESSED':
        return ShieldCheck;
      case 'TARGET_SET':
      default:
        return Building2;
    }
  };

  const getStatusBadge = (variant: ReadinessActivityEvent['statusVariant']) => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'slate':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <section id="activity" aria-labelledby="activity-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 id="activity-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Readiness Activity Timeline
            </h2>
            <p className="text-xs text-slate-500">
              Authenticated audit log of recent problem submissions, diagnostic quizzes, and verification events
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
          {events.length} Recent Logged Events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-2 shadow-xs">
          <Activity className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            No Recent Activity Recorded
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your problem submissions, quiz completions, and timed assessments will automatically appear here as authenticated evidence.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {events.map((ev) => {
            const Icon = getEventIcon(ev.type);
            const dateStr = new Date(ev.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ev.id}
                className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className={`p-2 rounded-xl border ${getStatusBadge(ev.statusVariant)} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </span>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {ev.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {ev.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <Link
                    href={ev.url}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors min-h-[36px]"
                  >
                    <span>View Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
