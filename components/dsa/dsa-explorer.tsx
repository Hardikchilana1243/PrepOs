'use client';

import React, { useState, useTransition } from 'react';
import {
  Code2,
  CheckCircle2,
  Circle,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Play,
  Terminal,
  Zap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { solveProblemAction } from '@/app/dashboard/actions';

interface ProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  description: string;
  optimalTimeComplexity: string | null;
  optimalSpaceComplexity: string | null;
  topicTitle: string;
  moduleTitle: string;
  companies: string[];
  solutions: {
    language: string;
    code: string;
    timeComplexity: string | null;
    spaceComplexity: string | null;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }[];
  isSolved: boolean;
}

interface DSAExplorerProps {
  problems: ProblemItem[];
  totalSolved: number;
}

export function DSAExplorer({ problems, totalSolved }: DSAExplorerProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(problems[0]?.id ?? '');
  const [selectedLang, setSelectedLang] = useState<'cpp' | 'java' | 'python'>('cpp');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [solveMessage, setSolveMessage] = useState<string | null>(null);

  const selectedProblem = problems.find((p) => p.id === selectedProblemId) ?? problems[0];

  const filteredProblems = problems.filter((p) => {
    const matchesDifficulty = filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  const handleSolve = (problemId: string) => {
    startTransition(async () => {
      setSolveMessage(null);
      try {
        const res = await solveProblemAction(problemId);
        setSolveMessage(`Verified! Problem marked solved. New PRS Score: ${res.updatedPRS.totalScore}%`);
      } catch (err) {
        setSolveMessage('Failed to record solve.');
      }
    });
  };

  const getLanguageCode = (lang: string) => {
    if (!selectedProblem) return '// No code available';
    const langKey = lang === 'cpp' ? 'CPP' : lang === 'java' ? 'JAVA' : 'PYTHON';
    const match = selectedProblem.solutions.find((s) => s.language.toUpperCase() === langKey);
    return match ? match.code : '// Reference solution coming soon';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Problem List & Filters */}
      <div className="lg:col-span-5 space-y-4">
        {/* Search & Filter Header */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>DSA Placement Roadmap</span>
            </h3>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
              {totalSolved} / {problems.length} Solved
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Filter by problem, topic, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center gap-1.5 pt-1">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                    filterDifficulty === diff
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problem Selection Items */}
        <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {filteredProblems.map((prob) => {
            const isSelected = prob.id === selectedProblemId;
            const diffColor =
              prob.difficulty === 'EASY'
                ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                : prob.difficulty === 'MEDIUM'
                ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                : 'text-rose-400 border-rose-500/20 bg-rose-500/10';

            return (
              <div
                key={prob.id}
                onClick={() => setSelectedProblemId(prob.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-[#0F172A]/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {prob.isSolved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white tracking-tight line-clamp-1">
                      {prob.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${diffColor}`}>
                    {prob.difficulty}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[180px]">{prob.topicTitle}</span>
                  {prob.companies.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Building2 className="w-3 h-3" />
                      <span>{prob.companies.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Problem Detail, Testcases & Code Viewer */}
      <div className="lg:col-span-7 space-y-4">
        {selectedProblem ? (
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 space-y-6 shadow-xl">
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                  <span>{selectedProblem.moduleTitle}</span>
                  <span>•</span>
                  <span>{selectedProblem.topicTitle}</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedProblem.title}
                </h2>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button
                  disabled={isPending}
                  onClick={() => handleSolve(selectedProblem.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                    selectedProblem.isSolved
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPending ? 'Verifying...' : selectedProblem.isSolved ? 'Re-verify Submission' : 'Submit & Solve'}</span>
                </button>
              </div>
            </div>

            {solveMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{solveMessage}</span>
              </div>
            )}

            {/* Problem Description */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Problem Statement
              </h4>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {selectedProblem.description}
              </div>
            </div>

            {/* Optimal Complexities & Mapped Companies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                  Optimal Target Complexity
                </div>
                <div className="text-xs font-mono text-cyan-400 mt-1">
                  Time: {selectedProblem.optimalTimeComplexity || 'O(N)'} | Space: {selectedProblem.optimalSpaceComplexity || 'O(1)'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                  Frequently Asked By
                </div>
                <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-1.5">
                  {selectedProblem.companies.length > 0
                    ? selectedProblem.companies.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {c}
                        </span>
                      ))
                    : 'Tier-1 Assessment Repositories'}
                </div>
              </div>
            </div>

            {/* Public Test Cases */}
            {selectedProblem.testCases.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Sample Test Cases
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProblem.testCases.slice(0, 2).map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px]">Input: </span>
                        <span className="text-slate-200">{tc.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Output: </span>
                        <span className="text-emerald-400">{tc.expectedOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Solution Code Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reference Implementation</span>
                </h4>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['cpp', 'java', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold transition-colors ${
                        selectedLang === lang
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#070A10] border border-slate-800/80 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[320px]">
                <pre className="text-[12px] leading-relaxed">
                  <code>{getLanguageCode(selectedLang)}</code>
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 text-slate-400">
            Select a problem from the roadmap to view details.
          </div>
        )}
      </div>
    </div>
  );
}
