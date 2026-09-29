'use client';

import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { RoadmapModuleItem, RoadmapProblemItem } from '@/lib/services/dsa-roadmap';
import { ProgressBar } from '@/components/ui/student-os';
import { DSATopicSection } from './dsa-topic-section';

interface DSAModuleSectionProps {
  module: RoadmapModuleItem;
  isExpanded: boolean;
  onToggle: () => void;
  // If filters are active, optionally pass pre-filtered problems for this module
  filteredProblemsMap?: Map<string, RoadmapProblemItem[]>;
}

export function DSAModuleSection({
  module,
  isExpanded,
  onToggle,
  filteredProblemsMap,
}: DSAModuleSectionProps) {
  // If pre-filtered map is supplied, calculate visible counts
  const topicsWithFilteredProblems = module.topics.map((topic) => {
    const problems = filteredProblemsMap
      ? filteredProblemsMap.get(topic.id) ?? []
      : topic.problems;
    return {
      ...topic,
      problems,
    };
  });

  const visibleTotal = topicsWithFilteredProblems.reduce(
    (acc, t) => acc + t.problems.length,
    0
  );

  // If search/filter filtered out all problems in this module, don't display empty container
  if (filteredProblemsMap && visibleTotal === 0) {
    return null;
  }

  const moduleNumber = String(module.orderIndex).padStart(2, '0');
  const isComplete = module.totalProblems > 0 && module.solvedProblems === module.totalProblems;

  // Compute start index accumulator for problem numbers
  let problemIndexOffset = 0;

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        isExpanded
          ? 'border-slate-300/90 shadow-2xs'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Module Header Bar (Clickable to Toggle) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
        aria-expanded={isExpanded}
        aria-label={`Toggle module ${module.title}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Collapse Chevron */}
          <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          {/* Module Title & Number */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400">
                MOD {moduleNumber}
              </span>
              {isComplete && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Done</span>
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {module.title}
            </h3>
          </div>
        </div>

        {/* Progress & Solved Stats */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs font-mono">
              <span className="font-semibold text-slate-800">
                {module.solvedProblems}
              </span>
              <span className="text-slate-400"> / {module.totalProblems}</span>
              <span className="text-slate-500 text-[11px] ml-1">solved</span>
            </div>
            <div className="w-24 mt-1 hidden sm:block">
              <ProgressBar
                value={module.progressPct}
                size="sm"
                color={isComplete ? 'emerald' : 'blue'}
              />
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Module Topics & Problem List */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4">
          {topicsWithFilteredProblems.map((topic) => {
            const startIndex = problemIndexOffset;
            problemIndexOffset += topic.problems.length;

            return (
              <DSATopicSection
                key={topic.id}
                topicTitle={topic.title}
                topicSlug={topic.slug}
                problems={topic.problems}
                startIndex={startIndex}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
