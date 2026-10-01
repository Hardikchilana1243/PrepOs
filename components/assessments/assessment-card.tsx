'use client';

// ============================================================================
// PREPOS ASSESSMENT CARD COMPONENT
// High-scanability, compact card with company links, status badges, & direct actions
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Star,
  Building2,
  FileText,
  Code2,
  BookOpen,
} from 'lucide-react';
import { AssessmentCatalogItem } from '@/lib/services/assessment';
import { DifficultyBadge } from '@/components/ui/student-os';

interface AssessmentCardProps {
  assessment: AssessmentCatalogItem;
  viewMode?: 'CARD' | 'ROW';
}

export function AssessmentCard({ assessment, viewMode = 'CARD' }: AssessmentCardProps) {
  const isTarget = assessment.company.isTarget;
  const inProgress = assessment.status === 'IN_PROGRESS';
  const completed = assessment.status === 'COMPLETED';

  // Primary action button routing
  let primaryAction: {
    label: string;
    href: string;
    variant: 'primary' | 'amber' | 'secondary';
    icon: React.ReactNode;
  };

  if (inProgress && assessment.activeAttempt) {
    primaryAction = {
      label: 'Continue Exam',
      href: `/dashboard/assessments/${assessment.slug}/attempt/${assessment.activeAttempt.attemptId}`,
      variant: 'amber',
      icon: <Play className="w-3.5 h-3.5 fill-current" />,
    };
  } else if (completed && assessment.latestAttemptId) {
    primaryAction = {
      label: 'Review Report',
      href: `/dashboard/assessments/${assessment.slug}/attempt/${assessment.latestAttemptId}/result`,
      variant: 'secondary',
      icon: <FileText className="w-3.5 h-3.5" />,
    };
  } else {
    primaryAction = {
      label: 'Start Assessment',
      href: `/dashboard/assessments/${assessment.slug}`,
      variant: 'primary',
      icon: <ArrowRight className="w-3.5 h-3.5" />,
    };
  }

  return (
    <div
      className={`rounded-2xl bg-white border transition-all duration-200 hover:shadow-md ${
        inProgress
          ? 'border-amber-300 ring-1 ring-amber-200'
          : completed && assessment.isPassed
          ? 'border-emerald-200/90 hover:border-emerald-300'
          : 'border-slate-200/90 hover:border-slate-300'
      } p-5 flex flex-col justify-between gap-4`}
    >
      {/* Top Header: Company badge, Target star, Difficulty, & Format */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/dashboard/companies/${assessment.company.slug}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title={`View ${assessment.company.name} Preparation Hub`}
            >
              <Building2 className="w-3 h-3 text-slate-500" />
              <span>{assessment.company.name}</span>
            </Link>

            {isTarget && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                title="Your Target Company"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>Target</span>
              </span>
            )}

            <DifficultyBadge difficulty={assessment.difficulty} size="sm" />
          </div>

          {/* Assessment Type Tag */}
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-mono">
            {assessment.assessmentType}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <Link
            href={`/dashboard/assessments/${assessment.slug}`}
            className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {assessment.title}
          </Link>
          {assessment.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {assessment.description}
            </p>
          )}
        </div>

        {/* Exam Structure Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600 font-mono">
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{assessment.durationMin}m</span>
          </span>

          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            <span>📝</span>
            <span>{assessment.totalQuestions} Qs</span>
          </span>

          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            <span>🎯</span>
            <span>{assessment.totalMarks} pts</span>
          </span>

          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-slate-500">
            <span>Target: {assessment.passingScorePct}%</span>
          </span>
        </div>
      </div>

      {/* Bottom Footer: Attempt Status Indicator + Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Indicator (Text + Icon for Accessibility) */}
        <div className="flex items-center gap-2">
          {inProgress ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>
                In Progress{' '}
                {assessment.activeAttempt && assessment.activeAttempt.remainingSeconds > 0
                  ? `(${Math.floor(assessment.activeAttempt.remainingSeconds / 60)}m left)`
                  : ''}
              </span>
            </div>
          ) : completed ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {assessment.isPassed ? (
                  <span className="text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cleared Cutoff</span>
                  </span>
                ) : (
                  <span className="text-amber-700 inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Needs Practice</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Latest: <strong className="text-slate-700">{assessment.latestScorePct}%</strong>
                {assessment.bestScorePct !== null && assessment.bestScorePct !== assessment.latestScorePct && (
                  <span className="ml-1.5">
                    • Best: <strong className="text-slate-700">{assessment.bestScorePct}%</strong>
                  </span>
                )}
                <span className="ml-1.5">({assessment.attemptsCount} {assessment.attemptsCount === 1 ? 'attempt' : 'attempts'})</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Not Attempted</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {completed && (
            <Link
              href={`/dashboard/assessments/${assessment.slug}`}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 inline-flex items-center gap-1 transition-colors min-h-[38px]"
              title="Retake this assessment simulation"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Retake</span>
            </Link>
          )}

          <Link
            href={primaryAction.href}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[38px] ${
              primaryAction.variant === 'amber'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : primaryAction.variant === 'secondary'
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span>{primaryAction.label}</span>
            {primaryAction.icon}
          </Link>
        </div>
      </div>
    </div>
  );
}
