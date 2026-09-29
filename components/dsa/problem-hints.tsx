'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';

interface ProblemHintsProps {
  hints: string[];
}

export function ProblemHints({ hints }: ProblemHintsProps) {
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  if (!hints || hints.length === 0) return null;

  const toggleHint = (index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section aria-labelledby="hints-heading" className="space-y-2.5 pt-2">
      <div className="flex items-center justify-between">
        <h3
          id="hints-heading"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Hints & Guidance ({hints.length})</span>
        </h3>
        <span className="text-[11px] text-slate-400">
          Try solving before revealing hints
        </span>
      </div>

      <div className="space-y-2">
        {hints.map((hint, idx) => {
          const isRevealed = revealedHints.has(idx);

          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/90 bg-white overflow-hidden text-xs"
            >
              <button
                type="button"
                onClick={() => toggleHint(idx)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                aria-expanded={isRevealed}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-700 font-bold">
                    Hint {idx + 1}
                  </span>
                </div>
                {isRevealed ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isRevealed && (
                <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 text-slate-700 leading-relaxed bg-amber-50/20">
                  {hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
