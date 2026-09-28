import React from 'react';

export default function DSALoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-2 space-y-2">
        <div className="h-4 w-32 bg-blue-50 rounded-full" />
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded-lg" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm h-36 flex flex-col justify-between">
        <div className="h-4 w-40 bg-slate-100 rounded" />
        <div className="h-2 w-full bg-slate-100 rounded-full" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-10 bg-slate-50 rounded-xl" />
          <div className="h-10 bg-slate-50 rounded-xl" />
          <div className="h-10 bg-slate-50 rounded-xl" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm h-28 flex flex-col justify-between"
          >
            <div className="h-5 w-48 bg-slate-200 rounded-lg" />
            <div className="h-3 w-72 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
