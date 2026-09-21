'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Layers, Code2, ArrowUpRight, CheckCircle2, Circle, Clock, Target } from 'lucide-react';

interface CompanyData {
  id: string;
  slug: string;
  name: string;
  tier: string;
  hiringRoles: string[];
  patterns: {
    patternName: string;
    frequencyPct: number;
    description: string | null;
  }[];
  problems: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    isSolved: boolean;
  }[];
  assessment: {
    title: string;
    durationMin: number;
    totalQuestions: number;
  } | null;
}

interface CompanyExplorerProps {
  companies: CompanyData[];
  initialCompanySlug?: string;
}

export function CompanyExplorer({ companies, initialCompanySlug }: CompanyExplorerProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialCompanySlug || companies[0]?.slug || ''
  );
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const tiers = ['ALL', 'Tier-1 Tech', 'Product', 'Enterprise', 'High-Impact IT'];

  const filteredCompanies = companies.filter((c) => {
    if (selectedTier === 'ALL') return true;
    return c.tier.toLowerCase() === selectedTier.toLowerCase();
  });

  const activeCompany = companies.find((c) => c.slug === selectedSlug) || filteredCompanies[0] || companies[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Company List Sidebar */}
      <div className="lg:col-span-4 space-y-3">
        {/* Tier Filter Pills */}
        <div className="flex flex-wrap gap-1 bg-[#0F172A] p-2 rounded-xl border border-slate-800">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                selectedTier === t
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {filteredCompanies.map((c) => {
            const isSelected = c.slug === activeCompany?.slug;
            const solvedCount = c.problems.filter((p) => p.isSolved).length;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedSlug(c.slug)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-950/20 border-purple-500/50 ring-1 ring-purple-500/20 shadow-md'
                    : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{c.name}</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {c.tier}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] truncate max-w-[150px]">
                    {c.patterns[0]?.patternName || 'Data Structures'}
                  </span>
                  <span className="font-mono text-[10px] text-purple-400 font-semibold">
                    {solvedCount} / {c.problems.length} solved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Company Deep Dive */}
      <div className="lg:col-span-8 space-y-6">
        {activeCompany ? (
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                  <span>COMPANY PREPARATION HUB</span>
                  <span>•</span>
                  <span>{activeCompany.tier}</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {activeCompany.name}
                </h2>
              </div>

              {activeCompany.assessment && (
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>
                    OA Format: {activeCompany.assessment.durationMin}m ({activeCompany.assessment.totalQuestions} Qs)
                  </span>
                </div>
              )}
            </div>

            {/* High-Yield Assessment Patterns */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Interview Patterns</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCompany.patterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white text-xs">{pat.patternName}</div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        {pat.frequencyPct}% frequency
                      </span>
                    </div>
                    {pat.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {pat.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mapped Problems */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Problems in PrepOS Roadmap</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeCompany.problems.filter((p) => p.isSolved).length} of {activeCompany.problems.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {activeCompany.problems.map((prob) => {
                  const diffColor =
                    prob.difficulty === 'EASY'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : prob.difficulty === 'MEDIUM'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

                  return (
                    <div
                      key={prob.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {prob.isSolved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-white tracking-tight">
                            {prob.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Roadmap ID: {prob.slug}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                        <Link
                          href={`/dashboard/dsa?problem=${prob.slug}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 text-slate-400">
            Select a company hub from the list.
          </div>
        )}
      </div>
    </div>
  );
}
