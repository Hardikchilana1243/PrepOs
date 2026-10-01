import React from 'react';

export default function CompaniesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="h-5 w-40 bg-slate-200 rounded-full" />
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-24 rounded-xl bg-slate-50 border border-slate-200" />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 w-72 bg-slate-200 rounded" />
          <div className="h-2 w-48 bg-slate-200 rounded-full" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="h-11 bg-slate-100 rounded-xl" />
        <div className="pt-2 flex gap-3">
          <div className="h-8 w-28 bg-slate-100 rounded-lg" />
          <div className="h-8 w-28 bg-slate-100 rounded-lg" />
          <div className="h-8 w-28 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Company Cards Grid Skeleton (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 h-64 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-6 w-36 bg-slate-200 rounded" />
              <div className="h-8 bg-slate-50 rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-slate-50 rounded-xl" />
                <div className="h-12 bg-slate-50 rounded-xl" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="h-2 bg-slate-100 rounded-full" />
              <div className="h-11 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
