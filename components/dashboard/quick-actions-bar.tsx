'use client';

// ============================================================================
// PREPOS GLOBAL QUICK ACTIONS COMPONENT
// Deterministic high-frequency preparation actions linking directly to core workflows
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  RotateCcw,
  Target,
  Building2,
  CalendarDays,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: React.ElementType;
  colorClass: string;
  badge: string;
}

const GLOBAL_ACTIONS: QuickAction[] = [
  {
    id: 'act-dsa',
    label: 'Solve DSA Problem',
    sublabel: 'Practice algorithmic patterns',
    href: '/dashboard/dsa',
    icon: Code2,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    badge: 'Algorithms',
  },
  {
    id: 'act-core-cs',
    label: 'Start Core CS Diagnostic',
    sublabel: 'DBMS & OS technical drills',
    href: '/dashboard/core-cs',
    icon: Cpu,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badge: 'Diagnostics',
  },
  {
    id: 'act-revision',
    label: 'Open Revision Queue',
    sublabel: 'SM-2 active recall intervals',
    href: '/dashboard/revision',
    icon: RotateCcw,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: 'Recall',
  },
  {
    id: 'act-assessment',
    label: 'Mock Assessment',
    sublabel: 'Timed online exam simulation',
    href: '/dashboard/assessments',
    icon: Target,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'Simulate',
  },
  {
    id: 'act-companies',
    label: 'Target Companies',
    sublabel: 'Recruiter patterns & OA hubs',
    href: '/dashboard/companies',
    icon: Building2,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    badge: 'Recruiters',
  },
  {
    id: 'act-plan',
    label: 'Weekly Study Plan',
    sublabel: 'Weekly quotas & milestones',
    href: '/dashboard/plan',
    icon: CalendarDays,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    badge: 'Adaptive',
  },
];

export function QuickActionsBar() {
  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="quick-actions-heading"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Preparation Quick Actions
        </h2>
        <span className="text-xs text-slate-400">Direct shortcuts to active modules</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {GLOBAL_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-subtle transition-all flex flex-col justify-between group min-h-[90px]"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center ${action.colorClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold group-hover:text-blue-600 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div className="mt-2">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {action.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {action.sublabel}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
