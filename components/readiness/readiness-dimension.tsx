'use client';

// ============================================================================
// PREPOS READINESS DIMENSION CARD COMPONENT
// Granular dimension breakdown card with status, metrics, trend, and direct CTA
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  Building2,
  Target,
  RotateCcw,
  TrendingUp,
  Minus,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ReadinessDimensionData } from '@/lib/services/readiness-cockpit';

interface ReadinessDimensionProps {
  dimension: ReadinessDimensionData;
}

export function ReadinessDimension({ dimension }: ReadinessDimensionProps) {
  const getDimensionIcon = () => {
    switch (dimension.key) {
      case 'DSA':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'COMPANY':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'ASSESSMENT':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'REVISION':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (dimension.status) {
      case 'EXCELLENT':
        return { text: 'Excellent', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'ON_TRACK':
        return { text: 'On Track', class: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ATTENTION_NEEDED':
        return { text: 'Attention', class: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'CRITICAL_GAP':
        return { text: 'Action Needed', class: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  const getTrendIcon = () => {
    switch (dimension.recentTrend) {
      case 'IMPROVING':
        return (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Improving</span>
          </span>
        );
      case 'DECLINING':
        return (
          <span className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Declining</span>
          </span>
        );
      case 'STEADY':
        return (
          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
            <Minus className="w-3.5 h-3.5" />
            <span>Steady</span>
          </span>
        );
      case 'INSUFFICIENT_DATA':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>Establishing</span>
          </span>
        );
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
      <div className="space-y-3">
        {/* Header & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
              {getDimensionIcon()}
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{dimension.name}</h3>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge.class}`}
          >
            {badge.text}
          </span>
        </div>

        {/* Dimension Metric & Score Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-xs font-semibold text-slate-600">{dimension.metricLabel}</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {dimension.score}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, dimension.score)}%` }}
            />
          </div>
        </div>

        {/* Factual Highlights List */}
        <ul className="space-y-1 text-xs text-slate-600 pt-1">
          {dimension.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px]">
              <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              <span className="truncate">{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Meta & Direct CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          {getTrendIcon()}
          {dimension.lastActivityDate && (
            <div className="text-[10px] text-slate-400 font-mono">
              Active: {dimension.lastActivityDate}
            </div>
          )}
        </div>

        <Link
          href={dimension.ctaUrl}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center gap-1.5 shadow-2xs transition-colors min-h-[38px] shrink-0"
        >
          <span>{dimension.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
