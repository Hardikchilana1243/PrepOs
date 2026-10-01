'use client';

// ============================================================================
// PREPOS READINESS TREND ANALYTICS COMPONENT
// Lightweight, zero-dependency SVG charts with accessible textual summaries
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Info,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { ReadinessTrendData } from '@/lib/services/readiness-cockpit';

interface ReadinessTrendsProps {
  trends: ReadinessTrendData;
}

export function ReadinessTrends({ trends }: ReadinessTrendsProps) {
  const [activeMetric, setActiveMetric] = useState<'PRS' | 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'REVISION'>('PRS');

  if (!trends.hasSufficientHistory) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4" id="trends">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Readiness Trend Trajectory
            </h2>
            <p className="text-xs text-slate-500">Historical performance analytics and consistency velocity</p>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-200/60 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              Trajectory Establishing
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              PrepOS requires multiple active days and diagnostic records to plot reliable placement trajectories. As you solve problems, take assessments, and review flashcards, your performance graphs will appear here.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-lg mx-auto text-left">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">DSA Activity</div>
              <div className="text-sm font-mono font-bold text-slate-800">
                {trends.dsaSubmissions.length} days
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Core CS Tests</div>
              <div className="text-sm font-mono font-bold text-slate-800">
                {trends.coreCsScores.length} logged
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">OA Attempts</div>
              <div className="text-sm font-mono font-bold text-slate-800">
                {trends.assessmentScores.length} logged
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Revision Days</div>
              <div className="text-sm font-mono font-bold text-slate-800">
                {trends.revisionConsistency.length} active
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render SVG charts when sufficient data exists
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5" id="trends">
      {/* Header & Metric Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900 text-white">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Readiness Performance Trajectory
            </h2>
            <p className="text-xs text-slate-500">Historical velocity derived from actual submissions and scores</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {(
            [
              { key: 'PRS', label: 'PRS Score' },
              { key: 'DSA', label: 'DSA Activity' },
              { key: 'CORE_CS', label: 'Core CS Scores' },
              { key: 'ASSESSMENT', label: 'OA Results' },
              { key: 'REVISION', label: 'Revision Volume' },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeMetric === m.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-2">
        {activeMetric === 'PRS' && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Placement Readiness Score History</span>
              <span className="font-mono text-slate-500">
                Latest: {trends.prsHistory[trends.prsHistory.length - 1]?.score ?? 0}/100
              </span>
            </div>

            {/* Accessible Line Chart */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
              <svg
                viewBox="0 0 500 160"
                className="w-full h-40 overflow-visible"
                role="img"
                aria-label="Placement Readiness Score trend line chart over time"
              >
                {/* Grid lines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="70" x2="490" y2="70" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="490" y2="120" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Y-axis labels */}
                <text x="32" y="24" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">100</text>
                <text x="32" y="74" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">50</text>
                <text x="32" y="124" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">0</text>

                {/* Polyline */}
                {(() => {
                  const data = trends.prsHistory;
                  if (data.length === 0) return null;
                  const stepX = 450 / Math.max(1, data.length - 1);
                  const points = data
                    .map((d, i) => {
                      const x = 40 + i * stepX;
                      const y = 120 - (d.score / 100) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        points={points}
                      />
                      {data.map((d, i) => {
                        const cx = 40 + i * stepX;
                        const cy = 120 - (d.score / 100) * 100;
                        return (
                          <g key={i}>
                            <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
                            <text
                              x={cx}
                              y="145"
                              textAnchor="middle"
                              fontSize="9"
                              fill="#64748b"
                              fontFamily="monospace"
                            >
                              {d.date.slice(5)}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              <div className="sr-only">
                <table>
                  <caption>Placement Readiness Score History</caption>
                  <thead>
                    <tr><th>Date</th><th>Score</th></tr>
                  </thead>
                  <tbody>
                    {trends.prsHistory.map((p, idx) => (
                      <tr key={idx}><td>{p.date}</td><td>{p.score}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeMetric === 'DSA' && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Daily DSA Submissions</span>
              <span className="font-mono text-slate-500">
                Total submissions: {trends.dsaSubmissions.reduce((a, b) => a + b.count, 0)}
              </span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
              <svg
                viewBox="0 0 500 160"
                className="w-full h-40 overflow-visible"
                role="img"
                aria-label="Bar chart showing daily DSA submission counts"
              >
                {/* Horizontal baseline */}
                <line x1="40" y1="120" x2="490" y2="120" stroke="#cbd5e1" strokeWidth="1" />

                {(() => {
                  const data = trends.dsaSubmissions;
                  if (data.length === 0) return null;
                  const maxCount = Math.max(1, ...data.map((d) => d.count));
                  const stepX = 450 / data.length;
                  const barWidth = Math.min(28, stepX * 0.7);

                  return data.map((d, i) => {
                    const x = 40 + i * stepX + (stepX - barWidth) / 2;
                    const barHeight = (d.count / maxCount) * 90;
                    const y = 120 - barHeight;

                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(2, barHeight)}
                          fill="#2563eb"
                          rx="4"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#1e293b"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {d.count > 0 ? d.count : ''}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y="140"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {d.date.slice(5)}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>

              <div className="sr-only">
                <table>
                  <caption>DSA Submissions Activity</caption>
                  <thead>
                    <tr><th>Date</th><th>Submissions</th></tr>
                  </thead>
                  <tbody>
                    {trends.dsaSubmissions.map((p, idx) => (
                      <tr key={idx}><td>{p.date}</td><td>{p.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeMetric === 'CORE_CS' && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Core CS Diagnostic Progress</span>
              <span className="font-mono text-slate-500">
                {trends.coreCsScores.length} diagnostics taken
              </span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2">
              {trends.coreCsScores.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No diagnostic attempts recorded yet.</div>
              ) : (
                <div className="space-y-2">
                  {trends.coreCsScores.map((attempt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{attempt.date}</span>
                        <span className="font-medium text-slate-900">{attempt.quizTitle}</span>
                      </div>
                      <span className={`font-mono font-bold ${attempt.scorePct >= 70 ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {attempt.scorePct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeMetric === 'ASSESSMENT' && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Mock OA Score Velocity</span>
              <span className="font-mono text-slate-500">
                {trends.assessmentScores.length} assessments completed
              </span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2">
              {trends.assessmentScores.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No assessments completed yet.</div>
              ) : (
                <div className="space-y-2">
                  {trends.assessmentScores.map((attempt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{attempt.date}</span>
                        <span className="font-medium text-slate-900">{attempt.assessmentTitle}</span>
                      </div>
                      <span className={`font-mono font-bold ${attempt.scorePct >= 70 ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {attempt.scorePct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeMetric === 'REVISION' && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Spaced Revision Volume</span>
              <span className="font-mono text-slate-500">
                Total reviewed: {trends.revisionConsistency.reduce((a, b) => a + b.count, 0)} cards
              </span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
              <svg
                viewBox="0 0 500 160"
                className="w-full h-40 overflow-visible"
                role="img"
                aria-label="Bar chart showing daily spaced revision reviews"
              >
                <line x1="40" y1="120" x2="490" y2="120" stroke="#cbd5e1" strokeWidth="1" />

                {(() => {
                  const data = trends.revisionConsistency;
                  if (data.length === 0) return null;
                  const maxCount = Math.max(1, ...data.map((d) => d.count));
                  const stepX = 450 / data.length;
                  const barWidth = Math.min(28, stepX * 0.7);

                  return data.map((d, i) => {
                    const x = 40 + i * stepX + (stepX - barWidth) / 2;
                    const barHeight = (d.count / maxCount) * 90;
                    const y = 120 - barHeight;

                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(2, barHeight)}
                          fill="#f59e0b"
                          rx="4"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#1e293b"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {d.count > 0 ? d.count : ''}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y="140"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {d.date.slice(5)}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>

              <div className="sr-only">
                <table>
                  <caption>Spaced Revision Consistency Activity</caption>
                  <thead>
                    <tr><th>Date</th><th>Reviews</th></tr>
                  </thead>
                  <tbody>
                    {trends.revisionConsistency.map((p, idx) => (
                      <tr key={idx}><td>{p.date}</td><td>{p.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
