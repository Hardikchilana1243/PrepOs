'use client';

// ============================================================================
// PREPOS PUBLIC VERIFICATION SUMMARY COMPONENT
// Displays verified Placement Readiness Score & factor breakdown from snapshot
// ============================================================================

import React from 'react';
import { Award, Code2, BookOpen, Clock, Activity, Check } from 'lucide-react';
import { PublicDossierVerification } from '@/lib/services/dossier-verification';

interface PublicVerificationSummaryProps {
  data: PublicDossierVerification;
}

export function PublicVerificationSummary({ data }: PublicVerificationSummaryProps) {
  const { readiness } = data;
  const { overallScore, tier, status, factors } = readiness;

  // Tier color styling
  const getTierBadge = (t: string) => {
    switch (t.toLowerCase()) {
      case 'placement_ready':
      case 'ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'interview_ready':
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'progressing':
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const factorItems = [
    {
      name: 'DSA Problem Solving',
      score: factors.dsaProblemSolving,
      weight: '35%',
      icon: Code2,
      color: 'bg-indigo-600',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-900',
    },
    {
      name: 'Core CS Fundamentals',
      score: factors.coreCsFundamentals,
      weight: '25%',
      icon: BookOpen,
      color: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-900',
    },
    {
      name: 'Mock Assessments & OAs',
      score: factors.mockAssessments,
      weight: '25%',
      icon: Clock,
      color: 'bg-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-900',
    },
    {
      name: 'Consistency & Revision',
      score: factors.consistencyAndRevision,
      weight: '15%',
      icon: Activity,
      color: 'bg-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-900',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Authoritative Placement Readiness Evaluation
          </h2>
          <p className="text-xs text-slate-500">
            Snapshot values captured at official dossier generation time.
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getTierBadge(
            tier
          )}`}
        >
          {tier.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Overall Score Gauge Card */}
        <div className="md:col-span-4 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              Authoritative PRS
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white pt-2">
              {overallScore}
              <span className="text-lg font-normal text-slate-400">/100</span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Readiness Classification:</span>
              <span className="font-semibold text-white uppercase">{status}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Evaluation Algorithm:</span>
              <span className="font-mono text-slate-300">Deterministic PRS v2.1</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Snapshot locked & immutable</span>
            </div>
          </div>
        </div>

        {/* 4-Pillar Weighted Factor Breakdown */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Evaluated Factor Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Objective 4-pillar algorithmic evaluation weighting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {factorItems.map((factor) => {
              const Icon = factor.icon;
              return (
                <div
                  key={factor.name}
                  className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${factor.bgLight}`}>
                        <Icon className={`w-3.5 h-3.5 ${factor.textColor}`} />
                      </div>
                      <span className="font-semibold text-slate-800">
                        {factor.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {factor.score}/100
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${factor.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Algorithm Weight: {factor.weight}</span>
                    <span>Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
