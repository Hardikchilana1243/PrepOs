import React from 'react';

export default function AssessmentResultLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 px-4 sm:px-6 animate-pulse">
      {/* Top link skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="h-8 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Main Scorecard Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-7 w-56 bg-slate-200 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-20 w-36 bg-slate-100 rounded-2xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Sections Breakdown Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="h-5 w-52 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 rounded-xl bg-slate-50 border border-slate-200" />
          <div className="h-32 rounded-xl bg-slate-50 border border-slate-200" />
        </div>
      </div>

      {/* Review Questions Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="h-5 w-44 bg-slate-200 rounded" />
        <div className="h-48 rounded-xl bg-slate-50 border border-slate-200" />
      </div>
    </div>
  );
}
