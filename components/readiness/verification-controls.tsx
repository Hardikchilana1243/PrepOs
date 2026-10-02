'use client';

// ============================================================================
// PREPOS FINAL VERIFICATION CONTROLS COMPONENT
// Coordinates Placement Dossier Export, PDF Generation, and Recruiter Link Sharing
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
} from 'lucide-react';
import { FinalReadinessExecutionData } from '@/lib/services/readiness-execution';

interface VerificationControlsProps {
  verificationControls: FinalReadinessExecutionData['verificationControls'];
}

export function VerificationControls({ verificationControls }: VerificationControlsProps) {
  const {
    hasDossier,
    latestDossierId,
    latestDossierVersion,
    hasActiveShare,
    verificationCount,
    lastVerifiedAt,
    shareStatus,
  } = verificationControls;

  const getShareBadge = (status: typeof shareStatus) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: CheckCircle2,
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Active Verification Link',
        };
      case 'EXPIRED':
        return {
          icon: Clock,
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Link Expired',
        };
      case 'REVOKED':
        return {
          icon: AlertTriangle,
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Link Revoked',
        };
      case 'NOT_CREATED':
      default:
        return {
          icon: Lock,
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'No Share Link',
        };
    }
  };

  const shareBadgeCfg = getShareBadge(shareStatus);
  const ShareIcon = shareBadgeCfg.icon;

  return (
    <section
      id="verification"
      aria-labelledby="verification-heading"
      className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/10 text-white inline-flex border border-white/10">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Placement Cell & Recruiter Verification
            </span>
          </div>

          <h2 id="verification-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Placement Readiness Dossier & Recruiter Portal
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Generate an authoritative, tamper-evident Placement Readiness Dossier compiling your verified DSA problem solutions, Core CS diagnostic scores, mock OA attempts, and target company pattern coverage. Recruiters can independently verify your dossier via secure, student-controlled verification links without authentication.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono pt-1">
            <span>Snapshot: {latestDossierId || 'Unsealed'}</span>
            {latestDossierVersion && <span>· Version {latestDossierVersion}</span>}
            <span>· Zero AI predictions · 100% database-verified</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/readiness/report"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Manage Dossier</span>
          </Link>

          <a
            href="/dashboard/readiness/report/pdf"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      </div>

      {/* Recruiter Share Status Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1 ${shareBadgeCfg.badge}`}>
              <ShareIcon className="w-3 h-3" />
              <span>{shareBadgeCfg.label}</span>
            </span>
            {hasActiveShare && (
              <span className="text-[11px] text-slate-400 font-mono">
                {verificationCount} external verification{verificationCount === 1 ? '' : 's'} logged
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300">
            {hasActiveShare
              ? 'Your active verification link exposes only recruiter-safe metrics (candidate display name, PRS, and 5-pillar summaries). Private source code and test cases are excluded.'
              : 'Generate a secure public link to allow recruiters or placement officers to verify your authenticated preparation snapshot.'}
          </p>

          {lastVerifiedAt && (
            <div className="text-[10px] text-slate-400 font-mono">
              Last verified: {new Date(lastVerifiedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <Link
            href="/dashboard/readiness/report"
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors min-h-[40px] border border-white/10"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{hasActiveShare ? 'Manage Share Link' : 'Generate Share Link'}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
