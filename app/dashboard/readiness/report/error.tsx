'use client';

// ============================================================================
// PREPOS PLACEMENT REPORT ERROR BOUNDARY
// ============================================================================

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RotateCcw, ArrowLeft } from 'lucide-react';

interface ReadinessReportErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReadinessReportError({
  error,
  reset,
}: ReadinessReportErrorProps) {
  useEffect(() => {
    console.error('Readiness Dossier Error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Unable to Compile Placement Dossier
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          An error occurred while compiling your verified preparation report. Your database progress and assessment submissions are fully safe.
        </p>
      </div>

      {error.message && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-700 max-w-md mx-auto text-left break-words">
          <span className="font-bold text-rose-700">Diagnostic message: </span>
          {error.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Compilation</span>
        </button>

        <Link
          href="/dashboard/readiness"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Readiness Cockpit</span>
        </Link>
      </div>
    </div>
  );
}
