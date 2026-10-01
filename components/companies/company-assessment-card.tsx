import React from 'react';
import Link from 'next/link';
import {
  Target,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';
import { CompanyAssessmentDetail } from '@/lib/services/companies';
import { CompanyEmptyState } from './company-empty-state';

interface CompanyAssessmentCardProps {
  companyName: string;
  hasAssessments: boolean;
  assessments: CompanyAssessmentDetail[];
}

export function CompanyAssessmentCard({
  companyName,
  hasAssessments,
  assessments,
}: CompanyAssessmentCardProps) {
  if (!hasAssessments || assessments.length === 0) {
    return (
      <section id="assessments-section" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Online Assessment Simulations — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Calibrated mock tests matching recruitment formats
            </p>
          </div>
        </div>

        <CompanyEmptyState
          icon={HelpCircle}
          title="No Mock OA Simulation Registered"
          description={`No company-specific online assessment simulation is currently published for ${companyName}. Timed simulations remain available for other tier-1 recruiters in the Mock Assessments Hub.`}
          actionLabel="Browse Mock Assessments"
          actionHref="/dashboard/assessments"
        />
      </section>
    );
  }

  const passedCount = assessments.filter((a) => a.isPassed).length;

  return (
    <section id="assessments-section" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Mock OA Simulations — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Timed practice tests calibrated to {companyName} recruitment online evaluation formats
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
          {passedCount} / {assessments.length} Simulation{assessments.length > 1 ? 's' : ''} Cleared
        </span>
      </div>

      {/* Assessment List */}
      <div className="space-y-3">
        {assessments.map((a) => {
          const attempt = a.latestAttempt;

          return (
            <div
              key={a.id}
              className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Details */}
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {a.title}
                  </h3>
                  <DifficultyBadge difficulty={a.difficulty} size="sm" />
                </div>

                {a.description && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {a.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{a.durationMin} mins</span>
                  </span>
                  <span>•</span>
                  <span>{a.totalQuestions} Questions</span>
                  <span>•</span>
                  <span>{a.sectionsCount} Sections (Coding + Core CS)</span>
                  <span>•</span>
                  <span>{a.totalMarks} Total Marks</span>
                </div>
              </div>

              {/* Right: Attempt State & CTA */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                {attempt ? (
                  <div className="text-left md:text-right space-y-0.5">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      Score: {attempt.scorePct}% ({attempt.totalScore}/{attempt.maxPossibleScore} pts)
                    </div>
                    <div>
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cleared ({a.passingScorePct}% Pass Mark)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Below {a.passingScorePct}% Passing Mark</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Not attempted yet</span>
                )}

                <Link
                  href={`/dashboard/assessments/${a.slug}`}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>{attempt ? 'Review / Retake' : 'Launch Simulation'}</span>
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
