'use client';

// ============================================================================
// PREPOS CRITICAL GAPS ENGINE COMPONENT
// Deterministic gap analysis exposing actionable preparation deficits
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  BookOpen,
  Clock,
  Repeat,
  Building2,
  Trophy,
} from 'lucide-react';
import { CriticalGapItem } from '@/lib/services/readiness-execution';

interface ReadinessGapsProps {
  gaps: CriticalGapItem[];
}

export function ReadinessGaps({ gaps }: ReadinessGapsProps) {
  const getCategoryIcon = (category: CriticalGapItem['category']) => {
    switch (category) {
      case 'DSA':
        return Code2;
      case 'CORE_CS':
        return BookOpen;
      case 'ASSESSMENT':
        return Clock;
      case 'REVISION':
        return Repeat;
      case 'COMPANY':
        return Building2;
      case 'MILESTONE':
      default:
        return Trophy;
    }
  };

  const getUrgencyBadge = (urgency: CriticalGapItem['urgency']) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NORMAL':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <section id="critical-gaps" aria-labelledby="gaps-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="gaps-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Critical Preparation Gaps
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic deficit analysis based on authenticated benchmarks and unfinished tasks
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          {gaps.length} Actionable Deficit{gaps.length === 1 ? '' : 's'}
        </span>
      </div>

      {gaps.length === 0 ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-emerald-950">
            No Critical Placement Gaps Detected
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
            You have satisfied all core thresholds: zero overdue revisions, Core CS diagnostic passing benchmark met, timed mock assessment completed, and company pattern coverage on track.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gaps.map((gap) => {
            const Icon = getCategoryIcon(gap.category);
            return (
              <div
                key={gap.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {gap.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getUrgencyBadge(
                        gap.urgency
                      )}`}
                    >
                      {gap.urgency} Priority
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {gap.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {gap.description}
                    </p>
                  </div>

                  {/* Metrics Comparison Box */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current</span>
                      <span className="font-bold text-slate-800">{gap.currentMetric}</span>
                    </div>
                    <div className="border-x border-slate-200/60 px-1">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target</span>
                      <span className="font-bold text-slate-800">{gap.targetMetric}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Remaining</span>
                      <span className="font-bold text-rose-600">{gap.remainingAmount}</span>
                    </div>
                  </div>

                  {/* Impact Rationale */}
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    Placement Rationale: {gap.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={gap.ctaUrl}
                    className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors min-h-[44px]"
                  >
                    <span>{gap.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
