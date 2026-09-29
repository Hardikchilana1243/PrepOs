import React from 'react';

export default function AssessmentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="h-8 w-72 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Cards List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 h-32" />
        ))}
      </div>
    </div>
  );
}
