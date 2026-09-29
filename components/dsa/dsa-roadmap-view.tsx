'use client';

import React, { useState, useMemo } from 'react';
import { DSARoadmapData, RoadmapProblemItem } from '@/lib/services/dsa-roadmap';
import { DSARoadmapHeader } from './dsa-roadmap-header';
import { DSARoadmapFilters } from './dsa-roadmap-filters';
import { DSAModuleSection } from './dsa-module-section';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/student-os';

interface DSARoadmapViewProps {
  data: DSARoadmapData;
}

export function DSARoadmapView({ data }: DSARoadmapViewProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  // Expanded modules state: default expand first 3 modules or modules with problems
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.modules.forEach((mod) => {
      init[mod.id] = mod.totalProblems > 0 || mod.orderIndex <= 2;
    });
    return init;
  });

  const handleToggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    data.modules.forEach((m) => (next[m.id] = true));
    setExpandedModules(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    data.modules.forEach((m) => (next[m.id] = false));
    setExpandedModules(next);
  };

  // Collect available companies & topics from data
  const availableCompanies = useMemo(() => {
    const set = new Set<string>();
    data.allProblems.forEach((p) => {
      p.companies.forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [data.allProblems]);

  const availableTopics = useMemo(() => {
    const map = new Map<string, string>();
    data.allProblems.forEach((p) => {
      if (!map.has(p.topicSlug)) {
        map.set(p.topicSlug, p.topicTitle);
      }
    });
    return Array.from(map.entries()).map(([slug, title]) => ({ slug, title }));
  }, [data.allProblems]);

  // Compute status counts for filter chips
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

  // Client-side filtering
  const filteredProblemsMap = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const map = new Map<string, RoadmapProblemItem[]>();

    data.modules.forEach((mod) => {
      mod.topics.forEach((topic) => {
        const matching = topic.problems.filter((p) => {
          const matchesDiff =
            selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;

          let matchesStatus = true;
          if (selectedStatus === 'SOLVED') matchesStatus = p.isSolved;
          else if (selectedStatus === 'ATTEMPTED') matchesStatus = p.isAttempted;
          else if (selectedStatus === 'BOOKMARKED') matchesStatus = p.isBookmarked;
          else if (selectedStatus === 'UNSOLVED') matchesStatus = !p.isSolved;

          const matchesCompany =
            selectedCompany === 'ALL' || p.companies.includes(selectedCompany);

          const matchesTopic =
            selectedTopic === 'ALL' || p.topicSlug === selectedTopic;

          const matchesSearch =
            !q ||
            p.title.toLowerCase().includes(q) ||
            p.topicTitle.toLowerCase().includes(q) ||
            p.moduleTitle.toLowerCase().includes(q) ||
            p.companies.some((c) => c.toLowerCase().includes(q));

          return (
            matchesDiff &&
            matchesStatus &&
            matchesCompany &&
            matchesTopic &&
            matchesSearch
          );
        });

        map.set(topic.id, matching);
      });
    });

    return map;
  }, [
    data.modules,
    searchQuery,
    selectedDifficulty,
    selectedStatus,
    selectedCompany,
    selectedTopic,
  ]);

  // Total visible problems across all modules
  const filteredCount = useMemo(() => {
    let count = 0;
    filteredProblemsMap.forEach((probs) => {
      count += probs.length;
    });
    return count;
  }, [filteredProblemsMap]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('ALL');
    setSelectedStatus('ALL');
    setSelectedCompany('ALL');
    setSelectedTopic('ALL');
  };

  const isFiltering =
    Boolean(searchQuery.trim()) ||
    selectedDifficulty !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedCompany !== 'ALL' ||
    selectedTopic !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* 1. Header Overview & Progress */}
      <DSARoadmapHeader
        totalProblems={data.totalProblems}
        solvedProblems={data.solvedProblems}
        overallProgressPct={data.overallProgressPct}
        difficultyDistribution={data.difficultyDistribution}
        totalModules={data.totalModules}
        completedModules={data.completedModules}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      {/* 2. Client-Side Search & Filter Bar */}
      <DSARoadmapFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        selectedTopic={selectedTopic}
        onTopicChange={setSelectedTopic}
        availableCompanies={availableCompanies}
        availableTopics={availableTopics}
        statusCounts={statusCounts}
        totalCount={data.totalProblems}
        filteredCount={filteredCount}
        onClearFilters={handleClearFilters}
      />

      {/* 3. Problem Sheets by Module */}
      {filteredCount === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <SearchX className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            No matching problems found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No problems match your current search and filter criteria. Try clearing some filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.modules.map((module) => (
            <DSAModuleSection
              key={module.id}
              module={module}
              isExpanded={
                isFiltering ? true : Boolean(expandedModules[module.id])
              }
              onToggle={() => handleToggleModule(module.id)}
              filteredProblemsMap={filteredProblemsMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
