import React from 'react';
import Link from 'next/link';
import {
  History,
  Code2,
  Cpu,
  Target,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { InterviewHistoryEvent } from '@/lib/services/interview';

interface InterviewHistoryProps {
  history: InterviewHistoryEvent[];
}

export function InterviewHistory({ history }: InterviewHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-xs space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No Interview History Recorded</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          As you execute practice sessions, solve problems, and review weak areas, your chronological preparation timeline will materialize here.
        </p>
      </div>
    );
  }

  const getEventIcon = (type: InterviewHistoryEvent['type']) => {
    switch (type) {
      case 'PRACTICE_COMPLETED':
        return Sparkles;
      case 'DSA_SUBMISSION':
        return Code2;
      case 'QUIZ_ATTEMPT':
        return Cpu;
      case 'ASSESSMENT_ATTEMPT':
        return Target;
      case 'REVISION_REVIEW':
        return RotateCcw;
      case 'BOOKMARK_TOGGLED':
        return Bookmark;
      default:
        return History;
    }
  };

  const getVariantClasses = (variant: InterviewHistoryEvent['statusVariant']) => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <span>Interview Practice History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological log of verified practice sessions, diagnostic attempts, and algorithmic submissions.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500">
          {history.length} Events Logged
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {history.map((event) => {
          const Icon = getEventIcon(event.type);
          const badgeClass = getVariantClasses(event.statusVariant);

          return (
            <div
              key={event.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {event.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate">{event.description}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {event.url && (
                <Link
                  href={event.url}
                  className="min-h-[38px] px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center justify-center gap-1 shrink-0 self-end sm:self-center transition-colors"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
