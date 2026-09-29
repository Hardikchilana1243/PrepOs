import React from 'react';
import Link from 'next/link';
import { Code2, CheckCircle2, Circle, ArrowRight, ExternalLink } from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';

export interface CompanyProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  topicTitle?: string;
  isSolved: boolean;
}

interface CompanyDSASectionProps {
  problems: CompanyProblemItem[];
}

export function CompanyDSASection({ problems }: CompanyDSASectionProps) {
  const solvedCount = problems.filter((p) => p.isSolved).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Tagged Algorithmic Problems</span>
        </h3>
        <span className="text-xs font-mono font-medium text-slate-500">
          {solvedCount} / {problems.length} Solved
        </span>
      </div>

      {problems.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-subtle">
          {problems.map((p) => (
            <div
              key={p.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {p.isSolved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {p.title}
                    </span>
                    <DifficultyBadge difficulty={p.difficulty} size="sm" />
                  </div>
                  {p.topicTitle && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.topicTitle}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {p.isSolved ? 'Completed' : 'Unsolved'}
                </span>

                <Link
                  href={`/dashboard/dsa/problem/${p.slug}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                    p.isSolved
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  <span>{p.isSolved ? 'Review' : 'Solve'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400">
          No algorithmic problems currently tagged for this company in curriculum database.
        </div>
      )}
    </div>
  );
}
