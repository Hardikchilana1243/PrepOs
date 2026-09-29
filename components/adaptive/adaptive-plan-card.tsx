'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, CheckCircle, Clock } from 'lucide-react';
import { AdaptivePlanTask } from '@/lib/services/adaptive-preparation';
import { AdaptiveTaskRow } from './adaptive-task-row';

interface AdaptivePlanCardProps {
  tasks: AdaptivePlanTask[];
  className?: string;
  showAllTasksLink?: boolean;
}

export function AdaptivePlanCard({
  tasks,
  className = '',
  showAllTasksLink = true,
}: AdaptivePlanCardProps) {
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Today&apos;s Adaptive Plan
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic priority actions ordered by measurable placement impact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="hidden sm:inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>~{totalMinutes} min total</span>
          </span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
            {completedCount}/{tasks.length} Done
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-6 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">
            All Priority Targets Completed
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You have completed all prioritized daily actions. Explore the DSA roadmap or full mock assessments.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <AdaptiveTaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      {showAllTasksLink && (
        <div className="pt-1 flex justify-end">
          <Link
            href="/dashboard/plan"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View Weekly Schedule & Targets</span>
            <span>&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
