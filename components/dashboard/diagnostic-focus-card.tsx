import React from 'react';
import Link from 'next/link';
import { PRSComponents } from '@/lib/services/readiness-score';
import {
  Compass,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Code2,
  Cpu,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

interface DiagnosticFocusCardProps {
  readiness: PRSComponents;
  dsaProgress: {
    solvedCount: number;
    totalCount: number;
    nextProblem: {
      title: string;
      slug: string;
      difficulty: string;
    } | null;
  };
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
  revisionSummary: {
    dueCount: number;
    nextRevisionTitle: string | null;
  };
}

export function DiagnosticFocusCard({
  readiness,
  dsaProgress,
  coreCsProgress,
  revisionSummary,
}: DiagnosticFocusCardProps) {
  // Determine the highest-impact next action based purely on actual database metrics
  const getNextAction = () => {
    // 1. Spaced Repetition Due (High urgency to avoid memory decay)
    if (revisionSummary.dueCount > 0) {
      return {
        priority: 'REVISION',
        tag: 'Retention Priority',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />,
        title: `${revisionSummary.dueCount} topic(s) due for spaced review`,
        description: revisionSummary.nextRevisionTitle
          ? `Review "${revisionSummary.nextRevisionTitle}" to maintain recall intervals before placement interviews.`
          : 'Complete SM-2 spaced repetition items to protect mastered algorithms from memory decay.',
        ctaText: 'Review Queue',
        ctaHref: '/dashboard/revision',
      };
    }

    // 2. Mock OA Unattempted (15% PRS gap)
    if (readiness.oaScore === 0) {
      return {
        priority: 'OA',
        tag: 'Placement Gap',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />,
        title: 'Company Online Assessment simulation pending',
        description:
          'Taking a timed mock assessment tests your speed under real test conditions and unlocks 15% of your Readiness Index.',
        ctaText: 'Take Practice Assessment',
        ctaHref: '/dashboard/assessments',
      };
    }

    // 3. Core CS Diagnostic Gap
    if (
      coreCsProgress.attemptedCount < coreCsProgress.totalQuizzes &&
      coreCsProgress.nextQuiz
    ) {
      return {
        priority: 'CORE_CS',
        tag: 'Knowledge Depth',
        badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        icon: <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />,
        title: `Take ${coreCsProgress.nextQuiz.title} drill`,
        description: `Complete this diagnostic quiz in ${coreCsProgress.nextQuiz.subjectTitle} to diagnose topic strengths and weakness areas.`,
        ctaText: 'Start Diagnostic Drill',
        ctaHref: `/dashboard/core-cs?quiz=${coreCsProgress.nextQuiz.slug}`,
      };
    }

    // 4. DSA Roadmap Next Problem
    if (dsaProgress.nextProblem) {
      return {
        priority: 'DSA',
        tag: 'Curriculum Progression',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: <Code2 className="w-4 h-4 text-blue-600 shrink-0" />,
        title: `Solve: ${dsaProgress.nextProblem.title}`,
        description: `Next unsolved problem in the curriculum (${dsaProgress.nextProblem.difficulty}). Solved ${dsaProgress.solvedCount} of ${dsaProgress.totalCount} problems.`,
        ctaText: 'Solve Problem',
        ctaHref: `/dashboard/dsa/problem/${dsaProgress.nextProblem.slug}`,
      };
    }

    // 5. All Current Goals Met
    return {
      priority: 'COMPLETED',
      tag: 'Curriculum Complete',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      title: 'Current curriculum targets up to date',
      description:
        'All standard curriculum problems and diagnostic drills completed. Continue practicing company hiring patterns.',
      ctaText: 'Browse Company Hubs',
      ctaHref: '/dashboard/companies',
    };
  };

  const action = getNextAction();

  return (
    <section
      aria-labelledby="diagnostic-focus-heading"
      className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Recommended Next Step */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-5 h-5 text-slate-700" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2
                id="diagnostic-focus-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Recommended Next Step
              </h2>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.2 rounded border ${action.badgeColor}`}
              >
                {action.tag}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {action.icon}
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate">
                {action.title}
              </h3>
            </div>

            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>

        {/* Right: Direct Action Button */}
        <div className="self-start md:self-center shrink-0">
          <Link
            href={action.ctaHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
          >
            <span>{action.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
