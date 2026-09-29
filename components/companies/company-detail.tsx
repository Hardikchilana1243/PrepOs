'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Layers,
  Code2,
  Brain,
  Target,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { CompanyPreparationOverview } from './company-preparation-overview';
import { CompanyDSASection, CompanyProblemItem } from './company-dsa-section';
import { CompanyCoreCSSection } from './company-core-cs-section';
import { CompanyAssessmentSection, CompanyAssessmentItem } from './company-assessment-section';
import { CompanyProgress } from './company-progress';

export interface CompanyDetailData {
  id: string;
  slug: string;
  name: string;
  tier: string;
  hiringRoles: string[];
  patterns: {
    patternName: string;
    frequencyPct: number;
    description: string | null;
  }[];
  problems: CompanyProblemItem[];
  assessments: CompanyAssessmentItem[];
}

interface CompanyDetailProps {
  company: CompanyDetailData;
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DSA' | 'CORE_CS' | 'ASSESSMENTS' | 'PROGRESS'>('OVERVIEW');

  // Compute actual student records
  const solvedCount = company.problems.filter((p) => p.isSolved).length;
  const totalProblems = company.problems.length;
  const assessmentAttempt = company.assessments[0]?.latestAttempt;
  const hasAssessment = company.assessments.length > 0;

  // Breakdown by difficulty
  const easyProblems = company.problems.filter((p) => p.difficulty === 'EASY');
  const easySolved = easyProblems.filter((p) => p.isSolved).length;

  const mediumProblems = company.problems.filter((p) => p.difficulty === 'MEDIUM');
  const mediumSolved = mediumProblems.filter((p) => p.isSolved).length;

  const hardProblems = company.problems.filter((p) => p.difficulty === 'HARD');
  const hardSolved = hardProblems.filter((p) => p.isSolved).length;

  // Calculate real progress percentage (equal weight across problems and OA simulation)
  const totalTasks = totalProblems + (hasAssessment ? 1 : 0);
  const completedTasks = solvedCount + (assessmentAttempt?.passed ? 1 : 0);
  const overallProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Determine next direct action
  const getNextAction = () => {
    const nextUnsolvedProblem = company.problems.find((p) => !p.isSolved);
    if (nextUnsolvedProblem) {
      return {
        title: `Solve: ${nextUnsolvedProblem.title} (${nextUnsolvedProblem.difficulty})`,
        type: 'DSA' as const,
        href: `/dashboard/dsa/problem/${nextUnsolvedProblem.slug}`,
        label: 'Solve Problem',
      };
    }
    if (hasAssessment && !assessmentAttempt) {
      return {
        title: `Launch ${company.name} Mock OA Simulation (${company.assessments[0].durationMin}m)`,
        type: 'ASSESSMENT' as const,
        href: `/dashboard/assessments/${company.assessments[0].slug}`,
        label: 'Take OA Drill',
      };
    }
    return {
      title: 'Review Core CS screening topics in DBMS & OS',
      type: 'CORE_CS' as const,
      href: '/dashboard/core-cs',
      label: 'Core CS Hub',
    };
  };

  const nextAction = getNextAction();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
      {/* Company Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {company.tier}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Target Roles: {company.hiringRoles.join(', ')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {company.name} Preparation Hub
          </h2>
        </div>

        {hasAssessment && (
          <Link
            href={`/dashboard/assessments/${company.assessments[0].slug}`}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-blue-700 flex items-center gap-2 font-medium transition-colors shrink-0"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>
              OA Simulation: {company.assessments[0].durationMin}m ({company.assessments[0].totalQuestions} Questions)
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Preparation Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DSA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'DSA'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>DSA Problems</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
            {solvedCount}/{totalProblems}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CORE_CS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'CORE_CS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Core CS Syllabus
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ASSESSMENTS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'ASSESSMENTS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Mock OA</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
            {company.assessments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PROGRESS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'PROGRESS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Verified Progress
        </button>
      </div>

      {/* TAB 1: PREPARATION OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <CompanyPreparationOverview
            companyName={company.name}
            tier={company.tier}
            totalModules={3}
            completedItems={completedTasks}
            totalItems={totalTasks}
            progressPct={overallProgressPct}
            nextAction={nextAction}
          />

          {/* Verified Interview Patterns */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Interview Patterns</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {company.patterns.map((pat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 text-xs">{pat.patternName}</div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {pat.frequencyPct}% frequency
                    </span>
                  </div>
                  {pat.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {pat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Preview of DSA & Assessments */}
          <CompanyDSASection problems={company.problems.slice(0, 3)} />

          {company.problems.length > 3 && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('DSA')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View all {company.problems.length} tagged problems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DSA PREPARATION */}
      {activeTab === 'DSA' && <CompanyDSASection problems={company.problems} />}

      {/* TAB 3: CORE CS PREPARATION */}
      {activeTab === 'CORE_CS' && <CompanyCoreCSSection companyName={company.name} />}

      {/* TAB 4: ASSESSMENTS PREPARATION */}
      {activeTab === 'ASSESSMENTS' && (
        <CompanyAssessmentSection
          assessments={company.assessments}
          companyName={company.name}
        />
      )}

      {/* TAB 5: VERIFIED PROGRESS */}
      {activeTab === 'PROGRESS' && (
        <CompanyProgress
          companyName={company.name}
          totalProblems={totalProblems}
          solvedProblems={solvedCount}
          easySolved={easySolved}
          easyTotal={easyProblems.length}
          mediumSolved={mediumSolved}
          mediumTotal={mediumProblems.length}
          hardSolved={hardSolved}
          hardTotal={hardProblems.length}
          assessmentPassed={Boolean(assessmentAttempt?.passed)}
          latestScorePct={assessmentAttempt?.scorePct ?? null}
        />
      )}
    </div>
  );
}
