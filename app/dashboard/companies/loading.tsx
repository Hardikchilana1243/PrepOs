import React from 'react';

export default function CompaniesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Main Grid: Directory Sidebar & Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Directory Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="h-10 bg-slate-200 rounded-xl" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/90 h-24" />
          ))}
        </div>

        {/* Detail Workspace */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/90 p-6 h-[540px] space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-28 bg-slate-50 border border-slate-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-slate-50 border border-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
