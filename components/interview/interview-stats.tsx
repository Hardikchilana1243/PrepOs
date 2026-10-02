import React from 'react';
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { InterviewDashboardSummary } from '@/lib/services/interview';

interface InterviewStatsProps {
  summary: InterviewDashboardSummary;
}

export function InterviewStats({ summary }: InterviewStatsProps) {
  const stats = [
    {
      label: 'Questions Practiced',
      value: summary.questionsPracticed,
      subtitle: `${summary.solvedCatalogCount} of ${summary.totalCatalogCount} solved`,
      icon: Code2,
      color: 'indigo',
      badge: `${Math.round((summary.solvedCatalogCount / Math.max(1, summary.totalCatalogCount)) * 100)}% Complete`,
    },
    {
      label: 'Interview Practice Sessions',
      value: summary.sessionsCompleted,
      subtitle: `${summary.studyStreakDays}d consecutive streak`,
      icon: CheckCircle2,
      color: 'emerald',
      badge: 'Audited Sessions',
    },
    {
      label: 'Identified Mistakes',
      value: summary.recentMistakesCount,
      subtitle: `${summary.topicsRequiringReviewCount} topics require practice`,
      icon: AlertTriangle,
      color: 'rose',
      badge: summary.recentMistakesCount > 0 ? 'Needs Attention' : 'Zero Deficits',
    },
    {
      label: 'Target Company Coverage',
      value: `${summary.targetCompanyCoveragePct}%`,
      subtitle: `${summary.revisionItemsCount} spaced recall items`,
      icon: Building2,
      color: 'purple',
      badge: 'Verified Patterns',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colorClasses = {
          indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
          emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          rose: 'bg-rose-50 border-rose-100 text-rose-700',
          purple: 'bg-purple-50 border-purple-100 text-purple-700',
        }[stat.color as 'indigo' | 'emerald' | 'rose' | 'purple'];

        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colorClasses}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-1">
                <span>{stat.subtitle}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {stat.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
