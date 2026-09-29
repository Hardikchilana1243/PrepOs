'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  FileCode,
  BookOpen,
  History,
  Play,
  Send,
  Loader2,
  Terminal,
} from 'lucide-react';
import {
  runProblemCodeAction,
  submitProblemCodeAction,
  toggleBookmarkAction,
} from '@/app/dashboard/actions';
import { getStarterCode, SupportedLanguage } from '@/lib/services/starter-code';
import { RunCodeResponse, SubmitCodeResponse } from '@/lib/services/code-execution';
import { ProblemHeader } from './problem-header';
import { ProblemDescription } from './problem-description';
import { ProblemExamples } from './problem-examples';
import { ProblemConstraints } from './problem-constraints';
import { ProblemHints } from './problem-hints';
import { ProblemEditorial } from './problem-editorial';
import { LanguageSelector } from './language-selector';
import { CodeEditor } from './code-editor';
import { TestCasePanel } from './test-case-panel';
import { ExecutionConsole } from './execution-console';
import { SubmissionHistory } from './submission-history';

interface ProblemWorkspaceProps {
  problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    statement: string;
    constraints: string;
    hints: string[];
    expectedTimeComplexity: string | null;
    expectedSpaceComplexity: string | null;
    moduleTitle: string;
    moduleSlug: string;
    topicTitle: string;
    topicSlug: string;
    companies: string[];
    sampleTestCases: {
      id: string;
      orderIndex: number;
      input: string;
      expected: string;
      explanation: string | null;
    }[];
    solutions: {
      language: string;
      editorial: string;
      timeComplexity: string;
      spaceComplexity: string;
      code: string;
    }[];
  };
  userState: {
    isSolved: boolean;
    isBookmarked: boolean;
    submissions: {
      id: string;
      language: string;
      status: string;
      executionTime: number | null;
      memoryKb: number | null;
      passedTests: number;
      totalTests: number;
      errorLog: string | null;
      createdAt: string;
    }[];
  };
}

