'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Loader2,
} from 'lucide-react';
import { SingleTestResult, ExecutionVerdict } from '@/lib/services/code-execution';

interface ExecutionConsoleProps {
  isLoading: boolean;
  verdict: ExecutionVerdict | string | null;
  passedTests?: number;
  totalTests?: number;
  executionTimeMs?: number;
  memoryKb?: number;
  errorLog?: string | null;
  results: SingleTestResult[];
}

export function ExecutionConsole({
  isLoading,
  verdict,
  passedTests,
  totalTests,
  executionTimeMs,
  memoryKb,
  errorLog,
  results,
}: ExecutionConsoleProps) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0B1120] text-slate-300 space-y-3 font-mono text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <div className="text-center space-y-1">
          <p className="font-semibold text-slate-200">Executing code on Judge0 server...</p>
          <p className="text-[11px] text-slate-500">Evaluating against test suite</p>
        </div>
      </div>
    );
  }

  if (!verdict) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0B1120] text-slate-500 text-xs font-mono space-y-1">
        <Terminal className="w-5 h-5 text-slate-600 mb-1" />
        <p>No execution results yet.</p>
        <p className="text-[11px] text-slate-600">Click &quot;Run&quot; or &quot;Submit&quot; to test your code.</p>
      </div>
    );
  }

  // Verdict style mapper
  const getVerdictStyle = () => {
    switch (verdict) {
      case 'ACCEPTED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          title: 'Accepted',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'WRONG_ANSWER':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          title: 'Wrong Answer',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'TIME_LIMIT_EXCEEDED':
        return {
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          title: 'Time Limit Exceeded',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      case 'COMPILATION_ERROR':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          title: 'Compilation Error',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'RUNTIME_ERROR':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          title: 'Runtime Error',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-slate-400" />,
          title: String(verdict).replace(/_/g, ' '),
          badge: 'bg-slate-900 text-slate-300 border-slate-700',
        };
    }
  };

  const style = getVerdictStyle();
  const currentResult = results[selectedCaseIdx];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0B1120] text-slate-100 overflow-hidden text-xs">
      {/* Top Verdict Status Banner */}
      <div className="px-4 py-2.5 bg-[#080D1A] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {style.icon}
          <span className="font-bold text-sm text-slate-100 font-mono">
            {style.title}
          </span>
          {totalTests !== undefined && passedTests !== undefined && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${style.badge}`}
            >
              {passedTests} / {totalTests} passed
            </span>
          )}
        </div>

        {/* Runtime / Memory Metrics */}
        {(executionTimeMs !== undefined || memoryKb !== undefined) && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            {executionTimeMs !== undefined && (
              <span>Runtime: {executionTimeMs} ms</span>
            )}
            {memoryKb !== undefined && (
              <>
                <span>•</span>
                <span>Mem: {Math.round(memoryKb)} KB</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Console Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        {/* Error Log (if any compilation or runtime failure) */}
        {errorLog && (
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              Error Details:
            </span>
            <pre className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-200 whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto">
              {errorLog}
            </pre>
          </div>
        )}

        {/* Test Case Results Tabs */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
              {results.map((res, idx) => {
                const passed = res.status === 'ACCEPTED';
                return (
                  <button
                    key={res.testCaseId || idx}
                    type="button"
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      selectedCaseIdx === idx
                        ? 'bg-slate-800 text-slate-100 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passed ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>Case {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Test Case Detail */}
            {currentResult && (
              <div className="space-y-2 text-xs">
                {/* Input */}
                {currentResult.input && (
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Input:
                    </span>
                    <pre className="p-2 rounded bg-[#070B14] border border-slate-800 text-slate-200 whitespace-pre-wrap">
                      {currentResult.input}
                    </pre>
                  </div>
                )}

                {/* Output vs Expected */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Your Output:
                    </span>
                    <pre
                      className={`p-2 rounded border whitespace-pre-wrap ${
                        currentResult.status === 'ACCEPTED'
                          ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-200'
                          : 'bg-rose-950/20 border-rose-900/60 text-rose-200'
                      }`}
                    >
                      {currentResult.actualOutput || 'None'}
                    </pre>
                  </div>

                  {currentResult.expectedOutput && (
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Expected Output:
                      </span>
                      <pre className="p-2 rounded bg-[#070B14] border border-slate-800 text-slate-200 whitespace-pre-wrap">
                        {currentResult.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
