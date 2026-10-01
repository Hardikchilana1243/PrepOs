'use client';

// ============================================================================
// PREPOS ASSESSMENT PERFORMANCE CHART COMPONENT
// Real-data historical trendline (SVG) with benchmark reference and honest empty state
// ============================================================================

import React, { useState } from 'react';
import { TrendingUp, AlertCircle, Calendar, Target } from 'lucide-react';
import { HistoricalAttemptItem } from '@/lib/services/assessment';

interface AssessmentPerformanceChartProps {
  attempts: HistoricalAttemptItem[];
  passingScorePct: number;
}

export function AssessmentPerformanceChart({
  attempts,
  passingScorePct,
}: AssessmentPerformanceChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // If fewer than 2 attempts, honestly display that trend data is unavailable
  if (!attempts || attempts.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Score Progression Trend
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-mono">
            {attempts?.length ?? 0} Sitting Recorded
          </span>
        </div>

        <div className="py-8 px-4 text-center space-y-2.5 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Performance trend requires at least 2 completed assessment attempts
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Historical trajectory lines are plotted strictly from real database records.
            Retake this simulation after reviewing weak areas to see your preparation score trajectory over time.
          </p>
        </div>
      </div>
    );
  }

  // Calculate SVG coordinates
  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = attempts.map((att, idx) => {
    const x = paddingX + (idx / (attempts.length - 1)) * usableWidth;
    const y = paddingY + (1 - Math.min(100, Math.max(0, att.scorePct)) / 100) * usableHeight;
    return { x, y, attempt: att, idx };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Cutoff Y coordinate
  const cutoffY = paddingY + (1 - Math.min(100, Math.max(0, passingScorePct)) / 100) * usableHeight;

  // Score progression calculation
  const firstScore = attempts[0].scorePct;
  const latestScore = attempts[attempts.length - 1].scorePct;
  const scoreDiff = latestScore - firstScore;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Score Progression Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical score trajectory across {attempts.length} completed sittings
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Progression:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              scoreDiff >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-xl border border-slate-200/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal guidelines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x={paddingX - 6} y={paddingY + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            100%
          </text>

          <line
            x1={paddingX}
            y1={paddingY + usableHeight / 2}
            x2={width - paddingX}
            y2={paddingY + usableHeight / 2}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={paddingX - 6}
            y={paddingY + usableHeight / 2 + 4}
            textAnchor="end"
            fontSize="10"
            fill="#94a3b8"
          >
            50%
          </text>

          {/* Benchmark Cutoff Line */}
          <line
            x1={paddingX}
            y1={cutoffY}
            x2={width - paddingX}
            y2={cutoffY}
            stroke="#f59e0b"
            strokeDasharray="6 3"
            strokeWidth="1.5"
          />
          <text
            x={width - paddingX + 4}
            y={cutoffY + 3}
            textAnchor="start"
            fontSize="9"
            fontWeight="bold"
            fill="#d97706"
          >
            Cutoff ({passingScorePct}%)
          </text>

          {/* Area under curve */}
          {points.length > 0 && (
            <polygon
              points={`${points[0].x},${height - paddingY} ${polylinePoints} ${
                points[points.length - 1].x
              },${height - paddingY}`}
              fill="url(#scoreGradient)"
            />
          )}

          {/* Trend Polyline */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Individual Data Points */}
          {points.map((p) => {
            const isHovered = hoveredIdx === p.idx;
            const isPassed = p.attempt.scorePct >= passingScorePct;

            return (
              <g
                key={p.attempt.id}
                onMouseEnter={() => setHoveredIdx(p.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 5}
                  fill={isPassed ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Attempt Number Label on bottom */}
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="#64748b"
                >
                  #{p.attempt.attemptNumber}
                </text>

                {/* Score Label above point */}
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                >
                  {p.attempt.scorePct}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover detail card if hovered */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white p-2.5 rounded-lg text-xs font-mono shadow-lg backdrop-blur pointer-events-none">
            <div className="font-bold text-slate-100">
              Attempt #{points[hoveredIdx].attempt.attemptNumber} — {points[hoveredIdx].attempt.scorePct}%
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {new Date(points[hoveredIdx].attempt.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="text-[10px] text-slate-300">
              {Math.floor(points[hoveredIdx].attempt.durationTakenSec / 60)}m taken •{' '}
              {points[hoveredIdx].attempt.passed ? 'Passed' : 'Needs Practice'}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Green dot = Cleared benchmark cutoff</span>
        <span>Amber dot = Below benchmark cutoff</span>
      </div>
    </div>
  );
}
