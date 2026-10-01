'use client';

// ============================================================================
// PREPOS READINESS INSIGHTS ENGINE COMPONENT
// Deterministic, explainable insights derived directly from student database records
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  TrendingUp,
  Code2,
  Cpu,
  Building2,
  Target,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ReadinessInsight } from '@/lib/services/readiness-cockpit';

interface ReadinessInsightsProps {
  insights: ReadinessInsight[];
}

export function ReadinessInsights({ insights }: ReadinessInsightsProps) {
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'RECOMMENDED' | 'POSITIVE'>('ALL');

  const filteredInsights = insights.filter((i) => {
    if (filter === 'ALL') return true;
    return i.severity === filter;
  });

  const getSeverityBadge = (severity: ReadinessInsight['severity']) => {
    switch (severity) {
      case 'URGENT':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Critical Gap',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          borderClass: 'border-l-rose-500',
        };
      case 'RECOMMENDED':
        return {
          icon: <Lightbulb className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Recommended',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          borderClass: 'border-l-amber-500',
        };
      case 'POSITIVE':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Strength',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          borderClass: 'border-l-emerald-500',
        };
      case 'INFO':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Diagnostic Info',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          borderClass: 'border-l-blue-500',
        };
    }
  };

  const getCategoryIcon = (category: ReadinessInsight['category']) => {
    switch (category) {
      case 'DSA':
        return <Code2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      case 'COMPANY':
        return <Building2 className="w-3.5 h-3.5 text-purple-600" />;
      case 'ASSESSMENT':
        return <Target className="w-3.5 h-3.5 text-emerald-600" />;
      case 'REVISION':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case 'PRS':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-4" id="insights">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Readiness Intelligence & Insights</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic diagnostic observations explainable by your historical submissions and scores.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(
            [
              { key: 'ALL', label: `All (${insights.length})` },
              { key: 'URGENT', label: 'Critical' },
              { key: 'RECOMMENDED', label: 'Actionable' },
              { key: 'POSITIVE', label: 'Strengths' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards List */}
      {filteredInsights.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active issues in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your readiness indicators are currently well-balanced. Continue regular practice to maintain pace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight) => {
            const sev = getSeverityBadge(insight.severity);

            return (
              <div
                key={insight.id}
                className={`bg-white rounded-2xl border border-slate-200/90 border-l-4 ${sev.borderClass} p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all`}
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Severity Badge + Category Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1 ${sev.badgeClass}`}
                    >
                      {sev.icon}
                      <span>{sev.label}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {getCategoryIcon(insight.category)}
                      <span>{insight.category}</span>
                    </span>
                  </div>

                  {/* Title & Metric */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                      {insight.title}
                    </h3>
                    <div className="mt-1 text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block font-medium">
                      Evidence: {insight.supportingMetric}
                    </div>
                  </div>

                  {/* Why it matters */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Placement impact: </span>
                    {insight.whyItMatters}
                  </p>
                </div>

                {/* Direct CTA */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    href={insight.ctaUrl}
                    className="text-xs font-semibold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1 transition-colors min-h-[36px]"
                  >
                    <span>{insight.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
