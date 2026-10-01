'use client';

// ============================================================================
// PREPOS SEARCH QUICK ACTIONS COMPONENT
// Deterministic quick shortcuts for immediate preparation tasks
// ============================================================================

import React from 'react';
import { Code2, Cpu, RotateCcw, Target, Building2, CalendarDays, ArrowRight } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: React.ElementType;
  badge: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-dsa',
    title: 'Solve DSA Problem',
    subtitle: 'Practice algorithmic patterns',
    url: '/dashboard/dsa',
    icon: Code2,
    badge: 'Algorithms',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'qa-core-cs',
    title: 'Core CS Diagnostic',
    subtitle: '10 MCQs in DBMS & OS',
    url: '/dashboard/core-cs',
    icon: Cpu,
    badge: 'Foundations',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'qa-revision',
    title: 'Due Revisions',
    subtitle: 'SM-2 active recall queue',
    url: '/dashboard/revision',
    icon: RotateCcw,
    badge: 'Recall',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'qa-oa',
    title: 'Practice Mock OA',
    subtitle: 'Timed placement test',
    url: '/dashboard/assessments',
    icon: Target,
    badge: 'Assessment',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
];

interface SearchQuickActionsProps {
  onSelectAction: (url: string) => void;
}

export function SearchQuickActions({ onSelectAction }: SearchQuickActionsProps) {
  return (
    <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Preparation Quick Actions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectAction(action.url)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 transition-all flex items-center justify-between text-left group min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${action.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {action.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{action.subtitle}</div>
                </div>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
