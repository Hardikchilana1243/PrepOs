import React from 'react';

export default function AssessmentsLoading() {
  return (
    <div className="space-y-6 animate-pulse py-2">
      {/* Header Banner Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="h-5 w-40 bg-slate-200 rounded-full" />
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-24 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 h-52 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-5 w-16 bg-slate-200 rounded" />
            </div>
            <div className="h-6 w-44 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-8 w-full bg-slate-50 rounded pt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
