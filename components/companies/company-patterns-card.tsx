import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { CompanyPatternItem } from '@/lib/services/companies';
import { ProgressBar } from '@/components/ui/student-os';

interface CompanyPatternsCardProps {
  companyName: string;
  patterns: CompanyPatternItem[];
}

export function CompanyPatternsCard({ companyName, patterns }: CompanyPatternsCardProps) {
  if (patterns.length === 0) {
    return null;
  }

  const getVeracityBadge = (veracity: string) => {
    switch (veracity) {
      case 'OFFICIAL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Official
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Verified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Reported
          </span>
        );
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Verified Interview Patterns — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              High-frequency algorithmic motifs observed in {companyName} campus recruitment rounds
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          {patterns.length} Calibrated Patterns
        </span>
      </div>

      {/* Grid of Verified Patterns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {patterns.map((pat) => (
          <div
            key={pat.id}
            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{pat.patternName}</h3>
              {getVeracityBadge(pat.veracity)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Occurrence Frequency</span>
                <strong className="text-slate-800">{pat.frequencyPct}%</strong>
              </div>
              <ProgressBar value={pat.frequencyPct} size="sm" color="blue" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span>Recruiter calibration</span>
              <span>Updated {new Date(pat.lastVerifiedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
