'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT HEADER & CANDIDATE IDENTITY
// ============================================================================

import React from 'react';
import { ShieldCheck, Calendar, Hash, Building2, GraduationCap, CheckCircle2 } from 'lucide-react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';

interface ReportHeaderProps {
  report: PlacementReadinessReport;
}

export function ReportHeader({ report }: ReportHeaderProps) {
  const { metadata, candidate, readinessSummary } = report;

  return (
    <div className="border-b border-slate-200 pb-6 space-y-6">
      {/* Top Formal Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-slate-900 text-white inline-flex">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
              PrepOS Placement Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Placement Readiness Dossier
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Official Technical Preparation Audit & Placement Verification Record
          </p>
        </div>

        {/* Verification & Metadata Badge Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-1 text-right text-xs shrink-0 self-start sm:self-auto min-w-[200px]">
          <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
            Verification ID
          </div>
          <div className="font-mono font-bold text-slate-900 text-xs">
            {metadata.reportId}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Generated: {metadata.generatedAt}
          </div>
          <div className="text-[10px] text-blue-600 font-mono font-semibold truncate max-w-[190px]">
            SHA: {metadata.verificationHash}
          </div>
        </div>
      </div>

      {/* Candidate Profile Card */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{candidate.name}</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Verified Candidate
            </span>
          </div>
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{candidate.email}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{candidate.targetDegree} (Class of {candidate.gradYear || 'N/A'})</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Target Firm</span>
            <span className="font-semibold text-slate-800">{candidate.targetCompanyName || 'Tier 2 / Tech'}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Language</span>
            <span className="font-semibold text-slate-800 font-mono">{candidate.preferredLang}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Streak</span>
            <span className="font-semibold text-slate-800 font-mono">{candidate.streakDays} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
