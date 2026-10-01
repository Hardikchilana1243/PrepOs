'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Building2 } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CompanyDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Company Detail Error:', error);
  }, [error]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto my-12 space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Unable to Load Company Workspace
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          An unexpected error occurred while loading this company's preparation patterns and assessment modules.
          Your progress records remain fully intact.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-colors min-h-[40px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>

        <Link
          href="/dashboard/companies"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors min-h-[40px]"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>All Company Hubs</span>
        </Link>
      </div>
    </div>
  );
}
