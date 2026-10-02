import React from 'react';
import {
  Code2,
  Cpu,
  Building2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { InterviewModeInfo } from '@/lib/services/interview';

interface InterviewModeCardProps {
  mode: InterviewModeInfo;
  onSelectMode?: (modeId: string) => void;
}

export function InterviewModeCard({ mode, onSelectMode }: InterviewModeCardProps) {
  const getIcon = () => {
    switch (mode.id) {
      case 'DSA':
        return Code2;
      case 'CORE_CS':
        return Cpu;
      case 'COMPANY':
        return Building2;
      case 'MISTAKES':
        return RotateCcw;
      case 'REVIEW':
        return Sparkles;
      default:
        return Code2;
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm ${
        mode.isRecommended
          ? 'border-indigo-200 ring-2 ring-indigo-500/10'
          : 'border-slate-200/90'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {mode.subtitle}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {mode.title}
              </h3>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              mode.isRecommended
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {mode.badge}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {mode.description}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
        {/* Coverage Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500">Coverage</span>
            <span className="text-slate-900 font-bold">
              {mode.completedCount} / {mode.availableCount} ({mode.coveragePct}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                mode.coveragePct >= 70
                  ? 'bg-emerald-500'
                  : mode.coveragePct >= 30
                  ? 'bg-indigo-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, mode.coveragePct)}%` }}
            />
          </div>
        </div>

        <a
          href={mode.ctaUrl}
          onClick={(e) => {
            if (onSelectMode && mode.ctaUrl.startsWith('#')) {
              e.preventDefault();
              onSelectMode(mode.id);
              const target = document.querySelector(mode.ctaUrl);
              target?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <span>Open Mode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
