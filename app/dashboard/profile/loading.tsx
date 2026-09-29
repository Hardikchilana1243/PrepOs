import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="h-8 w-72 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
        <div className="h-20 w-44 bg-slate-50 border border-slate-200 rounded-xl" />
      </div>

      {/* Next Step Skeleton */}
      <div className="h-28 rounded-2xl bg-slate-100 border border-slate-200" />

      {/* 4 Factor Breakdown Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
        <div className="h-6 w-56 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-50 border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Strengths & Gaps Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl bg-white border border-slate-200/90 p-5" />
        <div className="h-48 rounded-2xl bg-white border border-slate-200/90 p-5" />
      </div>

      {/* Profile Form & History Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/90 p-6 h-[420px]" />
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/90 p-6 h-[420px]" />
      </div>
    </div>
  );
}
