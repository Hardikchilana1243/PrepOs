import React from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  Target,
  Brain,
  Star,
  Calendar,
} from 'lucide-react';
import { CompanyActivityItem } from '@/lib/services/companies';
import { CompanyEmptyState } from './company-empty-state';

interface CompanyHistoryProps {
  companyName: string;
  history: CompanyActivityItem[];
}

export function CompanyHistory({ companyName, history }: CompanyHistoryProps) {
  if (history.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Preparation Activity Log — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Persisted timeline of student submissions, assessments, and diagnostic attempts
            </p>
          </div>
        </div>

        <CompanyEmptyState
          icon={Calendar}
          title="No Preparation Activity Logged Yet"
          description={`No submissions or assessment attempts have been recorded for ${companyName} problems yet. Solve your first tagged problem above to start calibrating your activity timeline.`}
        />
      </section>
    );
  }

  const formatActivityDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Preparation Activity Log — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Audit trail of authenticated submissions and simulations associated with this firm
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-slate-500">
          {history.length} Event{history.length > 1 ? 's' : ''} Recorded
        </span>
      </div>

      {/* Timeline items */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {history.map((event) => {
          let Icon = Clock;
          let iconColor = 'bg-blue-500 text-white';

          if (event.type === 'PROBLEM_SOLVED') {
            Icon = CheckCircle2;
            iconColor = 'bg-emerald-600 text-white';
          } else if (event.type === 'ASSESSMENT_COMPLETED') {
            Icon = Target;
            iconColor = 'bg-indigo-600 text-white';
          } else if (event.type === 'QUIZ_ATTEMPTED') {
            Icon = Brain;
            iconColor = 'bg-purple-600 text-white';
          }

          return (
            <div key={event.id} className="relative flex items-start justify-between gap-4">
              {/* Timeline marker */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${iconColor}`}
              >
                <Icon className="w-3 h-3" />
              </div>

              {/* Event Content */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900">
                    {event.title}
                  </h3>
                  {event.badge && (
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {event.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{event.detail}</p>
              </div>

              {/* Timestamp */}
              <span className="font-mono text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                {formatActivityDate(event.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