export function ProblemWorkspace({ problem, userState }: ProblemWorkspaceProps) {
  // Navigation & tabs
  const [activeLeftTab, setActiveLeftTab] = useState<'statement' | 'editorial' | 'submissions'>(
    'statement'
  );
  const [mobileTab, setMobileTab] = useState<'statement' | 'editor' | 'console' | 'submissions'>(
    'statement'
  );
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcases' | 'result'>('testcases');

  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Language & Code State
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('PYTHON');
  const [codes, setCodes] = useState<Record<SupportedLanguage, string>>(() => ({
    CPP: getStarterCode(problem.slug, 'CPP'),
    JAVA: getStarterCode(problem.slug, 'JAVA'),
    PYTHON: getStarterCode(problem.slug, 'PYTHON'),
    JAVASCRIPT: getStarterCode(problem.slug, 'JAVASCRIPT'),
  }));

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(userState.isBookmarked);
  const [isBookmarkPending, startBookmarkTransition] = useTransition();

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitCodeResponse | null>(null);

  // Solved state and submission history
  const [isSolved, setIsSolved] = useState<boolean>(userState.isSolved);
  const [submissions, setSubmissions] = useState(userState.submissions);

  const currentCode = codes[selectedLang] ?? '';

  const handleCodeChange = (newCode: string) => {
    setCodes((prev) => ({
      ...prev,
      [selectedLang]: newCode,
    }));
  };

  const handleResetCode = () => {
    if (confirm('Reset editor to initial starter code? All unsaved edits will be lost.')) {
      const initial = getStarterCode(problem.slug, selectedLang);
      handleCodeChange(initial);
    }
  };

  // Bookmark toggle
  const handleToggleBookmark = () => {
    startBookmarkTransition(async () => {
      const prev = isBookmarked;
      setIsBookmarked(!prev);
      try {
        const res = await toggleBookmarkAction(problem.id);
        setIsBookmarked(res.isBookmarked);
      } catch (err) {
        setIsBookmarked(prev);
      }
    });
  };

  // RUN CODE (Evaluates against public sample test cases)
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setActiveConsoleTab('result');
    setMobileTab('console');
    setRunResult(null);

    try {
      const res = await runProblemCodeAction(problem.id, selectedLang, currentCode);
      setRunResult(res);
    } catch (err) {
      setRunResult({
        success: false,
        status: 'PROVIDER_ERROR',
        passedTests: 0,
        totalTests: 0,
        isConfigured: true,
        errorLog: err instanceof Error ? err.message : 'Unknown execution error occurred',
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // SUBMIT CODE (Evaluates against all tests, including hidden test cases on server)
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setActiveConsoleTab('result');
    setMobileTab('console');
    setSubmitResult(null);

    try {
      const res = await submitProblemCodeAction(problem.id, selectedLang, currentCode);
      setSubmitResult(res);

      if (res.isSolved) {
        setIsSolved(true);
      }

      // Prepend new submission to history if recorded
      if (res.submissionId) {
        setSubmissions((prev) => [
          {
            id: res.submissionId as string,
            language: selectedLang,
            status: res.status,
            executionTime: res.executionTimeMs ?? null,
            memoryKb: res.memoryKb ?? null,
            passedTests: res.passedTests,
            totalTests: res.totalTests,
            errorLog: res.errorLog ?? null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        submissionId: 'error',
        isSolved: false,
        isConfigured: true,
        status: 'PROVIDER_ERROR',
        passedTests: 0,
        totalTests: 0,
        errorLog: err instanceof Error ? err.message : 'Submission failed',
        results: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEvaluating = isRunning || isSubmitting;
  const activeVerdict = submitResult ? submitResult.status : runResult ? runResult.status : null;
  const activeResults = submitResult ? submitResult.results : runResult ? runResult.results : [];
  const activeErrorLog = submitResult ? submitResult.errorLog : runResult ? runResult.errorLog : null;
  const activeTime = submitResult ? submitResult.executionTimeMs : runResult ? runResult.executionTimeMs : undefined;
  const activeMem = submitResult ? submitResult.memoryKb : runResult ? runResult.memoryKb : undefined;
  const activePassed = submitResult ? submitResult.passedTests : runResult ? runResult.results.filter(r => r.status === 'ACCEPTED').length : undefined;
  const activeTotal = submitResult ? submitResult.totalTests : runResult ? runResult.results.length : undefined;

  return (
    <div
      className={`flex flex-col ${
        isFocusMode
          ? 'fixed inset-0 z-50 bg-[#0F172A] text-slate-100 p-3 sm:p-4'
          : 'max-w-7xl mx-auto space-y-4'
      }`}
    >
      {/* 1. Header Navigation & Attributes */}
      <ProblemHeader
        title={problem.title}
        difficulty={problem.difficulty}
        moduleTitle={problem.moduleTitle}
        topicTitle={problem.topicTitle}
        companies={problem.companies}
        isSolved={isSolved}
        isBookmarked={isBookmarked}
        isBookmarkPending={isBookmarkPending}
        onToggleBookmark={handleToggleBookmark}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
      />

      {/* Mobile Tab Selector */}
      <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileTab('statement')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mobileTab === 'statement'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Problem
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mobileTab === 'editor'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('console')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mobileTab === 'console'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Console {activeResults.length > 0 && `(${activeResults.length})`}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('submissions')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mobileTab === 'submissions'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          History ({submissions.length})
        </button>
      </div>

      {/* 2. Main Two-Pane Split Layout */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch ${
          isFocusMode ? 'flex-1 min-h-0' : 'h-[calc(100vh-12rem)] min-h-[650px]'
        }`}
      >
        {/* =================================================================== */}
        {/* LEFT PANE: Description, Editorial, Submissions */}
        {/* =================================================================== */}
        <div
          className={`lg:col-span-5 xl:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col min-h-0 overflow-hidden ${
            mobileTab === 'statement' || mobileTab === 'submissions'
              ? 'flex'
              : 'hidden lg:flex'
          }`}
        >
          {/* Left Panel Tabs Header */}
          <div className="h-11 px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveLeftTab('statement')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeLeftTab === 'statement'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Description</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab('editorial')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeLeftTab === 'editorial'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Editorial</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab('submissions')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeLeftTab === 'submissions'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>History ({submissions.length})</span>
              </button>
            </div>
          </div>

          {/* Left Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {activeLeftTab === 'statement' && (
              <div className="space-y-5">
                <ProblemDescription statement={problem.statement} />
                <ProblemExamples examples={problem.sampleTestCases} />
                <ProblemConstraints
                  constraints={problem.constraints}
                  expectedTimeComplexity={problem.expectedTimeComplexity}
                  expectedSpaceComplexity={problem.expectedSpaceComplexity}
                />
                <ProblemHints hints={problem.hints} />
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <ProblemEditorial
                solutions={problem.solutions}
                isSolved={isSolved}
              />
            )}

            {activeLeftTab === 'submissions' && (
              <SubmissionHistory submissions={submissions} />
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANE: Code Editor & Console Workspace */}
        {/* =================================================================== */}
        <div
          className={`lg:col-span-7 xl:col-span-7 rounded-xl border border-slate-800 bg-[#0F172A] shadow-xs flex flex-col min-h-0 overflow-hidden ${
            mobileTab === 'editor' || mobileTab === 'console'
              ? 'flex'
              : 'hidden lg:flex'
          }`}
        >
          {/* Top of Editor: Language Selector & Reset */}
          <LanguageSelector
            selectedLang={selectedLang}
            onSelectLang={setSelectedLang}
            onResetCode={handleResetCode}
            disabled={isEvaluating}
          />

          {/* Middle: Code Editor Area */}
          <div className="flex-1 min-h-[280px] flex flex-col overflow-hidden">
            <CodeEditor
              value={currentCode}
              onChange={handleCodeChange}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              disabled={isEvaluating}
            />
          </div>

          {/* Bottom Console Tabs Header */}
          <div className="h-10 px-3 bg-[#080D1A] border-t border-b border-slate-800 flex items-center justify-between shrink-0 select-none text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveConsoleTab('testcases')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  activeConsoleTab === 'testcases'
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Test Cases ({problem.sampleTestCases.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveConsoleTab('result')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  activeConsoleTab === 'result'
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Console Output</span>
                {activeVerdict && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeVerdict === 'ACCEPTED'
                        ? 'bg-emerald-400'
                        : 'bg-rose-400'
                    }`}
                  />
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Ctrl+Enter to Run
            </div>
          </div>

          {/* Bottom Console Content (Height fixed / flexible) */}
          <div className="h-44 shrink-0 flex flex-col min-h-0 bg-[#0B1120]">
            {activeConsoleTab === 'testcases' ? (
              <TestCasePanel testCases={problem.sampleTestCases} />
            ) : (
              <ExecutionConsole
                isLoading={isEvaluating}
                verdict={activeVerdict}
                passedTests={activePassed}
                totalTests={activeTotal}
                executionTimeMs={activeTime}
                memoryKb={activeMem}
                errorLog={activeErrorLog}
                results={activeResults}
              />
            )}
          </div>

          {/* Execution Action Footer Bar */}
          <div className="h-14 px-4 bg-[#080D1A] border-t border-slate-800 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/dsa"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Back to Roadmap
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Run Code Button */}
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isEvaluating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Run</span>
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isEvaluating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
