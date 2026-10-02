import React from 'react';

export default function InterviewLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* 1. Hierarchy & Header Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 w-24 bg-slate-200 rounded" />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="space-y-3 max-w-xl flex-1">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-8 w-80 bg-slate-300 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-28 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-28 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-300 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Mode Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4" />
          ))}
        </div>
      </div>

      {/* 4. Question Catalog Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-52 bg-slate-200 rounded" />
        <div className="h-32 bg-white rounded-2xl border border-slate-200/90 p-5" />
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 p-5" />
          ))}
        </div>
      </div>
    </div>
  );
}
