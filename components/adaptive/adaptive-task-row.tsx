'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Code2,
  Cpu,
  RotateCcw,
  Target,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/student-os';
import { AdaptivePlanTask } from '@/lib/services/adaptive-preparation';

interface AdaptiveTaskRowProps {
  task: AdaptivePlanTask;
  showUnlockText?: boolean;
}

export function AdaptiveTaskRow({ task, showUnlockText = true }: AdaptiveTaskRowProps) {
  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'DSA':
        return <Code2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      case 'REVISION':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case 'ASSESSMENT':
        return <Target className="w-3.5 h-3.5 text-emerald-600" />;
      case 'COMPANY':
        return <Building2 className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge variant="danger" size="sm" dot>
            Critical
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge variant="warning" size="sm" dot>
            High Priority
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge variant="primary" size="sm">
            Core Target
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            Recommended
          </Badge>
        );
    }
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
        task.isCompleted
          ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 shrink-0">
          {task.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-blue-500 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-blue-500 transition-colors" />
            </div>
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {getAreaIcon(task.area)}
              <span>{task.area.replace('_', ' ')}</span>
            </span>
            {getPriorityBadge(task.priority)}
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedMinutes}m</span>
            </span>
          </div>

          <h4
            className={`text-sm font-semibold tracking-tight ${
              task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h4>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            {task.reason}
          </p>

          {showUnlockText && (
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px]">
              <span className="text-blue-700 font-medium">
                Impact: {task.metricImpact}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{task.unlockText}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end shrink-0 sm:self-center pl-8 sm:pl-0">
        <Link
          href={task.href}
          className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            task.isCompleted
              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              : 'text-white bg-blue-600 hover:bg-blue-700 shadow-xs'
          }`}
        >
          <span>{task.isCompleted ? 'Review' : 'Start Task'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );
}
