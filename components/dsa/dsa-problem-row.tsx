import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Bookmark,
  Circle,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { RoadmapProblemItem } from '@/lib/services/dsa-roadmap';
import { DifficultyBadge } from '@/components/ui/student-os';

interface DSAProblemRowProps {
  problem: RoadmapProblemItem;
  problemNumber: number;
}

export function DSAProblemRow({ problem, problemNumber }: DSAProblemRowProps) {
  const getStatusIcon = () => {
    if (problem.isSolved) {
      return (
        <span title="Solved" className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="w-4 h-4 fill-emerald-50 text-emerald-600 shrink-0" />
          <span className="sr-only">Solved</span>
        </span>
      );
    }
    if (problem.isAttempted) {
      return (
        <span title="Attempted" className="flex items-center gap-1 text-amber-500">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="sr-only">Attempted</span>
        </span>
      );
    }
    if (problem.isBookmarked) {
      return (
        <span title="Bookmarked" className="flex items-center gap-1 text-blue-600">
          <Bookmark className="w-4 h-4 fill-blue-500 shrink-0" />
          <span className="sr-only">Saved</span>
        </span>
      );
    }
    return (
      <span title="Todo" className="flex items-center gap-1 text-slate-300">
        <Circle className="w-4 h-4 shrink-0" />
        <span className="sr-only">Todo</span>
      </span>
    );
  };

  const formattedNum = String(problemNumber).padStart(2, '0');

  return (
    <div
      className={`group py-2.5 px-3 -mx-2 rounded-lg transition-colors flex items-center justify-between gap-3 text-xs border-b border-slate-100 last:border-b-0 ${
        problem.isSolved
          ? 'bg-slate-50/40 hover:bg-slate-50'
          : 'hover:bg-slate-50/80'
      }`}
    >
      {/* Left: Status + Number + Title + Metadata */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Status Indicator */}
        <div className="shrink-0">{getStatusIcon()}</div>

        {/* Index number */}
        <span className="font-mono text-slate-400 text-[11px] w-6 shrink-0">
          #{formattedNum}
        </span>

        {/* Problem Title */}
        <Link
          href={`/dashboard/dsa/problem/${problem.slug}`}
          className={`font-semibold tracking-tight truncate hover:underline hover:text-blue-600 transition-colors ${
            problem.isSolved ? 'text-slate-700' : 'text-slate-900'
          }`}
        >
          {problem.title}
        </Link>

        {/* Difficulty Badge */}
        <div className="shrink-0 hidden xs:block">
          <DifficultyBadge difficulty={problem.difficulty} size="sm" />
        </div>

        {/* Topic Tag */}
        <span className="hidden md:inline-block text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium shrink-0 max-w-[130px] truncate">
          {problem.topicTitle}
        </span>

        {/* Companies (up to 2 firms) */}
        {problem.companies.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {problem.companies.slice(0, 2).map((comp) => (
              <span
                key={comp}
                className="text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded font-medium"
              >
                {comp}
              </span>
            ))}
            {problem.companies.length > 2 && (
              <span className="text-[10px] text-slate-400">
                +{problem.companies.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Difficulty badge on mobile & Action CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="xs:hidden">
          <DifficultyBadge difficulty={problem.difficulty} size="sm" />
        </div>

        <Link
          href={`/dashboard/dsa/problem/${problem.slug}`}
          className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md transition-colors ${
            problem.isSolved
              ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
              : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100'
          }`}
        >
          <span>{problem.isSolved ? 'Review' : 'Solve'}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
