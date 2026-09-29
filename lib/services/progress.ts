// ============================================================================
// PREPOS PROGRESS & ACTIVITY SERVICE
// Canonical Activity Persistence & Automatic PRS Triggering
// ============================================================================

import prisma from '../db';
import { calculatePRS } from './readiness-score';
import { normalizeUtcMidnight } from '../utils/date';

export interface GradedQuestionReview {
  questionId: string;
  questionText: string;
  explanation: string;
  topicTitle: string;
  topicSlug: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface QuizSubmissionResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subjectTitle: string;
  subjectSlug: string;
  totalQuestions: number;
  correctQuestions: number;
  scorePercentage: number;
  passed: boolean;
  durationSec: number;
  strongTopics: string[];
  weakTopics: string[];
  gradedQuestions: GradedQuestionReview[];
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
  const today = normalizeUtcMidnight();

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
      subject: true,
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: {
          options: {
            orderBy: { orderIndex: 'asc' },
          },
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

  const strongTopicsSet = new Set<string>();
  const weakTopicsSet = new Set<string>();
  const gradedQuestions: GradedQuestionReview[] = [];

  const { findTopicForQuestion } = await import('./core-cs-curriculum');

  for (const question of quiz.questions) {
    const selectedOptionId = selectedOptions[question.id] || null;
    const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
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

    const topic = findTopicForQuestion(quiz.subject.slug, question.orderIndex);
    const topicTitle = topic?.title || 'Core CS Placement Foundations';
    const topicSlug = topic?.slug || 'core-cs-foundations';

    if (isCorrect) {
      strongTopicsSet.add(topicTitle);
    } else {
      weakTopicsSet.add(topicTitle);
    }

    gradedQuestions.push({
      questionId: question.id,
      questionText: question.questionText,
      explanation: question.explanation,
      topicTitle,
      topicSlug,
      selectedOptionId: selectedOptionId ?? null,
      selectedOptionText: selectedOption?.optionText ?? 'No answer provided',
      correctOptionId: correctOption?.id ?? '',
      correctOptionText: correctOption?.optionText ?? 'Answer unavailable',
      isCorrect,
    });
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
  const today = normalizeUtcMidnight();

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
      metadata: JSON.stringify({
        quizId,
        scorePct,
        correctCount,
        totalQuestions,
        subjectSlug: quiz.subject.slug,
        weakTopics: Array.from(weakTopicsSet),
      }),
    },
  });

  // Automatically mark any pending Core CS daily mission for today as completed
  await prisma.dailyMission.updateMany({
    where: {
      userId,
      date: today,
      type: 'CORE_CS',
      isCompleted: false,
    },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  }).catch(() => null);

  // Trigger PRS Recalculation
  await calculatePRS(userId);

  return {
    attemptId: attempt.id,
    quizId: quiz.id,
    quizTitle: quiz.title,
    subjectTitle: quiz.subject.title,
    subjectSlug: quiz.subject.slug,
    totalQuestions,
    correctQuestions: correctCount,
    scorePercentage: Math.round(scorePct),
    passed: scorePct >= 60,
    durationSec,
    strongTopics: Array.from(strongTopicsSet).filter((t) => !weakTopicsSet.has(t)),
    weakTopics: Array.from(weakTopicsSet),
    gradedQuestions,
  };
}

/**
 * Retrieves graded review data for a historical completed quiz attempt.
 * Validates ownership securely so students can only inspect their own attempts.
 */
export async function getQuizAttemptReview(
  userId: string,
  attemptId: string
): Promise<QuizSubmissionResult | null> {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      quiz: {
        include: {
          subject: true,
          questions: {
            orderBy: { orderIndex: 'asc' },
            include: {
              options: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    return null;
  }

  const { findTopicForQuestion } = await import('./core-cs-curriculum');

  const strongTopicsSet = new Set<string>();
  const weakTopicsSet = new Set<string>();
  const gradedQuestions: GradedQuestionReview[] = [];

  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  for (const question of attempt.quiz.questions) {
    const userAnswer = answersMap.get(question.id);
    const selectedOption = userAnswer
      ? question.options.find((opt) => opt.id === userAnswer.selectedOptionId)
      : null;
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const isCorrect = userAnswer ? userAnswer.isCorrect : false;

    const topic = findTopicForQuestion(attempt.quiz.subject.slug, question.orderIndex);
    const topicTitle = topic?.title || 'Core CS Placement Foundations';
    const topicSlug = topic?.slug || 'core-cs-foundations';

    if (isCorrect) {
      strongTopicsSet.add(topicTitle);
    } else {
      weakTopicsSet.add(topicTitle);
    }

    gradedQuestions.push({
      questionId: question.id,
      questionText: question.questionText,
      explanation: question.explanation,
      topicTitle,
      topicSlug,
      selectedOptionId: userAnswer?.selectedOptionId ?? null,
      selectedOptionText: selectedOption?.optionText ?? 'No answer provided',
      correctOptionId: correctOption?.id ?? '',
      correctOptionText: correctOption?.optionText ?? 'Answer unavailable',
      isCorrect,
    });
  }

  return {
    attemptId: attempt.id,
    quizId: attempt.quiz.id,
    quizTitle: attempt.quiz.title,
    subjectTitle: attempt.quiz.subject.title,
    subjectSlug: attempt.quiz.subject.slug,
    totalQuestions: attempt.totalQs,
    correctQuestions: attempt.correctQs,
    scorePercentage: Math.round(attempt.scorePct),
    passed: attempt.scorePct >= 60,
    durationSec: attempt.durationSec,
    strongTopics: Array.from(strongTopicsSet).filter((t) => !weakTopicsSet.has(t)),
    weakTopics: Array.from(weakTopicsSet),
    gradedQuestions,
  };
}


/**
 * SuperMemo-derived spaced repetition review logger.
 * Adjusts future intervals dynamically based on candidate recall confidence.
 */
export async function recordRevisionReview(
  userId: string,
  revisionId: string,
  confidence: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
) {
  const revision = await prisma.revision.findFirst({
    where: { id: revisionId, userId },
    include: { problem: true },
  });

  if (!revision) {
    throw new Error('Revision record not found');
  }

  let nextIntervalDays: number;
  if (confidence === 'AGAIN') {
    nextIntervalDays = 1;
  } else if (confidence === 'HARD') {
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
  const today = normalizeUtcMidnight();

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
