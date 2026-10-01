import React from 'react';

export default function AssessmentOverviewLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 animate-pulse">
      {/* Return Link Skeleton */}
      <div className="h-4 w-36 bg-slate-200 rounded" />

      {/* Main Header Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-xl">
            <div className="h-5 w-40 bg-slate-200 rounded-full" />
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-xl shrink-0" />
        </div>

        {/* 4 Format Specifier Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-50 border border-slate-200/80" />
          ))}
        </div>

        {/* Syllabus / Sections Skeletons */}
        <div className="space-y-2.5 pt-2">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
