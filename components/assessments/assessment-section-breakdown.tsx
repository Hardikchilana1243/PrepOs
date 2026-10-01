'use client';

// ============================================================================
// PREPOS ASSESSMENT SECTION BREAKDOWN COMPONENT
// Granular section performance (Coding vs Core CS, accuracy, negative marks, strengths)
// ============================================================================

import React from 'react';
import {
  Code2,
  BookOpen,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SectionResultSummary } from '@/lib/services/assessment-scoring';
import { ProgressBar } from '@/components/ui/student-os';

interface AssessmentSectionBreakdownProps {
  sections: SectionResultSummary[];
  strengths: string[];
  weakAreas: string[];
  passingScorePct: number;
}

export function AssessmentSectionBreakdown({
  sections,
  strengths,
  weakAreas,
  passingScorePct,
}: AssessmentSectionBreakdownProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Section-by-Section Performance Analysis</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of marks obtained, question completion, and sectional accuracy.
          </p>
        </div>
      </div>

      {/* Section Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((sec) => {
          const isPassedSection = sec.scorePct >= passingScorePct;
          const sectionAccuracy =
            sec.questionsAttempted > 0
              ? Math.round((sec.questionsCorrect / sec.questionsAttempted) * 100)
              : 0;

          return (
            <div
              key={sec.sectionId}
              className={`p-4 rounded-xl border transition-all ${
                isPassedSection
                  ? 'bg-slate-50/70 border-slate-200/90'
                  : 'bg-amber-50/30 border-amber-200/80'
              } space-y-3`}
            >
              {/* Top Row: Section icon & Title + Marks */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {sec.type === 'CODING' ? (
                      <Code2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {sec.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {sec.type === 'CODING' ? 'Algorithmic Coding' : 'Core CS MCQs'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {sec.score} / {sec.maxScore} pts
                  </div>
                  <div
                    className={`text-[11px] font-mono font-semibold ${
                      isPassedSection ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {sec.scorePct}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                value={sec.scorePct}
                size="sm"
                color={isPassedSection ? 'emerald' : 'amber'}
              />

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-center font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">
                    Attempted
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {sec.questionsAttempted} / {sec.totalQuestions}
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">
                    Correct
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    {sec.questionsCorrect}
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">
                    Accuracy
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {sectionAccuracy}%
                  </div>
                </div>
              </div>

              {/* Negative marking or test case footnote */}
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>
                  {sec.type === 'CODING'
                    ? 'Evaluated against hidden test cases'
                    : 'Negative marking (-0.5 pts applied)'}
                </span>
                <span>
                  {sec.questionsAttempted === sec.totalQuestions
                    ? '100% Completed'
                    : `${sec.totalQuestions - sec.questionsAttempted} Unattempted`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validated Strengths & Recommended Focus Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Validated Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Validated Strengths in this Sitting</span>
          </div>

          {strengths.length > 0 ? (
            <ul className="text-xs text-emerald-900 space-y-1.5">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 italic">
              Solve and submit problems correctly in subsequent attempts to establish validated strengths.
            </p>
          )}
        </div>

        {/* Recommended Focus Areas */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Recommended Focus & Revision Areas</span>
          </div>

          {weakAreas.length > 0 ? (
            <ul className="text-xs text-amber-900 space-y-1.5">
              {weakAreas.map((weak, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-medium">{weak}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700">
              Clean performance across all attempted sections. No critical weakness patterns flagged.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
