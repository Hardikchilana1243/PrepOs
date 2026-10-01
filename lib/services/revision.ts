// ============================================================================
// PREPOS REVISION & SPACED REPETITION SERVICE
// Centralized, Server-Side Authoritative Revision Scheduling & Analytics Engine
// ============================================================================

import prisma from '../db';
import { findTopicForQuestion } from './core-cs-curriculum';
import { calculatePRS } from './readiness-score';

export type RevisionSourceType = 'DSA' | 'CORE_CS' | 'ASSESSMENT' | 'COMPANY';

export type RevisionConfidenceRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY' | 'REVIEW_NEEDED';

export interface RevisionQueueItem {
  id: string;
  sourceType: RevisionSourceType;
  title: string;
  slug?: string;
  topicTitle: string;
  subjectTitle?: string;
  companyName?: string;
  companySlug?: string;
  difficulty?: string;
  statement?: string | null;
  hints?: string[];
  expectedTimeComplexity?: string | null;
  expectedSpaceComplexity?: string | null;
  explanation?: string | null;
  intervalDays: number;
  confidence: string;
  dueAt: string;
  dueAtRaw: string;
  isDue: boolean;
  daysOverdue: number;
  completedAt?: string | null;
  isBookmarked: boolean;
  reviewCount: number;
  problemId?: string;
  assessmentSlug?: string;
}

export interface RevisionSummary {
  dueTodayCount: number;
  overdueCount: number;
  upcomingCount: number;
  completedTodayCount: number;
  remainingTodayCount: number;
  totalTracked: number;
  streakDays: number;
  reviewedTotalCount: number;
}

