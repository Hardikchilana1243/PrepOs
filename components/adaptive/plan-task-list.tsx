'use client';

import React, { useState } from 'react';
import { AdaptivePlanTask } from '@/lib/services/adaptive-preparation';
import { AdaptiveTaskRow } from './adaptive-task-row';
import { CheckCircle2, ListFilter, Sparkles } from 'lucide-react';

interface PlanTaskListProps {
  todayTasks: AdaptivePlanTask[];
  allWeeklyTasks: AdaptivePlanTask[];
}

type TabType = 'today' | 'week' | 'remaining' | 'completed';

export function PlanTaskList({ todayTasks, allWeeklyTasks }: PlanTaskListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  const remainingTasks = allWeeklyTasks.filter((t) => !t.isCompleted);
  const completedTasks = allWeeklyTasks.filter((t) => t.isCompleted);

  const getFilteredTasks = (): AdaptivePlanTask[] => {
    switch (activeTab) {
      case 'today':
        return todayTasks;
      case 'week':
        return allWeeklyTasks;
      case 'remaining':
        return remainingTasks;
      case 'completed':
        return completedTasks;
      default:
        return todayTasks;
    }
  };

  const currentTasks = getFilteredTasks();

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'today'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today&apos;s Plan ({todayTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('week')}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'week'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week ({allWeeklyTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('remaining')}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'remaining'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Remaining ({remainingTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Showing {currentTasks.length} task{currentTasks.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Task List */}
      {currentTasks.length === 0 ? (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">
            {activeTab === 'completed'
              ? 'No Completed Tasks Yet'
              : 'All Tasks Cleared!'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'completed'
              ? 'Complete tasks from your daily or weekly roadmap to build your achievement history.'
              : 'You have cleared all prioritized preparation tasks in this view. Keep up the momentum!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentTasks.map((task) => (
            <AdaptiveTaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
