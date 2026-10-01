'use client';

// ============================================================================
// PREPOS PUBLIC VERIFICATION INTEGRITY COMPONENT
// Displays SHA-256 cryptographic verification status and tamper-evidence seal
// ============================================================================

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Copy, Check, Hash, Lock } from 'lucide-react';
import { PublicDossierVerification } from '@/lib/services/dossier-verification';

interface PublicVerificationIntegrityProps {
  data: PublicDossierVerification;
}

export function PublicVerificationIntegrity({ data }: PublicVerificationIntegrityProps) {
  const { integrityHash, integrityValid } = data;
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(integrityHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Lock className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Cryptographic Integrity & Tamper Verification
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Deterministic SHA-256 snapshot seal verification computed in real time by the verification server.
          </p>
        </div>

        {/* Real-time match badge */}
        <div>
          {integrityValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              INTEGRITY VERIFIED (PASS)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              INTEGRITY MISMATCH (FAIL)
            </span>
          )}
        </div>
      </div>

      {/* Hash display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            Recorded Snapshot SHA-256 Digest
          </span>
          <button
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Digest</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs sm:text-sm text-blue-300 break-all select-all tracking-wider shadow-inner">
          {integrityHash}
        </div>
      </div>

      {/* Academic Disclaimer & Scope of Verification */}
      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="font-semibold text-slate-800">
          Scope of Cryptographic Verification:
        </div>
        <p className="leading-relaxed">
          The cryptographic hash above is deterministically computed from the canonical representation of this dossier snapshot at generation time. Live recalculation by the verification server confirms that the stored record has remained unchanged and bit-for-bit identical since generation.
        </p>
        <p className="text-slate-400 text-[11px]">
          Note: This integrity check certifies data immutability and record provenance within PrepOS. It does not certify candidate character, employment guarantees, or external qualifications.
        </p>
      </div>
    </div>
  );
}
