'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT INSIGHTS SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ReportInsightsProps {
  insights: PlacementReadinessReport['insights'];
}

export function ReportInsights({ insights }: ReportInsightsProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RECOMMENDED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'POSITIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>Section 7: Deterministic Diagnostic Observations</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">
          {insights.length} Diagnostic Findings
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getSeverityBadge(
                  ins.severity
                )}`}
              >
                {ins.severity}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                {ins.category}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs">{ins.title}</h4>
              <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                Evidence: {ins.supportingMetric}
              </div>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-700">Placement impact: </span>
              {ins.whyItMatters}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
