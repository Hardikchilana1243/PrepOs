'use client';

import React from 'react';
import { Cpu, Database, Play, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';
import { RecommendedDrill } from '@/lib/services/core-cs';

interface CoreCSHeaderProps {
  totalQuizzes: number;
  attemptedCount: number;
  avgScorePct: number | null;
  recommendedDrill: RecommendedDrill;
  onStartDrill: (quizSlug: string) => void;
}

export function CoreCSHeader({
  totalQuizzes,
  attemptedCount,
  avgScorePct,
  recommendedDrill,
  onStartDrill,
}: CoreCSHeaderProps) {
  const completionPct = totalQuizzes > 0 ? Math.round((attemptedCount / totalQuizzes) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              Systems & Fundamentals
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              DBMS & Operating Systems
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Core CS Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Master placement-tested fundamentals in database architecture and operating systems. Review core conceptual models and test your knowledge through timed diagnostic drills.
          </p>
        </div>

        {/* Overall Curriculum Metrics Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:min-w-[220px] self-start md:self-center shrink-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">Quiz Coverage</span>
            <div className="text-xs font-bold text-slate-900 font-mono">
              <span>{attemptedCount}</span>
              <span className="text-slate-400 font-normal"> / {totalQuizzes}</span>
              <span className="text-indigo-600 ml-1.5 font-bold">({completionPct}%)</span>
            </div>
          </div>
          <ProgressBar value={completionPct} size="sm" color="indigo" />

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Average Score:</span>
            <span className="font-semibold text-slate-800">
              {avgScorePct !== null ? `${avgScorePct}%` : 'Uncalibrated'}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Next Diagnostic Banner */}
      {recommendedDrill && (
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/40 p-3.5 rounded-lg border border-indigo-100/70">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Compass className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Recommended Drill
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {recommendedDrill.quizTitle}
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate max-w-xl">
                {recommendedDrill.reason}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartDrill(recommendedDrill.quizSlug)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 self-start sm:self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start Drill (~{recommendedDrill.durationMin}m)</span>
          </button>
        </div>
      )}
    </div>
  );
}
