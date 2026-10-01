'use client';

// ============================================================================
// PREPOS PUBLIC VERIFICATION FOOTER COMPONENT
// Academic footer certifying authoritative provenance & candidate privacy
// ============================================================================

import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PublicDossierVerification } from '@/lib/services/dossier-verification';

interface PublicVerificationFooterProps {
  data: PublicDossierVerification;
}

export function PublicVerificationFooter({ data }: PublicVerificationFooterProps) {
  const { dossierId, version, verifiedAt } = data;

  return (
    <footer className="pt-8 border-t border-slate-200 text-xs text-slate-500 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">
              PrepOS Academic Verification Portal
            </div>
            <div className="text-[11px] text-slate-400">
              Institutional Placement Readiness Dossier System • Version {version}
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] space-y-0.5 sm:self-auto self-start">
          <div className="flex items-center sm:justify-end gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Verified Record</span>
          </div>
          <div className="text-slate-400">
            Dossier Snapshot: <span className="font-mono text-slate-600">{dossierId}</span>
          </div>
          <div className="text-slate-400">
            Verified: {new Date(verifiedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-600 leading-relaxed space-y-2">
        <p className="font-semibold text-slate-800">
          Statement of Candidate Identity Protection & Non-Disclosure:
        </p>
        <p>
          This verification view is strictly limited to authorized placement readiness metrics from an immutable candidate snapshot. Under PrepOS student privacy standards, candidate email addresses, internal user IDs, database identifiers, private learning activities, source code submissions, and assessment solution keys are intentionally withheld from public verification pages.
        </p>
        <p className="text-slate-400">
          PrepOS Placement Engine © {new Date().getFullYear()} • Deterministic Verification Service v6.13
        </p>
      </div>
    </footer>
  );
}
