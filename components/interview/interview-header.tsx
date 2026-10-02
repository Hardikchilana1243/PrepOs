import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ChevronRight,
  Flame,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Target,
  Sparkles,
} from 'lucide-react';

interface InterviewHeaderProps {
  streakDays: number;
  sessionsCompleted: number;
  recentMistakesCount: number;
}

export function InterviewHeader({
  streakDays,
  sessionsCompleted,
  recentMistakesCount,
}: InterviewHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 1. Primary Operational Hierarchy Bar */}
      <nav
        aria-label="Interview preparation hierarchy"
        className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-500 overflow-x-auto pb-1 max-w-full"
      >
        <span className="text-slate-900 font-bold flex items-center gap-1.5 shrink-0">
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
          <span>Interview Preparation</span>
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 hover:text-slate-900 transition-colors shrink-0">
          Interview Mode
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 hover:text-slate-900 transition-colors shrink-0">
          Company / Topic
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 hover:text-slate-900 transition-colors shrink-0">
          Practice Session
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 hover:text-slate-900 transition-colors shrink-0">
          Feedback
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 hover:text-slate-900 transition-colors shrink-0">
          Revision
        </span>
      </nav>

      {/* 2. Hero Command Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Production Interview Workspace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interview Preparation &amp; Practice Workspace
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Execute realistic interview drills across algorithmic coding problems, Core CS technical screening, target-company interview tracks, and mistake-driven review.
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="flex-1 sm:flex-none p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-bold mb-0.5">
                <Flame className="w-4 h-4" />
                <span>Streak</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900">{streakDays}d</div>
              <div className="text-[10px] text-slate-500 font-medium">Consecutive</div>
            </div>

            <div className="flex-1 sm:flex-none p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600 text-xs font-bold mb-0.5">
                <Target className="w-4 h-4" />
                <span>Sessions</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900">{sessionsCompleted}</div>
              <div className="text-[10px] text-slate-500 font-medium">Completed</div>
            </div>

            <div className="flex-1 sm:flex-none p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-bold mb-0.5">
                <RotateCcw className="w-4 h-4" />
                <span>Mistakes</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900">{recentMistakesCount}</div>
              <div className="text-[10px] text-slate-500 font-medium">To Review</div>
            </div>
          </div>
        </div>

        {/* Quick Nav Anchors */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <a
            href="#modes"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors whitespace-nowrap"
          >
            Practice Modes
          </a>
          <a
            href="#catalog"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors whitespace-nowrap"
          >
            Question Catalog
          </a>
          <a
            href="#mistakes"
            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 transition-colors whitespace-nowrap"
          >
            Mistake Review ({recentMistakesCount})
          </a>
          <a
            href="#company-prep"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors whitespace-nowrap"
          >
            Target Companies
          </a>
          <a
            href="#checklist"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors whitespace-nowrap"
          >
            Readiness Checklist
          </a>
          <a
            href="#history"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors whitespace-nowrap"
          >
            Session History
          </a>
          <Link
            href="/dashboard/readiness"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Readiness Cockpit</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
