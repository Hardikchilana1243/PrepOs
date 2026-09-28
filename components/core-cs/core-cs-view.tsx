'use client';

import React, { useState, useTransition } from 'react';
import {
  Cpu,
  Database,
  Play,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Layers,
  ChevronRight,
  TrendingUp,
  History,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { PageHeader, ProgressBar } from '@/components/ui/student-os';
import { CoreCSHubData, ClientQuiz } from '@/lib/services/core-cs';
import { QuizSubmissionResult } from '@/lib/services/progress';
import { getQuizAttemptReviewAction } from '@/app/dashboard/actions';
import { QuizRunner } from './quiz-runner';
import { QuizResults } from './quiz-results';
import { TopicExplorer } from './topic-explorer';

interface CoreCSViewProps {
  data: CoreCSHubData;
  initialQuizSlug?: string;
  initialSubject?: string;
  initialTopic?: string;
}

type TabType = 'hub' | 'dbms' | 'os';

export function CoreCSView({
  data,
  initialQuizSlug,
  initialSubject,
  initialTopic,
}: CoreCSViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialSubject === 'dbms' || initialSubject === 'os') return initialSubject;
    return 'hub';
  });

  const [activeQuizSlug, setActiveQuizSlug] = useState<string | null>(initialQuizSlug || null);
  const [reviewResult, setReviewResult] = useState<QuizSubmissionResult | null>(null);
  const [isReviewLoading, startReviewTransition] = useTransition();
  const [loadingAttemptId, setLoadingAttemptId] = useState<string | null>(null);

  // If a quiz is active, launch QuizRunner
  const activeQuiz = data.quizzes.find((q) => q.slug === activeQuizSlug);

  if (activeQuiz) {
    return (
      <QuizRunner
        quiz={activeQuiz}
        onExit={() => setActiveQuizSlug(null)}
      />
    );
  }

  // If viewing a historical attempt review
  if (reviewResult) {
    return (
      <QuizResults
        result={reviewResult}
        onExit={() => setReviewResult(null)}
        onRetake={() => {
          setReviewResult(null);
          setActiveQuizSlug(reviewResult.quizId ? data.quizzes.find((q) => q.id === reviewResult.quizId)?.slug || null : null);
        }}
      />
    );
  }

  const handleStartDrill = (quizSlug: string) => {
    setActiveQuizSlug(quizSlug);
  };

  const handleInspectAttempt = (attemptId: string) => {
    setLoadingAttemptId(attemptId);
    startReviewTransition(async () => {
      try {
        const res = await getQuizAttemptReviewAction(attemptId);
        if (res) {
          setReviewResult(res);
        }
      } catch (err) {
        console.error('Failed to load attempt review', err);
      } finally {
        setLoadingAttemptId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Bar */}
      <PageHeader
        title="Core CS Learning Hub"
        subtitle="Placement-focused syllabus, conceptual mastery, and timed diagnostics for DBMS and Operating Systems."
        tag="Level 2 — Placement Screening"
      />

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('hub')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hub'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Hub & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('dbms')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dbms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>DBMS Syllabus & Topics</span>
        </button>

        <button
          onClick={() => setActiveTab('os')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'os'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>OS Syllabus & Topics</span>
        </button>
      </div>

      {/* TAB 1: CENTRAL HUB & OVERVIEW */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* Today's Recommended Drill Hero Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  Today's Recommended Diagnostic
                </span>
                <span className="text-blue-100 text-xs">• 15-Minute Target</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {data.recommendedDrill.quizTitle}
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                {data.recommendedDrill.reason}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {data.recommendedDrill.focusTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/15"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => handleStartDrill(data.recommendedDrill.quizSlug)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Speed Drill</span>
              </button>
            </div>
          </div>

          {/* Subject Overview Cards (DBMS & Operating Systems) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.subjects.map((sub) => {
              const isDBMS = sub.slug === 'dbms';
              const progressPct =
                sub.bestScorePct !== null ? sub.bestScorePct : 0;

              return (
                <div
                  key={sub.slug}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isDBMS
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          {isDBMS ? (
                            <Database className="w-5 h-5" />
                          ) : (
                            <Cpu className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Level 2 Subject
                          </span>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {sub.title}
                          </h3>
                        </div>
                      </div>

                      {sub.bestScorePct !== null ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Best: {sub.bestScorePct}%
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                          Uncalibrated
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {sub.description}
                    </p>

                    {/* Subject Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center font-mono text-xs">
                      <div>
                        <div className="font-bold text-slate-800">
                          {sub.attemptsCount}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          Attempts
                        </div>
                      </div>
                      <div className="border-x border-slate-200">
                        <div className="font-bold text-slate-800">
                          {sub.avgScorePct !== null ? `${sub.avgScorePct}%` : '—'}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          Avg Score
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {sub.topicsCount}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          Topics
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab(isDBMS ? 'dbms' : 'os')}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Browse Topics</span>
                    </button>

                    <button
                      onClick={() => handleStartDrill(sub.quizSlug)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Drill</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weak Areas & Revision Queue Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Areas Identified */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Identified Weak Areas
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  From Recent MCQs
                </span>
              </div>

              {data.weakAreas.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recurring weak areas detected yet. Complete a diagnostic drill to calibrate topic mastery!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.weakAreas.map((weak, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-amber-950 truncate">
                          {weak.topicTitle}
                        </div>
                        <div className="text-[10px] text-amber-700 truncate">
                          {weak.placementRelevance}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab(weak.subjectSlug as TabType);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Core CS Active Recall Revision Queue */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Recent Missed MCQs
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  {data.revisionQuestions.length} Questions
                </span>
              </div>

              {data.revisionQuestions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Clean diagnostic record. Any questions answered incorrectly will automatically queue here for revision.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.revisionQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {q.subjectSlug}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 truncate">
                            {q.topicTitle}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium line-clamp-1">
                          {q.questionText}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleStartDrill(
                            q.subjectSlug === 'dbms'
                              ? 'dbms-placement-quiz'
                              : 'os-placement-quiz'
                          )
                        }
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 flex items-center gap-1 mt-1"
                      >
                        <span>Drill</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historical Diagnostic Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Historical Diagnostic Attempts
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {data.recentAttempts.length} Recorded Attempts
              </span>
            </div>

            {data.recentAttempts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No diagnostic attempts recorded yet. Launch a quiz above to calibrate your Core CS PRS score!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Subject / Diagnostic</th>
                      <th className="pb-3 text-center">Score</th>
                      <th className="pb-3 text-center">Correct</th>
                      <th className="pb-3 text-center">Benchmark</th>
                      <th className="pb-3 text-center">Completed</th>
                      <th className="pb-3 pr-2 text-right">Mistake Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {data.recentAttempts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2 font-sans font-medium text-slate-900">
                          <div className="font-bold">{a.quizTitle}</div>
                          <div className="text-[11px] text-slate-400">
                            {a.subjectTitle}
                          </div>
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-900">
                          {a.scorePct}%
                        </td>
                        <td className="py-3.5 text-center text-slate-600">
                          {a.correctQs} / {a.totalQs}
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              a.passed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {a.passed ? 'PASSED' : 'RETRY'}
                          </span>
                        </td>
                        <td className="py-3.5 text-center text-slate-400 font-sans text-[11px]">
                          {a.completedAt}
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            disabled={isReviewLoading && loadingAttemptId === a.id}
                            onClick={() => handleInspectAttempt(a.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                          >
                            {isReviewLoading && loadingAttemptId === a.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <span>Review Mistakes</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DBMS TOPICS & LESSONS */}
      {activeTab === 'dbms' && (
        <TopicExplorer
          subjectTitle="Database Management Systems (DBMS)"
          subjectSlug="dbms"
          topics={data.dbmsTopics}
          onStartDrill={handleStartDrill}
          activeTopicSlug={initialTopic}
        />
      )}

      {/* TAB 3: OPERATING SYSTEMS TOPICS & LESSONS */}
      {activeTab === 'os' && (
        <TopicExplorer
          subjectTitle="Operating Systems (OS)"
          subjectSlug="os"
          topics={data.osTopics}
          onStartDrill={handleStartDrill}
          activeTopicSlug={initialTopic}
        />
      )}
    </div>
  );
}
