import React from 'react';

export default function RevisionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Header Banner Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-44 bg-slate-200 rounded-full" />
            <div className="h-5 w-32 bg-slate-200 rounded-full" />
          </div>
          <div className="h-4 w-48 bg-slate-100 rounded-md hidden sm:block" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-80 max-w-full bg-slate-200 rounded-lg" />
          <div className="h-4 w-full max-w-2xl bg-slate-100 rounded-md" />
        </div>
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
      </div>

      {/* 2. 5 Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-3.5 w-3.5 bg-slate-200 rounded-full" />
            </div>
            <div className="h-7 w-12 bg-slate-300 rounded-md" />
            <div className="h-2.5 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Workspace Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        <div className="h-8 w-36 bg-slate-100 rounded-xl" />
        <div className="h-8 w-28 bg-slate-100 rounded-xl" />
      </div>

      {/* 4. Filter Bar Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="h-9 w-full sm:flex-1 bg-slate-100 rounded-xl" />
          <div className="h-8 w-44 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* 5. Revision Section Rows Skeleton */}
      <div className="space-y-4">
        <div className="h-14 bg-white border border-slate-200/90 rounded-2xl" />
        <div className="space-y-2.5 pl-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white border border-slate-200/90 h-24 shadow-subtle"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
