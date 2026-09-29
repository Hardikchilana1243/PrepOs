import React from 'react';
import Link from 'next/link';
import { Target, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';

export interface CompanyAssessmentItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: string;
  sectionsCount: number;
  latestAttempt?: {
    id: string;
    status: string;
    scorePct: number;
    passed: boolean;
  } | null;
}

interface CompanyAssessmentSectionProps {
  assessments: CompanyAssessmentItem[];
  companyName: string;
}

export function CompanyAssessmentSection({
  assessments,
  companyName,
}: CompanyAssessmentSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-blue-600" />
          <span>Online Assessment (OA) Simulations</span>
        </h3>
        <span className="text-xs font-mono font-medium text-slate-500">
          {assessments.length} Simulation{assessments.length > 1 ? 's' : ''} Configured
        </span>
      </div>

      {assessments.length > 0 ? (
        <div className="space-y-2.5">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{a.title}</span>
                  <DifficultyBadge difficulty={a.difficulty} size="sm" />
                </div>
                {a.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                    {a.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-mono">
                  <span>⏱ {a.durationMin} mins</span>
                  <span>•</span>
                  <span>📝 {a.totalQuestions} Questions ({a.sectionsCount} Sections)</span>
                  <span>•</span>
                  <span>🎯 {a.totalMarks} Points</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {a.latestAttempt && (
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-800">
                      Previous: {a.latestAttempt.scorePct}%
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {a.latestAttempt.passed ? (
                        <span className="text-emerald-600 font-semibold">✓ Benchmark Cleared</span>
                      ) : (
                        <span className="text-amber-600 font-semibold">Retry Recommended</span>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href={`/dashboard/assessments/${a.slug}`}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm min-h-[40px]"
                >
                  <span>{a.latestAttempt ? 'Review / Retake' : 'Launch Simulation'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400">
          No mock OA simulation currently registered for {companyName}. Check back soon or solve tagged problems.
        </div>
      )}
    </div>
  );
}
