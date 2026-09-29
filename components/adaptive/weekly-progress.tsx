'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Flame,
  CheckCircle2,
  Code2,
  Cpu,
  RotateCcw,
  Target,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { ProgressBar, Badge } from '@/components/ui/student-os';
import { WeeklyTarget } from '@/lib/services/weekly-plan';

interface WeeklyProgressProps {
  weekStartFormatted: string;
  weekEndFormatted: string;
  overallWeeklyPct: number;
  currentStreak: number;
  targets: WeeklyTarget[];
  className?: string;
}

export function WeeklyProgress({
  weekStartFormatted,
  weekEndFormatted,
  overallWeeklyPct,
  currentStreak,
  targets,
  className = '',
}: WeeklyProgressProps) {
  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'DSA':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'REVISION':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'ASSESSMENT':
        return <Target className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPillarColor = (pillar: string): 'blue' | 'indigo' | 'amber' | 'emerald' => {
    switch (pillar) {
      case 'DSA':
        return 'blue';
      case 'CORE_CS':
        return 'indigo';
      case 'REVISION':
        return 'amber';
      case 'ASSESSMENT':
        return 'emerald';
      default:
        return 'blue';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Weekly Preparation Window
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({weekStartFormatted} – {weekEndFormatted})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {overallWeeklyPct}%
            </span>
            <span className="text-xs text-slate-500">
              of weekly curriculum targets achieved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>{currentStreak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {targets.map((target) => (
          <div
            key={target.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                  {getPillarIcon(target.pillar)}
                </div>
                {target.isCompleted ? (
                  <Badge variant="success" size="sm">
                    Target Met
                  </Badge>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500">
                    {target.remaining} {target.unit} left
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-slate-900">
                {target.title}
              </h4>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-slate-900">
                  {target.current}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {target.target} {target.unit}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <ProgressBar
                value={target.completionPct}
                size="sm"
                color={getPillarColor(target.pillar)}
              />

              <Link
                href={target.actionHref}
                className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1 group"
              >
                <span>{target.actionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
