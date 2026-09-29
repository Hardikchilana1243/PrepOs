'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

interface SubmissionItem {
  id: string;
  language: string;
  status: string;
  executionTime: number | null;
  memoryKb: number | null;
  passedTests: number;
  totalTests: number;
  errorLog: string | null;
  createdAt: string;
}

interface SubmissionHistoryProps {
  submissions: SubmissionItem[];
}

export function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-200">
        No submissions recorded for this problem yet. Submit your code to track historical results.
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Wrong Answer</span>
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>TLE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Past Submissions ({submissions.length})
        </h3>
        <span className="text-[11px] text-slate-400">Recorded server attempts</span>
      </div>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden">
        {submissions.map((sub) => {
          const isExpanded = expandedId === sub.id;
          const dateFormatted = new Date(sub.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={sub.id} className="text-xs">
              <button
                type="button"
                onClick={() => toggleExpand(sub.id)}
                className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>{getStatusBadge(sub.status)}</div>

                  <span className="font-mono font-medium text-slate-700 uppercase text-[11px]">
                    {sub.language}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                  {sub.totalTests > 0 && (
                    <span>
                      {sub.passedTests} / {sub.totalTests} tests
                    </span>
                  )}
                  {sub.executionTime !== null && (
                    <span>{sub.executionTime} ms</span>
                  )}
                  <span className="text-slate-400 hidden sm:inline">
                    {dateFormatted}
                  </span>
                </div>
              </button>

              {/* Expandable Error/Log details */}
              {isExpanded && sub.errorLog && (
                <div className="px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/70 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Error Log:
                  </span>
                  <pre className="p-2.5 rounded bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    {sub.errorLog}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
