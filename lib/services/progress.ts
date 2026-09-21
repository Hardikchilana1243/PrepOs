// ============================================================================
// PREPOS PROGRESS & ACTIVITY SERVICE
// Canonical Activity Persistence & Automatic PRS Triggering
// ============================================================================

import prisma from '../db';
import { calculatePRS } from './readiness-score';

export interface QuizSubmissionResult {
  attemptId: string;
  totalQuestions: number;
  correctQuestions: number;
  scorePercentage: number;
  passed: boolean;
}

/**
 * Records a DSA problem as solved by a user, updates topic/roadmap progress,
 * schedules spaced repetition revision, and recalculates the user's PRS.
 */
export async function recordProblemSolved(userId: string, problemId: string) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { topic: { include: { module: true } } },
  });

  if (!problem) {
    throw new Error('Problem not found');
  }

  // 1. Upsert UserProgress
  await prisma.userProgress.upsert({
    where: {
      userId_problemId: {
        userId,
        problemId,
      },
    },
    update: {
      isSolved: true,
      solvedAt: new Date(),
      attemptsCnt: { increment: 1 },
    },
    create: {
      userId,
      problemId,
      isSolved: true,
      solvedAt: new Date(),
      attemptsCnt: 1,
    },
  });

  // 2. Update TopicProgress
  const topicTotalProblems = await prisma.problem.count({
    where: { topicId: problem.topicId },
  });
  const topicSolvedProblems = await prisma.userProgress.count({
    where: {
      userId,
      isSolved: true,
      problem: { topicId: problem.topicId },
    },
  });

  await prisma.topicProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId: problem.topicId,
      },
    },
    update: {
      solvedCount: topicSolvedProblems,
      totalCount: topicTotalProblems,
      isCompleted: topicSolvedProblems >= topicTotalProblems,
      updatedAt: new Date(),
    },
    create: {
      userId,
      topicId: problem.topicId,
      solvedCount: topicSolvedProblems,
      totalCount: topicTotalProblems,
      isCompleted: topicSolvedProblems >= topicTotalProblems,
    },
  });

  // 3. Schedule Spaced Repetition Revision for Day 7
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 7);

  await prisma.revision.upsert({
    where: {
      userId_problemId: {
        userId,
        problemId,
      },
    },
    update: {
      dueAt,
      completedAt: null,
      confidence: 'GOOD',
      updatedAt: new Date(),
    },
    create: {
      userId,
      problemId,
      dueAt,
      confidence: 'GOOD',
      intervalDays: 7,
    },
  });

  // 4. Update Profile Streak & Activity Event
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  await prisma.streakEvent.upsert({
    where: {
      userId_date_activityType: {
        userId,
        date: today,
        activityType: 'SUBMISSION',
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      date: today,
      activityType: 'SUBMISSION',
      count: 1,
    },
  });

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'PROBLEM_SOLVED',
      metadata: JSON.stringify({ problemId, problemTitle: problem.title }),
    },
  });

  // Increment profile streak if needed
  await prisma.profile.update({
    where: { userId },
    data: {
      streakDays: { increment: 1 },
      lastActiveAt: new Date(),
    },
  }).catch(() => null);

  // 5. Trigger Server-Side PRS Recalculation
  return calculatePRS(userId);
}

/**
 * Server-Side Quiz Grading and Progress Persistence.
 * Evaluates candidate responses securely on the server, ensuring
 * that QuestionOption.isCorrect is never exposed to client browsers.
 */
export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  selectedOptions: Record<string, string>, // questionId -> selectedOptionId
  durationSec: number = 60
): Promise<QuizSubmissionResult> {
  const quiz = await prisma.coreCSQuiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  let correctCount = 0;
  const totalQuestions = quiz.questions.length;
  const gradedAnswers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[] = [];

  for (const question of quiz.questions) {
    const selectedOptionId = selectedOptions[question.id];
    const correctOption = question.options.find((opt) => opt.isCorrect);

    const isCorrect = Boolean(selectedOptionId && correctOption && selectedOptionId === correctOption.id);
    if (isCorrect) {
      correctCount++;
    }

    if (selectedOptionId) {
      gradedAnswers.push({
        questionId: question.id,
        selectedOptionId,
        isCorrect,
      });
    }
  }

  const scorePct = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // Persist QuizAttempt record
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      scorePct,
      totalQs: totalQuestions,
      correctQs: correctCount,
      durationSec,
      completedAt: new Date(),
    },
  });

  // Persist individual QuizAnswer entries
  for (const answer of gradedAnswers) {
    await prisma.quizAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: answer.isCorrect,
      },
    });
  }

  // Record Activity & Streak
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  await prisma.streakEvent.upsert({
    where: {
      userId_date_activityType: {
        userId,
        date: today,
        activityType: 'QUIZ',
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      date: today,
      activityType: 'QUIZ',
      count: 1,
    },
  });

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'QUIZ_COMPLETED',
      metadata: JSON.stringify({ quizId, scorePct, correctCount, totalQuestions }),
    },
  });

  // Trigger PRS Recalculation
  await calculatePRS(userId);

  return {
    attemptId: attempt.id,
    totalQuestions,
    correctQuestions: correctCount,
    scorePercentage: Math.round(scorePct),
    passed: scorePct >= 60,
  };
}

/**
 * SuperMemo-derived spaced repetition review logger.
 * Adjusts future intervals dynamically based on candidate recall confidence.
 */
export async function recordRevisionReview(
  userId: string,
  revisionId: string,
  confidence: 'HARD' | 'GOOD' | 'EASY'
) {
  const revision = await prisma.revision.findFirst({
    where: { id: revisionId, userId },
    include: { problem: true },
  });

  if (!revision) {
    throw new Error('Revision record not found');
  }

  let nextIntervalDays: number;
  if (confidence === 'HARD') {
    nextIntervalDays = 2;
  } else if (confidence === 'GOOD') {
    nextIntervalDays = Math.max(7, Math.round(revision.intervalDays * 1.5));
  } else {
    nextIntervalDays = Math.max(14, revision.intervalDays * 2);
  }

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + nextIntervalDays);

  await prisma.revision.update({
    where: { id: revisionId },
    data: {
      confidence,
      intervalDays: nextIntervalDays,
      dueAt: nextDue,
      completedAt: new Date(),
    },
  });

  // Record streak / activity
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  await prisma.streakEvent.upsert({
    where: {
      userId_date_activityType: {
        userId,
        date: today,
        activityType: 'REVISION',
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      date: today,
      activityType: 'REVISION',
      count: 1,
    },
  });

  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'REVISION_COMPLETED',
      metadata: JSON.stringify({
        problemId: revision.problemId,
        confidence,
        nextIntervalDays,
      }),
    },
  });

  // Recalculate PRS
  await calculatePRS(userId);

  return { nextIntervalDays, nextDue };
}
