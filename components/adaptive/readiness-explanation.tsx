'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Code2,
  Target,
  Flame,
} from 'lucide-react';
import {
  PreparationPillarStatus,
  MasteryLevel,
} from '@/lib/services/adaptive-preparation';
import { Badge, ProgressBar } from '@/components/ui/student-os';

interface ReadinessExplanationProps {
  pillars: PreparationPillarStatus[];
  prsSummary: {
    totalScore: number;
    dsaScore: number;
    coreCsScore: number;
    oaScore: number;
    consistencyScore: number;
    isBaselineOnly: boolean;
  };
  className?: string;
}

export function ReadinessExplanation({
  pillars,
  prsSummary,
  className = '',
}: ReadinessExplanationProps) {
  const getLevelBadge = (level: MasteryLevel) => {
    switch (level) {
      case 'STRONG':
        return (
          <Badge variant="success" size="sm" dot>
            Strong
          </Badge>
        );
      case 'ON_TRACK':
        return (
          <Badge variant="primary" size="sm" dot>
            On Track
          </Badge>
        );
      case 'DEVELOPING':
        return (
          <Badge variant="warning" size="sm" dot>
            Developing
          </Badge>
        );
      case 'NEEDS_EVIDENCE':
      default:
        return (
          <Badge variant="default" size="sm" dot>
            Needs Evidence
          </Badge>
        );
    }
  };

  const getPillarIcon = (area: string) => {
    switch (area) {
      case 'DSA':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'ASSESSMENT':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'CONSISTENCY':
        return <Flame className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPillarWeight = (area: string) => {
    switch (area) {
      case 'DSA':
        return '40% PRS Weight';
      case 'CORE_CS':
        return '30% PRS Weight';
      case 'ASSESSMENT':
        return '15% PRS Weight';
      case 'CONSISTENCY':
        return '15% PRS Weight';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Placement Readiness Explainability
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of mathematical weights and verified database evidence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xl font-black text-slate-900">
                {prsSummary.totalScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-600">
                Placement Index (v1)
              </div>
            </div>
          </div>
        </div>

        {prsSummary.isBaselineOnly && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-xs text-amber-800">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Baseline profile calibrated. Complete DSA problems, Core CS quizzes, and mock assessments to record active progress.
            </span>
          </div>
        )}
      </div>

      {/* Pillar Breakdown Cards */}
      <div className="space-y-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.area}
            className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
                    {getPillarIcon(pillar.area)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {pillar.name}
                  </h4>
                  <span className="text-xs font-medium text-slate-400">
                    ({getPillarWeight(pillar.area)})
                  </span>
                  {getLevelBadge(pillar.level)}
                </div>

                <p className="text-xs font-semibold text-slate-700">
                  {pillar.headline}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-sm font-bold text-slate-900">
                  {pillar.metric}
                </span>
                <div className="text-[11px] text-slate-400">
                  Current Contribution: {pillar.scorePct}%
                </div>
              </div>
            </div>

            {/* Evidence & Remedy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="md:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Evidence: </span>
                <span>{pillar.evidence}</span>
              </div>

              <div className="flex flex-col justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-slate-700">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase">
                    Recommended Action
                  </span>
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {pillar.remedyAction.title}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={pillar.remedyAction.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>{pillar.remedyAction.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
