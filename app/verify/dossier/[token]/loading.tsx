import React from 'react';

export default function VerificationLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="h-8 bg-slate-300 rounded w-3/4 max-w-md" />
            <div className="h-4 bg-slate-200 rounded w-64" />
          </div>
          <div className="h-16 bg-slate-200 rounded-xl w-48" />
        </div>

        {/* Candidate Box Skeleton */}
        <div className="h-20 bg-slate-100 rounded-xl w-full" />

        {/* Score & Factors Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 h-48 bg-slate-200 rounded-xl" />
          <div className="md:col-span-8 h-48 bg-slate-100 rounded-xl" />
        </div>

        {/* Factors Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-slate-100 rounded-xl" />
          <div className="h-40 bg-slate-100 rounded-xl" />
          <div className="h-40 bg-slate-100 rounded-xl" />
        </div>

        {/* Cryptographic Hash Skeleton */}
        <div className="h-28 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
