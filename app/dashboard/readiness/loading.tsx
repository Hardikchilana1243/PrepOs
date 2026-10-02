import React from 'react';

export default function ReadinessLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* 1. Execution Header Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 w-20 bg-slate-200 rounded" />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-3 max-w-xl flex-1">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-8 w-80 bg-slate-300 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="h-32 w-56 bg-slate-200 rounded-xl shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100" />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Quick Pill Nav Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-8 w-28 bg-slate-100 rounded-lg shrink-0" />
        ))}
      </div>

      {/* 3. Critical Gaps Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3" />
          ))}
        </div>
      </div>

      {/* 4. Daily Plan Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-44 bg-slate-200 rounded" />
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 p-4 bg-slate-50/50" />
          ))}
        </div>
      </div>

      {/* 5. Targets Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-52 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3" />
          ))}
        </div>
      </div>

      {/* 6. Consistency Analytics Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-56 bg-slate-200 rounded" />
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl" />
            ))}
          </div>
          <div className="h-32 bg-slate-50 rounded-xl" />
        </div>
      </div>

      {/* 7. Checklist Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-56 bg-slate-200 rounded" />
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 p-4" />
          ))}
        </div>
      </div>
    </div>
  );
}
