import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-2 border-b border-slate-800 space-y-2">
        <div className="h-7 w-64 bg-slate-800 rounded-lg" />
        <div className="h-3 w-96 max-w-full bg-slate-800/60 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-[460px]" />
        <div className="lg:col-span-6 rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-[460px]" />
      </div>
    </div>
  );
}
