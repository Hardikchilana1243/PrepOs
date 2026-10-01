'use client';

// ============================================================================
// PREPOS PLACEMENT READINESS COMMAND CENTER MASTER VIEW
// Coordinates Header, Authoritative PRS, Priority Actions, Insights, Dimensions,
// Trends, and Milestones in an engineering cockpit interface
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Lightbulb,
  Layers,
  TrendingUp,
  Trophy,
  ArrowRight,
  ExternalLink,
  FileText,
  Download,
} from 'lucide-react';
import { PlacementReadinessCockpit } from '@/lib/services/readiness-cockpit';
import { ReadinessHeader } from './readiness-header';
import { ReadinessScore } from './readiness-score';
import { ReadinessBreakdown } from './readiness-breakdown';
import { ReadinessInsights } from './readiness-insights';
import { PriorityActions } from './priority-actions';
import { ReadinessTrends } from './readiness-trends';
import { ReadinessMilestones } from './readiness-milestones';
import { ReadinessEmptyState } from './readiness-empty-state';

interface ReadinessViewProps {
  data: PlacementReadinessCockpit;
  studentMeta?: {
    gradYear?: number;
    targetDegree?: string;
  };
}

export function ReadinessView({ data, studentMeta }: ReadinessViewProps) {
  const { overallPRS, dimensions, insights, priorityActions, trends, milestones } = data;

  const isBrandNewStudent =
    overallPRS.isBaselineOnly &&
    dimensions.dsa.completedActivity === 0 &&
    dimensions.coreCs.quizAttemptsCount === 0 &&
    dimensions.assessment.attemptsCount === 0;

  return (
    <div className="space-y-7 pb-16">
      {/* 1. Header Banner */}
      <ReadinessHeader
        overallPRS={overallPRS}
        targetCompanyName={dimensions.company.targetCompanyName}
        targetCompanySlug={dimensions.company.targetCompanySlug}
        targetRoleTier={dimensions.company.targetRoleTier}
        gradYear={studentMeta?.gradYear}
        targetDegree={studentMeta?.targetDegree}
      />

      {/* 2. Cockpit Quick Anchor Jump Navigation */}
      <nav aria-label="Readiness sections" className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold text-slate-600">
        <a
          href="#overall-score"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>PRS Score</span>
        </a>
        <a
          href="#dossier"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Placement Dossier</span>
        </a>
        <a
          href="#priority-actions"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Priority Actions ({priorityActions.length})</span>
        </a>
        <a
          href="#insights"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
          <span>Insights ({insights.length})</span>
        </a>
        <a
          href="#dimensions"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-slate-700" />
          <span>Readiness Pillars (5)</span>
        </a>
        <a
          href="#trends"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Trends</span>
        </a>
        <a
          href="#milestones"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Milestones ({milestones.length})</span>
        </a>
      </nav>

      {/* 3. Overall Placement Readiness Score (Authoritative PRS v1) */}
      <div id="overall-score">
        <ReadinessScore overallPRS={overallPRS} />
      </div>

      {/* If Brand New Student, show helpful starter roadmap */}
      {isBrandNewStudent && <ReadinessEmptyState />}

      {/* 4. Placement Readiness Dossier Section (Section 21) */}
      <section
        id="dossier"
        aria-labelledby="dossier-heading"
        className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/10 text-white inline-flex border border-white/10">
              <FileText className="w-4 h-4 text-blue-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Official Placement Export
            </span>
          </div>

          <h2 id="dossier-heading" className="text-xl sm:text-2xl font-bold tracking-tight">
            Placement Readiness Dossier & Verification Engine
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Generate an authoritative, tamper-evident Placement Readiness Dossier compiling your verified DSA problem solutions, Core CS diagnostic scores, mock OA attempts, and target company pattern coverage. Formatted for direct presentation to campus placement cells and recruiters.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono pt-1">
            <span>Coverage: DSA · Core CS · OAs · Companies · SM-2</span>
            {overallPRS.lastUpdated && <span>· Last calibrated: {overallPRS.lastUpdated}</span>}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/readiness/report"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>View Dossier</span>
          </Link>

          <a
            href="/dashboard/readiness/report/pdf"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>
        </div>
      </section>

      {/* 5. Priority Action Plan (Top 3-5 deterministic tasks) */}
      <PriorityActions actions={priorityActions} />

      {/* 6. Intelligence / Insights Engine */}
      <ReadinessInsights insights={insights} />

      {/* 7. Readiness Breakdown by Pillar (DSA, Core CS, Company, OA, Revision) */}
      <ReadinessBreakdown dimensions={dimensions} />

      {/* 8. Performance Trends Trajectory */}
      <ReadinessTrends trends={trends} />

      {/* 9. Readiness Milestones Roadmap */}
      <ReadinessMilestones milestones={milestones} />
    </div>
  );
}
