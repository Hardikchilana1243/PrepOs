'use client';

// ============================================================================
// PREPOS PLACEMENT READINESS COMMAND CENTER MASTER VIEW (PHASE 6.14)
// Execution-Oriented Command Center Hierarchy:
// Placement Readiness → Current Position → Critical Gaps → Today's Execution
// → Upcoming Targets → Verification → Pillars & Historical Trends
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  CalendarDays,
  Building2,
  CheckSquare,
  Lock,
  Layers,
  TrendingUp,
  History,
  Trophy,
} from 'lucide-react';
import { PlacementReadinessCockpit } from '@/lib/services/readiness-cockpit';
import { FinalReadinessExecutionData } from '@/lib/services/readiness-execution';
import { DailyExecutionWorkspaceData } from '@/lib/services/daily-execution';
import { ExecutionHeader } from './execution-header';
import { ReadinessGaps } from './readiness-gaps';
import { DailyExecutionPlan } from './daily-execution-plan';
import { TodayExecutionHeader } from './today-execution-header';
import { ExecutionProgress } from './execution-progress';
import { ExecutionTaskList } from './execution-task-list';
import { ExecutionCompletionState } from './execution-completion-state';
import { ExecutionConsistency } from './execution-consistency';
import { ExecutionHistory } from './execution-history';
import { ExecutionUpcoming } from './execution-upcoming';
import { PlacementTargets } from './placement-targets';
import { FinalReadinessChecklist } from './final-readiness-checklist';
import { ReadinessActivity } from './readiness-activity';
import { VerificationControls } from './verification-controls';
import { ReadinessBreakdown } from './readiness-breakdown';
import { ReadinessTrends } from './readiness-trends';
import { ReadinessMilestones } from './readiness-milestones';
import { ReadinessEmptyState } from './readiness-empty-state';
import { InterviewReadinessSummaryCard } from './interview-readiness-summary';
import { InterviewReadinessSummary } from '@/lib/services/interview';

interface ReadinessViewProps {
  executionData?: FinalReadinessExecutionData;
  dailyExecution?: DailyExecutionWorkspaceData;
  data?: PlacementReadinessCockpit;
  interviewSummary?: InterviewReadinessSummary;
  studentMeta?: {
    gradYear?: number;
    targetDegree?: string;
  };
}

