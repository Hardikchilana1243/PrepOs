import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Database,
  Cpu,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CompanyCoreCSQuizDetail } from '@/lib/services/companies';
import { CompanyEmptyState } from './company-empty-state';

interface CompanyCoreCSCardProps {
  companyName: string;
  hasMapping: boolean;
  quizzes: CompanyCoreCSQuizDetail[];
}

export function CompanyCoreCSCard({
  companyName,
  hasMapping,
  quizzes,
}: CompanyCoreCSCardProps) {
  if (!hasMapping || quizzes.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Core CS Foundations — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              DBMS, Operating Systems, and Systems Architecture calibration
            </p>
          </div>
        </div>

        <CompanyEmptyState
          icon={HelpCircle}
          title="No Company-Specific Core CS Mapping"
          description={`No company-specific Core CS screening requirements are registered for ${companyName} in the curriculum database. General DBMS & OS preparation remains available in the Core CS Learning Hub.`}
          actionLabel="Explore Core CS Learning Hub"
          actionHref="/dashboard/core-cs"
        />
      </section>
    );
  }

  const passedCount = quizzes.filter((q) => q.isBenchmarkMet).length;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Core CS Screening — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              High-yield conceptual topics tested during {companyName} technical screening rounds
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
          {passedCount} / {quizzes.length} Cleared (≥70% Benchmark)
        </span>
      </div>

      {/* Grid of Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const isDBMS = quiz.subjectSlug.toLowerCase().includes('dbms');
          const Icon = isDBMS ? Database : Cpu;
          const badgeColor = isDBMS
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-purple-50 text-purple-700 border-purple-200';

          return (
            <div
              key={quiz.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}
                  >
                    <Icon className="w-3 h-3" />
                    {quiz.subjectTitle}
                  </span>

                  <span className="font-mono text-[11px] text-slate-400">
                    ⏱ {quiz.durationMin}m • 📝 {quiz.totalQuestions} Questions
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{quiz.title}</h3>

                {/* Score & Benchmark Indicators */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  {quiz.attemptCount > 0 ? (
                    <div className="space-y-0.5">
                      <div className="font-mono text-slate-700">
                        Best Score: <strong className="text-slate-900">{quiz.bestScorePct}%</strong>
                        {quiz.averageScorePct !== null && (
                          <span className="text-slate-400 ml-1.5">(Avg: {quiz.averageScorePct}%)</span>
                        )}
                      </div>
                      <div>
                        {quiz.isBenchmarkMet ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>70% Placement Benchmark Cleared</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Below 70% Benchmark — Review Recommended</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      No attempts recorded yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {quiz.attemptCount > 0 ? `${quiz.attemptCount} attempt(s)` : 'Diagnostic Drill'}
                </span>

                <Link
                  href={`/dashboard/core-cs?subject=${quiz.subjectSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-blue-600 hover:text-blue-700 shadow-2xs transition-colors"
                >
                  <span>{quiz.attemptCount > 0 ? 'Retake Diagnostic' : 'Launch Diagnostic'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
