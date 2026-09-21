'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold text-white tracking-tight">
        Failed to load dashboard
      </h2>
      <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
        An error occurred while compiling your live placement readiness metrics.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => reset()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
