'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Bookmark,
  Play,
  Send,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Terminal,
  FileCode,
  History,
  BookOpen,
  Sparkles,
  Lock,
  Unlock,
  Check,
  Copy,
  Info,
  Building2,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import {
  runProblemCodeAction,
  submitProblemCodeAction,
  toggleBookmarkAction,
} from '@/app/dashboard/actions';
import { getStarterCode, SupportedLanguage } from '@/lib/services/starter-code';
import {
  SingleTestResult,
  RunCodeResponse,
  SubmitCodeResponse,
  ExecutionVerdict,
} from '@/lib/services/code-execution';
import { DifficultyBadge } from '@/components/ui/student-os';

interface ProblemWorkspaceProps {
  problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | string;
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

  // Focus Mode toggle
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Selected sample test case tab
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);

  // Language & Code
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('PYTHON');
  const [codes, setCodes] = useState<Record<SupportedLanguage, string>>(() => ({
    CPP: getStarterCode(problem.slug, 'CPP'),
    JAVA: getStarterCode(problem.slug, 'JAVA'),
    PYTHON: getStarterCode(problem.slug, 'PYTHON'),
    JAVASCRIPT: getStarterCode(problem.slug, 'JAVASCRIPT'),
  }));

  // Hints disclosure state & defensive parsing
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  // Defensive normalization guarantees problem.hints is always a valid string[]
  const normalizedHints: string[] = React.useMemo(() => {
    const raw: unknown = problem?.hints;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .map((h) => (typeof h === 'string' ? h.trim() : String(h ?? '').trim()))
        .filter((h) => h.length > 0);
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed || trimmed === '[]') return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((h) => (typeof h === 'string' ? h.trim() : String(h ?? '').trim()))
            .filter((h) => h.length > 0);
        }
        if (typeof parsed === 'string' && parsed.trim().length > 0) {
          return [parsed.trim()];
        }
      } catch {
        return [trimmed];
      }
    }
    return [];
  }, [problem?.hints]);

  // Editorial reference code disclosure
  const [revealedEditorial, setRevealedEditorial] = useState<boolean>(false);
  const [editorialLang, setEditorialLang] = useState<SupportedLanguage>('PYTHON');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

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
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  // Line numbering & editor sync
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const currentCode = codes[selectedLang] ?? '';

  const handleCodeChange = (newCode: string) => {
    setCodes((prev) => ({
      ...prev,
      [selectedLang]: newCode,
    }));
  };

  const handleResetCode = () => {
    if (confirm('Reset editor to initial starter code? All unsaved changes will be lost.')) {
      const initial = getStarterCode(problem.slug, selectedLang);
      handleCodeChange(initial);
    }
  };

  // Synchronize scroll between textarea and line gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut handlers (Tab, Shift+Tab, auto-close brackets, Run/Submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter -> Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRunCode();
      return;
    }

    // Ctrl+Shift+Enter or Cmd+Shift+Enter -> Submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmitCode();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // Tab key: Indent 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!e.shiftKey) {
        const updated = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
        handleCodeChange(updated);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
        });
      } else {
        // Shift+Tab: Unindent
        const linesBefore = value.substring(0, selectionStart).split('\n');
        const currentLine = linesBefore[linesBefore.length - 1];
        if (currentLine.startsWith('    ')) {
          const lineStartIdx = selectionStart - currentLine.length;
          const updated = value.substring(0, lineStartIdx) + currentLine.substring(4) + value.substring(selectionStart);
          handleCodeChange(updated);
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStartIdx, selectionStart - 4);
          });
        }
      }
      return;
    }

    // Auto-close brackets and quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const updated = value.substring(0, selectionStart) + e.key + closeChar + value.substring(selectionEnd);
      handleCodeChange(updated);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      });
      return;
    }
  };

  // Toggle hint reveal
  const toggleHint = (index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
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

  // RUN CODE (against sample/public test cases only)
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setActiveConsoleTab('result');
    setMobileTab('console');
    setRunResult(null);

    try {
      const res = await runProblemCodeAction(problem.id, selectedLang, currentCode);
      setRunResult(res);
      setSelectedResultIndex(0);
    } catch (err: any) {
      setRunResult({
        success: false,
        status: 'PROVIDER_ERROR',
        passedTests: 0,
        totalTests: 0,
        results: [],
        isConfigured: true,
        errorLog: err?.message || 'Failed to execute run request.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // SUBMIT CODE (against complete test suite)
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setActiveConsoleTab('result');
    setMobileTab('console');
    setSubmitResult(null);

    try {
      const res = await submitProblemCodeAction(problem.id, selectedLang, currentCode);
      setSubmitResult(res);
      setSelectedResultIndex(0);

      if (res.isSolved) {
        setIsSolved(true);
      }

      // If submission ID returned, prepend to local submissions list
      if (res.submissionId) {
        setSubmissions((prev) => [
          {
            id: res.submissionId!,
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
    } catch (err: any) {
      setSubmitResult({
        success: false,
        status: 'PROVIDER_ERROR',
        passedTests: 0,
        totalTests: 0,
        results: [],
        isSolved: false,
        isConfigured: true,
        errorLog: err?.message || 'Failed to submit solution.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy reference code to clipboard
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Find solution matching current editorial language
  const matchingSolution = problem.solutions.find((s) => s.language === editorialLang) ?? problem.solutions[0];

  const lineCount = currentCode.split('\n').length;
  const activeResults = submitResult ? submitResult.results : runResult ? runResult.results : [];
  const activeVerdict = submitResult ? submitResult.status : runResult ? runResult.status : null;
  const isEvaluating = isRunning || isSubmitting;

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        isFocusMode
          ? 'fixed inset-0 z-50 bg-[#0A0D14] text-slate-100'
          : 'h-[calc(100vh-6rem)] min-h-[700px] -m-4 md:-m-6 bg-white rounded-xl border border-slate-200/90 shadow-sm'
      }`}
    >
      {/* 1. Top Navbar */}
      <div
        className={`h-14 px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-20 ${
          isFocusMode
            ? 'border-b border-slate-800 bg-[#101522] text-slate-100'
            : 'border-b border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Left: Breadcrumbs & Focus indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          {!isFocusMode ? (
            <Link
              href="/dashboard/dsa"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              title="Back to DSA Roadmap"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Focus Mode • Deliberate Practice</span>
            </div>
          )}

          <div className="flex items-center gap-2 truncate">
            {!isFocusMode && (
              <>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {problem.moduleTitle}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline shrink-0" />
                <span className="text-xs text-blue-600 font-medium hidden md:inline">
                  {problem.topicTitle}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline shrink-0" />
              </>
            )}
            <h2 className="text-sm font-bold tracking-tight truncate">
              {problem.title}
            </h2>
          </div>

          <DifficultyBadge difficulty={problem.difficulty} size="sm" />

          {isSolved && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Solved</span>
            </span>
          )}
        </div>

        {/* Right: Actions, Language & Execution Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bookmark Button */}
          {!isFocusMode && (
            <button
              onClick={handleToggleBookmark}
              disabled={isBookmarkPending}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
              }`}
              title={isBookmarked ? 'Problem Saved' : 'Save Problem'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Reset Code Button */}
          <button
            onClick={handleResetCode}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              isFocusMode
                ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Reset to starter code"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* Language Selector */}
          <div
            className={`flex items-center rounded-lg p-0.5 text-xs font-mono border ${
              isFocusMode
                ? 'bg-slate-900 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(['CPP', 'JAVA', 'PYTHON'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  selectedLang === lang
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isFocusMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'CPP' ? 'C++' : lang === 'JAVA' ? 'Java' : 'Python'}
              </button>
            ))}
          </div>

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isFocusMode
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode (Distraction-Free)'}
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFocusMode ? 'Exit Focus' : 'Focus'}</span>
          </button>

          {/* Run Code Action (Secondary) */}
          <button
            disabled={isEvaluating}
            onClick={handleRunCode}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all disabled:opacity-50 ${
              isFocusMode
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800'
            }`}
            title="Run against sample test cases (Ctrl + Enter)"
          >
            <Play className="w-3 h-3 fill-current text-blue-500" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          {/* Submit Action (Primary) */}
          <button
            disabled={isEvaluating}
            onClick={handleSubmitCode}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-50"
            title="Submit against full test suite (Ctrl + Shift + Enter)"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center bg-slate-50 border-b border-slate-200 px-3 py-1 gap-1 text-xs font-mono">
        <button
          onClick={() => setMobileTab('statement')}
          className={`flex-1 py-1.5 rounded text-center ${
            mobileTab === 'statement' ? 'bg-white text-slate-900 font-bold shadow-subtle' : 'text-slate-500'
          }`}
        >
          Problem
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 rounded text-center ${
            mobileTab === 'editor' ? 'bg-white text-slate-900 font-bold shadow-subtle' : 'text-slate-500'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('console')}
          className={`flex-1 py-1.5 rounded text-center ${
            mobileTab === 'console' ? 'bg-white text-slate-900 font-bold shadow-subtle' : 'text-slate-500'
          }`}
        >
          Console {activeResults.length > 0 && `(${activeResults.length})`}
        </button>
        <button
          onClick={() => setMobileTab('submissions')}
          className={`flex-1 py-1.5 rounded text-center ${
            mobileTab === 'submissions' ? 'bg-white text-slate-900 font-bold shadow-subtle' : 'text-slate-500'
          }`}
        >
          History ({submissions.length})
        </button>
      </div>

      {/* 2. Main Workspace Split: Left (Problem Specs - Light) | Right (Code & Console - Dark) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Problem Details, Hints, Editorial, Submission History */}
        {/* =================================================================== */}
        {!isFocusMode && (
          <div
            className={`lg:col-span-6 border-r border-slate-200 bg-white flex flex-col min-h-0 ${
              mobileTab === 'statement' || mobileTab === 'submissions'
                ? 'flex'
                : 'hidden lg:flex'
            }`}
          >
            {/* Left Panel Tabs Header */}
            <div className="h-10 border-b border-slate-200 bg-slate-50 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveLeftTab('statement')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeLeftTab === 'statement'
                      ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Description</span>
                </button>

                <button
                  onClick={() => setActiveLeftTab('editorial')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeLeftTab === 'editorial'
                      ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Editorial</span>
                </button>

                <button
                  onClick={() => setActiveLeftTab('submissions')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeLeftTab === 'submissions'
                      ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Submissions ({submissions.length})</span>
                </button>
              </div>
            </div>

            {/* Left Panel Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-800">
              {/* TAB 1: Problem Description */}
              {activeLeftTab === 'statement' && (
                <div className="space-y-6">
                  {/* Problem Statement */}
                  <div className="text-sm leading-relaxed text-slate-700 font-sans space-y-3 whitespace-pre-line bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                    {problem.statement}
                  </div>

                  {/* Sample Test Cases / Examples */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-blue-600" />
                      <span>Examples</span>
                    </h3>

                    <div className="space-y-3">
                      {problem.sampleTestCases.map((tc, idx) => (
                        <div
                          key={tc.id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono"
                        >
                          <div className="text-xs font-bold text-slate-800 mb-1">
                            Example {idx + 1}:
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">Input: </span>
                            <span className="text-slate-800 font-medium">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">Output: </span>
                            <span className="text-emerald-700 font-bold">{tc.expected}</span>
                          </div>
                          {tc.explanation && (
                            <div className="pt-1.5 text-xs text-slate-500 font-sans border-t border-slate-200">
                              <span className="font-semibold text-slate-700">Explanation: </span>
                              {tc.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Constraints
                    </h3>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed">
                      {problem.constraints}
                    </div>
                  </div>

                  {/* Expected Complexity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Target Time Complexity
                      </div>
                      <div className="text-xs font-mono text-blue-700 font-bold mt-1">
                        {problem.expectedTimeComplexity || 'O(N)'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Target Space Complexity
                      </div>
                      <div className="text-xs font-mono text-blue-700 font-bold mt-1">
                        {problem.expectedSpaceComplexity || 'O(1)'}
                      </div>
                    </div>
                  </div>

                  {/* Hints Accordion */}
                  {normalizedHints.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hints ({normalizedHints.length})</span>
                      </h3>

                      <div className="space-y-2">
                        {normalizedHints.map((hint, idx) => {
                          const isRevealed = revealedHints.has(idx);
                          return (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-subtle"
                            >
                              <button
                                onClick={() => toggleHint(idx)}
                                className="w-full p-3 text-left flex items-center justify-between text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {isRevealed ? (
                                    <Unlock className="w-3.5 h-3.5 text-amber-500" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  <span className={isRevealed ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                                    Hint {idx + 1}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {isRevealed ? 'Hide' : 'Click to reveal'}
                                </span>
                              </button>
                              {isRevealed && (
                                <div className="p-3.5 pt-0 text-xs text-slate-600 font-sans border-t border-slate-100 bg-slate-50/50">
                                  {hint}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Companies Testing This Pattern */}
                  {problem.companies.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Companies Testing This Pattern</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {problem.companies.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Editorial & Solution */}
              {activeLeftTab === 'editorial' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Authoritative Editorial</div>
                      <div className="text-amber-800/90 mt-0.5">
                        We strongly recommend spending at least 20 minutes attempting this problem before reviewing the reference implementation.
                      </div>
                    </div>
                  </div>

                  {matchingSolution ? (
                    <div className="space-y-5">
                      {/* Approach & Editorial */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Algorithmic Approach
                        </h3>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                          {matchingSolution.editorial}
                        </div>
                      </div>

                      {/* Complexity Analysis */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">
                            Time Complexity
                          </div>
                          <div className="text-xs font-mono text-blue-700 font-bold mt-1">
                            {matchingSolution.timeComplexity}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">
                            Space Complexity
                          </div>
                          <div className="text-xs font-mono text-blue-700 font-bold mt-1">
                            {matchingSolution.spaceComplexity}
                          </div>
                        </div>
                      </div>

                      {/* Reference Implementation Toggle */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Reference Implementation
                          </h3>

                          {revealedEditorial && (
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
                              {(['CPP', 'JAVA', 'PYTHON'] as const).map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => setEditorialLang(lang)}
                                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                                    editorialLang === lang
                                      ? 'bg-white text-slate-900 shadow-subtle'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  {lang === 'CPP' ? 'C++' : lang === 'JAVA' ? 'Java' : 'Python'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {!revealedEditorial ? (
                          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                            <div className="text-xs text-slate-500">
                              Reference implementation is hidden by default to encourage independent problem decomposition.
                            </div>
                            <button
                              onClick={() => setRevealedEditorial(true)}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-subtle"
                            >
                              Reveal Reference Code
                            </button>
                          </div>
                        ) : (
                          <div className="relative rounded-xl bg-[#0A0D14] border border-slate-800 overflow-hidden text-slate-100">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-[#101522] border-b border-slate-800 text-[11px] font-mono text-slate-400">
                              <span>{editorialLang} Solution</span>
                              <button
                                onClick={() => handleCopyCode(matchingSolution.code)}
                                className="flex items-center gap-1 hover:text-white"
                              >
                                {copiedCode ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
                              <code>{matchingSolution.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">No solution available.</div>
                  )}
                </div>
              )}

              {/* TAB 3: Submission History */}
              {activeLeftTab === 'submissions' && (
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-1">
                      <History className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                      <div className="font-semibold text-slate-700">No submissions recorded yet.</div>
                      <p className="text-[11px] text-slate-500">
                        Write your code and click &quot;Submit&quot; to evaluate against the full test suite.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {submissions.map((sub) => {
                        const isExpanded = expandedSubmissionId === sub.id;
                        const isAcc = sub.status === 'ACCEPTED';
                        const badgeColor = isAcc
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : sub.status === 'WRONG_ANSWER'
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : sub.status === 'COMPILATION_ERROR'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200';

                        return (
                          <div
                            key={sub.id}
                            className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-subtle"
                          >
                            <div
                              onClick={() =>
                                setExpandedSubmissionId(isExpanded ? null : sub.id)
                              }
                              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {isAcc ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badgeColor}`}
                                    >
                                      {sub.status.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs font-mono text-slate-600">
                                      {sub.language}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                    {new Date(sub.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                                <div>
                                  <span className="text-slate-400">Tests: </span>
                                  <span className={isAcc ? 'text-emerald-600 font-bold' : 'text-slate-700'}>
                                    {sub.passedTests} / {sub.totalTests}
                                  </span>
                                </div>

                                {sub.executionTime !== null && (
                                  <div className="hidden sm:block">
                                    <span className="text-slate-400">Runtime: </span>
                                    <span>{sub.executionTime} ms</span>
                                  </div>
                                )}

                                <ChevronDown
                                  className={`w-4 h-4 text-slate-400 transition-transform ${
                                    isExpanded ? 'rotate-180 text-slate-700' : ''
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Expanded Details / Error Log */}
                            {isExpanded && sub.errorLog && (
                              <div className="p-3 border-t border-slate-100 bg-[#0A0D14] text-[11px] font-mono text-rose-300 whitespace-pre-wrap overflow-x-auto max-h-48">
                                {sub.errorLog}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Code Editor (Top) + Output/Console Panel (Bottom) */}
        {/* INTENTIONALLY DARK CODING ENVIRONMENT */}
        {/* =================================================================== */}
        <div
          className={`${
            isFocusMode ? 'lg:col-span-12' : 'lg:col-span-6'
          } bg-[#0A0D14] text-slate-100 flex flex-col min-h-0 dark-workspace ${
            mobileTab === 'editor' || mobileTab === 'console' || isFocusMode
              ? 'flex'
              : 'hidden lg:flex'
          }`}
        >
          {/* Workspace Subheader: Status & Helpers */}
          <div className="h-9 border-b border-slate-800 bg-[#101522] px-4 flex items-center justify-between shrink-0 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-300">
                {selectedLang === 'CPP' ? 'C++17' : selectedLang === 'JAVA' ? 'Java 17' : 'Python 3.12'} Solution
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="hidden sm:inline">Lines: {lineCount}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden md:inline">Ctrl+Enter to Run</span>
            </div>
          </div>

          {/* CODE EDITOR CONTAINER */}
          <div className="flex-1 flex min-h-[220px] overflow-hidden bg-[#0A0D14] relative">
            {/* Line Numbers Gutter */}
            <div
              ref={lineNumbersRef}
              className="w-11 shrink-0 py-3 text-right pr-3 select-none text-[12px] font-mono text-slate-600 bg-[#0A0D14] border-r border-slate-800/80 overflow-hidden leading-[1.6]"
              aria-hidden="true"
            >
              {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Actual Code Textarea */}
            <textarea
              ref={textareaRef}
              value={currentCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[13px] leading-[1.6] outline-none resize-none overflow-y-auto whitespace-pre tab-[4]"
              placeholder="// Write your solution here..."
            />
          </div>

          {/* =================================================================== */}
          {/* BOTTOM CONSOLE: Test Cases & Execution Results */}
          {/* =================================================================== */}
          <div className="h-56 sm:h-64 border-t border-slate-800 bg-[#101522] flex flex-col shrink-0">
            {/* Console Header Tabs */}
            <div className="h-9 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 bg-[#0A0D14] text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('testcases')}
                  className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                    activeConsoleTab === 'testcases'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sample Test Cases</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                    activeConsoleTab === 'result'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Test Result{' '}
                    {activeVerdict && (
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          activeVerdict === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {activeVerdict}
                      </span>
                    )}
                  </span>
                </button>
              </div>

              {activeVerdict && (
                <div className="text-[10px] text-slate-400">
                  {submitResult ? 'Full Test Suite' : 'Sample Tests Only'}
                </div>
              )}
            </div>

            {/* Console Body Area */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono workspace-scroll">
              {/* TAB 1: Sample Test Cases Browser */}
              {activeConsoleTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {problem.sampleTestCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedSampleIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                          selectedSampleIndex === idx
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {problem.sampleTestCases[selectedSampleIndex] && (
                    <div className="space-y-2.5">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                          Input:
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-200">
                          {problem.sampleTestCases[selectedSampleIndex].input}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                          Expected Output:
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-emerald-400">
                          {problem.sampleTestCases[selectedSampleIndex].expected}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Execution Results */}
              {activeConsoleTab === 'result' && (
                <div>
                  {/* Evaluating / Loading Spinner */}
                  {isEvaluating && (
                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-xs text-slate-300 font-semibold">
                        {isRunning
                          ? 'Executing against sample test cases...'
                          : 'Evaluating submission against full test suite (including hidden tests)...'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Compiling and running through real execution sandbox
                      </div>
                    </div>
                  )}

                  {/* Idle State */}
                  {!isEvaluating && !runResult && !submitResult && (
                    <div className="py-8 text-center text-slate-500 space-y-2">
                      <Terminal className="w-6 h-6 mx-auto text-slate-600" />
                      <div className="text-xs">
                        Click &quot;Run&quot; to test against sample cases, or &quot;Submit&quot; to evaluate against all test cases.
                      </div>
                    </div>
                  )}

                  {/* Verdict & Test Results */}
                  {!isEvaluating && (submitResult || runResult) && (
                    <div className="space-y-3">
                      {/* Verdict Banner */}
                      {activeVerdict === 'ACCEPTED' && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <div>
                              <div className="font-bold text-sm">Accepted!</div>
                              <div className="text-[11px] text-emerald-300/80">
                                {submitResult ? 'All test cases passed. Problem marked solved!' : 'All sample test cases passed.'}
                              </div>
                            </div>
                          </div>
                          {(submitResult?.executionTimeMs !== undefined || runResult?.executionTimeMs !== undefined) && (
                            <div className="text-right text-[11px] text-slate-400">
                              <div>Runtime: {submitResult?.executionTimeMs ?? runResult?.executionTimeMs} ms</div>
                              <div>Memory: {submitResult?.memoryKb ?? runResult?.memoryKb} KB</div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeVerdict === 'WRONG_ANSWER' && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2.5">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          <div>
                            <div className="font-bold text-sm">Wrong Answer</div>
                            <div className="text-[11px] text-rose-300/80">
                              Your output did not match the expected answer for one or more test cases.
                            </div>
                          </div>
                        </div>
                      )}

                      {activeVerdict === 'COMPILATION_ERROR' && (
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <div className="font-bold">Compilation Error</div>
                          </div>
                          {(submitResult?.errorLog || runResult?.errorLog) && (
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {submitResult?.errorLog || runResult?.errorLog}
                            </div>
                          )}
                        </div>
                      )}

                      {activeVerdict === 'RUNTIME_ERROR' && (
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                            <div className="font-bold">Runtime Error</div>
                          </div>
                          {(submitResult?.errorLog || runResult?.errorLog) && (
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {submitResult?.errorLog || runResult?.errorLog}
                            </div>
                          )}
                        </div>
                      )}

                      {activeVerdict === 'TIME_LIMIT_EXCEEDED' && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2.5">
                          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold text-sm">Time Limit Exceeded</div>
                            <div className="text-[11px] text-amber-200/80">
                              Your solution exceeded the execution time limit. Check for infinite loops or high time complexity.
                            </div>
                          </div>
                        </div>
                      )}

                      {activeVerdict === 'PROVIDER_NOT_CONFIGURED' && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="font-bold">Execution Provider Not Configured</div>
                          </div>
                          <p className="text-[11px] text-amber-200/80 leading-relaxed font-sans">
                            PrepOS adheres strictly to honest evaluation and never fabricates results.
                            To enable real code compilation and testing, configure <code className="px-1.5 py-0.5 rounded bg-amber-950/60 font-mono text-amber-200">JUDGE0_API_URL</code> in your environment.
                          </p>
                        </div>
                      )}

                      {/* Case Pills */}
                      {activeResults.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {activeResults.map((r, idx) => (
                              <button
                                key={r.testCaseId}
                                onClick={() => setSelectedResultIndex(idx)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                                  selectedResultIndex === idx
                                    ? 'bg-slate-700 text-white font-bold ring-1 ring-blue-500'
                                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                                }`}
                              >
                                {r.status === 'ACCEPTED' ? (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                )}
                                <span>
                                  {r.isSecret ? `Hidden #${r.testCaseNumber}` : `Case ${r.testCaseNumber}`}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Selected Case Inspection */}
                          {activeResults[selectedResultIndex] && (
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                              {activeResults[selectedResultIndex].isSecret ? (
                                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/60 space-y-1.5">
                                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Hidden Test Case #{activeResults[selectedResultIndex].testCaseNumber}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-sans">
                                    This test case is part of the secret test suite to prevent hardcoding. Input and expected answers remain strictly server-side.
                                  </p>
                                  <div className="text-[11px] font-mono text-slate-300 pt-1">
                                    Verdict:{' '}
                                    <span
                                      className={
                                        activeResults[selectedResultIndex].status === 'ACCEPTED'
                                          ? 'text-emerald-400 font-bold'
                                          : 'text-rose-400 font-bold'
                                      }
                                    >
                                      {activeResults[selectedResultIndex].status}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                                      Input:
                                    </div>
                                    <div className="p-2 rounded bg-slate-900 text-slate-200">
                                      {activeResults[selectedResultIndex].input}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                                        Expected Output:
                                      </div>
                                      <div className="p-2 rounded bg-slate-900 text-emerald-400">
                                        {activeResults[selectedResultIndex].expectedOutput}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                                        Your Output:
                                      </div>
                                      <div
                                        className={`p-2 rounded bg-slate-900 ${
                                          activeResults[selectedResultIndex].status === 'ACCEPTED'
                                            ? 'text-emerald-400'
                                            : 'text-rose-400'
                                        }`}
                                      >
                                        {activeResults[selectedResultIndex].actualOutput || '<empty output>'}
                                      </div>
                                    </div>
                                  </div>

                                  {activeResults[selectedResultIndex].errorMessage && (
                                    <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px]">
                                      {activeResults[selectedResultIndex].errorMessage}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
