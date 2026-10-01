'use client';

import React, { useState, useMemo } from 'react';
import { CompanySummary } from '@/lib/services/companies';
import { CompanyCard } from './company-card';
import { CompanyFilters, CompanyFilterState } from './company-filters';
import { CompanyEmptyState } from './company-empty-state';
import { SearchX } from 'lucide-react';

interface CompanyGridProps {
  initialCompanies: CompanySummary[];
}

const DEFAULT_FILTERS: CompanyFilterState = {
  searchQuery: '',
  targetOnly: false,
  status: 'ALL',
  tier: 'ALL',
  hasAssessments: false,
  hasCoreCS: false,
};

export function CompanyGrid({ initialCompanies }: CompanyGridProps) {
  const [companies, setCompanies] = useState<CompanySummary[]>(initialCompanies);
  const [filters, setFilters] = useState<CompanyFilterState>(DEFAULT_FILTERS);

  // Sync target toggle updates across the client list
  const handleTargetToggle = (slug: string, newTarget: boolean) => {
    setCompanies((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, isTarget: newTarget } : c))
    );
  };

  // Compute filtered companies client-side with zero redundant DB queries
  const filteredCompanies = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();

    return companies.filter((c) => {
      // 1. Text Search
      if (q) {
        const nameMatch = c.name.toLowerCase().includes(q);
        const patternMatch = c.topPattern?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        if (!nameMatch && !patternMatch && !descMatch) return false;
      }

      // 2. Target Only
      if (filters.targetOnly && !c.isTarget) {
        return false;
      }

      // 3. Status Filter
      if (filters.status !== 'ALL' && c.preparationStatus !== filters.status) {
        return false;
      }

      // 4. Tier Filter
      if (filters.tier !== 'ALL' && c.tier !== filters.tier) {
        return false;
      }

      // 5. Capabilities Filter
      if (filters.hasAssessments && !c.hasAssessments) {
        return false;
      }

      if (filters.hasCoreCS && !c.hasCoreCS) {
        return false;
      }

      return true;
    });
  }, [companies, filters]);

  const targetCount = useMemo(() => companies.filter((c) => c.isTarget).length, [companies]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <CompanyFilters
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        filteredCount={filteredCompanies.length}
        totalCount={companies.length}
        targetCount={targetCount}
      />

      {/* Grid of Company Cards */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {filteredCompanies.map((comp) => (
            <CompanyCard
              key={comp.id}
              company={comp}
              onTargetToggle={handleTargetToggle}
            />
          ))}
        </div>
      ) : (
        <CompanyEmptyState
          icon={SearchX}
          title="No Companies Match Filter Criteria"
          description="Adjust your search terms, target criteria, or status filters to discover verified placement hubs."
          actionLabel="Clear All Filters"
          onAction={() => setFilters(DEFAULT_FILTERS)}
        />
      )}
    </div>
  );
}
