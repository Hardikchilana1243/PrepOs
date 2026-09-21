import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RevisionQueue } from '@/components/revision/revision-queue';

export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch all revisions for current candidate
  const revisions = await prisma.revision.findMany({
    where: { userId: user.id },
    include: {
      problem: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { dueAt: 'asc' },
  });

  const now = new Date();

  const formattedRevisions = revisions.map((rev) => {
    const isDue = rev.dueAt <= now && rev.completedAt === null;
    return {
      id: rev.id,
      problemId: rev.problem.id,
      problemTitle: rev.problem.title,
      problemSlug: rev.problem.slug,
      difficulty: rev.problem.difficulty,
      topicTitle: rev.problem.topic.title,
      intervalDays: rev.intervalDays,
      confidence: rev.confidence,
      dueAt: new Date(rev.dueAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      isDue,
    };
  });

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Spaced Repetition Revision
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated recall intervals ensure algorithmic concepts stay fresh until the day of your on-campus placement tests.
        </p>
      </div>

      <RevisionQueue revisions={formattedRevisions} />
    </div>
  );
}
