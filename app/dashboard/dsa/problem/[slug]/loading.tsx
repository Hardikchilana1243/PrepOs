import React from 'react';
import { Skeleton } from '@/components/ui/student-os';

export default function ProblemDetailLoading() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-4 animate-pulse"
      aria-busy="true"
      aria-label="Loading problem workspace"
    >
      {/* Header Skeleton */}
      <div className="pb-3 border-b border-slate-200/80 space-y-2">
        <Skeleton className="h-4 w-48 rounded" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-60 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Two Pane Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-12rem)] min-h-[650px]">
        {/* Left Pane Skeleton */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        {/* Right Pane Skeleton */}
        <div className="lg:col-span-7 bg-[#0F172A] rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <Skeleton className="h-8 w-48 rounded bg-slate-800" />
          <Skeleton className="h-72 w-full rounded bg-slate-800/80 my-4" />
          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <Skeleton className="h-4 w-24 rounded bg-slate-800" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-lg bg-slate-800" />
              <Skeleton className="h-9 w-24 rounded-lg bg-emerald-800/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
