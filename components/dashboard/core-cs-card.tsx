import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface CoreCSCardProps {
  coreCsProgress: {
    totalQuizzes: number;
    attemptedCount: number;
    averageScore: number;
    nextQuiz: {
      title: string;
      slug: string;
      subjectTitle: string;
    } | null;
  };
}

export function CoreCSCard({ coreCsProgress }: CoreCSCardProps) {
  const { totalQuizzes, attemptedCount, averageScore, nextQuiz } = coreCsProgress;
  const progressPct = totalQuizzes > 0 ? Math.round((attemptedCount / totalQuizzes) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Core CS Drills
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {attemptedCount} / {totalQuizzes}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Quizzes Completed</span>
            <span className="font-semibold text-slate-800">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} size="md" color="indigo" />
        </div>

        {/* Next Recommendation */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Next Diagnostic Drill
          </div>
          {nextQuiz ? (
            <Link
              href={`/dashboard/core-cs?quiz=${nextQuiz.slug}`}
              className="group block p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 truncate">
                  {nextQuiz.title}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                  {nextQuiz.subjectTitle}
                </span>
              </div>
            </Link>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              No pending drills
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/core-cs"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-between group"
        >
          <span>All Core CS Quizzes</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
