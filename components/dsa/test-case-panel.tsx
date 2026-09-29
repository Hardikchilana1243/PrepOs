'use client';

import React, { useState } from 'react';

interface SampleTestCase {
  id: string;
  orderIndex: number;
  input: string;
  expected: string;
  explanation: string | null;
}

interface TestCasePanelProps {
  testCases: SampleTestCase[];
}

export function TestCasePanel({ testCases }: TestCasePanelProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!testCases || testCases.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400">
        No sample test cases available.
      </div>
    );
  }

  const currentCase = testCases[activeTab] ?? testCases[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0B1120] text-slate-100 overflow-hidden text-xs">
      {/* Test Case Tab Selector */}
      <div className="flex items-center gap-1 px-3 pt-2 bg-[#080D1A] border-b border-slate-800 shrink-0 overflow-x-auto">
        {testCases.map((tc, idx) => (
          <button
            key={tc.id}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 rounded-t-lg font-mono text-xs font-semibold transition-colors ${
              activeTab === idx
                ? 'bg-[#0B1120] text-blue-400 border-t-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Case {idx + 1}
          </button>
        ))}
      </div>

      {/* Selected Test Case Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs">
        {/* Input */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Input:
          </span>
          <pre className="p-2.5 rounded-lg bg-[#070B14] border border-slate-800 text-slate-200 whitespace-pre-wrap">
            {currentCase.input}
          </pre>
        </div>

        {/* Expected Output */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Expected Output:
          </span>
          <pre className="p-2.5 rounded-lg bg-[#070B14] border border-slate-800 text-slate-200 whitespace-pre-wrap">
            {currentCase.expected}
          </pre>
        </div>
      </div>
    </div>
  );
}
