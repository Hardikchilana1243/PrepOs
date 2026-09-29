'use client';

import React, { useState } from 'react';
import { CompanyHubHeader } from './company-hub-header';
import { CompanyDirectory } from './company-directory';
import { CompanyDetail, CompanyDetailData } from './company-detail';
import { CompanyCardData } from './company-card';

interface CompanyExplorerProps {
  companies: CompanyDetailData[];
  initialCompanySlug?: string;
}

export function CompanyExplorer({ companies, initialCompanySlug }: CompanyExplorerProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialCompanySlug || companies[0]?.slug || ''
  );

  const activeCompany =
    companies.find((c) => c.slug === selectedSlug) || companies[0];

  // Calculate high-level stats for header
  const totalCompanies = companies.length;
  const totalAssessments = companies.reduce((acc, c) => acc + c.assessments.length, 0);
  const totalCompanyProblems = companies.reduce((acc, c) => acc + c.problems.length, 0);

  let completedCompanies = 0;
  let inProgressCompanies = 0;

  const cardDataList: CompanyCardData[] = companies.map((c) => {
    const solvedCount = c.problems.filter((p) => p.isSolved).length;
    const problemCount = c.problems.length;
    const assessmentAttempted = c.assessments.some((a) => a.latestAttempt);
    const assessmentPassed = c.assessments.some((a) => a.latestAttempt?.passed);

    let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
    if (problemCount > 0 && solvedCount === problemCount && (c.assessments.length === 0 || assessmentPassed)) {
      status = 'COMPLETED';
      completedCompanies++;
    } else if (solvedCount > 0 || assessmentAttempted) {
      status = 'IN_PROGRESS';
      inProgressCompanies++;
    }

    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      tier: c.tier,
      topPattern: c.patterns[0]?.patternName,
      problemCount,
      solvedCount,
      assessmentCount: c.assessments.length,
      assessmentAttempted,
      status,
    };
  });

  return (
    <div className="space-y-6">
      {/* Company Hub Header with Real Metrics */}
      <CompanyHubHeader
        totalCompanies={totalCompanies}
        totalAssessments={totalAssessments}
        totalCompanyProblems={totalCompanyProblems}
        completedCompanies={completedCompanies}
        inProgressCompanies={inProgressCompanies}
      />

      {/* Main Grid: Directory Sidebar & Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Company Directory */}
        <div className="lg:col-span-4">
          <CompanyDirectory
            companies={cardDataList}
            selectedSlug={activeCompany?.slug || ''}
            onSelectCompany={(slug) => setSelectedSlug(slug)}
          />
        </div>

        {/* Right Column: Company Detail Workspace */}
        <div className="lg:col-span-8">
          {activeCompany ? (
            <CompanyDetail company={activeCompany} />
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-400">
              No company selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
