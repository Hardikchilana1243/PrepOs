// ============================================================================
// PREPOS DAILY MISSION SERVICE
// Deterministic, Idempotent 3-Task Daily Preparation Plan
// ============================================================================

import prisma from '../db';

export interface MissionItem {
  id: string;
  title: string;
  description: string | null;
  type: string; // 'DSA' | 'CORE_CS' | 'REVISION'
  targetId: string | null;
  targetUrl: string;
  isCompleted: boolean;
}

export async function getOrCreateDailyMissions(userId: string): Promise<MissionItem[]> {
  // Normalize today's date to midnight UTC to ensure idempotent daily grouping
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

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

  // 2. Otherwise, dynamically generate today's 3 tasks
  // Task 1: Find next unsolved DSA problem from roadmap
  const solvedProblemIds = (
    await prisma.userProgress.findMany({
      where: { userId, isSolved: true },
      select: { problemId: true },
    })
  ).map((p) => p.problemId);

  const nextProblem = await prisma.problem.findFirst({
    where: {
      id: { notIn: solvedProblemIds },
      status: 'PUBLISHED',
    },
    orderBy: { createdAt: 'asc' },
  });

  const dsaTargetId = nextProblem?.slug ?? 'array-element-frequency-counter';
  const dsaTitle = nextProblem
    ? `Solve DSA: ${nextProblem.title}`
    : 'Complete Advanced DSA Review';
  const dsaDesc = nextProblem
    ? `Target: ${nextProblem.difficulty} problem covering ${nextProblem.slug.split('-').slice(0, 2).join(' ')}.`
    : 'Review your previously solved algorithms and edge cases.';

  // Task 2: Core CS Speed Drill (DBMS or OS)
  const dbmsQuiz = await prisma.coreCSQuiz.findFirst({
    where: { slug: 'dbms-placement-quiz' },
  });
  const coreCsTargetId = dbmsQuiz?.slug ?? 'dbms-placement-quiz';
  const coreCsTitle = 'Complete DBMS Speed Drill (10 MCQs)';
  const coreCsDesc = 'Review ACID properties, normalization, indexing, and SQL transactions.';

  // Task 3: Spaced Repetition / Placement Pattern Review
  const revTitle = 'Revise Placement High-Yield Pattern';
  const revDesc = 'Review Sliding Window and Fast-Slow Pointer invariants in the Roadmap.';

  const missionTemplates = [
    {
      title: dsaTitle,
      description: dsaDesc,
      type: 'DSA',
      targetId: dsaTargetId,
    },
    {
      title: coreCsTitle,
      description: coreCsDesc,
      type: 'CORE_CS',
      targetId: coreCsTargetId,
    },
    {
      title: revTitle,
      description: revDesc,
      type: 'REVISION',
      targetId: 'revision-queue',
    },
  ];

  const createdMissions: MissionItem[] = [];

  for (const template of missionTemplates) {
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
      return targetId ? `/dashboard/dsa?problem=${targetId}` : '/dashboard/dsa';
    case 'CORE_CS':
      return targetId ? `/dashboard/core-cs?quiz=${targetId}` : '/dashboard/core-cs';
    case 'REVISION':
      return '/dashboard/revision';
    default:
      return '/dashboard';
  }
}
