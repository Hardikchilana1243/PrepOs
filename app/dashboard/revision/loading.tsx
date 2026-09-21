import React from 'react';

export default function RevisionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-2 border-b border-slate-800 space-y-2">
        <div className="h-7 w-64 bg-slate-800 rounded-lg" />
        <div className="h-3 w-96 max-w-full bg-slate-800/60 rounded-full" />
      </div>

      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-36" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 h-24" />
        ))}
      </div>
    </div>
  );
}
