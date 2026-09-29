'use client';

import React, { useState, useTransition } from 'react';
import {
  Cpu,
  Database,
  Layers,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
} from 'lucide-react';
import { CoreCSHubData, ClientQuiz } from '@/lib/services/core-cs';
import { QuizSubmissionResult } from '@/lib/services/progress';
import { getQuizAttemptReviewAction } from '@/app/dashboard/actions';
import { CoreCSHeader } from './core-cs-header';
import { SubjectCard } from './subject-card';
import { QuizRow } from './quiz-row';
import { TopicSection } from './topic-section';
import { QuizRunner } from './quiz-runner';
import { QuizResults } from './quiz-results';

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
          setActiveQuizSlug(
            reviewResult.quizId
              ? data.quizzes.find((q) => q.id === reviewResult.quizId)?.slug || null
              : null
          );
        }}
      />
    );
  }

  const handleStartDrill = (quizSlug: string) => {
    setActiveQuizSlug(quizSlug);
  };

  const handleOpenSubject = (subjectSlug: string) => {
    if (subjectSlug === 'dbms' || subjectSlug === 'os') {
      setActiveTab(subjectSlug);
    }
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

  // Aggregate stats across subjects
  const totalQuizzes = data.quizzes.length;
  const attemptedQuizzesCount = data.subjects.filter((s) => s.attemptsCount > 0).length;
  const attemptedScores = data.subjects
    .map((s) => s.avgScorePct)
    .filter((s): s is number => s !== null);
  const overallAvgScore =
    attemptedScores.length > 0
      ? Math.round(attemptedScores.reduce((a, b) => a + b, 0) / attemptedScores.length)
      : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Overall Subject Metrics */}
      <CoreCSHeader
        totalQuizzes={totalQuizzes}
        attemptedCount={attemptedQuizzesCount}
        avgScorePct={overallAvgScore}
        recommendedDrill={data.recommendedDrill}
        onStartDrill={handleStartDrill}
      />

      {/* 2. Main Subject Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('hub')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hub'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Hub & Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dbms')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dbms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>DBMS Syllabus ({data.dbmsTopics.length} Topics)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('os')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'os'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>OS Syllabus ({data.osTopics.length} Topics)</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: CENTRAL HUB & OVERVIEW */}
      {/* =================================================================== */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* Two Core Subjects Grid (DBMS & OS) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Primary Subjects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.subjects.map((sub) => (
                <SubjectCard
                  key={sub.slug}
                  subject={sub}
                  onOpenTopics={handleOpenSubject}
                  onStartQuiz={handleStartDrill}
                />
              ))}
            </div>
          </div>

          {/* Diagnostic Quizzes Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Diagnostic Placement Quizzes
            </h2>

            <div className="space-y-2">
              {data.quizzes.map((quiz) => {
                const sub = data.subjects.find((s) => s.slug === quiz.subjectSlug);
                return (
                  <QuizRow
                    key={quiz.id}
                    quiz={quiz}
                    attemptsCount={sub?.attemptsCount || 0}
                    bestScorePct={sub?.bestScorePct ?? null}
                    onStartQuiz={handleStartDrill}
                  />
                );
              })}
            </div>
          </div>

          {/* Weak Topics Section (surfaces only genuine DB records) */}
          {data.weakAreas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Identified Weak Conceptual Areas
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.weakAreas.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{w.topicTitle}</span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-mono">
                        {w.missCount} Missed {w.missCount === 1 ? 'Q' : 'Qs'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {w.placementRelevance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Quiz Attempts (if any exist) */}
          {data.recentAttempts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recent Diagnostic Attempts
                </h2>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden text-xs">
                {data.recentAttempts.map((att) => {
                  const dateFormatted = new Date(att.completedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={att.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            att.passed ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {att.quizTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {att.subjectTitle} • {dateFormatted}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="font-bold text-slate-800">{att.scorePct}%</span>
                          <span className="text-slate-400 text-[10px] ml-1">
                            ({att.correctQs}/{att.totalQs})
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isReviewLoading && loadingAttemptId === att.id}
                          onClick={() => handleInspectAttempt(att.id)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                        >
                          Review →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: DBMS TOPICS & LESSONS */}
      {/* =================================================================== */}
      {activeTab === 'dbms' && (
        <TopicSection
          subjectTitle="Database Management Systems"
          subjectSlug="dbms"
          topics={data.dbmsTopics}
          onStartQuiz={handleStartDrill}
          initialTopicSlug={initialTopic}
        />
      )}

      {/* =================================================================== */}
      {/* TAB 3: OPERATING SYSTEMS TOPICS & LESSONS */}
      {/* =================================================================== */}
      {activeTab === 'os' && (
        <TopicSection
          subjectTitle="Operating Systems"
          subjectSlug="os"
          topics={data.osTopics}
          onStartQuiz={handleStartDrill}
          initialTopicSlug={initialTopic}
        />
      )}
    </div>
  );
}
