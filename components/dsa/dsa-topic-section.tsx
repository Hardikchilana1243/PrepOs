import React from 'react';
import { RoadmapProblemItem } from '@/lib/services/dsa-roadmap';
import { DSAProblemRow } from './dsa-problem-row';

interface DSATopicSectionProps {
  topicTitle: string;
  topicSlug: string;
  problems: RoadmapProblemItem[];
  startIndex: number;
}

export function DSATopicSection({
  topicTitle,
  topicSlug,
  problems,
  startIndex,
}: DSATopicSectionProps) {
  if (problems.length === 0) return null;

  const solvedCount = problems.filter((p) => p.isSolved).length;
  const totalCount = problems.length;
  const isComplete = totalCount > 0 && solvedCount === totalCount;

  return (
    <div className="space-y-1 pt-2 first:pt-0">
      {/* Topic Subheader */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-800 tracking-tight">
            {topicTitle}
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            ({problems.length} {problems.length === 1 ? 'problem' : 'problems'})
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span
            className={
              isComplete
                ? 'text-emerald-700 font-semibold'
                : 'text-slate-600 font-medium'
            }
          >
            {solvedCount} / {totalCount}
          </span>
          <span className="text-slate-400">done</span>
        </div>
      </div>

      {/* Problems List in Topic */}
      <div className="divide-y divide-slate-100">
        {problems.map((problem, idx) => (
          <DSAProblemRow
            key={problem.id}
            problem={problem}
            problemNumber={startIndex + idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
