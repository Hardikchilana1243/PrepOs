import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { DSAExplorer } from '@/components/dsa/dsa-explorer';

export const dynamic = 'force-dynamic';

export default async function DSAPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch all published problems with relations
  const [problems, userProgress] = await Promise.all([
    prisma.problem.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        topic: {
          include: {
            module: true,
          },
        },
        companyProblems: {
          include: {
            company: true,
          },
        },
        solutions: true,
        testCases: {
          where: { isSecret: false },
          take: 2,
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id, isSolved: true },
      select: { problemId: true },
    }),
  ]);

  const solvedIds = new Set(userProgress.map((p) => p.problemId));

  const formattedProblems = problems.map((prob) => ({
    id: prob.id,
    slug: prob.slug,
    title: prob.title,
    difficulty: prob.difficulty,
    description: prob.statement,
    optimalTimeComplexity: prob.expectedTimeComplexity,
    optimalSpaceComplexity: prob.expectedSpaceComplexity,
    topicTitle: prob.topic.title,
    moduleTitle: prob.topic.module.title,
    companies: prob.companyProblems.map((cp) => cp.company.name),
    solutions: prob.solutions.map((s) => ({
      language: s.language,
      code: s.code,
      timeComplexity: s.timeComplexity,
      spaceComplexity: s.spaceComplexity,
    })),
    testCases: prob.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expected,
      isPublic: !tc.isSecret,
    })),
    isSolved: solvedIds.has(prob.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            DSA Placement Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated 14-module algorithm curriculum mapping every problem to Tier-1 interview patterns.
          </p>
        </div>
      </div>

      <DSAExplorer
        problems={formattedProblems}
        totalSolved={userProgress.length}
      />
    </div>
  );
}
