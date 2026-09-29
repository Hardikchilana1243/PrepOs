'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { MissionItem } from '@/lib/services/daily-mission';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Code2,
  Cpu,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/student-os';

interface TodayMissionCardProps {
  missions: MissionItem[];
  onToggleMission: (missionId: string, isCompleted: boolean) => Promise<void>;
}

export function TodayMissionCard({ missions, onToggleMission }: TodayMissionCardProps) {
  const [localMissions, setLocalMissions] = useState(missions);
  const [isPending, startTransition] = useTransition();

  const completedCount = localMissions.filter((m) => m.isCompleted).length;
  const totalCount = localMissions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const firstIncomplete = localMissions.find((m) => !m.isCompleted);

  const handleToggle = (missionId: string, currentState: boolean) => {
    const newState = !currentState;
    // Optimistic UI update
    setLocalMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, isCompleted: newState } : m))
    );
    startTransition(async () => {
      try {
        await onToggleMission(missionId, newState);
      } catch (err) {
        // Rollback on error
        setLocalMissions((prev) =>
          prev.map((m) => (m.id === missionId ? { ...m, isCompleted: currentState } : m))
        );
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DSA':
        return <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'CORE_CS':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case 'REVISION':
        return <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DSA':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'CORE_CS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'REVISION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getActionLabel = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'Review';
    switch (type) {
      case 'DSA':
        return 'Solve Problem';
      case 'CORE_CS':
        return 'Start Drill';
      case 'REVISION':
        return 'Review Topic';
      default:
        return 'Start';
    }
  };

  return (
    <section
      aria-labelledby="todays-mission-heading"
      className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full"
    >
      <div>
        {/* Mission Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Primary Goal
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                Daily Focus Checklist
              </span>
            </div>

            <h2
              id="todays-mission-heading"
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1"
            >
              Today&apos;s Mission
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Three targeted tasks to build placement readiness and protect your consistency streak.
            </p>
          </div>

          {/* Mission Progress & Dominant CTA */}
          <div className="flex items-center gap-3 sm:self-center shrink-0">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-800">
                <span className="font-mono">{completedCount}</span> of{' '}
                <span className="font-mono">{totalCount}</span>
                <span className="font-normal text-slate-500 ml-1">done</span>
              </div>
              <div className="w-20 mt-1">
                <ProgressBar
                  value={progressPct}
                  size="sm"
                  color={allCompleted ? 'emerald' : 'blue'}
                />
              </div>
            </div>

            {/* Dominant Next Action Button */}
            {allCompleted ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Mission Complete</span>
              </div>
            ) : firstIncomplete ? (
              <Link
                href={firstIncomplete.targetUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>Continue Mission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : null}
          </div>
        </div>

        {/* Task List */}
        {localMissions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No missions assigned for today. Explore the DSA roadmap or Core CS quizzes to start practicing.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-1">
            {localMissions.map((item, idx) => {
              const isDone = item.isCompleted;
              const typeLabel = item.type.replace('_', ' ');

              return (
                <div
                  key={item.id}
                  className={`py-3.5 px-2 -mx-2 rounded-lg transition-colors flex items-center justify-between gap-3 ${
                    isDone ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left: Completion Toggle & Task Information */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, isDone)}
                      aria-label={`Mark "${item.title}" as ${isDone ? 'incomplete' : 'complete'}`}
                      className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={item.targetUrl}
                          className={`text-sm font-semibold tracking-tight truncate hover:underline ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </Link>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${getTypeBadge(
                            item.type
                          )}`}
                        >
                          {getTypeIcon(item.type)}
                          <span>{typeLabel}</span>
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Direct Task Action */}
                  <Link
                    href={item.targetUrl}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isDone
                        ? 'text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/70'
                        : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100'
                    }`}
                  >
                    <span>{getActionLabel(item.type, isDone)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion Banner (when all 3 completed) */}
      {allCompleted && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/70">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Today&apos;s plan is complete!
            </span>
            <span className="text-emerald-700 hidden sm:inline">
              Keep momentum going by practicing ahead on the roadmap.
            </span>
          </div>
          <Link
            href="/dashboard/dsa"
            className="font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
          >
            Solve bonus problem →
          </Link>
        </div>
      )}
    </section>
  );
}
