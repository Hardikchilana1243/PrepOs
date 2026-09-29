import React from 'react';
import { Skeleton } from '@/components/ui/student-os';

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      {/* 1. Header Skeleton */}
      <div className="pb-2 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>
            <Skeleton className="h-8 w-60 rounded-lg" />
            <Skeleton className="h-3.5 w-80 rounded" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* 2. Today's Mission & Readiness Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Mission Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-6 w-36 rounded-md" />
                <Skeleton className="h-3 w-56 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Readiness Skeleton */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>

            <Skeleton className="h-3 w-full mt-2 rounded" />

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Preparation Pillars Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200/90 p-5 h-52 flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-lg mt-4" />
              </div>
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ))}
        </div>

        {/* Focus Banner Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 h-20 shadow-2xs flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-36 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* 4. Shortcuts Bar Skeleton */}
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
