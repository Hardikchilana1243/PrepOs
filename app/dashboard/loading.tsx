import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Greeting Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-28 bg-white border border-slate-200 rounded-full" />
          <div className="h-7 w-20 bg-white border border-slate-200 rounded-full" />
          <div className="h-7 w-32 bg-amber-50 border border-amber-200 rounded-full" />
        </div>
      </div>

      {/* Main Row: Today's Mission & PRS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm h-72 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-blue-50 rounded-full" />
            <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm h-72 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="h-10 bg-slate-50 rounded-lg" />
            <div className="h-10 bg-slate-50 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 4 Pillars Skeleton */}
      <div>
        <div className="h-4 w-36 bg-slate-200 rounded mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 h-48 space-y-3 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-7 w-20 bg-slate-100 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded-full" />
              </div>
              <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
