import React from 'react';

export default function DSALoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-2 border-b border-slate-800 space-y-2">
        <div className="h-7 w-64 bg-slate-800 rounded-lg" />
        <div className="h-3 w-96 max-w-full bg-slate-800/60 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 h-28" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 h-20" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 rounded-2xl bg-[#0F172A] border border-slate-800 p-6 h-[500px]" />
      </div>
    </div>
  );
}
