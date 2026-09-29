import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import {
  Target,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';

export const dynamic = 'force-dynamic';

export default async function AssessmentsHubPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch all published assessments and student attempts
  const [assessments, userAttempts] = await Promise.all([
    prisma.assessment.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        company: {
          select: {
            name: true,
            slug: true,
          },
        },
        sections: {
          select: {
            id: true,
            title: true,
            type: true,
            totalMarks: true,
          },
        },
        attempts: {
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            scorePct: true,
            passed: true,
            createdAt: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.assessmentAttempt.findMany({
      where: { userId: user.id },
      select: {
        scorePct: true,
        passed: true,
      },
    }),
  ]);

  const attemptedCount = userAttempts.length;
  const passedCount = userAttempts.filter((a) => a.passed).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              Online Assessment Engine
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">• Timed OA Simulations</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Company Mock Assessments
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Experience realistic campus recruitment online assessments. Timed countdowns, multi-section
            structure (Coding & Core CS), automated execution against hidden test cases, and authoritative scoring.
          </p>
        </div>

        {/* Real Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className="text-xl font-bold text-slate-900">{assessments.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Available
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className="text-xl font-bold text-blue-600">{attemptedCount}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Attempted
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono col-span-2 sm:col-span-1">
            <div className="text-xl font-bold text-emerald-600">{passedCount}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Passed
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Cards List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Placement Simulations</span>
        </h2>

        <div className="space-y-3">
          {assessments.map((a) => {
            const latestAttempt = a.attempts[0];

            return (
              <div
                key={a.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      <Building2 className="w-3 h-3" />
                      {a.company.name}
                    </span>

                    <DifficultyBadge difficulty={a.difficulty} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {a.title}
                  </h3>

                  {a.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {a.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                    <span>⏱ {a.durationMin} mins</span>
                    <span>•</span>
                    <span>📝 {a.totalQuestions} Questions</span>
                    <span>•</span>
                    <span>🎯 {a.totalMarks} Points</span>
                    <span>•</span>
                    <span>{a.sections.length} Sections</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {latestAttempt && (
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-slate-900">
                        {latestAttempt.scorePct}%
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {latestAttempt.passed ? (
                          <span className="text-emerald-600 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Benchmark Cleared
                          </span>
                        ) : (
                          <span className="text-amber-600 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Needs Practice
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/assessments/${a.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors min-h-[42px]"
                  >
                    <span>{latestAttempt ? 'Review / Retake' : 'Launch Simulation'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
