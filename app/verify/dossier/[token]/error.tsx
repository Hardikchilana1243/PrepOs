'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

export default function VerificationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
        <div className="flex justify-center">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            Verification Unavailable
          </h2>
          <p className="text-xs text-slate-500">
            An unexpected error occurred while verifying this placement dossier.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Verification
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            PrepOS Home
          </Link>
        </div>
      </div>
    </div>
  );
}
