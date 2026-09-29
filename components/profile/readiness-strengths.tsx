import React from 'react';
import { CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface StrengthsProps {
  dsaSolvedCount: number;
  totalProblems: number;
  coreCsAvgScore: number;
  quizAttemptsCount: number;
  oaPassedCount: number;
  streakDays: number;
}

export function ReadinessStrengths({
  dsaSolvedCount,
  totalProblems,
  coreCsAvgScore,
  quizAttemptsCount,
  oaPassedCount,
  streakDays,
}: StrengthsProps) {
  const strengths: { title: string; detail: string }[] = [];

  if (dsaSolvedCount >= 10) {
    strengths.push({
      title: 'Algorithmic Problem Volume',
      detail: `Verified completion of ${dsaSolvedCount} curriculum problems across key roadmap patterns.`,
    });
  } else if (dsaSolvedCount > 0) {
    strengths.push({
      title: 'Roadmap Kickoff',
      detail: `${dsaSolvedCount} algorithmic problems solved and logged with Judge0 automated verification.`,
    });
  }

  if (quizAttemptsCount > 0 && coreCsAvgScore >= 70) {
    strengths.push({
      title: 'Core CS Benchmark Mastery',
      detail: `Maintaining an average of ${coreCsAvgScore}% across ${quizAttemptsCount} diagnostic quiz attempt${
        quizAttemptsCount > 1 ? 's' : ''
      }.`,
    });
  }

  if (oaPassedCount > 0) {
    strengths.push({
      title: 'Online Assessment Screening',
      detail: `Successfully cleared benchmark screening threshold on ${oaPassedCount} company OA simulation${
        oaPassedCount > 1 ? 's' : ''
      }.`,
    });
  }

  if (streakDays >= 3) {
    strengths.push({
      title: 'Placement Study Consistency',
      detail: `Active ${streakDays}-day streak demonstrates consistent preparation habit.`,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Verified Readiness Strengths
        </h3>
      </div>

      {strengths.length > 0 ? (
        <div className="space-y-2.5">
          {strengths.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/80 space-y-0.5"
            >
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>{s.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          No strong verified signals yet. Solve problems, attempt quizzes, or maintain your study streak to establish strength signals.
        </div>
      )}
    </div>
  );
}
