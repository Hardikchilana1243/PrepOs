'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Code2,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  ArrowRight,
  Filter,
  Layers,
  FolderKanban,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/student-os';
import { CompanyProblemDetail } from '@/lib/services/companies';
import { CompanyEmptyState } from './company-empty-state';

interface CompanyProblemListProps {
  companyName: string;
  problems: CompanyProblemDetail[];
}

export function CompanyProblemList({ companyName, problems }: CompanyProblemListProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SOLVED' | 'ATTEMPTED' | 'TODO'>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');
  const [groupByTopic, setGroupByTopic] = useState<boolean>(true);

  // Available topics for filtering
  const availableTopics = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of problems) {
      if (p.topic) {
        map.set(p.topic.slug, p.topic.title);
      }
    }
    return Array.from(map.entries()).map(([slug, title]) => ({ slug, title }));
  }, [problems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (difficultyFilter !== 'ALL' && p.difficulty !== difficultyFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }
      if (topicFilter !== 'ALL' && p.topic.slug !== topicFilter) {
        return false;
      }
      return true;
    });
  }, [problems, difficultyFilter, statusFilter, topicFilter]);

  // Group by topic if toggled
  const groupedByTopic = useMemo(() => {
    const groups: { topicTitle: string; topicSlug: string; items: CompanyProblemDetail[] }[] = [];
    const map = new Map<string, CompanyProblemDetail[]>();

    for (const p of filteredProblems) {
      const key = p.topic.title || 'General';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(p);
    }

    map.forEach((items, topicTitle) => {
      groups.push({
        topicTitle,
        topicSlug: items[0]?.topic.slug || '',
        items,
      });
    });

    return groups;
  }, [filteredProblems]);

  const solvedCount = problems.filter((p) => p.isSolved).length;

  return (
    <section id="problems-section" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Tagged DSA Problems — {companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Authentic algorithmic problems mapped directly to {companyName} campus recruitment drives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            {solvedCount} / {problems.length} Solved
          </span>

          <button
            type="button"
            onClick={() => setGroupByTopic(!groupByTopic)}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
            <span>{groupByTopic ? 'Flat List' : 'Group by Topic'}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="problem-difficulty-select" className="text-slate-500 font-medium">
              Difficulty:
            </label>
            <select
              id="problem-difficulty-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[34px]"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="problem-status-select" className="text-slate-500 font-medium">
              Status:
            </label>
            <select
              id="problem-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[34px]"
            >
              <option value="ALL">All Status</option>
              <option value="SOLVED">Solved</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="TODO">Unsolved</option>
            </select>
          </div>

          {/* Topic Dropdown */}
          {availableTopics.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label htmlFor="problem-topic-select" className="text-slate-500 font-medium">
                Topic:
              </label>
              <select
                id="problem-topic-select"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[34px]"
              >
                <option value="ALL">All Topics</option>
                {availableTopics.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="font-mono text-slate-500 text-xs">
          Showing <strong className="text-slate-900">{filteredProblems.length}</strong> of{' '}
          <strong className="text-slate-900">{problems.length}</strong>
        </div>
      </div>

      {/* Problems Render */}
      {filteredProblems.length === 0 ? (
        <CompanyEmptyState
          title="No Problems Match Selected Criteria"
          description="Adjust your difficulty, status, or topic filter to view tagged algorithmic problems."
          actionLabel="Reset Problem Filters"
          onAction={() => {
            setDifficultyFilter('ALL');
            setStatusFilter('ALL');
            setTopicFilter('ALL');
          }}
        />
      ) : groupByTopic ? (
        /* Grouped View */
        <div className="space-y-4">
          {groupedByTopic.map((group) => (
            <div
              key={group.topicTitle}
              className="rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs"
            >
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>{group.topicTitle}</span>
                </span>
                <span className="font-mono text-slate-500">
                  {group.items.filter((i) => i.isSolved).length}/{group.items.length} Solved
                </span>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {group.items.map((prob) => (
                  <ProblemRow key={prob.id} problem={prob} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat List View */
        <div className="rounded-xl border border-slate-200/90 divide-y divide-slate-100 bg-white overflow-hidden shadow-2xs">
          {filteredProblems.map((prob) => (
            <ProblemRow key={prob.id} problem={prob} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProblemRow({ problem }: { problem: CompanyProblemDetail }) {
  const getStatusIcon = () => {
    if (problem.isSolved) {
      return (
        <span title="Solved" className="text-emerald-600 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </span>
      );
    }
    if (problem.isAttempted) {
      return (
        <span title="Attempted" className="text-blue-600 shrink-0">
          <Clock className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span title="Unsolved" className="text-slate-300 shrink-0">
        <Circle className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {getStatusIcon()}

        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/dsa/problem/${problem.slug}`}
              className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate"
            >
              {problem.title}
            </Link>

            <DifficultyBadge difficulty={problem.difficulty} size="sm" />

            {problem.isBookmarked && (
              <span title="Bookmarked in personal study list">
                <Bookmark className="w-3.5 h-3.5 fill-blue-500 text-blue-600 shrink-0" />
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>{problem.topic.title}</span>
            {problem.frequency > 1 && (
              <>
                <span>•</span>
                <span className="font-mono text-slate-500">{problem.frequency}x recurrence</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between sm:justify-end">
        <span className="font-mono text-[11px] text-slate-400">
          {problem.isSolved ? 'Completed' : problem.isAttempted ? 'In Progress' : 'To Do'}
        </span>

        <Link
          href={`/dashboard/dsa/problem/${problem.slug}`}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs ${
            problem.isSolved
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <span>{problem.isSolved ? 'Review' : 'Solve'}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
