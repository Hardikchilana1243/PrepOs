'use client';

// ============================================================================
// PREPOS PUBLIC VERIFICATION STATUS COMPONENT
// Handles non-valid verification states (EXPIRED, REVOKED, INVALID)
// Strictly prevents enumeration or disclosure of private student data
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Clock, Ban, HelpCircle, ArrowLeft } from 'lucide-react';

interface PublicVerificationStatusProps {
  status: 'EXPIRED' | 'REVOKED' | 'INVALID';
  message: string;
}

export function PublicVerificationStatus({ status, message }: PublicVerificationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'EXPIRED':
        return {
          icon: Clock,
          iconBg: 'bg-amber-100 text-amber-700 border-amber-300',
          title: 'Verification Link Expired',
          subtitle: 'The validity period for this dossier verification link has lapsed.',
          description:
            'Candidates configure security expiration periods (e.g., 7, 30, or 90 days) on shared dossier links to maintain control over their preparation snapshots. If you are a recruiter or placement officer, please request a newly generated verification link directly from the candidate.',
          badge: 'LINK EXPIRED',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'REVOKED':
        return {
          icon: Ban,
          iconBg: 'bg-rose-100 text-rose-700 border-rose-300',
          title: 'Verification Link Revoked',
          subtitle: 'This verification link was explicitly revoked by the candidate.',
          description:
            'Candidates can immediately invalidate previously shared links at any time from their PrepOS dashboard. Once revoked, the associated dossier snapshot is no longer accessible via this link.',
          badge: 'LINK REVOKED',
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'INVALID':
      default:
        return {
          icon: ShieldAlert,
          iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
          title: 'Verification Record Not Found',
          subtitle: 'The provided verification token is invalid or unrecognized.',
          description:
            'The link you followed may be incomplete, malformed, or no longer exists in our verification registry. Ensure that the full URL was copied correctly without trailing punctuation.',
          badge: 'INVALID TOKEN',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 text-center">
        {/* Status Icon */}
        <div className="flex justify-center">
          <div className={`p-4 rounded-2xl border ${config.iconBg}`}>
            <Icon className="w-10 h-10" />
          </div>
        </div>

        {/* Status Badge & Title */}
        <div className="space-y-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${config.badgeColor}`}
          >
            {config.badge}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm font-medium text-slate-600">
            {config.subtitle}
          </p>
        </div>

        {/* Explanatory Body */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left leading-relaxed space-y-2">
          <p>{config.description}</p>
          <p className="text-slate-400 text-[11px] font-mono">
            System Notice: {message}
          </p>
        </div>

        {/* Recruiter Help Information */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>PrepOS Verification Protocol v6.13</span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
