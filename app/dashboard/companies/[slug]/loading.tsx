import React from 'react';

export default function CompanyDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-9 w-32 bg-slate-100 rounded-xl" />
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-72 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
          </div>

          <div className="h-20 w-48 bg-slate-50 border border-slate-200 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Coverage Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-6 w-24 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Patterns Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="h-6 w-44 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Problems Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-50 border border-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
