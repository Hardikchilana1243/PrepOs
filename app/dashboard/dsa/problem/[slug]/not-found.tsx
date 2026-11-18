import React from 'react';
import Link from 'next/link';
import { Code2, ArrowLeft } from 'lucide-react';

export default function ProblemNotFound() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto my-12 space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
        <Code2 className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          DSA Problem Not Found
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          The requested algorithmic problem does not exist or may have been updated in the curriculum roadmap.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/dashboard/dsa"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors min-h-[40px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to DSA Roadmap</span>
        </Link>
      </div>
    </div>
  );
}
