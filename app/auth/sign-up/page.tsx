'use client';

import React from 'react';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { signUpAction } from '../actions';
import { UserPlus, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUpAction, null);

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-blue-500/25">
            P
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            PrepOS
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-mono">
          New Candidate Onboarding
        </p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold mb-2">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Begin SDE Placement Preparation</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Set up your personalized placement readiness profile.
        </p>

        {state?.error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Aryan Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="email">
              College or Personal Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="candidate@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="password">
              Create Password (min 6 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 mt-2"
          >
            <span>Continue to Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have a PrepOS profile?{' '}
          <Link href="/auth/sign-in" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
