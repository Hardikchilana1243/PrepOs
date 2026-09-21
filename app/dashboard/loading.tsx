import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-48 bg-slate-800 rounded-full" />
          <div className="h-8 w-64 bg-slate-800 rounded-xl" />
          <div className="h-3 w-96 max-w-full bg-slate-800/70 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-slate-800 rounded-xl" />
          <div className="h-8 w-20 bg-slate-800 rounded-xl" />
          <div className="h-8 w-32 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Main Row: PRS & Today's Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 h-64 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-3 w-36 bg-slate-800 rounded-full" />
              <div className="h-6 w-56 bg-slate-800 rounded-lg" />
            </div>
            <div className="h-16 w-20 bg-slate-800 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
            <div className="h-16 bg-slate-900 rounded-xl" />
            <div className="h-16 bg-slate-900 rounded-xl" />
            <div className="h-16 bg-slate-900 rounded-xl" />
            <div className="h-16 bg-slate-900 rounded-xl" />
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 h-64 space-y-3">
          <div className="h-5 w-40 bg-slate-800 rounded-lg" />
          <div className="h-14 bg-slate-900 rounded-xl" />
          <div className="h-14 bg-slate-900 rounded-xl" />
          <div className="h-14 bg-slate-900 rounded-xl" />
        </div>
      </div>

      {/* 4 Pillars Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 h-48 space-y-3">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-8 w-20 bg-slate-800 rounded" />
          <div className="h-2 w-full bg-slate-800 rounded" />
          <div className="h-12 bg-slate-900 rounded-xl mt-4" />
        </div>
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 h-48 space-y-3">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-8 w-20 bg-slate-800 rounded" />
          <div className="h-2 w-full bg-slate-800 rounded" />
          <div className="h-12 bg-slate-900 rounded-xl mt-4" />
        </div>
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 h-48 space-y-3">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-8 w-20 bg-slate-800 rounded" />
          <div className="h-2 w-full bg-slate-800 rounded" />
          <div className="h-12 bg-slate-900 rounded-xl mt-4" />
        </div>
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 h-48 space-y-3">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-8 w-20 bg-slate-800 rounded" />
          <div className="h-2 w-full bg-slate-800 rounded" />
          <div className="h-12 bg-slate-900 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}
