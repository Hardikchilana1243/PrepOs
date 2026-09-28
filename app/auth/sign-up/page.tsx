'use client';

import React from 'react';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { signUpAction } from '../actions';
import { UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUpAction, null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600 selection:text-white font-sans">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-sm">
            P
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">
            PrepOS
          </span>
        </Link>
        <p className="text-xs text-slate-500 font-medium">
          New Candidate Registration
        </p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Begin SDE Placement Preparation</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Set up your personalized placement readiness profile.
        </p>

        {state?.error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Aryan Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email">
              College or Personal Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="candidate@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="password">
              Create Password (min 6 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>Continue to Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have a PrepOS profile?{' '}
          <Link href="/auth/sign-in" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
