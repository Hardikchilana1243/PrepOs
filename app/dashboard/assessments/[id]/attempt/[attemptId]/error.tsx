'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

export default function AssessmentAttemptError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="text-center space-y-1 max-w-sm">
        <h2 className="text-base font-bold text-slate-900">
          Assessment Session Interrupted
        </h2>
        <p className="text-xs text-slate-500">
          {error.message || 'Unable to load active attempt workspace. Your draft answers remain saved on the server.'}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resume Session</span>
        </button>

        <Link
          href="/dashboard/assessments"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Catalog</span>
        </Link>
      </div>
    </div>
  );
}
