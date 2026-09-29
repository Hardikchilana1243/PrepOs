import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Core CS Drills
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {attemptedCount} / {totalQuizzes}
          </span>
        </div>

        {/* Progress Bar & Avg Accuracy */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Completed Drills</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-semibold text-slate-800">{progressPct}%</span>
              {attemptedCount > 0 && (
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                  {averageScore}% avg
                </span>
              )}
            </div>
          </div>
          <ProgressBar value={progressPct} size="sm" color="indigo" />
        </div>

        {/* Next Diagnostic Drill */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Next Diagnostic Drill
          </div>
          {nextQuiz ? (
            <Link
              href={`/dashboard/core-cs?quiz=${nextQuiz.slug}`}
              className="group block p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
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
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>All quizzes completed!</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/core-cs"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-between group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <span>Open Core CS Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
