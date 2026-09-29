import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, ArrowRight, HelpCircle } from 'lucide-react';

interface GapsProps {
  dsaSolvedCount: number;
  totalProblems: number;
  quizAttemptsCount: number;
  coreCsAvgScore: number;
  oaAttemptsCount: number;
  revisionsDueCount: number;
}

export function ReadinessGaps({
  dsaSolvedCount,
  totalProblems,
  quizAttemptsCount,
  coreCsAvgScore,
  oaAttemptsCount,
  revisionsDueCount,
}: GapsProps) {
  const gaps: { title: string; detail: string; href: string; ctaText: string; isUncalibrated: boolean }[] = [];

  if (revisionsDueCount > 0) {
    gaps.push({
      title: 'Recall Interval Decay Risk',
      detail: `${revisionsDueCount} spaced repetition item${revisionsDueCount > 1 ? 's are' : ' is'} due or overdue. Review recall to preserve long-term retention.`,
      href: '/dashboard/revision',
      ctaText: 'Review Queue',
      isUncalibrated: false,
    });
  }

  if (oaAttemptsCount === 0) {
    gaps.push({
      title: 'Mock OA Simulation — Not Yet Calibrated',
      detail: 'No full-length Online Assessments completed. Candidate cannot be benchmarked for timed placement simulation without OA data.',
      href: '/dashboard/assessments',
      ctaText: 'Launch First OA',
      isUncalibrated: true,
    });
  }

  if (quizAttemptsCount === 0) {
    gaps.push({
      title: 'Core CS Fundamentals — Not Yet Calibrated',
      detail: 'DBMS and OS diagnostic drills have not been completed. Candidate score is running on baseline default.',
      href: '/dashboard/core-cs',
      ctaText: 'Start Core CS Quiz',
      isUncalibrated: true,
    });
  } else if (coreCsAvgScore < 70) {
    gaps.push({
      title: 'Core CS Benchmark Below 70%',
      detail: `Current average score is ${coreCsAvgScore}%. Top recruiters require minimum 70% threshold in DBMS and OS screening.`,
      href: '/dashboard/core-cs',
      ctaText: 'Retry Diagnostics',
      isUncalibrated: false,
    });
  }

  if (dsaSolvedCount === 0) {
    gaps.push({
      title: 'DSA Roadmap — Not Yet Calibrated',
      detail: 'Zero algorithmic problems solved on the platform. Start with Warm-up or Arrays to calibrate problem solving.',
      href: '/dashboard/dsa',
      ctaText: 'Start Solving',
      isUncalibrated: true,
    });
  } else if (dsaSolvedCount < 10) {
    gaps.push({
      title: 'Algorithmic Coverage Depth',
      detail: `${totalProblems - dsaSolvedCount} curriculum problems remaining. Expand coverage across Trees, Graphs, and DP.`,
      href: '/dashboard/dsa',
      ctaText: 'Continue Roadmap',
      isUncalibrated: false,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1 rounded-md bg-amber-50 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Measurable Gaps & Uncalibrated Areas
        </h3>
      </div>

      {gaps.length > 0 ? (
        <div className="space-y-2.5">
          {gaps.map((g, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border space-y-1.5 ${
                g.isUncalibrated
                  ? 'bg-slate-50/70 border-slate-200/90'
                  : 'bg-amber-50/40 border-amber-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    g.isUncalibrated ? 'text-slate-700' : 'text-amber-900'
                  }`}
                >
                  {g.title}
                </span>

                <Link
                  href={g.href}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
                >
                  <span>{g.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">{g.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-center text-xs text-emerald-800 font-medium">
          Zero critical gaps detected! All 4 PRS pillars have verified calibrated data.
        </div>
      )}
    </div>
  );
}
