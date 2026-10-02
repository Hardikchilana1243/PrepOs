'use client';

// ============================================================================
// PREPOS EXECUTION TASK LIST (PHASE 6.15)
// Filterable, High-Scanability Task Collection for Placement Execution
// ============================================================================

import React, { useState, useMemo } from 'react';
import { ExecutionTaskItem } from '@/lib/services/daily-execution';
import { ExecutionTaskRow } from './execution-task-row';
import { ExecutionEmptyState } from './execution-empty-state';
import { CheckCircle2, ListFilter, Sparkles } from 'lucide-react';

interface ExecutionTaskListProps {
  tasks: ExecutionTaskItem[];
  dateIso?: string;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED';

export function ExecutionTaskList({ tasks, dateIso }: ExecutionTaskListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const activeCount = tasks.filter((t) => !t.isCompleted && !t.isSkipped).length;

  const filteredTasks = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return tasks.filter((t) => !t.isCompleted && !t.isSkipped);
    }
    if (activeTab === 'COMPLETED') {
      return tasks.filter((t) => t.isCompleted);
    }
    return tasks;
  }, [tasks, activeTab]);

  return (
    <div className="space-y-4">
      {/* List Filter Controls & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Workload ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Workload Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ListFilter className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {activeCount === 0 && tasks.length > 0
              ? 'All daily tasks complete!'
              : `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`}
          </span>
        </div>
      </div>

      {/* Task Rows */}
      {filteredTasks.length === 0 ? (
        <ExecutionEmptyState
          type={
            activeTab === 'COMPLETED'
              ? 'NO_COMPLETED_YET'
              : activeTab === 'ACTIVE'
              ? 'ALL_TASKS_COMPLETED'
              : 'NO_TASKS'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <ExecutionTaskRow key={task.id} task={task} dateIso={dateIso} />
          ))}
        </div>
      )}
    </div>
  );
}