export function ReadinessView({
  executionData,
  dailyExecution,
  data,
  interviewSummary,
  studentMeta,
}: ReadinessViewProps) {
  // Graceful fallback if only legacy cockpit data is passed
  const cockpit = executionData?.cockpit ?? data;

  if (!cockpit) {
    return <ReadinessEmptyState />;
  }

  const { overallPRS, dimensions, trends, milestones } = cockpit;

  // Synthesize position data if executionData is not passed directly
  const currentPosition = executionData?.currentPosition ?? {
    prsScore: overallPRS.score,
    prsTier: overallPRS.tier,
    prsTierLabel: overallPRS.tierLabel,
    composition: {
      dsaWeight: 40,
      coreCsWeight: 30,
      oaWeight: 15,
      consistencyWeight: 15,
      dsaScore: overallPRS.dsaScore,
      coreCsScore: overallPRS.coreCsScore,
      oaScore: overallPRS.oaScore,
      consistencyScore: overallPRS.consistencyScore,
    },
    preparationCompletionPct: overallPRS.completionPct,
    dsaRemaining: {
      solved: dimensions.dsa.completedActivity,
      total: dimensions.dsa.totalActivity,
      remaining: Math.max(0, dimensions.dsa.totalActivity - dimensions.dsa.completedActivity),
      solvedPct: Math.round((dimensions.dsa.completedActivity / Math.max(1, dimensions.dsa.totalActivity)) * 100),
    },
    coreCsBenchmark: {
      currentAvg: dimensions.coreCs.avgScorePct,
      benchmarkPct: 70,
      isMet: dimensions.coreCs.avgScorePct >= 70,
      passedQuizzes: dimensions.coreCs.quizAttemptsCount,
      totalQuizzes: 10,
    },
    oaHistory: {
      completedCount: dimensions.assessment.attemptsCount,
      passedCount: dimensions.assessment.passedCount,
      latestAttempt: null,
    },
    revisionWorkload: {
      dueToday: dimensions.revision.dueTodayCount,
      overdue: dimensions.revision.overdueCount,
      totalScheduled: dimensions.revision.inScheduleCount,
      healthPct: dimensions.revision.retentionHealthPct,
    },
    targetCompanyCoverage: {
      primaryTarget: dimensions.company.targetCompanyName || null,
      targetCompaniesCount: dimensions.company.targetCompanyName ? 1 : 0,
      avgCoveragePct: dimensions.company.score,
    },
    activeStreak: overallPRS.streakDays,
  };

  const isBrandNewStudent =
    overallPRS.isBaselineOnly &&
    dimensions.dsa.completedActivity === 0 &&
    dimensions.coreCs.quizAttemptsCount === 0 &&
    dimensions.assessment.attemptsCount === 0;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Placement Execution Masthead & Current Position */}
      <ExecutionHeader
        currentPosition={currentPosition}
        studentMeta={studentMeta}
      />

      {/* 2. Cockpit Quick Anchor Jump Navigation */}
      <nav
        aria-label="Execution sections"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold text-slate-600 print:hidden"
      >
        <a
          href="#critical-gaps"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Critical Gaps ({executionData?.criticalGaps.length ?? 0})</span>
        </a>

        <a
          href="#today-execution"
          className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-300 text-blue-800 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors font-bold"
        >
          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
          <span>Today&apos;s Execution</span>
        </a>

        <a
          href="#consistency-analytics"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Consistency</span>
        </a>

        <a
          href="#targets"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Target Companies</span>
        </a>

        <a
          href="#checklist"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Readiness Checklist</span>
        </a>

        <a
          href="#verification"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Verification & Dossier</span>
        </a>

        <a
          href="#activity"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-slate-600" />
          <span>Activity Timeline</span>
        </a>

        <a
          href="#pillars"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-slate-700" />
          <span>5 Pillars</span>
        </a>

        <a
          href="#trends"
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Trends</span>
        </a>
      </nav>

      {/* Brand New Student Starter Guide */}
      {isBrandNewStudent && <ReadinessEmptyState />}

      {/* 3. Critical Gaps Engine */}
      {executionData && <ReadinessGaps gaps={executionData.criticalGaps} />}

      {/* 4. Today's Placement Execution Engine (Phase 6.15) */}
      {dailyExecution ? (
        <section id="today-execution" className="space-y-6">
          <TodayExecutionHeader summary={dailyExecution.summary} />
          <ExecutionProgress summary={dailyExecution.summary} />
          {dailyExecution.summary.status === 'ALL_COMPLETED' ? (
            <ExecutionCompletionState summary={dailyExecution.summary} />
          ) : (
            <ExecutionTaskList tasks={dailyExecution.tasks} dateIso={dailyExecution.summary.dateIso} />
          )}
        </section>
      ) : executionData ? (
        <DailyExecutionPlan plan={executionData.dailyExecutionPlan} />
      ) : null}

      {/* 5. Placement Target Timeline & Company Coverage */}
      {executionData && <PlacementTargets placementTargets={executionData.placementTargets} />}

      {/* 5b. Interview Preparation & Practice Workspace Integration */}
      {interviewSummary && <InterviewReadinessSummaryCard summary={interviewSummary} />}

      {/* 5c. Consistency Analytics Engine (Phase 6.15) */}
      {dailyExecution && <ExecutionConsistency consistency={dailyExecution.consistency} />}

      {/* 5d. Daily Execution History (Phase 6.15) */}
      {dailyExecution && <ExecutionHistory history={dailyExecution.history} />}

      {/* 5e. Upcoming Execution Workload (Phase 6.15) */}
      {dailyExecution && <ExecutionUpcoming upcoming={dailyExecution.upcoming} />}

      {/* 6. Final Readiness Checklist */}
      {executionData && <FinalReadinessChecklist finalChecklist={executionData.finalChecklist} />}

      {/* 7. Verification Controls & Dossier Sharing */}
      {executionData ? (
        <VerificationControls verificationControls={executionData.verificationControls} />
      ) : (
        <section
          id="verification"
          className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Placement Readiness Dossier</h3>
            <p className="text-xs text-slate-400">
              Compile your verified DSA solutions, Core CS scores, and mock assessments.
            </p>
          </div>
          <Link
            href="/dashboard/readiness/report"
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold"
          >
            Open Dossier
          </Link>
        </section>
      )}

      {/* 8. Readiness Activity Timeline */}
      {executionData && <ReadinessActivity activityTimeline={executionData.activityTimeline} />}

      {/* 9. Readiness Breakdown by Pillar (DSA, Core CS, Company, OA, Revision) */}
      <div id="pillars">
        <ReadinessBreakdown dimensions={dimensions} />
      </div>

      {/* 10. Performance Trends Trajectory */}
      <div id="trends">
        <ReadinessTrends trends={trends} />
      </div>

      {/* 11. Readiness Milestones Roadmap */}
      <div id="milestones">
        <ReadinessMilestones milestones={milestones} />
      </div>
    </div>
  );
}
