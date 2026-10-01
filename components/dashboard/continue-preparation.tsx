'use client';

// ============================================================================
// PREPOS CONTINUE PREPARATION COMPONENT
// Deterministic active preparation cards derived directly from real database state
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Target,
  Code2,
  Cpu,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ContinuePreparationItem } from '@/lib/services/global-search';

interface ContinuePreparationProps {
  items: ContinuePreparationItem[];
}

export function ContinuePreparation({ items }: ContinuePreparationProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 text-center shadow-xs space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">All Active Tasks Up to Date</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No unfinished assessments or overdue recall items. Choose an algorithmic pattern on the DSA
          Roadmap or take a Core CS diagnostic drill.
        </p>
      </div>
    );
  }

  const getSourceIcon = (type: ContinuePreparationItem['type']) => {
    switch (type) {
      case 'ASSESSMENT':
        return <Target className="w-4 h-4 text-rose-600" />;
      case 'REVISION':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'DSA':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'CORE_CS':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'COMPANY':
        return <Building2 className="w-4 h-4 text-purple-600" />;
    }
  };

  const getBadgeStyle = (variant: ContinuePreparationItem['badgeVariant']) => {
    switch (variant) {
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Continue Preparation
          </h2>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
            {items.length} active
          </span>
        </div>
        <span className="text-xs text-slate-400">Deterministic active priorities</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-lg bg-slate-50 border border-slate-200">
                    {getSourceIcon(item.type)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {item.type.replace('_', ' ')}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(
                    item.badgeVariant
                  )}`}
                >
                  {item.badgeText}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.subtitle}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                {item.lastActivity || 'In Progress'}
              </span>

              <Link
                href={item.url}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center gap-1.5 shadow-2xs transition-colors min-h-[36px]"
              >
                <span>{item.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
