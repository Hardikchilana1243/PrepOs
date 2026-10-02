'use client';

// ============================================================================
// PREPOS PLACEMENT EXECUTION HEADER COMPONENT
// Current Position, Authoritative PRS Composition & Preparation Summary
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Zap,
  Flame,
  BookOpen,
  Code2,
  Clock,
  Repeat,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { FinalReadinessExecutionData } from '@/lib/services/readiness-execution';

interface ExecutionHeaderProps {
  currentPosition: FinalReadinessExecutionData['currentPosition'];
  studentMeta?: {
    gradYear?: number;
    targetDegree?: string;
  };
}

export function ExecutionHeader({ currentPosition, studentMeta }: ExecutionHeaderProps) {
  const {
    prsScore,
    prsTier,
    prsTierLabel,
    composition,
    preparationCompletionPct,
    dsaRemaining,
    coreCsBenchmark,
    oaHistory,
    revisionWorkload,
    targetCompanyCoverage,
    activeStreak,
  } = currentPosition;

  const getTierBadge = (t: string) => {
    switch (t) {
      case 'TIER_1_READY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'COMPETITIVE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FOUNDATION_BUILDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Execution Hierarchy Breadcrumb Bar */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        <span className="text-slate-900 font-bold">Placement Readiness</span>
        <span>→</span>
        <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          Current Position
        </span>
        <span>→</span>
        <a href="#critical-gaps" className="hover:text-slate-900 transition-colors">
          Critical Gaps
        </a>
        <span>→</span>
        <a href="#daily-plan" className="hover:text-slate-900 transition-colors">
          Today&apos;s Execution
        </a>
        <span>→</span>
        <a href="#targets" className="hover:text-slate-900 transition-colors">
          Upcoming Targets
        </a>
        <span>→</span>
        <a href="#verification" className="hover:text-slate-900 transition-colors">
          Verification
        </a>
      </div>

      {/* 2. Main Execution Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 rounded-md bg-slate-900 text-white inline-flex">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                PrepOS Final Execution Engine
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getTierBadge(prsTier)}`}>
                {prsTierLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Final Placement Execution Command Center
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time execution dashboard tracking your remaining preparation gaps, daily tasks,
              target company coverage, and verifiable placement credentials.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
              {studentMeta?.targetDegree && (
                <span>Program: <strong className="text-slate-700">{studentMeta.targetDegree}</strong></span>
              )}
              {studentMeta?.gradYear && (
                <span>Batch: <strong className="text-slate-700">Class of {studentMeta.gradYear}</strong></span>
              )}
              {targetCompanyCoverage.primaryTarget && (
                <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  Target: {targetCompanyCoverage.primaryTarget}
                </span>
              )}
            </div>
          </div>

          {/* Overall PRS Hero Score */}
          <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 flex flex-col justify-between shrink-0 min-w-[220px] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Authoritative PRS
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>

            <div className="text-4xl sm:text-5xl font-black text-white py-2">
              {prsScore}
              <span className="text-base font-normal text-slate-400">/100</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5" />
                <span>{activeStreak} Day Streak</span>
              </div>
              <span className="font-mono text-slate-300">{preparationCompletionPct}% Complete</span>
            </div>
          </div>
        </div>

        {/* 3. 4-Pillar PRS Composition Formula Breakdown */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Authoritative Score Composition (40% DSA · 30% Core CS · 15% OA · 15% Consistency)
            </span>
            <span className="text-[11px] text-slate-400">
              Formula strictly locked to deterministic database evaluations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* DSA Factor */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>DSA Solving</span>
                </div>
                <span className="font-bold text-slate-900">{composition.dsaScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, composition.dsaScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Weight: 40%</span>
                <span>{dsaRemaining.solved}/{dsaRemaining.total} Solved</span>
              </div>
            </div>

            {/* Core CS Factor */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Core CS Mastery</span>
                </div>
                <span className="font-bold text-slate-900">{composition.coreCsScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, composition.coreCsScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Weight: 30%</span>
                <span className={coreCsBenchmark.isMet ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                  {coreCsBenchmark.currentAvg}% (Target: 70%)
                </span>
              </div>
            </div>

            {/* Mock OA Factor */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Timed Mock OAs</span>
                </div>
                <span className="font-bold text-slate-900">{composition.oaScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, composition.oaScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Weight: 15%</span>
                <span>{oaHistory.passedCount}/{oaHistory.completedCount} Cleared</span>
              </div>
            </div>

            {/* Consistency / Revision Factor */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Repeat className="w-3.5 h-3.5 text-purple-600" />
                  <span>Consistency (SM-2)</span>
                </div>
                <span className="font-bold text-slate-900">{composition.consistencyScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, composition.consistencyScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Weight: 15%</span>
                <span>{revisionWorkload.overdue} Overdue</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quick Position Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[11px] block">DSA Remaining</span>
            <span className="font-bold text-slate-900 text-sm">
              {dsaRemaining.remaining} problems
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[11px] block">Core CS Status</span>
            <span className={`font-bold text-sm ${coreCsBenchmark.isMet ? 'text-emerald-700' : 'text-amber-700'}`}>
              {coreCsBenchmark.isMet ? 'Benchmark Met' : `${coreCsBenchmark.currentAvg}% (<70%)`}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[11px] block">Overdue Workload</span>
            <span className={`font-bold text-sm ${revisionWorkload.overdue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {revisionWorkload.overdue > 0 ? `${revisionWorkload.overdue} Items Due` : 'Queue Cleared'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[11px] block">Target Coverage</span>
            <span className="font-bold text-slate-900 text-sm">
              {targetCompanyCoverage.avgCoveragePct}% Prepared
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
