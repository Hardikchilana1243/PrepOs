'use client';

// ============================================================================
// PREPOS READINESS EMPTY STATE COMPONENT
// Contextual fallback and onboarding prompts for fresh student accounts
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Code2,
  Cpu,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ReadinessEmptyStateProps {
  title?: string;
  description?: string;
}

export function ReadinessEmptyState({
  title = 'Placement Engine Ready for Calibration',
  description = 'PrepOS computes your authoritative Placement Readiness Score across 4 pillars. Complete your first practice activity to begin generating intelligent readiness analytics.',
}: ReadinessEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center space-y-6 max-w-2xl mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
        <Compass className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      {/* Suggested Starter Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <Link
          href="/dashboard/dsa"
          className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col justify-between space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <Code2 className="w-4 h-4 text-blue-600" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Solve First Problem</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Calibrate DSA rating</div>
          </div>
        </Link>

        <Link
          href="/dashboard/core-cs"
          className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col justify-between space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Core CS Diagnostic</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Test DBMS / OS basics</div>
          </div>
        </Link>

        <Link
          href="/dashboard/assessments"
          className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex flex-col justify-between space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <Target className="w-4 h-4 text-emerald-600" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Mock Assessment</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Simulate real OA test</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
