'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { signInAction } from '../actions';
import { LogIn, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

export default function SignInPage() {
  const [state, formAction] = useFormState(signInAction, null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fillDemoCredentials = () => {
    setEmail('demo.student@prepos.dev');
    setPassword('Placement2026!');
  };

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
          Clean Student OS
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Access Your Placement Cockpit</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Sign In to PrepOS
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Continue your placement readiness journey.
        </p>

        {state?.error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email">
              College or Personal Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="password">
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Fill */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Fill Demo Credentials</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          First time preparing?{' '}
          <Link href="/auth/sign-up" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
