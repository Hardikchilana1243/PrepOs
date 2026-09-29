import React from 'react';
import Link from 'next/link';
import { Code2, Cpu, FileCheck, RotateCcw, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function QuickActionsBar() {
  const actions = [
    {
      label: 'DSA Roadmap',
      href: '/dashboard/dsa',
      icon: <Code2 className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      label: 'Core CS Drills',
      href: '/dashboard/core-cs',
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-600" />,
    },
    {
      label: 'Mock Assessments',
      href: '/dashboard/assessments',
      icon: <FileCheck className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      label: 'Spaced Revision',
      href: '/dashboard/revision',
      icon: <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      label: 'Readiness Profile',
      href: '/dashboard/profile',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />,
    },
  ];

  return (
    <nav
      aria-label="Workspace Quick Navigation"
      className="py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3"
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Workspace Shortcuts
      </span>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors py-1 px-2 rounded-md hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {act.icon}
            <span>{act.label}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </Link>
        ))}
      </div>
    </nav>
  );
}
