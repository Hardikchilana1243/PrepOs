import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Core CS Drills</span>
          </div>
          <Link
            href="/dashboard/core-cs"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            All Quizzes <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl font-black font-mono text-white">
            {attemptedCount} <span className="text-sm font-normal text-slate-500">/ {totalQuizzes} Quizzes</span>
          </div>
          <div className="text-xs font-mono font-bold text-cyan-400">
            {averageScore > 0 ? `${averageScore}% Avg` : 'No attempts'}
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="bg-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(attemptedCount > 0 ? 10 : 0, (attemptedCount / totalQuizzes) * 100)}%` }}
          />
        </div>
      </div>

      {/* Next Action Box */}
      <div className="mt-5 pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold mb-1">
          Next Screening Drill
        </div>
        {nextQuiz ? (
          <Link
            href={`/dashboard/core-cs?quiz=${nextQuiz.slug}`}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="truncate pr-2">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                {nextQuiz.title}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                {nextQuiz.subjectTitle}
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
          </Link>
        ) : (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All Core CS diagnostic drills completed.</span>
          </div>
        )}
      </div>
    </div>
  );
}
