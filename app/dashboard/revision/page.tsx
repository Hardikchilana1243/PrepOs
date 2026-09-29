import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RevisionQueue, RevisionQueueItem } from '@/components/revision/revision-queue';

export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch all revisions and Core CS mistakes in parallel with explicit projections
  const [revisions, incorrectAnswers] = await Promise.all([
    prisma.revision.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        intervalDays: true,
        confidence: true,
        dueAt: true,
        completedAt: true,
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            statement: true,
            hints: true,
            expectedTimeComplexity: true,
            expectedSpaceComplexity: true,
            topic: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    }),

    prisma.quizAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: { userId: user.id },
      },
      select: {
        id: true,
        questionId: true,
        attempt: {
          select: {
            completedAt: true,
            quiz: {
              select: {
                subject: {
                  select: {
                    slug: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        question: {
          select: {
            id: true,
            questionText: true,
            explanation: true,
            orderIndex: true,
          },
        },
      },
      orderBy: { attempt: { completedAt: 'desc' } },
      take: 20,
    }),
  ]);

  const { findTopicForQuestion } = await import('@/lib/services/core-cs-curriculum');

  // De-duplicate Core CS mistakes
  const questionMissMap = new Map<
    string,
    {
      id: string;
      questionText: string;
      explanation: string;
      topicTitle: string;
      subjectTitle: string;
      subjectSlug: string;
      missCount: number;
      lastDate: Date;
    }
  >();

  for (const ans of incorrectAnswers) {
    const sSlug = ans.attempt.quiz.subject.slug;
    const topic = findTopicForQuestion(sSlug, ans.question.orderIndex);
    const qId = ans.question.id;
    const existingQ = questionMissMap.get(qId);

    if (existingQ) {
      existingQ.missCount += 1;
      if (ans.attempt.completedAt > existingQ.lastDate) {
        existingQ.lastDate = ans.attempt.completedAt;
      }
    } else {
      questionMissMap.set(qId, {
        id: ans.id,
        questionText: ans.question.questionText,
        explanation: ans.question.explanation,
        topicTitle: topic?.title || 'Core CS Foundations',
        subjectTitle: ans.attempt.quiz.subject.title,
        subjectSlug: sSlug,
        missCount: 1,
        lastDate: ans.attempt.completedAt,
      });
    }
  }

  const now = new Date();

  // Format DSA spaced revisions
  const dsaItems: RevisionQueueItem[] = revisions.map((rev) => {
    const dueDate = new Date(rev.dueAt);
    const isDue = dueDate <= now && rev.completedAt === null;
    const diffMs = now.getTime() - dueDate.getTime();
    const daysOverdue = isDue && diffMs > 86400000 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;

    let parsedHints: string[] = [];
    const rawHints: unknown = rev.problem.hints;
    if (Array.isArray(rawHints)) {
      parsedHints = rawHints.map(String);
    } else if (typeof rawHints === 'string') {
      try {
        const parsed = JSON.parse(rawHints);
        if (Array.isArray(parsed)) parsedHints = parsed.map(String);
        else if (parsed) parsedHints = [String(parsed)];
      } catch {
        parsedHints = [rawHints];
      }
    }

    return {
      id: rev.id,
      sourceType: 'DSA',
      problemId: rev.problem.id,
      problemTitle: rev.problem.title,
      problemSlug: rev.problem.slug,
      difficulty: rev.problem.difficulty,
      topicTitle: rev.problem.topic.title,
      statement: rev.problem.statement,
      hints: parsedHints,
      expectedTimeComplexity: rev.problem.expectedTimeComplexity,
      expectedSpaceComplexity: rev.problem.expectedSpaceComplexity,
      intervalDays: rev.intervalDays,
      confidence: rev.confidence,
      dueAt: dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      dueAtRaw: rev.dueAt.toISOString(),
      isDue,
      daysOverdue,
      completedAt: rev.completedAt ? rev.completedAt.toISOString() : null,
    };
  });

  // Format Core CS review items
  const coreCsItems: RevisionQueueItem[] = Array.from(questionMissMap.values())
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, 10)
    .map((info) => ({
      id: `cs-review-${info.id}`,
      sourceType: 'CORE_CS',
      problemTitle: info.questionText,
      topicTitle: info.topicTitle,
      subjectTitle: info.subjectTitle,
      explanation: info.explanation,
      intervalDays: 1,
      confidence: 'REVIEW_NEEDED',
      dueAt: new Date(info.lastDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      dueAtRaw: info.lastDate.toISOString(),
      isDue: true,
      daysOverdue: 0,
      completedAt: null,
    }));

  const initialItems: RevisionQueueItem[] = [...dsaItems, ...coreCsItems];

  return (
    <div className="space-y-6">
      <RevisionQueue initialItems={initialItems} />
    </div>
  );
}
