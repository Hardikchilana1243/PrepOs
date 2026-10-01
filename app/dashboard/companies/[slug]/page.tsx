import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getCompanyDetailData } from '@/lib/services/companies';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CompanyDetailHeader } from '@/components/companies/company-detail-header';
import { CompanyReadinessCard } from '@/components/companies/company-readiness-card';
import { CompanyPatternsCard } from '@/components/companies/company-patterns-card';
import { CompanyProblemList } from '@/components/companies/company-problem-list';
import { CompanyCoreCSCard } from '@/components/companies/company-core-cs-card';
import { CompanyAssessmentCard } from '@/components/companies/company-assessment-card';
import { CompanyPreparationChecklist } from '@/components/companies/company-preparation-checklist';
import { CompanyHistory } from '@/components/companies/company-history';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const data = await getCompanyDetailData(params.slug, user.id);
  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Breadcrumbs */}
      <Breadcrumbs />

      {/* 1. Company Identity & Top Metrics Header */}
      <CompanyDetailHeader
        company={{
          slug: data.slug,
          name: data.name,
          tier: data.tier,
          description: data.description,
          websiteUrl: data.websiteUrl,
          isTarget: data.isTarget,
        }}
        coverage={{
          coveragePct: data.coverage.coveragePct,
          completedItems: data.coverage.completedItems,
          totalItems: data.coverage.totalItems,
          status: data.coverage.status,
        }}
        metrics={{
          totalProblems: data.dsa.totalCount,
          solvedProblems: data.dsa.solvedCount,
          attemptedProblems: data.dsa.attemptedCount,
          totalAssessments: data.assessments.totalCount,
          passedAssessments: data.assessments.passedCount,
          hasCoreCS: data.coreCs.hasMapping,
          totalQuizzes: data.coreCs.totalQuizzes,
          passedQuizzes: data.coreCs.passedQuizzes,
        }}
      />

      {/* 2. Deterministic Preparation Coverage Card */}
      <CompanyReadinessCard
        companyName={data.name}
        overallCoveragePct={data.coverage.coveragePct}
        totalItems={data.coverage.totalItems}
        completedItems={data.coverage.completedItems}
        remainingItems={data.coverage.remainingItems}
        dsa={{
          total: data.dsa.totalCount,
          solved: data.dsa.solvedCount,
          remaining: Math.max(0, data.dsa.totalCount - data.dsa.solvedCount),
          coveragePct: data.dsa.coveragePct,
        }}
        coreCs={{
          hasMapping: data.coreCs.hasMapping,
          total: data.coreCs.totalQuizzes,
          cleared: data.coreCs.passedQuizzes,
          remaining: Math.max(0, data.coreCs.totalQuizzes - data.coreCs.passedQuizzes),
          coveragePct:
            data.coreCs.totalQuizzes > 0
              ? Math.round((data.coreCs.passedQuizzes / data.coreCs.totalQuizzes) * 100)
              : 0,
        }}
        assessments={{
          hasAssessments: data.assessments.hasAssessments,
          total: data.assessments.totalCount,
          passed: data.assessments.passedCount,
          remaining: Math.max(0, data.assessments.totalCount - data.assessments.passedCount),
          coveragePct:
            data.assessments.totalCount > 0
              ? Math.round((data.assessments.passedCount / data.assessments.totalCount) * 100)
              : 0,
        }}
        revision={{
          hasScheduled: data.revision.hasScheduled,
          total: data.revision.totalScheduled,
          dueCount: data.revision.dueCount,
          coveragePct:
            data.revision.totalScheduled > 0
              ? Math.round(
                  ((data.revision.totalScheduled - data.revision.dueCount) /
                    data.revision.totalScheduled) *
                    100
                )
              : 100,
        }}
      />

      {/* 3. Verified Interview Patterns */}
      <CompanyPatternsCard
        companyName={data.name}
        patterns={data.patterns}
      />

      {/* 4. Tagged DSA Problems Workspace */}
      <CompanyProblemList
        companyName={data.name}
        problems={data.dsa.problems}
      />

      {/* 5. Core CS Foundations Screening */}
      <CompanyCoreCSCard
        companyName={data.name}
        hasMapping={data.coreCs.hasMapping}
        quizzes={data.coreCs.quizzes}
      />

      {/* 6. Mock Online Assessments */}
      <CompanyAssessmentCard
        companyName={data.name}
        hasAssessments={data.assessments.hasAssessments}
        assessments={data.assessments.items}
      />

      {/* 7. Preparation Checklist (Action Plan) */}
      <CompanyPreparationChecklist
        companyName={data.name}
        checklist={data.checklist}
      />

      {/* 8. Persisted Preparation Activity History */}
      <CompanyHistory
        companyName={data.name}
        history={data.history}
      />
    </div>
  );
}
