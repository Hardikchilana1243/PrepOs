import React from 'react';
import { AlertCircle, Clock, Database } from 'lucide-react';

interface ProblemConstraintsProps {
  constraints: string;
  expectedTimeComplexity: string | null;
  expectedSpaceComplexity: string | null;
}

export function ProblemConstraints({
  constraints,
  expectedTimeComplexity,
  expectedSpaceComplexity,
}: ProblemConstraintsProps) {
  const constraintList = constraints
    ? constraints
        .split('\n')
        .map((c) => c.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean)
    : [];

  return (
    <section aria-labelledby="constraints-heading" className="space-y-3 pt-2">
      <h3
        id="constraints-heading"
        className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
      >
        <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
        <span>Constraints & Target Complexities</span>
      </h3>

      {/* Constraints List */}
      {constraintList.length > 0 && (
        <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc marker:text-slate-400">
          {constraintList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-[11px] border border-slate-200/60 font-medium">
                {item}
              </code>
            </li>
          ))}
        </ul>
      )}

      {/* Target Complexities */}
      {(expectedTimeComplexity || expectedSpaceComplexity) && (
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          {expectedTimeComplexity && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-200/80 text-blue-900">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-slate-600">Expected Time:</span>
              <code className="font-mono font-bold text-blue-700">
                {expectedTimeComplexity}
              </code>
            </div>
          )}

          {expectedSpaceComplexity && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-slate-900">
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-medium text-slate-600">Expected Space:</span>
              <code className="font-mono font-bold text-slate-800">
                {expectedSpaceComplexity}
              </code>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
