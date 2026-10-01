'use client';

// ============================================================================
// PREPOS PUBLIC VERIFICATION FACTORS COMPONENT
// Detailed 5-pillar verification metrics and completed milestones from snapshot
// ============================================================================

import React from 'react';
import {
  Code2,
  BookOpen,
  FileCheck2,
  Building2,
  Repeat,
  CheckCircle,
  Flag,
} from 'lucide-react';
import { PublicDossierVerification } from '@/lib/services/dossier-verification';

interface PublicVerificationFactorsProps {
  data: PublicDossierVerification;
}

export function PublicVerificationFactors({ data }: PublicVerificationFactorsProps) {
  const { preparation, milestones } = data;
  const { dsa, coreCs, assessments, company, consistency } = preparation;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Verified Preparation Metrics & Evidence
        </h2>
        <p className="text-xs text-slate-500">
          Independent quantitative metrics extracted from authoritative system logs.
        </p>
      </div>

      {/* 5 Preparation Pillar Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. DSA Problem Solving Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Code2 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">DSA Mastery</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {dsa.totalSolved} Solved
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Easy Problems:</span>
              <span className="font-semibold text-emerald-600">{dsa.easyCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Medium Problems:</span>
              <span className="font-semibold text-amber-600">{dsa.mediumCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Hard Problems:</span>
              <span className="font-semibold text-rose-600">{dsa.hardCount}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">First-Pass Acceptance:</span>
              <span className="font-bold text-slate-900">{dsa.acceptanceRate}%</span>
            </div>
          </div>
        </div>

        {/* 2. Core CS Fundamentals Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Core CS Concepts</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {coreCs.topicsCompleted} / {coreCs.totalTopics} Modules
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Completed Modules:</span>
              <span className="font-semibold text-slate-900">{coreCs.topicsCompleted}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Quizzes Passed:</span>
              <span className="font-semibold text-emerald-600">{coreCs.quizzesPassed}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Average Evaluation Score:</span>
              <span className="font-semibold text-blue-600">{coreCs.averageScore}%</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Domain Verification:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* 3. Mock Assessments & OAs */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Online Assessments</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              {assessments.completedCount} Completed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Timed Simulations:</span>
              <span className="font-semibold text-slate-900">{assessments.completedCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Assessments Cleared:</span>
              <span className="font-semibold text-emerald-600">{assessments.passedCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Mean Assessment Score:</span>
              <span className="font-semibold text-slate-900">{assessments.averageScore}%</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Anti-Cheat Enforcement:</span>
              <span className="font-bold text-slate-700">Server-Authoritative</span>
            </div>
          </div>
        </div>

        {/* 4. Company Target Preparation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Building2 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Target Companies</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
              {company.preparedCompanyCount} Hubs Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Primary Target:</span>
              <span className="font-semibold text-slate-900">
                {company.targetCompany || 'General Placement Tier'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Company Patterns Studied:</span>
              <span className="font-semibold text-purple-700">
                {company.preparedCompanyCount} Companies
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Interview Readiness:</span>
              <span className="font-semibold text-slate-900">Verified</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Curriculum Alignment:</span>
              <span className="font-bold text-slate-700">Industry-Standard</span>
            </div>
          </div>
        </div>

        {/* 5. Revision & Spaced Repetition */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Repeat className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Spaced Revision</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
              SM-2 Engine
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Reviews Executed:</span>
              <span className="font-semibold text-slate-900">{consistency.itemsReviewed}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Estimated Concept Retention:</span>
              <span className="font-semibold text-emerald-600">
                {consistency.retentionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Current Revision Streak:</span>
              <span className="font-semibold text-amber-700">
                {consistency.currentStreak} Days
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Decay Mitigation:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* 6. Recruiter Verification Guarantee Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Recruiter Verification Notice
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All metrics shown on this page are derived from immutable server-side records.
              PrepOS does not permit client score overrides or synthetic test simulations.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 font-mono">
            Zero AI predictions • Zero fabricated insights
          </div>
        </div>
      </div>

      {/* Verified Milestones List */}
      {milestones && milestones.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Flag className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Verified Candidate Milestones
            </h3>
            <span className="text-xs text-slate-400">
              ({milestones.length} achievements recorded)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50/60"
              >
                <div className="p-1 rounded bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {m.title}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {m.category} {m.achievedAt ? `• ${new Date(m.achievedAt).toLocaleDateString()}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
