import React from 'react';
import { Skeleton } from '@/components/ui/student-os';

export default function DSALoading() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-5 animate-pulse"
      aria-busy="true"
      aria-label="Loading DSA roadmap"
    >
      {/* Header Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-3.5 w-96 max-w-full rounded" />
          </div>

          <Skeleton className="h-20 w-56 rounded-xl" />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-5 w-32 rounded" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex justify-between items-center gap-3">
          <Skeleton className="h-8 w-80 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* Module Rows Skeletons */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-5 w-44 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-2 w-24 rounded-full hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
