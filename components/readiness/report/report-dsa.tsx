'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT DSA COMPETENCY SECTION
// ============================================================================

import React from 'react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { Code2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportDsaProps {
  dsa: PlacementReadinessReport['dsaCompetency'];
}

export function ReportDsa({ dsa }: ReportDsaProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>Section 1: Data Structures & Algorithms Competency</span>
        </h3>
        <span className="text-xs font-mono font-bold text-slate-800">
          Score: {dsa.score} / 100
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Solved Volume</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {dsa.solvedCount} <span className="text-xs font-normal text-slate-400">/ {dsa.totalProblems}</span>
          </div>
          <span className="text-[10px] text-slate-500">{dsa.solvedPct}% curriculum completed</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Success Rate</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {dsa.submissionSuccessRate}%
          </div>
          <span className="text-[10px] text-slate-500">WA: {dsa.wrongAnswerCount} · TLE: {dsa.tleCount}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Topic Coverage</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {dsa.topicCoverageCount} <span className="text-xs font-normal text-slate-400">/ {dsa.totalTopicsCount}</span>
          </div>
          <span className="text-[10px] text-slate-500">Algorithmic archetypes</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Company-Tagged</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            {dsa.companyTaggedSolved} <span className="text-xs font-normal text-slate-400">/ {dsa.companyTaggedTotal}</span>
          </div>
          <span className="text-[10px] text-slate-500">Interview questions</span>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
        <span className="text-xs font-bold text-slate-800 block">Difficulty Distribution Solved</span>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded p-2 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 block">Easy</span>
            <span className="font-mono font-bold text-xs text-emerald-900">
              {dsa.solvedByDifficulty.easy} / {dsa.totalByDifficulty.easy}
            </span>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded p-2 text-center">
            <span className="text-[11px] font-semibold text-amber-800 block">Medium</span>
            <span className="font-mono font-bold text-xs text-amber-900">
              {dsa.solvedByDifficulty.medium} / {dsa.totalByDifficulty.medium}
            </span>
          </div>
          <div className="bg-rose-50/70 border border-rose-200 rounded p-2 text-center">
            <span className="text-[11px] font-semibold text-rose-800 block">Hard</span>
            <span className="font-mono font-bold text-xs text-rose-900">
              {dsa.solvedByDifficulty.hard} / {dsa.totalByDifficulty.hard}
            </span>
          </div>
        </div>
      </div>

      {/* Factual Highlights */}
      <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Observed Execution Highlights
        </span>
        <ul className="space-y-1 text-xs text-slate-600">
          {dsa.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
