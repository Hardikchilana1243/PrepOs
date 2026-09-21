'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MissionItem } from '@/lib/services/daily-mission';
import { CheckCircle2, Circle, ArrowRight, Target, Sparkles } from 'lucide-react';

interface TodayMissionCardProps {
  missions: MissionItem[];
  onToggleMission: (missionId: string, isCompleted: boolean) => Promise<void>;
}

export function TodayMissionCard({ missions, onToggleMission }: TodayMissionCardProps) {
  const [localMissions, setLocalMissions] = useState(missions);
  const completedCount = localMissions.filter((m) => m.isCompleted).length;

  const handleToggle = async (missionId: string, currentState: boolean) => {
    const newState = !currentState;
    setLocalMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, isCompleted: newState } : m))
    );
    await onToggleMission(missionId, newState);
  };

  return (
    <div id="todays-mission" className="rounded-2xl bg-[#0F172A] border border-slate-800/90 p-5 md:p-6 shadow-xl scroll-mt-20">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight">Today&apos;s Mission</h3>
            <p className="text-xs text-slate-400">
              Deterministic daily target calibrated to your placement goals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {completedCount} / {localMissions.length} Done
          </span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {localMissions.map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.isCompleted
                ? 'bg-slate-900/40 border-slate-800/50 opacity-75'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(item.id, item.isCompleted)}
                className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                aria-label={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 font-bold">0{idx + 1}</span>
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      item.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.type}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed pl-6">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={item.targetUrl}
              className={`self-end sm:self-auto inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                item.isCompleted
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                  : 'text-blue-400 hover:text-blue-300 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20'
              }`}
            >
              <span>{item.isCompleted ? 'Review' : 'Start Task'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
