'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Code2,
  CheckCircle2,
  Clock,
  Bookmark,
  Circle,
  Search,
  ChevronDown,
  ChevronRight,
  Building2,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  DSARoadmapData,
  RoadmapModuleItem,
  RoadmapProblemItem,
} from '@/lib/services/dsa-roadmap';
import { ProgressBar, DifficultyBadge, StatusIndicator } from '@/components/ui/student-os';

interface DSARoadmapViewProps {
  data: DSARoadmapData;
}

export function DSARoadmapView({ data }: DSARoadmapViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'journey' | 'catalog'>('journey');

  // By default, expand modules that contain problems or the first 3
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.modules.forEach((mod) => {
      init[mod.id] = mod.totalProblems > 0 || mod.orderIndex <= 3;
    });
    return init;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    data.modules.forEach((m) => (next[m.id] = true));
    setExpandedModules(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    data.modules.forEach((m) => (next[m.id] = false));
    setExpandedModules(next);
  };

  // Filtered problems list (for catalog/search)
  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.allProblems.filter((p) => {
      const matchesDiff = filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
      const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.topicTitle.toLowerCase().includes(q) ||
        p.moduleTitle.toLowerCase().includes(q) ||
        p.companies.some((c) => c.toLowerCase().includes(q));

      return matchesDiff && matchesStatus && matchesSearch;
    });
  }, [data.allProblems, searchQuery, filterDifficulty, filterStatus]);

  // Status counts for filter chips
  const statusCounts = useMemo(() => {
    let solved = 0;
    let attempted = 0;
    let bookmarked = 0;
    let unsolved = 0;
    for (const p of data.allProblems) {
      if (p.isSolved) solved++;
      else if (p.isAttempted) attempted++;
      if (p.isBookmarked) bookmarked++;
      if (!p.isSolved && !p.isAttempted) unsolved++;
    }
    return { solved, attempted, bookmarked, unsolved };
  }, [data.allProblems]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Journey Progress Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Placement Curriculum
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">14 Core Modules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              DSA Learning Journey
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Master the algorithmic patterns tested in software engineering interviews.
              Solve problems, run real code tests, and build long-term retention.
            </p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Curriculum Solved</span>
              <span className="font-semibold text-slate-900 font-mono">
                {data.solvedProblems} / {data.totalProblems}
              </span>
            </div>
            <ProgressBar value={data.overallProgressPct} size="md" color="blue" />
            <div className="flex justify-between items-center text-xs mt-2 text-slate-500 font-mono">
              <span>{data.overallProgressPct}% Completed</span>
              <span className="text-emerald-600 font-medium">Verified</span>
            </div>
          </div>
        </div>

        {/* Difficulty Distribution Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          {/* Easy */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">Easy</span>
              <span className="text-slate-600 font-mono">
                {data.difficultyDistribution.EASY.solved} / {data.difficultyDistribution.EASY.total}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${data.difficultyDistribution.EASY.progressPct}%` }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-700 font-semibold">Medium</span>
              <span className="text-slate-600 font-mono">
                {data.difficultyDistribution.MEDIUM.solved} / {data.difficultyDistribution.MEDIUM.total}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${data.difficultyDistribution.MEDIUM.progressPct}%` }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-700 font-semibold">Hard</span>
              <span className="text-slate-600 font-mono">
                {data.difficultyDistribution.HARD.solved} / {data.difficultyDistribution.HARD.total}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${data.difficultyDistribution.HARD.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems, topics, modules, or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('journey')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'journey'
                    ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Journey View
              </button>
              <button
                onClick={() => setViewMode('catalog')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'catalog'
                    ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Catalog ({filteredProblems.length})
              </button>
            </div>

            {viewMode === 'journey' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <button
                  onClick={expandAll}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] border border-slate-200 text-slate-600 font-medium"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] border border-slate-200 text-slate-600 font-medium"
                >
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Difficulty Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Difficulty:</span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterDifficulty === diff
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Status Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'SOLVED', label: `Solved (${statusCounts.solved})` },
              { id: 'ATTEMPTED', label: `Attempted (${statusCounts.attempted})` },
              { id: 'BOOKMARKED', label: `Saved (${statusCounts.bookmarked})` },
              { id: 'UNSOLVED', label: `Unsolved (${statusCounts.unsolved})` },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === st.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Content: Journey View or Catalog View */}
      {viewMode === 'journey' && !searchQuery ? (
        <div className="space-y-4">
          {data.modules.map((mod) => {
            const isExpanded = Boolean(expandedModules[mod.id]);
            const modProblems = mod.topics.flatMap((t) => t.problems);

            // Filter problems within this module
            const matchingModuleProblems = modProblems.filter((p) => {
              const matchesDiff = filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
              const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
              return matchesDiff && matchesStatus;
            });

            if (filterDifficulty !== 'ALL' || filterStatus !== 'ALL') {
              if (matchingModuleProblems.length === 0) return null;
            }

            const firstUnsolvedProb = modProblems.find((p) => !p.isSolved);

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm transition-all"
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleModule(mod.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 select-none transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          Module {String(mod.orderIndex).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                          {mod.title}
                        </h3>
                        {mod.isCompleted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>
                      {mod.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Module Progress Badges */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-semibold text-slate-700 font-mono">
                        {mod.solvedProblems} / {mod.totalProblems} Solved
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${mod.progressPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {mod.progressPct}%
                    </span>
                  </div>
                </div>

                {/* Module Body (Topics & Problems) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-3 space-y-6 bg-slate-50/50 border-t border-slate-100">
                    {mod.topics.map((topic) => {
                      const topicMatchingProbs = topic.problems.filter((p) => {
                        const matchesDiff =
                          filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
                        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
                        return matchesDiff && matchesStatus;
                      });

                      if (
                        (filterDifficulty !== 'ALL' || filterStatus !== 'ALL') &&
                        topicMatchingProbs.length === 0
                      ) {
                        return null;
                      }

                      return (
                        <div key={topic.id} className="space-y-2">
                          {/* Topic Subheader */}
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                            <div className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-blue-600" />
                              <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                                {topic.title}
                              </h4>
                              {topic.description && (
                                <span className="hidden md:inline text-[11px] text-slate-500">
                                  — {topic.description}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {topic.solvedProblems} / {topic.totalProblems} completed
                            </span>
                          </div>

                          {/* Problem Rows */}
                          {topic.problems.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200/60">
                              Core lecture topic — advanced practice problems unlock in subsequent sprints.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {topicMatchingProbs.map((prob) => (
                                <ProblemRowItem key={prob.id} problem={prob} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Catalog / Search Results View */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>
              Showing {filteredProblems.length} of {data.allProblems.length} problems
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredProblems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-800">
                No problems matched your current filters.
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or setting the difficulty and status filters to ALL.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProblems.map((prob) => (
                <ProblemRowItem key={prob.id} problem={prob} showModule />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProblemRowItem({
  problem,
  showModule = false,
}: {
  problem: RoadmapProblemItem;
  showModule?: boolean;
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-subtle transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        {/* Status Indicator Icon */}
        <div className="shrink-0 mt-0.5 sm:mt-0">
          <StatusIndicator status={problem.status} />
        </div>

        {/* Title & Metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/dsa/problem/${problem.slug}`}
              className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1"
            >
              {problem.title}
            </Link>

            <DifficultyBadge difficulty={problem.difficulty} size="sm" />

            {problem.isBookmarked && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 flex-wrap">
            {showModule && (
              <>
                <span className="font-medium text-slate-700">{problem.moduleTitle}</span>
                <span>•</span>
              </>
            )}
            <span>{problem.topicTitle}</span>

            {problem.companies.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{problem.companies.slice(0, 2).join(', ')}</span>
                  {problem.companies.length > 2 && (
                    <span>+{problem.companies.length - 2}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Action CTA */}
      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
        <Link
          href={`/dashboard/dsa/problem/${problem.slug}`}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
            problem.isSolved
              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              : 'text-white bg-blue-600 hover:bg-blue-700 shadow-subtle'
          }`}
        >
          <span>{problem.isSolved ? 'Review' : 'Solve'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
