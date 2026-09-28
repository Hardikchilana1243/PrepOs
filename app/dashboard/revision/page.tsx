import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RevisionQueue } from '@/components/revision/revision-queue';
import { PageHeader } from '@/components/ui/student-os';

export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch all revisions and Core CS mistakes in parallel
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
            orderIndex: true,
          },
        },
      },
      orderBy: { attempt: { completedAt: 'desc' } },
      take: 20,
    }),
  ]);

  const { findTopicForQuestion } = await import('@/lib/services/core-cs-curriculum');

  const questionMissMap = new Map<
    string,
    {
      questionText: string;
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
        questionText: ans.question.questionText,
        topicTitle: topic?.title || 'Core CS Foundations',
        subjectTitle: ans.attempt.quiz.subject.title,
        subjectSlug: sSlug,
        missCount: 1,
        lastDate: ans.attempt.completedAt,
      });
    }
  }

  const coreCsMistakes = Array.from(questionMissMap.entries())
    .sort((a, b) => b[1].missCount - a[1].missCount)
    .slice(0, 6)
    .map(([id, info]) => ({
      id,
      questionText: info.questionText,
      topicTitle: info.topicTitle,
      subjectTitle: info.subjectTitle,
      subjectSlug: info.subjectSlug,
      missedTimes: info.missCount,
      lastMissedAt: new Date(info.lastDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));

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
      <PageHeader
        title="Spaced Repetition Revision"
        subtitle="Automated recall intervals ensure algorithmic concepts and core CS topics stay fresh until your technical assessments."
        tag="Level 1 & 2 — Active Recall"
      />

      <RevisionQueue
        revisions={formattedRevisions}
        coreCsMistakes={coreCsMistakes}
      />
    </div>
  );
}
