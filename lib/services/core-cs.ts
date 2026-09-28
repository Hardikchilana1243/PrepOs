// ============================================================================
// PREPOS CORE CS SERVICE
// Placement Hub Aggregations, Weak Areas Detection & Curriculum Mapping
// ============================================================================

import prisma from '../db';
import {
  DBMS_TOPICS,
  OS_TOPICS,
  CoreCSTopic,
  findTopicForQuestion,
  getTopicsForSubject,
} from './core-cs-curriculum';

export interface SubjectStats {
  slug: string;
  title: string;
  description: string;
  quizId: string;
  quizSlug: string;
  totalQuestions: number;
  durationMin: number;
  attemptsCount: number;
  bestScorePct: number | null;
  avgScorePct: number | null;
  lastAttemptAt: string | null;
  topicsCount: number;
}

export interface WeakAreaItem {
  topicTitle: string;
  topicSlug: string;
  subjectSlug: string;
  missCount: number;
  totalAssociatedQs: number;
  placementRelevance: string;
}

export interface RevisionQuestionItem {
  id: string;
  questionText: string;
  topicTitle: string;
  subjectTitle: string;
  subjectSlug: string;
  missedTimes: number;
  lastMissedAt: string;
}

export interface RecommendedDrill {
  quizId: string;
  quizSlug: string;
  quizTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  durationMin: number;
  totalQuestions: number;
  reason: string;
  focusTopics: string[];
}

export interface ClientMCQOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface ClientMCQQuestion {
  id: string;
  questionText: string;
  orderIndex: number;
  topicTitle: string;
  topicSlug: string;
  options: ClientMCQOption[];
}

export interface ClientQuiz {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
  totalQuestions: number;
  subjectSlug: string;
  subjectTitle: string;
  questions: ClientMCQQuestion[];
}

export interface HubAttemptItem {
  id: string;
  quizTitle: string;
  subjectTitle: string;
  subjectSlug: string;
  scorePct: number;
  correctQs: number;
  totalQs: number;
  durationSec: number;
  completedAt: string;
  passed: boolean;
}

export interface CoreCSHubData {
  subjects: SubjectStats[];
  recommendedDrill: RecommendedDrill;
  weakAreas: WeakAreaItem[];
  revisionQuestions: RevisionQuestionItem[];
  dbmsTopics: CoreCSTopic[];
  osTopics: CoreCSTopic[];
  recentAttempts: HubAttemptItem[];
  quizzes: ClientQuiz[];
}

/**
 * Fetch and assemble all data needed for the Core CS Hub.
 * CRITICAL SECURITY: Never selects or exposes question explanation or option.isCorrect
 * to prevent leaking quiz answer keys to the client browser prior to submission.
 */
