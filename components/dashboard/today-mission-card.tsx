'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MissionItem } from '@/lib/services/daily-mission';
import { CheckCircle2, Circle, ArrowRight, Target, Clock, Sparkles } from 'lucide-react';

interface TodayMissionCardProps {
  missions: MissionItem[];
  onToggleMission: (missionId: string, isCompleted: boolean) => Promise<void>;
}

export function TodayMissionCard({ missions, onToggleMission }: TodayMissionCardProps) {
  const [localMissions, setLocalMissions] = useState(missions);
  const completedCount = localMissions.filter((m) => m.isCompleted).length;
  const firstIncomplete = localMissions.find((m) => !m.isCompleted) || localMissions[0];

  const handleToggle = async (missionId: string, currentState: boolean) => {
    const newState = !currentState;
    setLocalMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, isCompleted: newState } : m))
    );
    await onToggleMission(missionId, newState);
  };

  return (
    <div id="todays-plan" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Level 1 — Action
            </span>
            <span className="text-xs text-slate-400">•</span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>~60 min total</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Today&apos;s Target
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete your daily target to maintain momentum and recalibrate your placement index.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700">
              {completedCount} of {localMissions.length}
            </span>
            <span className="text-xs text-slate-400 ml-1">done</span>
          </div>
          {firstIncomplete && (
            <Link
              href={firstIncomplete.targetUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm shrink-0"
            >
              <span>Start today&apos;s plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-slate-100 mt-2">
        {localMissions.map((item, idx) => {
          const typeBadge = {
            DSA: 'bg-blue-50 text-blue-700 border-blue-100',
            CORE_CS: 'bg-purple-50 text-purple-700 border-purple-100',
            REVISION: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          }[item.type] || 'bg-slate-50 text-slate-600 border-slate-100';

          return (
            <div
              key={item.id}
              className={`py-3.5 flex items-center justify-between gap-3 transition-colors ${
                item.isCompleted ? 'opacity-60' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(item.id, item.isCompleted)}
                  className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                  aria-label={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold tracking-tight truncate ${
                        item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeBadge}`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={item.targetUrl}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  item.isCompleted
                    ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span>{item.isCompleted ? 'Review' : 'Start'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
