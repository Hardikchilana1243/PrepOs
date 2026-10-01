'use client';

// ============================================================================
// PREPOS ASSESSMENT CATALOG COMPONENT
// Structured preparation workspace: Company -> Difficulty -> Assessment hierarchy
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Layers,
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { AssessmentCatalogData, AssessmentCatalogItem } from '@/lib/services/assessment';
import { AssessmentHeader } from './assessment-header';
import { AssessmentFilters, AssessmentFilterValues } from './assessment-filters';
import { AssessmentCard } from './assessment-card';
import { AssessmentEmptyState } from './assessment-empty-state';

interface AssessmentCatalogProps {
  initialData: AssessmentCatalogData;
}

export function AssessmentCatalog({ initialData }: AssessmentCatalogProps) {
  // Filter state
  const [filters, setFilters] = useState<AssessmentFilterValues>({
    search: '',
    companySlug: 'ALL',
    difficulty: 'ALL',
    status: 'ALL',
    duration: 'ALL',
    type: 'ALL',
  });

  // Organization mode: Grouped by Company vs Flat List
  const [viewMode, setViewMode] = useState<'GROUPED' | 'LIST'>('GROUPED');

  const handleFilterChange = (updates: Partial<AssessmentFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      companySlug: 'ALL',
      difficulty: 'ALL',
      status: 'ALL',
      duration: 'ALL',
      type: 'ALL',
    });
  };

  // Extract unique available companies for the filter dropdown
  const availableCompanies = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; isTarget: boolean }>();
    initialData.assessments.forEach((a) => {
      if (!map.has(a.company.slug)) {
        map.set(a.company.slug, {
          slug: a.company.slug,
          name: a.company.name,
          isTarget: a.company.isTarget,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.isTarget && !b.isTarget) return -1;
      if (!a.isTarget && b.isTarget) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [initialData.assessments]);

  // Filter assessment list
  const filteredAssessments = useMemo(() => {
    return initialData.assessments.filter((a) => {
      // 1. Search Query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesDesc = a.description?.toLowerCase().includes(query) ?? false;
        const matchesCompany = a.company.name.toLowerCase().includes(query);
        const matchesSections = a.sections.some((s) => s.title.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesCompany && !matchesSections) {
          return false;
        }
      }

      // 2. Company
      if (filters.companySlug !== 'ALL' && a.company.slug !== filters.companySlug) {
        return false;
      }

      // 3. Difficulty
      if (filters.difficulty !== 'ALL' && a.difficulty !== filters.difficulty) {
        return false;
      }

      // 4. Status
      if (filters.status !== 'ALL' && a.status !== filters.status) {
        return false;
      }

      // 5. Duration
      if (filters.duration === 'SHORT' && a.durationMin >= 45) return false;
      if (filters.duration === 'MEDIUM' && (a.durationMin < 45 || a.durationMin > 90)) return false;
      if (filters.duration === 'LONG' && a.durationMin <= 90) return false;

      // 6. Type
      if (filters.type !== 'ALL' && a.assessmentType !== filters.type) {
        return false;
      }

      return true;
    });
  }, [initialData.assessments, filters]);

  // Group assessments by Company -> Assessment for the grouped view
  const groupedByCompany = useMemo(() => {
    const groups: {
      company: { id: string; name: string; slug: string; tier: string; isTarget: boolean };
      assessments: AssessmentCatalogItem[];
    }[] = [];

    const map = new Map<string, AssessmentCatalogItem[]>();
    const companyInfoMap = new Map<string, any>();

    filteredAssessments.forEach((a) => {
      if (!map.has(a.company.slug)) {
        map.set(a.company.slug, []);
        companyInfoMap.set(a.company.slug, a.company);
      }
      map.get(a.company.slug)!.push(a);
    });

    // Sort companies: target companies first, then name
    const sortedSlugs = Array.from(map.keys()).sort((slugA, slugB) => {
      const compA = companyInfoMap.get(slugA);
      const compB = companyInfoMap.get(slugB);
      if (compA?.isTarget && !compB?.isTarget) return -1;
      if (!compA?.isTarget && compB?.isTarget) return 1;
      return (compA?.name || '').localeCompare(compB?.name || '');
    });

    sortedSlugs.forEach((slug) => {
      groups.push({
        company: companyInfoMap.get(slug),
        assessments: map.get(slug)!,
      });
    });

    return groups;
  }, [filteredAssessments]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Real Database Stats */}
      <AssessmentHeader
        totalAssessments={initialData.totalAssessments}
        attemptedCount={initialData.attemptedCount}
        passedCount={initialData.passedCount}
        averageScorePct={initialData.averageScorePct}
      />

      {/* 2. Interactive Multi-faceted Filters */}
      <AssessmentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        availableCompanies={availableCompanies}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={filteredAssessments.length}
      />

      {/* 3. Catalog Body */}
      {filteredAssessments.length === 0 ? (
        initialData.totalAssessments === 0 ? (
          <AssessmentEmptyState
            title="No assessments published yet"
            description="Official placement online assessments will appear here once published."
          />
        ) : (
          <AssessmentEmptyState
            title="No matching assessments found"
            description={
              filters.search
                ? `No assessments matched "${filters.search}". Try adjusting your search query or filter criteria.`
                : 'No assessments matched the selected filter criteria. Try resetting your filters to explore all available simulations.'
            }
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        )
      ) : viewMode === 'GROUPED' ? (
        /* Grouped Hierarchy View: Company -> Assessment */
        <div className="space-y-8">
          {groupedByCompany.map((group) => (
            <div key={group.company.slug} className="space-y-3">
              {/* Company Section Header with Hub Deep Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-slate-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {group.company.name}
                      </h2>
                      {group.company.isTarget && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>Target Company</span>
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {group.company.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium font-mono">
                      {group.assessments.length}{' '}
                      {group.assessments.length === 1 ? 'assessment simulation' : 'assessment simulations'}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/companies/${group.company.slug}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors"
                >
                  <span>Open {group.company.name} Hub</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Assessment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.assessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}
