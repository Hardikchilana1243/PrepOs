'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface SampleTestCase {
  id: string;
  orderIndex: number;
  input: string;
  expected: string;
  explanation: string | null;
}

interface ProblemExamplesProps {
  examples: SampleTestCase[];
}

export function ProblemExamples({ examples }: ProblemExamplesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!examples || examples.length === 0) return null;

  return (
    <section aria-labelledby="examples-heading" className="space-y-3 pt-2">
      <h3
        id="examples-heading"
        className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
      >
        <Terminal className="w-3.5 h-3.5 text-blue-600" />
        <span>Examples</span>
      </h3>

      <div className="space-y-3">
        {examples.map((example, idx) => (
          <div
            key={example.id}
            className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Example {idx + 1}:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    example.id,
                    `Input: ${example.input}\nOutput: ${example.expected}`
                  )
                }
                className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
                title="Copy example"
              >
                {copiedId === example.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Input Row */}
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-500">Input:</span>
              <pre className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900 text-xs overflow-x-auto whitespace-pre-wrap">
                {example.input}
              </pre>
            </div>

            {/* Expected Output Row */}
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-500">Output:</span>
              <pre className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900 text-xs overflow-x-auto whitespace-pre-wrap">
                {example.expected}
              </pre>
            </div>

            {/* Explanation if present */}
            {example.explanation && (
              <div className="pt-1 text-slate-600 leading-relaxed border-t border-slate-200/60">
                <span className="font-semibold text-slate-700">Explanation: </span>
                <span>{example.explanation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
