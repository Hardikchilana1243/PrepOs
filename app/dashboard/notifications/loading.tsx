import React from 'react';

export default function NotificationsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-40 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-300 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-slate-200 rounded-lg" />
            <div className="h-10 w-28 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="w-6 h-6 rounded bg-slate-200" />
            </div>
            <div className="h-6 w-10 bg-slate-300 rounded" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-10 w-28 bg-slate-200 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Rows Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex gap-2 items-center">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-48 bg-slate-300 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
            <div className="flex gap-2 items-center self-end sm:self-center">
              <div className="h-9 w-24 bg-slate-200 rounded-lg" />
              <div className="h-9 w-9 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
