import React from 'react';
import { Skeleton } from '@/components/ui/student-os';

export default function CoreCSLoading() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading Core CS Hub"
    >
      {/* Header Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-3.5 w-96 max-w-full rounded" />
          </div>

          <Skeleton className="h-20 w-56 rounded-xl" />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-36 rounded-lg" />
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* 2 Subject Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-5 w-36 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Quizzes List Skeleton */}
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
