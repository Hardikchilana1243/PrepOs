import React from 'react';

export default function CoreCSLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-2 border-b border-slate-800 space-y-2">
        <div className="h-7 w-72 bg-slate-800 rounded-lg" />
        <div className="h-3 w-96 max-w-full bg-slate-800/60 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-56 space-y-3" />
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-56 space-y-3" />
      </div>

      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-64" />
    </div>
  );
}
