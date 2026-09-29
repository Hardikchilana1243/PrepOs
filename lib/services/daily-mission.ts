// ============================================================================
// PREPOS DAILY MISSION SERVICE
// Deterministic, Adaptive 3-Task Daily Preparation Plan
// Driven by Real Database Preparation Gaps & SM-2 Intervals
// ============================================================================

import prisma from '../db';
import { normalizeUtcMidnight } from '../utils/date';

export interface MissionItem {
  id: string;
  title: string;
  description: string | null;
  type: string; // 'DSA' | 'CORE_CS' | 'REVISION' | 'ASSESSMENT' | 'COMPANY'
  targetId: string | null;
  targetUrl: string;
  isCompleted: boolean;
}

export async function getOrCreateDailyMissions(userId: string): Promise<MissionItem[]> {
  // Normalize today's date to midnight UTC to ensure idempotent daily grouping
  const today = normalizeUtcMidnight();

  // 1. Check if missions already exist for today
  const existingMissions = await prisma.dailyMission.findMany({
    where: {
      userId,
      date: today,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (existingMissions.length >= 3) {
    return existingMissions.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      targetId: m.targetId,
      targetUrl: getMissionTargetUrl(m.type, m.targetId),
      isCompleted: m.isCompleted,
    }));
  }

  // 2. Dynamically generate today's 3 tasks using deterministic gap precedence:
  //    Precedence:
  //    1. Overdue spaced revision
  //    2. Critical unattempted Core CS diagnostic
  //    3. Significant Core CS gap (<70%)
  //    4. Missing mock assessment / OA exposure
  //    5. Next DSA progression problem
  //    6. Consistency-building spaced review
  //    7. Company-specific practice

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    overdueRevision,
    solvedProgress,
    allQuizzes,
    quizAttempts,
    oaAttemptsCount,
    publishedAssessment,
  ] = await Promise.all([
    prisma.revision.findFirst({
      where: {
        userId,
        dueAt: { lte: oneDayAgo },
        completedAt: null,
      },
      include: {
        problem: {
          select: { title: true, slug: true, difficulty: true },
        },
      },
      orderBy: { dueAt: 'asc' },
    }),
    prisma.userProgress.findMany({
      where: { userId, isSolved: true },
      select: { problemId: true },
    }),
    prisma.coreCSQuiz.findMany({
      include: {
        subject: { select: { title: true } },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      select: { quizId: true, scorePct: true },
    }),
    prisma.assessmentAttempt.count({
      where: {
        userId,
        status: { in: ['SUBMITTED', 'EVALUATING', 'EVALUATED', 'EXPIRED'] },
      },
    }),
    prisma.assessment.findFirst({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, durationMin: true },
      orderBy: { orderIndex: 'asc' },
    }),
  ]);

  const solvedProblemIds = solvedProgress.map((p) => p.problemId);

  // Next unsolved problem
  const nextProblem = await prisma.problem.findFirst({
    where: {
      id: { notIn: solvedProblemIds },
      status: 'PUBLISHED',
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, slug: true, difficulty: true },
  });

  const attemptedQuizIds = new Set(quizAttempts.map((a) => a.quizId));
  const unattemptedQuizzes = allQuizzes.filter((q) => !attemptedQuizIds.has(q.id));

  const coreCsAvgScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + a.scorePct, 0) / quizAttempts.length)
      : 0;

  const lowestScoreAttempt = quizAttempts.length > 0
    ? [...quizAttempts].sort((a, b) => a.scorePct - b.scorePct)[0]
    : null;
  const lowestScoreQuiz = lowestScoreAttempt
    ? allQuizzes.find((q) => q.id === lowestScoreAttempt.quizId)
    : null;

  // Build ordered candidate list
  interface MissionCandidate {
    title: string;
    description: string;
    type: 'DSA' | 'CORE_CS' | 'REVISION' | 'ASSESSMENT' | 'COMPANY';
    targetId: string | null;
  }

  const candidatePool: MissionCandidate[] = [];

  // Priority 1: Overdue Spaced Revision
  if (overdueRevision) {
    candidatePool.push({
      title: `Recall Overdue Problem: ${overdueRevision.problem.title}`,
      description: `Spaced recall window passed. Review ${overdueRevision.problem.difficulty} problem to lock in algorithmic retention.`,
      type: 'REVISION',
      targetId: 'revision-queue',
    });
  }

  // Priority 2: Critical Unattempted Diagnostic
  if (unattemptedQuizzes.length > 0) {
    const q = unattemptedQuizzes[0];
    candidatePool.push({
      title: `Diagnostic Drill: ${q.title}`,
      description: `Establish baseline screening score in ${q.subject.title} (10 MCQs).`,
      type: 'CORE_CS',
      targetId: q.slug,
    });
  }

  // Priority 3: Significant Core CS Gap (< 70%)
  if (coreCsAvgScore < 70 && lowestScoreQuiz && lowestScoreAttempt) {
    candidatePool.push({
      title: `Retake Drill: ${lowestScoreQuiz.title}`,
      description: `Raise score from ${Math.round(lowestScoreAttempt.scorePct)}% to clear the 70% screening benchmark.`,
      type: 'CORE_CS',
      targetId: lowestScoreQuiz.slug,
    });
  }

  // Priority 4: Missing Mock OA Exposure
  if (oaAttemptsCount === 0 && publishedAssessment) {
    candidatePool.push({
      title: `Mock Assessment: ${publishedAssessment.title}`,
      description: `Calibrate timed multi-section exam stamina (${publishedAssessment.durationMin} mins, Coding + MCQs).`,
      type: 'ASSESSMENT',
      targetId: publishedAssessment.slug,
    });
  }

  // Priority 5: Next DSA Progression Problem
  if (nextProblem) {
    candidatePool.push({
      title: `Solve DSA: ${nextProblem.title}`,
      description: `Target: ${nextProblem.difficulty} problem covering ${nextProblem.slug.split('-').slice(0, 2).join(' ')}.`,
      type: 'DSA',
      targetId: nextProblem.slug,
    });
  } else {
    candidatePool.push({
      title: 'Complete Advanced DSA Review',
      description: 'Review your previously solved algorithms and edge cases.',
      type: 'DSA',
      targetId: 'dsa-roadmap',
    });
  }

  // Priority 6: Consistency-building recall
  candidatePool.push({
    title: 'Revise High-Yield Placement Patterns',
    description: 'Review Sliding Window and Fast-Slow Pointer invariants in the Roadmap.',
    type: 'REVISION',
    targetId: 'revision-queue',
  });

  // Priority 7: Company-specific practice
  candidatePool.push({
    title: 'Review Verified Recruiter Patterns',
    description: 'Study verified interview question distributions and hiring patterns.',
    type: 'COMPANY',
    targetId: 'company-hubs',
  });

  // Pick the top 3 distinct candidates ensuring unique titles and types where possible
  const selectedMissions: MissionCandidate[] = [];
  const usedTitles = new Set<string>();

  for (const candidate of candidatePool) {
    if (!usedTitles.has(candidate.title)) {
      selectedMissions.push(candidate);
      usedTitles.add(candidate.title);
    }
    if (selectedMissions.length >= 3) break;
  }

  // Fallback to guarantee at least 3
  while (selectedMissions.length < 3) {
    selectedMissions.push({
      title: `Daily Placement Milestone ${selectedMissions.length + 1}`,
      description: 'Continue daily placement preparation consistency.',
      type: 'DSA',
      targetId: 'roadmap',
    });
  }

  const createdMissions: MissionItem[] = [];

  for (const template of selectedMissions) {
    const record = await prisma.dailyMission.upsert({
      where: {
        userId_date_title: {
          userId,
          date: today,
          title: template.title,
        },
      },
      update: {
        description: template.description,
        type: template.type,
        targetId: template.targetId,
      },
      create: {
        userId,
        date: today,
        title: template.title,
        description: template.description,
        type: template.type,
        targetId: template.targetId,
      },
    });

    createdMissions.push({
      id: record.id,
      title: record.title,
      description: record.description,
      type: record.type,
      targetId: record.targetId,
      targetUrl: getMissionTargetUrl(record.type, record.targetId),
      isCompleted: record.isCompleted,
    });
  }

  return createdMissions;
}

export async function toggleMissionCompletion(
  userId: string,
  missionId: string,
  isCompleted: boolean
): Promise<boolean> {
  const mission = await prisma.dailyMission.findFirst({
    where: { id: missionId, userId },
  });

  if (!mission) {
    return false;
  }

  await prisma.dailyMission.update({
    where: { id: missionId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  return true;
}

function getMissionTargetUrl(type: string, targetId: string | null): string {
  switch (type) {
    case 'DSA':
      return targetId && targetId !== 'dsa-roadmap' && targetId !== 'roadmap'
        ? `/dashboard/dsa/problem/${targetId}`
        : '/dashboard/dsa';
    case 'CORE_CS':
      return targetId ? `/dashboard/core-cs?quiz=${targetId}` : '/dashboard/core-cs';
    case 'REVISION':
      return '/dashboard/revision';
    case 'ASSESSMENT':
      return targetId ? `/dashboard/assessments/${targetId}` : '/dashboard/assessments';
    case 'COMPANY':
      return '/dashboard/companies';
    default:
      return '/dashboard';
  }
}
