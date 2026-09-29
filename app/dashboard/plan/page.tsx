import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getWeeklyPlanData } from '@/lib/services/weekly-plan';
import { getAdaptivePreparationData } from '@/lib/services/adaptive-preparation';
import { PageHeader } from '@/components/ui/student-os';
import { RecommendationCard } from '@/components/adaptive/recommendation-card';
import { WeeklyProgress } from '@/components/adaptive/weekly-progress';
import { PlanTaskList } from '@/components/adaptive/plan-task-list';
import { PreparationInsights } from '@/components/adaptive/preparation-insights';
import { ReadinessExplanation } from '@/components/adaptive/readiness-explanation';
import { AlertTriangle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Preparation Plan | PrepOS',
  description: 'Deterministic adaptive study plan, weekly targets, and placement readiness orchestration.',
};

export default async function PreparationPlanPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const [weeklyPlan, adaptiveData] = await Promise.all([
    getWeeklyPlanData(user.id),
    getAdaptivePreparationData(user.id),
  ]);

  const hasOverdue = weeklyPlan.overdueTasks.length > 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      <PageHeader
        title="Preparation Plan"
        subtitle="Intelligent study orchestration answering what to do next based on your real performance and memory retention intervals"
        tag="Adaptive Orchestrator"
      />

      {/* Overdue alert banner if applicable */}
      {hasOverdue && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Overdue Recall Risk: </span>
            <span>
              {weeklyPlan.overdueTasks.length} problem(s) have passed their SM-2 scheduled review window. Practice active recall now before memory decay sets in.
            </span>
          </div>
        </div>
      )}

      {/* Primary Recommended Next Step */}
      <RecommendationCard
        recommendation={adaptiveData.recommendation}
        showPlanLink={false}
      />

      {/* Weekly Targets & Progress */}
      <WeeklyProgress
        weekStartFormatted={weeklyPlan.weekStartFormatted}
        weekEndFormatted={weeklyPlan.weekEndFormatted}
        overallWeeklyPct={weeklyPlan.overallWeeklyPct}
        currentStreak={weeklyPlan.currentStreak}
        targets={weeklyPlan.targets}
      />

      {/* Interactive Plan Task List (Today / This Week / Remaining / Completed) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Study Queue & Targets
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {weeklyPlan.remainingCount} Pending / {weeklyPlan.completedCount} Completed
          </span>
        </div>

        <PlanTaskList
          todayTasks={weeklyPlan.todayTasks}
          allWeeklyTasks={weeklyPlan.allWeeklyTasks}
        />
      </section>

      {/* Preparation Insights Section */}
      <PreparationInsights insights={adaptiveData.insights} />

      {/* Placement Readiness Explainability Audit */}
      <ReadinessExplanation
        pillars={adaptiveData.pillarsStatus}
        prsSummary={adaptiveData.prsSummary}
      />
    </div>
  );
}
