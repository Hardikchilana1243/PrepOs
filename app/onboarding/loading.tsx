import React from 'react';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[#070A10] flex flex-col justify-center items-center px-4 py-12 animate-pulse">
      <div className="w-full max-w-xl text-center mb-6 space-y-2">
        <div className="h-6 w-48 mx-auto bg-slate-800 rounded-full" />
        <div className="h-8 w-72 mx-auto bg-slate-800 rounded-xl" />
        <div className="h-4 w-56 mx-auto bg-slate-800/60 rounded-full" />
      </div>

      <div className="w-full max-w-xl rounded-2xl bg-[#0F172A] border border-slate-800 p-8 h-[450px]" />
    </div>
  );
}
