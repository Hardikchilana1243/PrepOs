import React from 'react';
import { Skeleton } from '@/components/ui/student-os';

export default function PlanLoading() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse"
      aria-busy="true"
      aria-label="Loading preparation plan"
    >
      {/* Header Skeleton */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      {/* Recommended Next Step Skeleton */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-72 rounded" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </div>

      {/* Weekly Progress Skeleton */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Task List Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-60 rounded" />
              <Skeleton className="h-3 w-80 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
