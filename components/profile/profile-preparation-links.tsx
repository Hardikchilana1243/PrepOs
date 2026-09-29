import React from 'react';
import Link from 'next/link';
import { Code2, Brain, Target, Building2, RotateCcw, ArrowRight } from 'lucide-react';

export function ProfilePreparationLinks() {
  const links = [
    {
      title: 'DSA Roadmap & Workspace',
      subtitle: '14 curriculum modules & Judge0 execution',
      href: '/dashboard/dsa',
      icon: Code2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Core CS Learning Hub',
      subtitle: 'DBMS & Operating Systems diagnostics',
      href: '/dashboard/core-cs',
      icon: Brain,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Company Mock Assessments',
      subtitle: 'Timed full-length campus OA simulations',
      href: '/dashboard/assessments',
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Company Preparation Hubs',
      subtitle: 'Verified patterns for Tier-1 & Product firms',
      href: '/dashboard/companies',
      icon: Building2,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Spaced Repetition Revision',
      subtitle: 'SM-2 interval queue for active recall',
      href: '/dashboard/revision',
      icon: RotateCcw,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Integrated Preparation Modules
          </h3>
          <p className="text-xs text-slate-500">
            Every submission across these modules feeds into your verified readiness metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg ${item.bg} ${item.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
