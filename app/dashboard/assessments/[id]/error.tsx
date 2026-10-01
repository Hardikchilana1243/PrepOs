'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

export default function AssessmentOverviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">
          Failed to load assessment details
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {error.message || 'An error occurred while retrieving assessment specifications from the database.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>

        <Link
          href="/dashboard/assessments"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    </div>
  );
}
