'use client';

// ============================================================================
// PREPOS INTERVIEW PREPARATION & PRACTICE MASTER VIEW
// Responsive, Deterministic & Filterable Client Workspace
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  InterviewWorkspaceData,
  InterviewPracticeItem,
} from '@/lib/services/interview';
import { InterviewHeader } from './interview-header';
import { InterviewStats } from './interview-stats';
import { InterviewModeCard } from './interview-mode-card';
import { InterviewFilters, InterviewFilterState } from './interview-filters';
import { InterviewPracticeList } from './interview-practice-list';
import { InterviewMistakes } from './interview-mistakes';
import { InterviewCompanyPrep } from './interview-company-prep';
import { InterviewChecklist } from './interview-checklist';
import { InterviewHistory } from './interview-history';
import { InterviewEmptyState } from './interview-empty-state';

interface InterviewViewProps {
  data: InterviewWorkspaceData;
}

export function InterviewView({ data }: InterviewViewProps) {
  // 1. Client-Side Filter State for Instant Responsiveness
  const [filterState, setFilterState] = useState<InterviewFilterState>({
    searchQuery: '',
    selectedCompany: 'ALL',
    selectedTopic: 'ALL',
    selectedDifficulty: 'ALL',
    selectedCategory: 'ALL',
    solvedFilter: 'ALL',
    bookmarkedOnly: false,
    needsReviewOnly: false,
  });

  // 2. Filter Evaluation
  const filteredCatalog = useMemo(() => {
    return data.catalog.filter((item: InterviewPracticeItem) => {
      // Search query filter
      if (filterState.searchQuery.trim() !== '') {
        const q = filterState.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTopic = item.topic.toLowerCase().includes(q);
        const matchesCompany = item.companyNames.some((c) => c.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTopic && !matchesCompany) return false;
      }

      // Company filter
      if (
        filterState.selectedCompany !== 'ALL' &&
        !item.companyNames.includes(filterState.selectedCompany)
      ) {
        return false;
      }

      // Topic filter
      if (
        filterState.selectedTopic !== 'ALL' &&
        item.topic !== filterState.selectedTopic
      ) {
        return false;
      }

      // Difficulty filter
      if (
        filterState.selectedDifficulty !== 'ALL' &&
        item.difficulty !== filterState.selectedDifficulty
      ) {
        return false;
      }

      // Solved filter
      if (filterState.solvedFilter === 'SOLVED' && !item.isSolved) return false;
      if (filterState.solvedFilter === 'UNSOLVED' && item.isSolved) return false;

      // Bookmarked filter
      if (filterState.bookmarkedOnly && !item.isBookmarked) return false;

      // Needs review filter
      if (filterState.needsReviewOnly && !item.needsReview) return false;

      return true;
    });
  }, [data.catalog, filterState]);

  const handleSelectMode = (modeId: string) => {
    if (modeId === 'DSA') {
      setFilterState((prev) => ({ ...prev, selectedCategory: 'DSA' }));
    } else if (modeId === 'CORE_CS') {
      setFilterState((prev) => ({ ...prev, selectedCategory: 'CORE_CS' }));
    } else if (modeId === 'COMPANY') {
      setFilterState((prev) => ({ ...prev, selectedCompany: data.filters.companies[0] || 'ALL' }));
    } else if (modeId === 'REVIEW') {
      setFilterState((prev) => ({ ...prev, bookmarkedOnly: true }));
    }
  };

  const isBrandNewStudent =
    data.summary.questionsPracticed === 0 &&
    data.summary.sessionsCompleted === 0 &&
    data.mistakes.length === 0;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header with Operational Hierarchy and Badges */}
      <InterviewHeader
        streakDays={data.summary.studyStreakDays}
        sessionsCompleted={data.summary.sessionsCompleted}
        recentMistakesCount={data.summary.recentMistakesCount}
      />

      {/* 2. Top Metric Cards */}
      <InterviewStats summary={data.summary} />

      {/* 3. Five Core Interview Practice Modes */}
      <section id="modes" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Interview Preparation Modes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a specialized practice focus derived from authentic database records and company tracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.modes.map((mode) => (
            <InterviewModeCard
              key={mode.id}
              mode={mode}
              onSelectMode={handleSelectMode}
            />
          ))}
        </div>
      </section>

      {/* 4. Filterable Interview Question Catalog */}
      <section id="catalog" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Interview Question Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified algorithmic problems, diagnostic technical screenings, and company interview patterns.
          </p>
        </div>

        <InterviewFilters
          filterState={filterState}
          onChange={setFilterState}
          availableCompanies={data.filters.companies}
          availableTopics={data.filters.topics}
          totalResultsCount={filteredCatalog.length}
        />

        <InterviewPracticeList items={filteredCatalog} />
      </section>

      {/* 5. Mistake-Driven Review Section */}
      <section id="mistakes">
        <InterviewMistakes mistakes={data.mistakes} />
      </section>

      {/* 6. Target Company Tracks Section */}
      <section id="company-prep">
        <InterviewCompanyPrep companies={data.companyPrep} />
      </section>

      {/* 7. Verifiable Readiness Checklist */}
      <section id="checklist">
        <InterviewChecklist checklist={data.checklist} />
      </section>

      {/* 8. Chronological Activity History */}
      <section id="history">
        <InterviewHistory history={data.history} />
      </section>
    </div>
  );
}
