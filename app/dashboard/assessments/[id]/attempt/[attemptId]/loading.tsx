import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AssessmentAttemptLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-sm font-bold text-slate-900">
          Initializing Authoritative Assessment Session...
        </h2>
        <p className="text-xs text-slate-500 font-mono">
          Syncing server countdown clock, questions, and test suites
        </p>
      </div>
    </div>
  );
}
