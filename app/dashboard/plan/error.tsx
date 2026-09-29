'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/student-os';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlanError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Preparation Plan Error:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">
          Unable to Load Preparation Plan
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          An error occurred while compiling your adaptive study recommendations and weekly targets.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="primary"
          size="sm"
          onClick={reset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Home className="w-3.5 h-3.5" />}
          >
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
