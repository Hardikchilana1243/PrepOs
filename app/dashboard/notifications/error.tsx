'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({ error, reset }: ErrorProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900">
          Failed to Load Placement Notifications
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {error.message ||
            'An unexpected error occurred while loading your notification center. Underlying preparation records remain completely safe.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/dashboard"
          className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
