'use client';

// ============================================================================
// PREPOS REVISION HEADER COMPONENT
// Top command center banner with SM-2 engine badges & adaptive recommendation
// ============================================================================

import React from 'react';
import {
  Brain,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { RevisionSummary } from '@/lib/services/revision';

interface RevisionHeaderProps {
  summary: RevisionSummary;
}

export function RevisionHeader({ summary }: RevisionHeaderProps) {
  const { overdueCount, dueTodayCount, completedTodayCount, streakDays } = summary;

  const getNextActionRecommendation = () => {
    if (overdueCount > 0) {
      return {
        text: `You have ${overdueCount} overdue item${
          overdueCount > 1 ? 's' : ''
        }. Prioritize these now to prevent algorithmic memory decay before placement drives.`,
        tone: 'urgent',
      };
    }
    if (dueTodayCount > 0) {
      return {
        text: `${dueTodayCount} problem${
          dueTodayCount > 1 ? 's are' : ' is'
        } due for active recall today. Complete your reviews to lock in retention intervals.`,
        tone: 'active',
      };
    }
    if (completedTodayCount > 0) {
      return {
        text: `Great job! You reviewed ${completedTodayCount} item${
          completedTodayCount > 1 ? 's' : ''
        } today. Your spaced intervals have been updated in the database.`,
        tone: 'clear',
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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              SM-2 Spaced Repetition Engine
            </span>

            {streakDays > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{streakDays} Day Study Streak</span>
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Active Retrieval &amp; Forgetting Curve Defense
          </span>
        </div>

        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Spaced Revision Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Algorithmic patterns and core CS concepts decay without active retrieval. PrepOS schedules
            your solved problems and diagnostic mistakes using SuperMemo SM-2 intervals (Day 1, 2, 7, 14, 30)
            to test your recall just before forgetting curves peak.
          </p>
        </div>

        {/* Adaptive Action Callout */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs transition-colors ${
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
          <span className="font-medium leading-relaxed">{recommendation.text}</span>
        </div>
      </div>
    </div>
  );
}