export async function getCoreCSHubData(userId: string): Promise<CoreCSHubData> {
  const [dbQuizzes, attempts, incorrectAnswers] = await Promise.all([
    prisma.coreCSQuiz.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        durationMin: true,
        subject: {
          select: {
            slug: true,
            title: true,
            description: true,
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            questionText: true,
            orderIndex: true,
            // explanation is omitted for security!
            options: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                optionText: true,
                orderIndex: true,
                // isCorrect is omitted for security!
              },
            },
          },
        },
      },
    }),

    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        scorePct: true,
        correctQs: true,
        totalQs: true,
        durationSec: true,
        completedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
            subject: {
              select: {
                slug: true,
                title: true,
              },
            },
          },
        },
      },
    }),

    // Query incorrect answers for weak areas analysis
    prisma.quizAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: { userId },
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
      take: 50,
    }),
  ]);

  // Format Quizzes with mapped topic metadata
  const clientQuizzes: ClientQuiz[] = dbQuizzes.map((quiz) => ({
    id: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    durationMin: quiz.durationMin,
    totalQuestions: quiz.questions.length,
    subjectSlug: quiz.subject.slug,
    subjectTitle: quiz.subject.title,
    questions: quiz.questions.map((q) => {
      const topic = findTopicForQuestion(quiz.subject.slug, q.orderIndex);
      return {
        id: q.id,
        questionText: q.questionText,
        orderIndex: q.orderIndex,
        topicTitle: topic?.title || 'Placement Concept',
        topicSlug: topic?.slug || 'placement-concept',
        options: q.options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          orderIndex: opt.orderIndex,
        })),
      };
    }),
  }));

  // Group attempts by subject
  const attemptsBySubject: Record<string, typeof attempts> = {
    dbms: [],
    os: [],
  };

  attempts.forEach((a) => {
    const sSlug = a.quiz.subject.slug;
    if (attemptsBySubject[sSlug]) {
      attemptsBySubject[sSlug].push(a);
    }
  });

  // Calculate subject stats
  const subjectStatsList: SubjectStats[] = clientQuizzes.map((quiz) => {
    const sSlug = quiz.subjectSlug;
    const sAttempts = attemptsBySubject[sSlug] || [];
    const count = sAttempts.length;

    let bestScore: number | null = null;
    let avgScore: number | null = null;
    let lastDate: string | null = null;

    if (count > 0) {
      bestScore = Math.round(Math.max(...sAttempts.map((a) => a.scorePct)));
      const sum = sAttempts.reduce((acc, a) => acc + a.scorePct, 0);
      avgScore = Math.round(sum / count);
      lastDate = new Date(sAttempts[0].completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    const topics = getTopicsForSubject(sSlug);

    return {
      slug: sSlug,
      title: quiz.subjectTitle,
      description: quiz.description || '',
      quizId: quiz.id,
      quizSlug: quiz.slug,
      totalQuestions: quiz.totalQuestions,
      durationMin: quiz.durationMin,
      attemptsCount: count,
      bestScorePct: bestScore,
      avgScorePct: avgScore,
      lastAttemptAt: lastDate,
      topicsCount: topics.length,
    };
  });

  // Calculate Weak Areas from incorrect responses
  const topicMissMap = new Map<string, { topic: CoreCSTopic; missCount: number }>();
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

    if (topic) {
      const existing = topicMissMap.get(topic.id);
      if (existing) {
        existing.missCount += 1;
      } else {
        topicMissMap.set(topic.id, { topic, missCount: 1 });
      }
    }

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

  const weakAreas: WeakAreaItem[] = Array.from(topicMissMap.values())
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, 4)
    .map(({ topic, missCount }) => ({
      topicTitle: topic.title,
      topicSlug: topic.slug,
      subjectSlug: topic.subjectSlug,
      missCount,
      totalAssociatedQs: topic.questionIndices.length,
      placementRelevance: topic.placementRelevance,
    }));

  const revisionQuestions: RevisionQuestionItem[] = Array.from(questionMissMap.entries())
    .sort((a, b) => b[1].missCount - a[1].missCount)
    .slice(0, 5)
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

  // Determine Today's Recommended Drill
  let recommendedSubject = 'dbms';
  let drillReason = 'Build high-frequency database diagnostic calibration.';

  const dbmsStat = subjectStatsList.find((s) => s.slug === 'dbms');
  const osStat = subjectStatsList.find((s) => s.slug === 'os');

  if (dbmsStat && osStat) {
    if (dbmsStat.attemptsCount === 0 && osStat.attemptsCount === 0) {
      recommendedSubject = 'dbms';
      drillReason = 'Start with DBMS to establish your Core CS baseline score.';
    } else if (dbmsStat.attemptsCount > 0 && osStat.attemptsCount === 0) {
      recommendedSubject = 'os';
      drillReason = 'Balance your Core CS readiness with Operating Systems Concurrency.';
    } else if (dbmsStat.attemptsCount === 0 && osStat.attemptsCount > 0) {
      recommendedSubject = 'dbms';
      drillReason = 'Complete your DBMS assessment to balance your 30% Core CS PRS component.';
    } else {
      // Both attempted: recommend subject with lower average score or higher misses
      const dbmsAvg = dbmsStat.avgScorePct ?? 0;
      const osAvg = osStat.avgScorePct ?? 0;
      if (dbmsAvg < osAvg) {
        recommendedSubject = 'dbms';
        drillReason = `Recommended to boost your DBMS score (currently ${dbmsAvg}% vs OS ${osAvg}%).`;
      } else {
        recommendedSubject = 'os';
        drillReason = `Recommended to boost your OS score (currently ${osAvg}% vs DBMS ${dbmsAvg}%).`;
      }
    }
  }

  const recQuiz = clientQuizzes.find((q) => q.subjectSlug === recommendedSubject) || clientQuizzes[0];
  const recTopics = getTopicsForSubject(recommendedSubject).map((t) => t.title).slice(0, 3);

  const recommendedDrill: RecommendedDrill = {
    quizId: recQuiz?.id || '',
    quizSlug: recQuiz?.slug || 'dbms-placement-quiz',
    quizTitle: recQuiz?.title || 'Core CS Placement Drill',
    subjectSlug: recQuiz?.subjectSlug || 'dbms',
    subjectTitle: recQuiz?.subjectTitle || 'Database Management Systems',
    durationMin: recQuiz?.durationMin || 15,
    totalQuestions: recQuiz?.totalQuestions || 10,
    reason: drillReason,
    focusTopics: recTopics,
  };

  // Format recent attempts
  const recentAttempts: HubAttemptItem[] = attempts.map((a) => ({
    id: a.id,
    quizTitle: a.quiz.title,
    subjectTitle: a.quiz.subject.title,
    subjectSlug: a.quiz.subject.slug,
    scorePct: Math.round(a.scorePct),
    correctQs: a.correctQs,
    totalQs: a.totalQs,
    durationSec: a.durationSec,
    completedAt: new Date(a.completedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    passed: a.scorePct >= 60,
  }));

  return {
    subjects: subjectStatsList,
    recommendedDrill,
    weakAreas,
    revisionQuestions,
    dbmsTopics: DBMS_TOPICS,
    osTopics: OS_TOPICS,
    recentAttempts,
    quizzes: clientQuizzes,
  };
}
