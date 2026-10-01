import React from 'react';

export default function ReadinessReportLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Top Toolbar Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex justify-between items-center">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Document Sheet Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 space-y-8">
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-8 w-72 bg-slate-200 rounded" />
          <div className="h-16 w-full bg-slate-50 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-900/10 rounded-xl" />
          <div className="h-32 md:col-span-2 bg-slate-100 rounded-xl" />
        </div>

        <div className="space-y-4">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
