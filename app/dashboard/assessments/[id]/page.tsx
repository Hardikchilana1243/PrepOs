import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Clock,
  Award,
  Layers,
  Code2,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
}
  from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { getAssessmentOverview } from '@/lib/services/assessment';
import { PageHeader, DifficultyBadge } from '@/components/ui/student-os';
import { AssessmentStartButton } from '@/components/assessments/assessment-start-button';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AssessmentOverviewPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const overview = await getAssessmentOverview(params.id, user.id);
  if (!overview) {
    notFound();
  }

  const hasActive = Boolean(overview.activeAttempt);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Navigation Links */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/assessments"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Assessments</span>
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href={`/dashboard/companies/${overview.companySlug}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <span>{overview.companyName} Hub</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {overview.companyName} Assessment Hub
              </span>
              <DifficultyBadge difficulty={overview.difficulty} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {overview.title}
            </h1>

            {overview.description && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {overview.description}
              </p>
            )}
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <AssessmentStartButton
              assessmentSlugOrId={overview.slug}
              activeAttemptId={overview.activeAttempt?.attemptId}
              hasActiveAttempt={hasActive}
            />
          </div>
        </div>

        {/* Quick Format Specifier Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Exam Duration
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{overview.durationMin} Minutes</span>
            </div>
            <div className="text-[10px] text-slate-500">Authoritative Server Timer</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Marks
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {overview.totalMarks} Points
            </div>
            <div className="text-[10px] text-slate-500">Sectional Weightage</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Questions
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {overview.totalQuestions} Questions
            </div>
            <div className="text-[10px] text-slate-500">
              {overview.sections.length} Sections (Coding + Core CS)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Passing Target
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {overview.passingScorePct}% Score
            </div>
            <div className="text-[10px] text-slate-500">Benchmark Cutoff</div>
          </div>
        </div>

        {/* Syllabus / Sections Breakdown */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Assessment Sections & Structure</span>
          </h2>

          <div className="space-y-2.5">
            {overview.sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {sec.type === 'CODING' ? 'Algorithmic Coding' : 'Core CS MCQs'}
                      </span>
                    </div>
                    {sec.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>
                    )}
                  </div>
                </div>

                <div className="text-right sm:shrink-0 text-xs font-mono text-slate-600">
                  <span className="font-semibold text-slate-900">{sec.questionsCount} Questions</span>
                  <span className="mx-1">•</span>
                  <span>{sec.totalMarks} Marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Guidelines & Integrity Rules */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2 text-xs">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            <span>Placement Assessment Guidelines</span>
          </div>
          <ul className="text-slate-600 space-y-1 pl-4 list-disc leading-relaxed">
            <li>The assessment timer runs authoritatively on the server. If time expires, your latest saved drafts will be evaluated automatically.</li>
            <li>Code is continuously autosaved. You can navigate between problems or refresh your browser without losing progress.</li>
            <li>Core CS multiple choice questions contain negative marking (-0.5 points for incorrect answers). Unanswered questions are not penalized.</li>
            <li>Your final score contributes directly to the 15% Online Assessment component of your Placement Readiness Score (PRS).</li>
          </ul>
        </div>
      </div>

      {/* Attempt History Section */}
      {overview.pastAttempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Your Previous Attempts ({overview.pastAttempts.length})</span>
          </h2>

          <div className="space-y-2">
            {overview.pastAttempts.map((att) => (
              <div
                key={att.attemptId}
                className="p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-700">
                    #{att.attemptNumber}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Attempt {att.attemptNumber} — {att.passed ? 'Passed Cutoff' : 'Completed'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(att.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900">
                      {att.scorePct}% ({att.totalScore}/{att.maxPossibleScore} pts)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {Math.floor(att.durationTakenSec / 60)}m {att.durationTakenSec % 60}s used
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/assessments/${overview.slug}/attempt/${att.attemptId}/result`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