export interface RevisionAnalytics {
  dueVsCompleted: {
    due: number;
    completedToday: number;
    totalCompleted: number;
  };
  sourceDistribution: {
    dsa: number;
    coreCs: number;
    assessment: number;
    company: number;
  };
  intervalDistribution: {
    learning: number;       // 1 - 3 days
    earlyRetention: number; // 4 - 7 days
    intermediate: number;   // 8 - 14 days
    longTerm: number;       // > 14 days
  };
  recentActivity: Array<{
    id: string;
    title: string;
    confidence: string;
    nextIntervalDays: number;
    timestamp: string;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface RevisionDashboardData {
  summary: RevisionSummary;
  items: RevisionQueueItem[];
  analytics: RevisionAnalytics;
  topics: string[];
  companies: Array<{ name: string; slug: string }>;
}

/**
 * Normalizes a date to UTC midnight for consistent daily boundaries.
 */
function normalizeUtcMidnight(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Retrieves the complete Revision Dashboard state for an authenticated student.
 * Queries are strictly scoped to the student's authenticated userId.
 */
export async function getRevisionDashboardData(userId: string): Promise<RevisionDashboardData> {
  const now = new Date();
  const todayMidnight = normalizeUtcMidnight(now);

  // Parallel database queries with targeted projections
  const [
    revisions,
    bookmarks,
    incorrectQuizAnswers,
    incorrectAssessmentAnswers,
    userProfile,
    streakEvents,
    progressEvents,
  ] = await Promise.all([
    // 1. Spaced Repetition Revisions (DSA Problems)
    prisma.revision.findMany({
      where: { userId },
      select: {
        id: true,
        intervalDays: true,
        confidence: true,
        dueAt: true,
        completedAt: true,
        updatedAt: true,
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
            companyProblems: {
              select: {
                company: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    }),

    // 2. User Bookmarks for fast lookup
    prisma.bookmark.findMany({
      where: { userId },
      select: { problemId: true },
    }),

    // 3. Core CS Quiz Mistakes
    prisma.quizAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: { userId },
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

    // 4. Assessment Evaluation Mistakes
    prisma.assessmentAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: {
          userId,
          status: 'EVALUATED',
        },
      },
      select: {
        id: true,
        marksAwarded: true,
        attempt: {
          select: {
            submittedAt: true,
            updatedAt: true,
            assessment: {
              select: {
                title: true,
                slug: true,
                company: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        question: {
          select: {
            id: true,
            marks: true,
            type: true,
            problem: {
              select: {
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
            mcqQuestion: {
              select: {
                questionText: true,
                explanation: true,
              },
            },
          },
        },
      },
      orderBy: { lastSavedAt: 'desc' },
      take: 15,
    }),

    // 5. User Profile Streak
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: {
          select: {
            streakDays: true,
          },
        },
      },
    }),

    // 6. Streak Events for Revision Activity Trend
    prisma.streakEvent.findMany({
      where: {
        userId,
        activityType: 'REVISION',
      },
      orderBy: { date: 'asc' },
      take: 14,
      select: {
        date: true,
        count: true,
      },
    }),

    // 7. Recent Progress Events for Activity Feed
    prisma.progressEvent.findMany({
      where: {
        userId,
        eventType: 'REVISION_COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        metadata: true,
      },
    }),
  ]);

  const bookmarkedProblemIds = new Set(bookmarks.map((b) => b.problemId));
  const topicsSet = new Set<string>();
  const companiesMap = new Map<string, { name: string; slug: string }>();

  // Process DSA spaced revision items
  const dsaItems: RevisionQueueItem[] = revisions.map((rev) => {
    const dueDate = new Date(rev.dueAt);
    const completedDate = rev.completedAt ? new Date(rev.completedAt) : null;
    const isCompleted = completedDate !== null;

    // Due logic: if not completed, due if dueAt <= now
    const isDue = !isCompleted && dueDate <= now;
    const diffMs = now.getTime() - dueDate.getTime();
    // Overdue if dueAt < today's start and not completed
    const daysOverdue = !isCompleted && dueDate < todayMidnight ? Math.max(1, Math.floor(diffMs / 86400000)) : 0;

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

    if (rev.problem.topic?.title) {
      topicsSet.add(rev.problem.topic.title);
    }

    const firstCompany = rev.problem.companyProblems?.[0]?.company;
    if (firstCompany) {
      companiesMap.set(firstCompany.slug, { name: firstCompany.name, slug: firstCompany.slug });
    }

    const isBookmarked = bookmarkedProblemIds.has(rev.problem.id);

    return {
      id: rev.id,
      sourceType: 'DSA',
      title: rev.problem.title,
      slug: rev.problem.slug,
      problemId: rev.problem.id,
      difficulty: rev.problem.difficulty,
      topicTitle: rev.problem.topic?.title || 'Algorithmic Problem',
      companyName: firstCompany?.name,
      companySlug: firstCompany?.slug,
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
      isBookmarked,
      reviewCount: rev.intervalDays >= 14 ? 3 : rev.intervalDays >= 7 ? 2 : 1,
    };
  });

  // De-duplicate Core CS mistakes
  const coreCsMap = new Map<
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

  for (const ans of incorrectQuizAnswers) {
    const sSlug = ans.attempt.quiz.subject.slug;
    const topic = findTopicForQuestion(sSlug, ans.question.orderIndex);
    const qId = ans.question.id;
    const existing = coreCsMap.get(qId);

    if (existing) {
      existing.missCount += 1;
      if (ans.attempt.completedAt > existing.lastDate) {
        existing.lastDate = ans.attempt.completedAt;
      }
    } else {
      coreCsMap.set(qId, {
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

  const coreCsItems: RevisionQueueItem[] = Array.from(coreCsMap.values())
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, 10)
    .map((info) => {
      topicsSet.add(info.topicTitle);
      return {
        id: `cs-review-${info.id}`,
        sourceType: 'CORE_CS',
        title: info.questionText,
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
        isBookmarked: false,
        reviewCount: info.missCount,
      };
    });

  // De-duplicate Assessment mistakes
  const assessmentMap = new Map<string, RevisionQueueItem>();

  for (const ans of incorrectAssessmentAnswers) {
    const aTitle = ans.attempt.assessment.title;
    const aSlug = ans.attempt.assessment.slug;
    const comp = ans.attempt.assessment.company;
    if (comp) {
      companiesMap.set(comp.slug, { name: comp.name, slug: comp.slug });
    }

    const q = ans.question;
    const isCoding = q.type === 'CODING' && q.problem;
    const title = isCoding ? q.problem!.title : q.mcqQuestion?.questionText || 'Assessment Question';
    const topic = isCoding ? q.problem!.topic?.title || 'Online Assessment Coding' : 'OA Placement Screening';
    topicsSet.add(topic);

    const key = `assessment-${ans.id}`;
    if (!assessmentMap.has(key)) {
      assessmentMap.set(key, {
        id: key,
        sourceType: 'ASSESSMENT',
        title,
        slug: isCoding ? q.problem?.slug : undefined,
        topicTitle: topic,
        companyName: comp?.name,
        companySlug: comp?.slug,
        difficulty: isCoding ? q.problem?.difficulty : 'MEDIUM',
        explanation: q.mcqQuestion?.explanation,
        intervalDays: 1,
        confidence: 'REVIEW_NEEDED',
        dueAt: new Date(ans.attempt.submittedAt || ans.attempt.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        dueAtRaw: (ans.attempt.submittedAt || ans.attempt.updatedAt).toISOString(),
        isDue: true,
        daysOverdue: 0,
        completedAt: null,
        isBookmarked: false,
        reviewCount: 1,
        assessmentSlug: aSlug,
      });
    }
  }

  const assessmentItems = Array.from(assessmentMap.values()).slice(0, 8);

  const allItems: RevisionQueueItem[] = [...dsaItems, ...coreCsItems, ...assessmentItems];

  // Calculate accurate summary counts
  let dueTodayCount = 0;
  let overdueCount = 0;
  let upcomingCount = 0;
  let completedTodayCount = 0;
  let reviewedTotalCount = 0;

  for (const item of allItems) {
    if (item.completedAt) {
      reviewedTotalCount++;
      const compDate = new Date(item.completedAt);
      if (compDate >= todayMidnight) {
        completedTodayCount++;
      }
    } else {
      if (item.daysOverdue > 0) {
        overdueCount++;
      } else if (item.isDue) {
        dueTodayCount++;
      } else {
        upcomingCount++;
      }
    }
  }

  const remainingTodayCount = dueTodayCount + overdueCount;
  const streakDays = userProfile?.profile?.streakDays ?? 0;

  // Source Distribution
  let dsaCount = 0;
  let coreCsCount = 0;
  let assessmentCount = 0;
  let companyLinkedCount = 0;

  for (const item of allItems) {
    if (item.sourceType === 'DSA') dsaCount++;
    else if (item.sourceType === 'CORE_CS') coreCsCount++;
    else if (item.sourceType === 'ASSESSMENT') assessmentCount++;

    if (item.companySlug) companyLinkedCount++;
  }

  // Interval Distribution across scheduled items
  let learningCount = 0;
  let earlyRetentionCount = 0;
  let intermediateCount = 0;
  let longTermCount = 0;

  for (const item of allItems) {
    if (item.intervalDays <= 3) learningCount++;
    else if (item.intervalDays <= 7) earlyRetentionCount++;
    else if (item.intervalDays <= 14) intermediateCount++;
    else longTermCount++;
  }

  // Activity Feed formatting
  const recentActivity = progressEvents.map((ev) => {
    let title = 'Spaced Recall Session';
    let confidence = 'GOOD';
    let nextIntervalDays = 7;

    if (ev.metadata) {
      try {
        const meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata) : (ev.metadata as any);
        if (meta?.confidence) confidence = meta.confidence;
        if (meta?.nextIntervalDays) nextIntervalDays = meta.nextIntervalDays;
        if (meta?.problemTitle) title = meta.problemTitle;
      } catch {
        // Ignore metadata parse errors
      }
    }

    return {
      id: ev.id,
      title,
      confidence,
      nextIntervalDays,
      timestamp: ev.createdAt.toISOString(),
    };
  });

  // Daily Trend calculation from real StreakEvents
  const dailyTrend = streakEvents.map((se) => ({
    date: new Date(se.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: se.count,
  }));

  return {
    summary: {
      dueTodayCount,
      overdueCount,
      upcomingCount,
      completedTodayCount,
      remainingTodayCount,
      totalTracked: allItems.length,
      streakDays,
      reviewedTotalCount,
    },
    items: allItems,
    analytics: {
      dueVsCompleted: {
        due: remainingTodayCount,
        completedToday: completedTodayCount,
        totalCompleted: reviewedTotalCount,
      },
      sourceDistribution: {
        dsa: dsaCount,
        coreCs: coreCsCount,
        assessment: assessmentCount,
        company: companyLinkedCount,
      },
      intervalDistribution: {
        learning: learningCount,
        earlyRetention: earlyRetentionCount,
        intermediate: intermediateCount,
        longTerm: longTermCount,
      },
      recentActivity,
      dailyTrend,
    },
    topics: Array.from(topicsSet).sort(),
    companies: Array.from(companiesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/**
 * SuperMemo SM-2 Spaced Repetition Review Logger.
 * Strictly scoped to authenticated userId.
 */
export async function recordRevisionReview(
  userId: string,
  revisionId: string,
  confidence: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
): Promise<{ nextIntervalDays: number; nextDue: Date }> {
  const revision = await prisma.revision.findFirst({
    where: { id: revisionId, userId },
    include: { problem: true },
  });

  if (!revision) {
    throw new Error('Revision record not found or not owned by user');
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

  // Record streak activity event
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
        problemTitle: revision.problem?.title || 'DSA Problem',
        confidence,
        nextIntervalDays,
      }),
    },
  });

  // Recalculate candidate Placement Readiness Score (PRS)
  await calculatePRS(userId).catch(() => null);

  return { nextIntervalDays, nextDue };
}

/**
 * Toggles bookmark for a problem for authenticated student.
 */
export async function toggleProblemBookmark(
  userId: string,
  problemId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_problemId: {
        userId,
        problemId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    return { success: true, isBookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        problemId,
      },
    });
    return { success: true, isBookmarked: true };
  }
}
