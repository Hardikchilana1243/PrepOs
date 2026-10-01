'use client';

// ============================================================================
// PREPOS PUBLIC VERIFICATION HEADER COMPONENT
// Academic header for recruiter verification with candidate identity minimization
// ============================================================================

import React from 'react';
import { ShieldCheck, CheckCircle2, GraduationCap, Building2, Calendar, Hash } from 'lucide-react';
import { PublicDossierVerification } from '@/lib/services/dossier-verification';

interface PublicVerificationHeaderProps {
  data: PublicDossierVerification;
}

export function PublicVerificationHeader({ data }: PublicVerificationHeaderProps) {
  const { candidate, dossierId, version, generatedAt, verifiedAt, verificationCount } = data;

  return (
    <div className="border-b border-slate-200 pb-6 space-y-6">
      {/* Top Academic Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-slate-900 text-white inline-flex">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
              PrepOS Official Placement Verification System
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Placement Readiness Verification Report
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            Recruiter & Placement Cell Read-Only Verification Portal
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1 text-right text-xs shrink-0 self-start sm:self-auto min-w-[200px]">
          <div className="flex items-center justify-end gap-1.5 text-emerald-800 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>RECORD VERIFIED</span>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Dossier: {dossierId}
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Verifications: {verificationCount} checks logged
          </div>
        </div>
      </div>

      {/* Candidate Display Card (Minimizing Private Information: Name only, zero email/ids) */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{candidate?.displayName || 'Candidate'}</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Authenticated Student
            </span>
          </div>
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{candidate?.targetDegree} (Class of {candidate?.gradYear || 'N/A'})</span>
            </span>
            <span>·</span>
            <span>Language: <strong className="font-mono text-slate-700">{candidate?.preferredLang}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Target Firm</span>
            <span className="font-semibold text-slate-800">{candidate?.targetCompanyName || 'Tier 2 / Tech'}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Snapshot Date</span>
            <span className="font-semibold text-slate-800 font-mono">{generatedAt}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Snapshot Version</span>
            <span className="font-semibold text-slate-800 font-mono">v{version}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
