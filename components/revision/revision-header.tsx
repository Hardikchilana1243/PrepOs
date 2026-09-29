import React from 'react';
import { RotateCcw, Clock, AlertTriangle, CheckCircle2, Brain, Sparkles } from 'lucide-react';

interface RevisionHeaderProps {
  dueCount: number;
  overdueCount: number;
  totalTracked: number;
  completedRecentCount: number;
}

export function RevisionHeader({
  dueCount,
  overdueCount,
  totalTracked,
  completedRecentCount,
}: RevisionHeaderProps) {
  const getNextActionRecommendation = () => {
    if (overdueCount > 0) {
      return {
        text: `You have ${overdueCount} overdue item${overdueCount > 1 ? 's' : ''}. Prioritize these now to prevent algorithmic memory decay before placement drives.`,
        tone: 'urgent',
      };
    }
    if (dueCount > 0) {
      return {
        text: `${dueCount} problem${dueCount > 1 ? 's are' : ' is'} due for spaced recall today. Complete your reviews to lock in retention intervals.`,
        tone: 'active',
      };
    }
    return {
      text: 'Queue is clear! All active recall intervals are up to date. Solve new DSA problems or complete Core CS diagnostic quizzes to expand your retention queue.',
      tone: 'clear',
    };
  };

  const recommendation = getNextActionRecommendation();

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              SM-2 Spaced Repetition Engine
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">• Level 2 Recall</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Spaced Revision Hub
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Algorithmic patterns and core CS concepts decay without active retrieval. PrepOS uses
            adaptive SuperMemo SM-2 intervals (Day 1, 2, 7, 14, 30) to test your recall just before
            forgetting curves peak.
          </p>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className={`text-xl font-bold ${dueCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {dueCount}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Due Today
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className={`text-xl font-bold ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {overdueCount}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Overdue
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className="text-xl font-bold text-blue-600">{totalTracked}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              In Schedule
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-center font-mono">
            <div className="text-xl font-bold text-emerald-600">{completedRecentCount}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold tracking-wider mt-0.5">
              Reviewed
            </div>
          </div>
        </div>
      </div>

      {/* Action Recommendation Callout */}
      <div
        className={`px-4 py-3 rounded-xl border flex items-center gap-3 text-xs ${
          recommendation.tone === 'urgent'
            ? 'bg-rose-50/80 border-rose-200 text-rose-800'
            : recommendation.tone === 'active'
            ? 'bg-amber-50/80 border-amber-200 text-amber-800'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
        }`}
      >
        {recommendation.tone === 'urgent' ? (
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        ) : recommendation.tone === 'active' ? (
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        )}
        <span className="font-medium">{recommendation.text}</span>
      </div>
    </div>
  );
}
