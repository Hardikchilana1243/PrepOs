'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT TRENDS SECTION
// Compact, accessible historical velocity tables & summary
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { TrendingUp, Clock } from 'lucide-react';

interface ReportTrendsProps {
  trends: PlacementReadinessReport['trends'];
}

export function ReportTrends({ trends }: ReportTrendsProps) {
  if (!trends.hasSufficientHistory) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Section 9: Historical Trajectory & Velocity</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Baseline Stage</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1.5 text-xs">
          <Clock className="w-5 h-5 text-slate-400 mx-auto" />
          <div className="font-bold text-slate-800">Historical Trajectory Calibrating</div>
          <p className="text-slate-500 text-[11px] max-w-md mx-auto">
            Historical trend curves require multiple distinct study sessions and diagnostic attempts. Current verified baseline data is recorded in individual pillar sections above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Section 9: Historical Trajectory & Velocity</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">Verified Activity Log</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* PRS History Table */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 block text-[11px] uppercase">
            PRS Progression Record
          </span>
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="pb-1 font-semibold">Date</th>
                <th className="pb-1 font-semibold text-right">PRS Score</th>
              </tr>
            </thead>
            <tbody>
              {trends.prsHistory.slice(-5).map((p, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="py-1 text-slate-600">{p.date}</td>
                  <td className="py-1 font-bold text-slate-900 text-right">{p.score} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DSA Submissions Table */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 block text-[11px] uppercase">
            Recent DSA Activity Volume
          </span>
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="pb-1 font-semibold">Date</th>
                <th className="pb-1 font-semibold text-right">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {trends.dsaSubmissions.slice(-5).map((s, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="py-1 text-slate-600">{s.date}</td>
                  <td className="py-1 font-bold text-blue-600 text-right">{s.count} executions</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
