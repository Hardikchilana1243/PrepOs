import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getCompanyCatalogData } from '@/lib/services/companies';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CompaniesHeader } from '@/components/companies/companies-header';
import { CompanyGrid } from '@/components/companies/company-grid';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    company?: string;
  };
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  // If legacy query param ?company=slug is present, redirect to the focused workspace detail route
  if (searchParams?.company) {
    redirect(`/dashboard/companies/${searchParams.company}`);
  }

  const user = await getSessionUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const data = await getCompanyCatalogData(user.id);

  const totalProblemsCount = data.companies.reduce(
    (sum, c) => sum + c.mappedProblemsCount,
    0
  );
  const totalAssessmentsCount = data.companies.reduce(
    (sum, c) => sum + c.assessmentsCount,
    0
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Companies Catalog Header with Key Metrics */}
      <CompaniesHeader
        totalCompanies={data.totalCompanies}
        totalTargetCount={data.totalTargetCount}
        totalProblemsCount={totalProblemsCount}
        totalAssessmentsCount={totalAssessmentsCount}
        overallCoveragePct={data.overallCoveragePct}
        totalCoveredCount={data.totalCoveredCount}
      />

      {/* Responsive Catalog Grid with Client-Side Search & Filters */}
      <CompanyGrid initialCompanies={data.companies} />
    </div>
  );
}
