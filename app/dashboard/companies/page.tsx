import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { CompanyExplorer } from '@/components/companies/company-explorer';
import { PageHeader } from '@/components/ui/student-os';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    company?: string;
  };
}

function getCompanyTier(slug: string): string {
  if (['google', 'microsoft', 'amazon', 'uber', 'atlassian'].includes(slug)) {
    return 'Tier-1 Tech';
  }
  if (['flipkart', 'goldman-sachs'].includes(slug)) {
    return 'Product';
  }
  if (['cisco', 'oracle'].includes(slug)) {
    return 'Enterprise';
  }
  return 'High-Impact IT';
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch all companies, patterns, assessments, and mapped problems
  const [companies, userProgress] = await Promise.all([
    prisma.company.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        patterns: {
          orderBy: { frequencyPct: 'desc' },
          select: {
            patternName: true,
            frequencyPct: true,
          },
        },
        assessments: {
          take: 1,
          select: {
            title: true,
            durationMin: true,
            totalQuestions: true,
          },
        },
        companyProblems: {
          select: {
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id, isSolved: true },
      select: { problemId: true },
    }),
  ]);

  const solvedSet = new Set(userProgress.map((p) => p.problemId));

  const formattedCompanies = companies.map((comp) => ({
    id: comp.id,
    slug: comp.slug,
    name: comp.name,
    tier: getCompanyTier(comp.slug),
    hiringRoles: ['SDE-1', 'Graduate Software Engineer'],
    patterns: comp.patterns.map((p) => ({
      patternName: p.patternName,
      frequencyPct: p.frequencyPct,
      description: `Verified pattern frequency (${p.frequencyPct}%) from recent placement interview rounds.`,
    })),
    problems: comp.companyProblems.map((cp) => ({
      id: cp.problem.id,
      slug: cp.problem.slug,
      title: cp.problem.title,
      difficulty: cp.problem.difficulty,
      isSolved: solvedSet.has(cp.problem.id),
    })),
    assessment: comp.assessments[0]
      ? {
          title: comp.assessments[0].title,
          durationMin: comp.assessments[0].durationMin,
          totalQuestions: comp.assessments[0].totalQuestions,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Placement Hubs"
        subtitle="Deconstruct verified interview patterns, hiring trends, and mapped algorithmic problems across top software engineering recruiters."
        tag="Level 3 — Context & Companies"
      />

      <CompanyExplorer
        companies={formattedCompanies}
        initialCompanySlug={searchParams.company}
      />
    </div>
  );
}
