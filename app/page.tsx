import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  Building2,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Layers,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-blue-500/20">
            P
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PrepOS
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-slate-800 text-cyan-400 border border-slate-700">
            Release v1.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-1.5"
          >
            <span>Start Preparing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-4 sm:px-8 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-cyan-400 text-xs font-mono mb-6 shadow-inner">
            <Terminal className="w-3.5 h-3.5" />
            <span>The Operating System for SDE Placement Readiness</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
            One roadmap. One dashboard.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              One destination for SDE readiness.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Eliminate tutorial fragmentation. PrepOS unifies structured Data Structures & Algorithms, Core Computer Science diagnostics, top company pattern intelligence, and active revision into an integrated placement cockpit.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Dashboard Demo</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>

          {/* Terminal Console Mockup Preview */}
          <div className="mt-14 w-full max-w-4xl rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-4 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 px-2 text-xs font-mono text-slate-500">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-slate-400 font-semibold">prepos-runtime — active preparation status</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="text-[11px] font-mono text-cyan-400 font-semibold uppercase">
                  PRS Evaluation Engine
                </div>
                <div className="text-3xl font-mono font-black text-white mt-1">20% → 100%</div>
                <div className="text-xs text-slate-400 mt-1">
                  Server-computed index factoring DSA mastery, Core CS drills, and consistency.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
                  Roadmap Matrix
                </div>
                <div className="text-3xl font-mono font-black text-white mt-1">14 Modules</div>
                <div className="text-xs text-slate-400 mt-1">
                  28 topics from Time Complexity to 2D DP with 20 original placement problems.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">
                  Verified Provenance
                </div>
                <div className="text-3xl font-mono font-black text-white mt-1">10 Companies</div>
                <div className="text-xs text-slate-400 mt-1">
                  Amazon, Microsoft, Google, TCS pattern maps with zero fabricated leak claims.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Matrix */}
        <section className="px-4 sm:px-8 py-16 border-t border-slate-800/80 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A Serious Developer Tool for Campus Placement
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Engineered for high information density without gamified clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 w-fit mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">DSA Master Roadmap</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  14 structured modules with 20 original placement problems. 100% complete compilable solutions in C++, Java, and Python with zero stubs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                48 Test Cases • Secret/Public
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="p-2.5 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 w-fit mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Core CS Diagnostics</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Timed screening quizzes covering DBMS (ACID, Normalization, Indexing) and Operating Systems (Paging, Deadlocks, Mutexes).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                20 Timed MCQs • Server Graded
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 w-fit mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Company Intelligence</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Verified interview patterns across 10 placement firms including Amazon, Microsoft, Google, TCS, and Infosys with veracity tracking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                40 Patterns • 34 Problem Links
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 w-fit mb-4">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Spaced Repetition</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Automatic Day-7 scheduling for solved algorithms to prevent retention decay before technical campus assessment day.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                SuperMemo SM-2 Retention
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 font-mono">
        <div>PrepOS — The Operating System for SDE Placement Readiness.</div>
        <div className="mt-1 text-slate-600">Built with Next.js App Router, Prisma, PostgreSQL & Tailwind CSS.</div>
      </footer>
    </div>
  );
}
