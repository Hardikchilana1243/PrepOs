'use client';

// ============================================================================
// PREPOS ASSESSMENT WORKSPACE COMPONENT
// Distraction-Free, Exam-Like Timed Workspace (Desktop & Mobile Responsive)
// ============================================================================

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Code2,
  BookOpen,
  Play,
  Send,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { AssessmentWorkspaceData } from '@/lib/services/assessment';
import {
  autosaveMCQAnswerAction,
  autosaveCodeDraftAction,
  runAssessmentCodeAction,
  submitAssessmentCodeAction,
  submitFinalAssessmentAction,
} from '@/app/dashboard/assessments/actions';
import { SupportedLanguage, ExecutionVerdict, SingleTestResult } from '@/lib/services/code-execution';
import { getStarterCode } from '@/lib/services/starter-code';

interface WorkspaceProps {
  initialData: AssessmentWorkspaceData;
}

export function AssessmentWorkspace({ initialData }: WorkspaceProps) {
  const router = useRouter();

  // Navigation state
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Authoritative server-calculated remaining time
  const [timeLeft, setTimeLeft] = useState(() => initialData.remainingSeconds);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Saved answers map: questionId -> { selectedOptionId, codeDraft, codeLanguage, lastSavedAt }
  const [answers, setAnswers] = useState<Record<string, {
    selectedOptionId?: string | null;
    codeDraft?: string;
    codeLanguage?: SupportedLanguage;
    lastSavedAt?: string;
  }>>(() => {
    const map: Record<string, any> = {};
    initialData.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        map[q.id] = {
          selectedOptionId: q.savedAnswer?.selectedOptionId ?? null,
          codeDraft: q.savedAnswer?.codeDraft ?? q.starterCode ?? '',
          codeLanguage: q.savedAnswer?.codeLanguage ?? 'CPP',
          lastSavedAt: q.savedAnswer?.lastSavedAt,
        };
      });
    });
    return map;
  });

  // Latest submissions map: questionId -> submission status
  const [submissions, setSubmissions] = useState<Record<string, {
    status: string;
    passedTests: number;
    totalTests: number;
    marksEarned: number;
  }>>(() => {
    const map: Record<string, any> = {};
    initialData.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.latestSubmission) {
          map[q.id] = q.latestSubmission;
        }
      });
    });
    return map;
  });

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Code Execution states
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [runResults, setRunResults] = useState<{
    status: ExecutionVerdict;
    passedTests: number;
    totalTests: number;
    results: SingleTestResult[];
    errorLog?: string;
  } | null>(null);
  const [submitResults, setSubmitResults] = useState<{
    status: ExecutionVerdict;
    passedTests: number;
    totalTests: number;
    marksEarned: number;
    results: any[];
    errorLog?: string;
  } | null>(null);

  // Active coding tab (editor vs console)
  const [activeConsoleTab, setActiveConsoleTab] = useState<'TESTS' | 'OUTPUT'>('TESTS');

  // Submit assessment modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFinalSubmitting, startFinalTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Debounce ref for coding draft autosave
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Live countdown timer synced to server expiresAt
  useEffect(() => {
    const targetExpiry = new Date(initialData.expiresAt).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((targetExpiry - now) / 1000));
      setTimeLeft(diffSec);

      if (diffSec <= 0) {
        clearInterval(timer);
        setIsTimeExpired(true);
        handleAutoExpireSubmission();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [initialData.expiresAt]);

  const currentSection = initialData.sections[activeSectionIdx] || initialData.sections[0];
  const currentQuestion = currentSection?.questions[activeQuestionIdx] || currentSection?.questions[0];

  // Helper: check if a question is answered
  const isQuestionAnswered = useCallback((qId: string, qType: 'CODING' | 'MCQ') => {
    if (qType === 'MCQ') {
      return Boolean(answers[qId]?.selectedOptionId);
    }
    return Boolean(submissions[qId] || (answers[qId]?.codeDraft && answers[qId].codeDraft.trim().length > 30));
  }, [answers, submissions]);

  // Count total answered questions across sections
  const totalQuestionsCount = initialData.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnsweredCount = initialData.sections.reduce((acc, s) => {
    return acc + s.questions.filter((q) => isQuestionAnswered(q.id, q.type)).length;
  }, 0);

  // Handle MCQ Option Selection with fast server-side autosave
  const handleSelectMCQOption = async (optionId: string) => {
    if (isTimeExpired || isFinalSubmitting) return;

    // Optimistic UI update
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: optionId,
      },
    }));

    setSaveStatus('saving');
    try {
      const res = await autosaveMCQAnswerAction(initialData.attemptId, currentQuestion.id, optionId);
      if (res.success) {
        setSaveStatus('saved');
        setLastSavedTime(new Date(res.savedAt).toLocaleTimeString());
      }
    } catch (err) {
      setSaveStatus('idle');
      console.error('Failed to autosave MCQ choice:', err);
    }
  };

  // Clear MCQ selection
  const handleClearMCQSelection = async () => {
    if (isTimeExpired || isFinalSubmitting) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: null,
      },
    }));
  };

  // Handle Code Editor Change with 3-second debouncing
  const handleCodeChange = (newCode: string) => {
    if (isTimeExpired || isFinalSubmitting) return;

    const currentLang = answers[currentQuestion.id]?.codeLanguage || 'CPP';

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        codeDraft: newCode,
        codeLanguage: currentLang,
      },
    }));

    setSaveStatus('saving');

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await autosaveCodeDraftAction(
          initialData.attemptId,
          currentQuestion.id,
          newCode,
          currentLang
        );
        if (res.success) {
          setSaveStatus('saved');
          setLastSavedTime(new Date(res.savedAt).toLocaleTimeString());
        }
      } catch (err) {
        setSaveStatus('idle');
        console.error('Autosave code draft failed:', err);
      }
    }, 2500);
  };

  // Handle Language Change
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    const currentCode = answers[currentQuestion.id]?.codeDraft;
    const starter = getStarterCode(currentQuestion.title?.toLowerCase().replace(/\s+/g, '-') || '', newLang);

    // If candidate hasn't heavily modified starter, switch to new template
    const codeToUse = (!currentCode || currentCode.length < 50) ? starter : currentCode;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        codeLanguage: newLang,
        codeDraft: codeToUse,
      },
    }));

    autosaveCodeDraftAction(initialData.attemptId, currentQuestion.id, codeToUse, newLang).catch(() => null);
  };

  // Run Code against Sample Tests
  const handleRunSampleCode = async () => {
    if (isRunningCode || isTimeExpired) return;

    const code = answers[currentQuestion.id]?.codeDraft || '';
    const lang = answers[currentQuestion.id]?.codeLanguage || 'CPP';

    setIsRunningCode(true);
    setRunResults(null);
    setSubmitResults(null);
    setActiveConsoleTab('OUTPUT');

    try {
      const res = await runAssessmentCodeAction(
        initialData.attemptId,
        currentQuestion.id,
        lang,
        code
      );
      setRunResults(res);
    } catch (err: any) {
      setRunResults({
        status: 'PROVIDER_ERROR',
        passedTests: 0,
        totalTests: 0,
        results: [],
        errorLog: err?.message || 'Execution failed. Please retry.',
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Submit Code for Evaluation against Full Test Suite
  const handleSubmitCode = async () => {
    if (isSubmittingCode || isTimeExpired) return;

    const code = answers[currentQuestion.id]?.codeDraft || '';
    const lang = answers[currentQuestion.id]?.codeLanguage || 'CPP';

    setIsSubmittingCode(true);
    setSubmitResults(null);
    setRunResults(null);
    setActiveConsoleTab('OUTPUT');

    try {
      const res = await submitAssessmentCodeAction(
        initialData.attemptId,
        currentQuestion.id,
        lang,
        code
      );
      setSubmitResults(res);

      // Record latest submission verdict
      setSubmissions((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          status: res.status,
          passedTests: res.passedTests,
          totalTests: res.totalTests,
          marksEarned: res.marksEarned,
        },
      }));
    } catch (err: any) {
      setSubmitResults({
        status: 'PROVIDER_ERROR',
        passedTests: 0,
        totalTests: 0,
        marksEarned: 0,
        results: [],
        errorLog: err?.message || 'Submission failed. Please check your network and retry.',
      });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  // Submit Entire Assessment
  const handleFinalSubmit = () => {
    setSubmissionError(null);
    startFinalTransition(async () => {
      try {
        const res = await submitFinalAssessmentAction(initialData.attemptId);
        if (res.redirectUrl) {
          router.push(res.redirectUrl);
        }
      } catch (err: any) {
        setSubmissionError(err?.message || 'Failed to submit assessment. Please retry.');
      }
    });
  };

  // Automatic submission when timer expires
  const handleAutoExpireSubmission = () => {
    startFinalTransition(async () => {
      try {
        const res = await submitFinalAssessmentAction(initialData.attemptId);
        if (res.redirectUrl) {
          router.push(res.redirectUrl);
        }
      } catch (err) {
        console.error('Auto-expiry submission error:', err);
      }
    });
  };

  // Navigation handlers
  const goToNextQuestion = () => {
    if (activeQuestionIdx < currentSection.questions.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
    } else if (activeSectionIdx < initialData.sections.length - 1) {
      setActiveSectionIdx(activeSectionIdx + 1);
      setActiveQuestionIdx(0);
    }
    setRunResults(null);
    setSubmitResults(null);
  };

  const goToPrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
    } else if (activeSectionIdx > 0) {
      setActiveSectionIdx(activeSectionIdx - 1);
      const prevSec = initialData.sections[activeSectionIdx - 1];
      setActiveQuestionIdx(prevSec.questions.length - 1);
    }
    setRunResults(null);
    setSubmitResults(null);
  };

  // Format timer
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const timerFormatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isTimerCritical = timeLeft < 300; // < 5 minutes
  const isTimerWarning = timeLeft < 900;  // < 15 minutes

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. DISTRACTION-FREE EXAM HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-sm px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Assessment Title & Company */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {initialData.companyName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {initialData.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{initialData.companyName}</span>
              <span>•</span>
              <span className="font-mono">Total: {initialData.totalMarks} pts</span>
            </div>
          </div>
        </div>

        {/* Center: Authoritative Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono font-bold text-xs sm:text-sm transition-colors ${
              isTimerCritical
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                : isTimerWarning
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-rose-600' : 'text-slate-500'}`} />
            <span>{timerFormatted}</span>
          </div>

          {/* Autosave Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                <span>Autosaving...</span>
              </>
            ) : (
              <span>Autosaved</span>
            )}
          </div>
        </div>

        {/* Right: Submit Assessment Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finish Assessment</span>
            <span className="sm:hidden">Finish</span>
          </button>
        </div>
      </header>

      {/* 2. SECTION TABS BAR */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-2 py-1.5">
          {initialData.sections.map((sec, idx) => {
            const isActive = idx === activeSectionIdx;
            const answeredInSec = sec.questions.filter((q) => isQuestionAnswered(q.id, q.type)).length;

            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSectionIdx(idx);
                  setActiveQuestionIdx(0);
                  setRunResults(null);
                  setSubmitResults(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/90 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {sec.type === 'CODING' ? <Code2 className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                <span>{sec.title}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-slate-200 font-mono">
                  {answeredInSec}/{sec.questions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Overall Progress Counter */}
        <div className="text-xs text-slate-500 font-medium hidden lg:block shrink-0">
          Questions Completed: <span className="font-semibold text-slate-800">{totalAnsweredCount}</span> of {totalQuestionsCount}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Question Navigator & Problem Description */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white overflow-y-auto">
          {/* Question Number Pills Navigator */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {currentSection.title} (Question {activeQuestionIdx + 1} of {currentSection.questions.length})
              </span>
              <span className="text-[11px] font-semibold text-blue-600">
                {currentQuestion.marks} Marks {currentQuestion.negativeMarks > 0 && `(-${currentQuestion.negativeMarks} penalty)`}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {currentSection.questions.map((q, qIdx) => {
                const isCurrent = qIdx === activeQuestionIdx;
                const isAnswered = isQuestionAnswered(q.id, q.type);
                const isCodingSolved = submissions[q.id]?.status === 'ACCEPTED';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuestionIdx(qIdx);
                      setRunResults(null);
                      setSubmitResults(null);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                        : isCodingSolved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Statement Container */}
          <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            {currentQuestion.type === 'MCQ' ? (
              /* MCQ Question Presentation */
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Multiple Choice Question
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* MCQ Options Radio Cards */}
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options?.map((opt, oIdx) => {
                    const isSelected = answers[currentQuestion.id]?.selectedOptionId === opt.id;
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectMCQOption(opt.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/20 text-blue-900 shadow-sm'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {letter}
                        </div>
                        <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                          {opt.optionText}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Selection Button */}
                {answers[currentQuestion.id]?.selectedOptionId && (
                  <div className="pt-2">
                    <button
                      onClick={handleClearMCQSelection}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Clear my choice
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Coding Problem Presentation */
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                      Algorithmic Problem
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {currentQuestion.difficulty || 'Medium'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {currentQuestion.title}
                  </h2>
                </div>

                {/* Problem Statement */}
                <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {currentQuestion.statement}
                </div>

                {/* Constraints */}
                {currentQuestion.constraints && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Constraints
                    </div>
                    <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                      {currentQuestion.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Testcases */}
                {currentQuestion.sampleTestCases && currentQuestion.sampleTestCases.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Sample Test Cases
                    </div>
                    <div className="space-y-2.5">
                      {currentQuestion.sampleTestCases.map((tc, idx) => (
                        <div key={tc.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs font-mono">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Sample {idx + 1}
                          </div>
                          <div>
                            <span className="text-slate-400">Input: </span>
                            <span className="text-slate-800 font-semibold">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Expected: </span>
                            <span className="text-emerald-700 font-semibold">{tc.expected}</span>
                          </div>
                          {tc.explanation && (
                            <div className="text-slate-500 text-[11px] font-sans pt-1 border-t border-slate-200/60">
                              {tc.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Pagination Control */}
          <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
            <button
              onClick={goToPrevQuestion}
              disabled={activeSectionIdx === 0 && activeQuestionIdx === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={goToNextQuestion}
              disabled={
                activeSectionIdx === initialData.sections.length - 1 &&
                activeQuestionIdx === currentSection.questions.length - 1
              }
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console (or MCQ navigation panel on mobile) */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-900 text-white overflow-hidden min-h-[500px] lg:min-h-0">
          {currentQuestion.type === 'CODING' ? (
            <>
              {/* Code Editor Top Bar */}
              <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Language:</span>
                  <select
                    value={answers[currentQuestion.id]?.codeLanguage || 'CPP'}
                    onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white px-2.5 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="CPP">C++ (GCC 14.1)</option>
                    <option value="JAVA">Java (JDK 17)</option>
                    <option value="PYTHON">Python (3.12)</option>
                  </select>
                </div>

                {submissions[currentQuestion.id] && (
                  <div className="text-xs font-mono">
                    {submissions[currentQuestion.id].status === 'ACCEPTED' ? (
                      <span className="text-emerald-400 font-bold">✓ Accepted ({submissions[currentQuestion.id].marksEarned} pts)</span>
                    ) : (
                      <span className="text-amber-400 font-bold">
                        {submissions[currentQuestion.id].passedTests}/{submissions[currentQuestion.id].totalTests} Tests Passed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Code Editor Textarea */}
              <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
                <textarea
                  value={answers[currentQuestion.id]?.codeDraft || ''}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Write your code solution here..."
                  spellCheck={false}
                  className="w-full h-full bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-blue-600/40"
                  style={{ tabSize: 4 }}
                />
              </div>

              {/* Bottom Test Execution Drawer */}
              <div className="bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
                {/* Drawer Header Tabs */}
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setActiveConsoleTab('OUTPUT')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        activeConsoleTab === 'OUTPUT'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Execution Console
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunSampleCode}
                      disabled={isRunningCode || isSubmittingCode}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isRunningCode ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>Run Sample Tests</span>
                    </button>

                    <button
                      onClick={handleSubmitCode}
                      disabled={isRunningCode || isSubmittingCode}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingCode ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Submit Solution</span>
                    </button>
                  </div>
                </div>

                {/* Console Output Body */}
                <div className="max-h-48 overflow-y-auto p-3 text-xs font-mono">
                  {isRunningCode && (
                    <div className="flex items-center gap-2 text-slate-400 py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>Executing against sample test cases...</span>
                    </div>
                  )}

                  {isSubmittingCode && (
                    <div className="flex items-center gap-2 text-slate-400 py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Evaluating against complete test suite (public + hidden)...</span>
                    </div>
                  )}

                  {runResults && !isRunningCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${runResults.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Verdict: {runResults.status} ({runResults.passedTests}/{runResults.totalTests} Sample Tests Passed)
                        </span>
                      </div>
                      {runResults.errorLog && (
                        <pre className="p-2 rounded bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px] whitespace-pre-wrap">
                          {runResults.errorLog}
                        </pre>
                      )}
                      {runResults.results.map((r, i) => (
                        <div key={i} className="text-[11px] border border-slate-800 rounded p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-300">Sample {i + 1}</span>
                            <span className={r.status === 'ACCEPTED' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {r.status}
                            </span>
                          </div>
                          <div>Input: {r.input}</div>
                          <div>Expected: {r.expectedOutput}</div>
                          {r.actualOutput && <div>Actual: {r.actualOutput}</div>}
                          {r.errorMessage && <div className="text-rose-400">{r.errorMessage}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {submitResults && !isSubmittingCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${submitResults.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Submission: {submitResults.status} — {submitResults.passedTests}/{submitResults.totalTests} Test Cases Passed
                        </span>
                        <span className="font-bold text-emerald-400">+{submitResults.marksEarned} pts awarded</span>
                      </div>
                      {submitResults.errorLog && (
                        <pre className="p-2 rounded bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px] whitespace-pre-wrap">
                          {submitResults.errorLog}
                        </pre>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                        {submitResults.results.map((r, i) => (
                          <div
                            key={i}
                            className={`p-1.5 rounded text-[10px] text-center border font-mono ${
                              r.status === 'ACCEPTED'
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                                : 'bg-rose-950/40 border-rose-800 text-rose-300'
                            }`}
                          >
                            TC {i + 1} {r.isSecret ? '(Hidden)' : ''}: {r.status}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!runResults && !submitResults && !isRunningCode && !isSubmittingCode && (
                    <div className="text-slate-500 py-3 text-center">
                      Run code against sample tests or submit solution to execute the complete automated test suite.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Non-Coding Right Panel: Focused Exam Guidelines */
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4 text-slate-300 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-blue-400 opacity-60" />
              <h3 className="text-base font-bold text-white">
                Core CS Placement Diagnostics
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your answer on the left. Your choices are automatically synced to the server within milliseconds. You can change your choice anytime before final submission.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-1.5 w-full">
                <div className="font-semibold text-white text-[11px] uppercase tracking-wider">
                  Section Rules
                </div>
                <div className="text-slate-300">• Correct Answer: +{currentQuestion.marks} Marks</div>
                {currentQuestion.negativeMarks > 0 && (
                  <div className="text-amber-400">• Incorrect Answer: -{currentQuestion.negativeMarks} Negative Marks</div>
                )}
                <div className="text-slate-400">• Unanswered Question: 0 Marks (No Penalty)</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CONFIRMATION SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Assessment Submission
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you ready to submit your assessment? Once submitted, your answers and code will be permanently evaluated and your results compiled.
              </p>

              {/* Breakdown Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Answered</div>
                  <div className="text-base font-bold text-emerald-600">
                    {totalAnsweredCount} / {totalQuestionsCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Unanswered</div>
                  <div className="text-base font-bold text-amber-600">
                    {totalQuestionsCount - totalAnsweredCount}
                  </div>
                </div>
              </div>

              {totalQuestionsCount - totalAnsweredCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    You have {totalQuestionsCount - totalAnsweredCount} unattempted questions.
                  </span>
                </div>
              )}

              {submissionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {submissionError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isFinalSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Continue Assessment
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={isFinalSubmitting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isFinalSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading Assessment...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & View Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
