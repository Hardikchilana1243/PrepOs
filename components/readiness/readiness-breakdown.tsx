'use client';

// ============================================================================
// PREPOS READINESS BREAKDOWN COMPONENT
// Detailed multi-pillar breakdown: DSA, Core CS, Target Company, Mock OA, Revision
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  Building2,
  Target,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { PlacementReadinessCockpit } from '@/lib/services/readiness-cockpit';
import { ReadinessDimension } from './readiness-dimension';

interface ReadinessBreakdownProps {
  dimensions: PlacementReadinessCockpit['dimensions'];
}

export function ReadinessBreakdown({ dimensions }: ReadinessBreakdownProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'DSA' | 'CORE_CS' | 'COMPANY' | 'ASSESSMENT' | 'REVISION'>('ALL');

  const { dsa, coreCs, company, assessment, revision } = dimensions;

  return (
    <div className="space-y-6" id="dimensions">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Readiness Breakdown by Pillar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real progress derived from database submissions, diagnostics, assessments, and SM-2 revision.
          </p>
        </div>

        {/* Pillar Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {(
            [
              { key: 'ALL', label: 'All Dimensions' },
              { key: 'DSA', label: 'DSA' },
              { key: 'CORE_CS', label: 'Core CS' },
              { key: 'COMPANY', label: 'Company' },
              { key: 'ASSESSMENT', label: 'OA & Mocks' },
              { key: 'REVISION', label: 'Revision' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Pillar Summary Cards Grid */}
      {(activeTab === 'ALL' || activeTab === 'DSA') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReadinessDimension dimension={dsa} />
          {activeTab === 'ALL' && (
            <>
              <ReadinessDimension dimension={coreCs} />
              <ReadinessDimension dimension={company} />
              <ReadinessDimension dimension={assessment} />
              <ReadinessDimension dimension={revision} />
            </>
          )}
        </div>
      )}

      {/* Deep-Dive Pillar Panels */}
      <div className="space-y-5">
        {/* DSA Pillar Deep-Dive */}
        {(activeTab === 'ALL' || activeTab === 'DSA') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">DSA Readiness Deep-Dive</h3>
                  <p className="text-xs text-slate-500">Problem execution, difficulty tiers, and pattern coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/dsa"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Practice DSA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/dsa/history"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Submissions</span>
                </Link>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Solved / Total</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {dsa.completedActivity} <span className="text-xs text-slate-400 font-normal">/ {dsa.totalActivity}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {dsa.totalActivity > 0 ? Math.round((dsa.completedActivity / dsa.totalActivity) * 100) : 0}% catalog solved
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Success Rate</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {dsa.submissionSuccessRate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  WA: {dsa.wrongAnswerCount} · TLE: {dsa.tleCount}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Topic Coverage</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {dsa.topicCoverageCount} <span className="text-xs text-slate-400 font-normal">/ {dsa.totalTopicsCount}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Core algorithm categories
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company-Tagged</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {dsa.companyTaggedSolved} <span className="text-xs text-slate-400 font-normal">/ {dsa.companyTaggedTotal}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Target interview questions
                </div>
              </div>
            </div>

            {/* Difficulty Distribution Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Difficulty Distribution</span>
                <span className="font-mono text-slate-700">
                  Easy: {dsa.solvedByDifficulty.easy}/{dsa.totalByDifficulty.easy} · Med: {dsa.solvedByDifficulty.medium}/{dsa.totalByDifficulty.medium} · Hard: {dsa.solvedByDifficulty.hard}/{dsa.totalByDifficulty.hard}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Easy</span>
                  <span className="text-xs font-mono font-bold text-emerald-900">
                    {dsa.solvedByDifficulty.easy} / {dsa.totalByDifficulty.easy}
                  </span>
                </div>
                <div className="bg-amber-50 rounded-lg p-2 border border-amber-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800">Medium</span>
                  <span className="text-xs font-mono font-bold text-amber-900">
                    {dsa.solvedByDifficulty.medium} / {dsa.totalByDifficulty.medium}
                  </span>
                </div>
                <div className="bg-rose-50 rounded-lg p-2 border border-rose-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-800">Hard</span>
                  <span className="text-xs font-mono font-bold text-rose-900">
                    {dsa.solvedByDifficulty.hard} / {dsa.totalByDifficulty.hard}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CORE CS Pillar Deep-Dive */}
        {(activeTab === 'ALL' || activeTab === 'CORE_CS') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Core CS Readiness Deep-Dive</h3>
                  <p className="text-xs text-slate-500">DBMS, Operating Systems, Computer Networks & Architecture</p>
                </div>
              </div>
              <Link
                href="/dashboard/core-cs"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Diagnostic Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quizzes Taken</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {coreCs.quizAttemptsCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Diagnostic attempts logged
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Score</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {coreCs.avgScorePct}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Across all attempts
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Best Score</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {coreCs.bestScorePct}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Peak diagnostic result
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Missed Concepts</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {coreCs.missedConceptsCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Incorrect answers to review
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPANY Pillar Deep-Dive */}
        {(activeTab === 'ALL' || activeTab === 'COMPANY') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Company Preparation Deep-Dive</h3>
                  <p className="text-xs text-slate-500">
                    Target Company:{' '}
                    <span className="font-semibold text-slate-900">
                      {company.targetCompanyName || 'None Selected'}
                    </span>{' '}
                    ({company.targetRoleTier || 'Standard Tier'})
                  </p>
                </div>
              </div>
              <Link
                href={company.ctaUrl}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>{company.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company Problems Solved</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {company.companyProblemsSolved} <span className="text-xs text-slate-400 font-normal">/ {company.totalCompanyProblems}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Specific company curriculum
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Patterns Covered</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {company.patternsCovered} <span className="text-xs text-slate-400 font-normal">/ {company.totalPatterns}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Interview question archetypes
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company Hub Link</div>
                <div className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {company.targetCompanySlug ? `/companies/${company.targetCompanySlug}` : 'Catalog'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Verified interview formats
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOCK ASSESSMENTS Pillar Deep-Dive */}
        {(activeTab === 'ALL' || activeTab === 'ASSESSMENT') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mock Assessments & OA Deep-Dive</h3>
                  <p className="text-xs text-slate-500">Timed simulation tests with server-authoritative timer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {assessment.hasUnfinishedAttempt && assessment.unfinishedAttemptUrl && (
                  <Link
                    href={assessment.unfinishedAttemptUrl}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5 animate-pulse"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume Attempt</span>
                  </Link>
                )}
                <Link
                  href="/dashboard/assessments"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Assessment Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attempts</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {assessment.attemptsCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Completed / In-progress
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Passed OAs</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {assessment.passedCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Exceeded benchmark cutoff
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Score</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {assessment.avgScorePct}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Weighted accuracy
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Best Score</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {assessment.bestScorePct}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Peak simulation score
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVISION Pillar Deep-Dive */}
        {(activeTab === 'ALL' || activeTab === 'REVISION') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Spaced Revision Deep-Dive</h3>
                  <p className="text-xs text-slate-500">SM-2 memory consolidation for long-term retention</p>
                </div>
              </div>
              <Link
                href="/dashboard/revision"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Study Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Due Today</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {revision.dueTodayCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Items ready for review
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overdue Backlog</div>
                <div className={`text-lg font-mono font-bold mt-1 ${revision.overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {revision.overdueCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Immediate attention
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Items</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {revision.inScheduleCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  In SM-2 learning schedule
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Retention Health</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {revision.retentionHealthPct}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Schedule on-time ratio
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
