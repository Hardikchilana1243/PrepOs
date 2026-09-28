import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  Building2,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Target,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Navigation Header */}
      <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-sm">
            P
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            PrepOS
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Student OS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Start Preparing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-4 sm:px-8 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6 shadow-subtle">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Calm on the surface. Powerful underneath.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl leading-[1.12]">
            One roadmap. One dashboard.
            <br />
            <span className="text-blue-600">
              One destination for SDE readiness.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            Eliminate tutorial fragmentation. PrepOS unifies structured Data Structures & Algorithms, Core Computer Science diagnostics, recruiter pattern intelligence, and active spaced revision into an integrated student operating system.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <span>Explore Dashboard Demo</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Operating System Preview Cards */}
          <div className="mt-14 w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-sm p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Student Preparation Cockpit
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Real-time Verified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                  Placement Index (PRS)
                </div>
                <div className="text-3xl font-mono font-black text-slate-900 mt-1">20% → 100%</div>
                <div className="text-xs text-slate-500 mt-1">
                  Server-computed index factoring DSA mastery, Core CS drills, and consistency.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">
                  Learning Roadmap
                </div>
                <div className="text-3xl font-mono font-black text-slate-900 mt-1">14 Modules</div>
                <div className="text-xs text-slate-500 mt-1">
                  28 topics from Foundation & Complexity to 2D DP with 20 placement problems.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                  Recruiter Intelligence
                </div>
                <div className="text-3xl font-mono font-black text-slate-900 mt-1">10 Companies</div>
                <div className="text-xs text-slate-500 mt-1">
                  Amazon, Microsoft, Google, TCS pattern maps with zero fabricated leak claims.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Matrix */}
        <section className="px-4 sm:px-8 py-16 border-t border-slate-200/80 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              A Serious Learning System for SDE Placement
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Engineered for high clarity, minimal visual noise, and calm deliberate practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">DSA Learning Journey</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  14 structured modules with 20 original placement problems. Full executable solutions in Python, C++, and Java verified against real Judge0 sandboxes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                48 Test Cases • Secret/Public
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Core CS Diagnostics</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Timed screening quizzes covering DBMS (ACID, Normalization, Indexing) and Operating Systems (Paging, Deadlocks, Concurrency).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                20 Timed MCQs • Server Graded
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Company Intelligence</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Verified interview patterns across 10 placement firms including Amazon, Microsoft, Google, TCS, and Infosys.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                40 Patterns • 34 Problem Links
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Spaced Repetition</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Automatic Day-7 SM-2 scheduling for solved algorithms to prevent retention decay before technical campus assessment day.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                SuperMemo SM-2 Retention
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div>PrepOS — The Operating System for SDE Placement Readiness.</div>
        <div className="mt-1 text-slate-400">Clean Student OS. Built with Next.js, Prisma, PostgreSQL & Tailwind CSS.</div>
      </footer>
    </div>
  );
}
