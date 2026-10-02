'use client';

// ============================================================================
// PREPOS EXECUTION TASK ROW (PHASE 6.15)
// Focused, High-Scanability Task Card With Direct Navigation & Status Toggles
// ============================================================================

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  FileCheck2,
  RotateCcw,
  Building2,
  Milestone,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  MoreVertical,
  XCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { ExecutionTaskItem, ExecutionCategory } from '@/lib/services/daily-execution';
import {
  completeExecutionTaskAction,
  reopenExecutionTaskAction,
  skipExecutionTaskAction,
} from '@/app/dashboard/readiness/actions';

interface ExecutionTaskRowProps {
  task: ExecutionTaskItem;
  dateIso?: string;
}

const CATEGORY_CONFIG: Record<
  ExecutionCategory,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  DSA: {
    label: 'DSA Coding',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Code2,
  },
  CORE_CS: {
    label: 'Core CS Quiz',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Cpu,
  },
  ASSESSMENT: {
    label: 'Mock OA',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: FileCheck2,
  },
  REVISION: {
    label: 'Spaced Revision',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: RotateCcw,
  },
  COMPANY: {
    label: 'Target Company',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    icon: Building2,
  },
  MILESTONE: {
    label: 'Milestone',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Milestone,
  },
};

export function ExecutionTaskRow({ task, dateIso }: ExecutionTaskRowProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.isCompleted);
  const [optimisticSkipped, setOptimisticSkipped] = useState(task.isSkipped);

  const config = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.DSA;
  const CategoryIcon = config.icon;

  const handleToggleComplete = () => {
    startTransition(async () => {
      try {
        if (optimisticCompleted) {
          setOptimisticCompleted(false);
          await reopenExecutionTaskAction(task.id, dateIso);
        } else {
          setOptimisticCompleted(true);
          setOptimisticSkipped(false);
          await completeExecutionTaskAction(task.id, task.category, dateIso);
        }
      } catch (err) {
        // Rollback optimistic state
        setOptimisticCompleted(task.isCompleted);
        console.error('Task status update failed:', err);
      }
    });
  };

  const handleSkip = () => {
    setShowMenu(false);
    startTransition(async () => {
      try {
        setOptimisticSkipped(true);
        setOptimisticCompleted(false);
        await skipExecutionTaskAction(task.id, 'Deferred by student', dateIso);
      } catch (err) {
        setOptimisticSkipped(task.isSkipped);
        console.error('Task skip failed:', err);
      }
    });
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border p-4 md:p-5 transition-all duration-200 hover:shadow-md ${
        optimisticCompleted
          ? 'border-emerald-200/90 bg-emerald-50/20'
          : optimisticSkipped
          ? 'border-slate-200 bg-slate-50/50 opacity-70'
          : task.priority === 'HIGH'
          ? 'border-amber-200 shadow-2xs'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Checkbox & Task Meta */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Completion Checkbox Button (accessible min 44x44px touch target) */}
          <button
            onClick={handleToggleComplete}
            disabled={isPending}
            aria-label={optimisticCompleted ? 'Mark task as incomplete' : 'Mark task as completed'}
            className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            {optimisticCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
            ) : optimisticSkipped ? (
              <XCircle className="w-6 h-6 text-slate-400" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500 transition-colors" />
            )}
          </button>

          {/* Details */}
          <div className="min-w-0 flex-1">
            {/* Category & Attributes Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span>{config.label}</span>
              </span>

              {task.company && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                  <Building2 className="w-3 h-3" />
                  <span>{task.company}</span>
                </span>
              )}

              {task.difficulty && (
                <span
                  className={`px-2 py-0.5 rounded-md text-2xs font-bold uppercase ${
                    task.difficulty === 'EASY'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : task.difficulty === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {task.difficulty}
                </span>
              )}

              {task.priority === 'HIGH' && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>High Priority</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-medium text-slate-500 bg-slate-100">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>~{task.estimatedMinutes} min</span>
              </span>
            </div>

            {/* Task Title */}
            <h3
              className={`text-base font-bold tracking-tight ${
                optimisticCompleted
                  ? 'text-slate-500 line-through'
                  : optimisticSkipped
                  ? 'text-slate-400 italic'
                  : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            {/* Subtitle / Context */}
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5 leading-relaxed">
              {task.subtitle}
            </p>

            {/* Objective Reason */}
            {task.reason && (
              <div className="mt-2 flex items-start gap-1.5 text-2xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">
                  <strong className="text-slate-700 font-semibold">Inclusion Rationale:</strong>{' '}
                  {task.reason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 pl-10 sm:pl-0">
          {/* Main Action Button */}
          <Link
            href={task.deepLinkUrl}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              optimisticCompleted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
            }`}
          >
            <span>{optimisticCompleted ? 'Review Work' : task.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Quick Menu (Skip / Details) */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More task options"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-fadeIn">
                <button
                  onClick={handleSkip}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Skip Task</span>
                </button>
                <button
                  onClick={handleToggleComplete}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{optimisticCompleted ? 'Mark Incomplete' : 'Mark Completed'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
