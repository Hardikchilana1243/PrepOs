'use client';

// ============================================================================
// PREPOS PRIORITY ACTION PLAN COMPONENT
// Top 3-5 deterministic, database-backed placement preparation tasks
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
  Code2,
  Cpu,
  Building2,
  Target,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { PriorityAction } from '@/lib/services/readiness-cockpit';

interface PriorityActionsProps {
  actions: PriorityAction[];
}

export function PriorityActions({ actions }: PriorityActionsProps) {
  const getCategoryIcon = (category: PriorityAction['category']) => {
    switch (category) {
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

  const getUrgencyBadge = (urgency: PriorityAction['urgency']) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NORMAL':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4" id="priority-actions">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900 text-white">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Placement Priority Actions
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic sequence of your highest-impact preparation tasks right now.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium text-slate-400 self-start sm:self-auto">
          {actions.length} tasks identified
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {actions.map((action, index) => {
          const isHighestPriority = index === 0;

          return (
            <div
              key={action.id}
              className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isHighestPriority
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Step number badge */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                    isHighestPriority
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  #{action.priorityOrder}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        isHighestPriority
                          ? 'bg-white/15 text-slate-200 border-white/20'
                          : getUrgencyBadge(action.urgency)
                      }`}
                    >
                      {action.badgeText}
                    </span>
                    <span
                      className={`text-xs font-semibold inline-flex items-center gap-1 ${
                        isHighestPriority ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {!isHighestPriority && getCategoryIcon(action.category)}
                      <span>{action.category}</span>
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold tracking-tight leading-snug ${
                      isHighestPriority ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {action.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isHighestPriority ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {action.rationale}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 self-end sm:self-center">
                <Link
                  href={action.ctaUrl}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors min-h-[44px] ${
                    isHighestPriority
                      ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  <span>{action.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
