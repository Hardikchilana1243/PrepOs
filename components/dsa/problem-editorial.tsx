'use client';

import React, { useState } from 'react';
import { BookOpen, Lock, Unlock, Copy, Check, Clock, Database } from 'lucide-react';
import { SupportedLanguage } from '@/lib/services/starter-code';

interface SolutionItem {
  language: string;
  editorial: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
}

interface ProblemEditorialProps {
  solutions: SolutionItem[];
  isSolved: boolean;
}

export function ProblemEditorial({ solutions, isSolved }: ProblemEditorialProps) {
  const [isRevealed, setIsRevealed] = useState<boolean>(isSolved);
  const [selectedLang, setSelectedLang] = useState<string>('PYTHON');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!solutions || solutions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-200">
        No official editorial published for this problem yet.
      </div>
    );
  }

  // Find solution for selected language or fallback to first
  const activeSolution =
    solutions.find((s) => s.language.toUpperCase() === selectedLang.toUpperCase()) ??
    solutions[0];

  const handleCopy = () => {
    if (!activeSolution?.code) return;
    navigator.clipboard.writeText(activeSolution.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // If not revealed yet, show a clean disclosure gate
  if (!isRevealed) {
    return (
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            Official Solution & Editorial Locked
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            We recommend attempting the problem for at least 15–20 minutes before looking at the editorial solution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsRevealed(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-colors"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>Reveal Solution & Explanation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Optimal Approach & Analysis</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified algorithmic solution pattern and complexities.
          </p>
        </div>

        {/* Complexity Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[11px] border border-blue-200 font-semibold">
            <Clock className="w-3 h-3 text-blue-600" />
            {activeSolution.timeComplexity}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200 font-semibold">
            <Database className="w-3 h-3 text-slate-600" />
            {activeSolution.spaceComplexity}
          </span>
        </div>
      </div>

      {/* Explanation Text */}
      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 font-sans">
        {activeSolution.editorial}
      </div>

      {/* Code Solution Display */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {solutions.map((sol) => (
              <button
                key={sol.language}
                type="button"
                onClick={() => setSelectedLang(sol.language.toUpperCase())}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeSolution.language.toUpperCase() === sol.language.toUpperCase()
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sol.language.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Copy Solution Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Monospace Code Display */}
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <code>{activeSolution.code}</code>
        </pre>
      </div>
    </div>
  );
}
