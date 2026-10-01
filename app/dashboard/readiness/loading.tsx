import React from 'react';

export default function ReadinessLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-pulse">
      {/* 1. Header Banner Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-48 bg-slate-200 rounded-full" />
          <div className="h-5 w-32 bg-slate-200 rounded-full" />
        </div>
        <div className="h-7 w-80 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 rounded" />
      </div>

      {/* 2. Quick Pill Nav Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-28 bg-slate-100 rounded-lg" />
        ))}
      </div>

      {/* 3. Overall PRS Score Hero Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-28 h-28 rounded-2xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-72 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="w-72 h-16 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-5 w-16 bg-slate-200 rounded" />
              <div className="h-2 w-full bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Priority Actions Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-100" />
          ))}
        </div>
      </div>

      {/* 5. 5-Pillar Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full" />
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
