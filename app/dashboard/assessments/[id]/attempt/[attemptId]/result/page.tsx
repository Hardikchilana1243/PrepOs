import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { compileResultSummary, evaluateAssessmentAttempt } from '@/lib/services/assessment-scoring';
import { AssessmentResults } from '@/components/assessments/assessment-results';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
    attemptId: string;
  };
}

export default async function AssessmentResultPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: params.attemptId },
    select: { id: true, userId: true, status: true },
  });

  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }

  // If attempt was submitted or expired but not yet evaluated, evaluate now
  if (attempt.status === 'SUBMITTED' || attempt.status === 'EXPIRED' || attempt.status === 'EVALUATING') {
    await evaluateAssessmentAttempt(params.attemptId).catch(() => null);
  }

  let result;
  try {
    result = await compileResultSummary(params.attemptId);
  } catch (err) {
    notFound();
  }

  return <AssessmentResults result={result} />;
}
