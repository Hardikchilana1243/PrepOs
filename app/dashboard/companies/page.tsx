import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { CompanyExplorer } from '@/components/companies/company-explorer';

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

  // Fetch all 10 companies, patterns, assessments, and mapped problems
  const [companies, userProgress] = await Promise.all([
    prisma.company.findMany({
      include: {
        patterns: {
          orderBy: { frequencyPct: 'desc' },
        },
        assessments: {
          take: 1,
        },
        companyProblems: {
          include: {
            problem: true,
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
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Company Placement Hubs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deconstruct hiring trends, high-yield algorithmic patterns, and exact online assessment formats for top engineering recruiters.
        </p>
      </div>

      <CompanyExplorer
        companies={formattedCompanies}
        initialCompanySlug={searchParams.company}
      />
    </div>
  );
}
