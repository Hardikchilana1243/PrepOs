'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/student-os';

export default function CoreCSError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Core CS Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
        Failed to load Core CS Learning Hub
      </h2>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
        An error occurred while compiling your subject diagnostic metrics. Your past quiz attempts remain safely recorded.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Button
          onClick={() => reset()}
          size="sm"
          variant="primary"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Retry Loading
        </Button>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
