import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { CoreCSView } from '@/components/core-cs/core-cs-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    quiz?: string;
  };
}

export default async function CoreCSPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch quizzes with their subjects and questions
  // CRITICAL SECURITY RULE: NEVER select or pass `isCorrect` to the client browser!
  const [quizzes, attempts] = await Promise.all([
    prisma.coreCSQuiz.findMany({
      include: {
        subject: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              select: {
                id: true,
                optionText: true,
                orderIndex: true,
                // isCorrect is intentionally omitted for security!
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: { quiz: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
  ]);

  const formattedQuizzes = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    slug: q.slug,
    description: q.description,
    durationMin: q.durationMin,
    totalQuestions: q.questions.length,
    subjectTitle: q.subject.title,
    questions: q.questions.map((ques) => ({
      id: ques.id,
      questionText: ques.questionText,
      orderIndex: ques.orderIndex,
      options: ques.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
        orderIndex: opt.orderIndex,
      })),
    })),
  }));

  const formattedAttempts = attempts.map((a) => ({
    id: a.id,
    quizTitle: a.quiz.title,
    scorePct: a.scorePct,
    correctQs: a.correctQs,
    totalQs: a.totalQs,
    durationSec: a.durationSec,
    completedAt: new Date(a.completedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Core Computer Science Screening Drills
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous 10-minute diagnostic evaluations covering DBMS, Operating Systems, and high-frequency interview concepts.
        </p>
      </div>

      <CoreCSView
        quizzes={formattedQuizzes}
        attempts={formattedAttempts}
        initialQuizSlug={searchParams.quiz}
      />
    </div>
  );
}
