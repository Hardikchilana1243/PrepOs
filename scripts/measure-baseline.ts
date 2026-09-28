import prisma from '../lib/db';
import { getDashboardData } from '../lib/services/dashboard';
import { getDSARoadmapData, getProblemDetailData } from '../lib/services/dsa-roadmap';
import { getReadinessScore } from '../lib/services/readiness-score';

async function runProfile() {
  console.log('====================================================');
  console.log('PREPOS BASELINE PERFORMANCE AUDIT');
  console.log('====================================================\n');

  // Find a test user with solved history
  const user = await prisma.user.findFirst({
    where: { email: 'priya.candidate@univ.edu' },
    include: { profile: true },
  });

  if (!user) {
    console.error('Test user not found');
    process.exit(1);
  }

  const userId = user.id;
  console.log(`Profiling with User ID: ${userId} (${user.name})`);

  // 1. Dashboard Service
  const t0 = performance.now();
  const dashboardData = await getDashboardData(userId);
  const tDashboard = performance.now() - t0;
  const dashboardPayloadBytes = Buffer.byteLength(JSON.stringify(dashboardData), 'utf8');
  console.log(`[1] /dashboard data load: ${tDashboard.toFixed(2)} ms (Payload: ${(dashboardPayloadBytes / 1024).toFixed(2)} KB)`);

  // 2. DSA Roadmap Service
  const t1 = performance.now();
  const roadmapData = await getDSARoadmapData(userId);
  const tRoadmap = performance.now() - t1;
  const roadmapPayloadBytes = Buffer.byteLength(JSON.stringify(roadmapData), 'utf8');
  console.log(`[2] /dashboard/dsa roadmap load: ${tRoadmap.toFixed(2)} ms (Payload: ${(roadmapPayloadBytes / 1024).toFixed(2)} KB, Problems: ${roadmapData.allProblems.length})`);

  // 3. Problem Detail (array-element-frequency-counter)
  const problemSlug = 'array-element-frequency-counter';
  const t2 = performance.now();
  const problemData = await getProblemDetailData(userId, problemSlug);
  const tProblem = performance.now() - t2;
  const problemPayloadBytes = Buffer.byteLength(JSON.stringify(problemData), 'utf8');
  console.log(`[3] Problem Workspace (${problemSlug}): ${tProblem.toFixed(2)} ms (Payload: ${(problemPayloadBytes / 1024).toFixed(2)} KB)`);

  // 4. Core CS Queries
  const t3 = performance.now();
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
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
  ]);
  const tCoreCS = performance.now() - t3;
  const coreCsPayloadBytes = Buffer.byteLength(JSON.stringify({ quizzes, attempts }), 'utf8');
  console.log(`[4] /dashboard/core-cs queries: ${tCoreCS.toFixed(2)} ms (Payload: ${(coreCsPayloadBytes / 1024).toFixed(2)} KB)`);

  // 5. Companies Queries
  const t4 = performance.now();
  const [companies, userProgress] = await Promise.all([
    prisma.company.findMany({
      include: {
        patterns: { orderBy: { frequencyPct: 'desc' } },
        assessments: { take: 1 },
        companyProblems: { include: { problem: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.userProgress.findMany({
      where: { userId, isSolved: true },
      select: { problemId: true },
    }),
  ]);
  const tCompanies = performance.now() - t4;
  const companiesPayloadBytes = Buffer.byteLength(JSON.stringify({ companies, userProgress }), 'utf8');
  console.log(`[5] /dashboard/companies queries: ${tCompanies.toFixed(2)} ms (Payload: ${(companiesPayloadBytes / 1024).toFixed(2)} KB)`);

  // 6. Revision Queries
  const t5 = performance.now();
  const revisions = await prisma.revision.findMany({
    where: { userId },
    include: {
      problem: {
        include: { topic: true },
      },
    },
    orderBy: { dueAt: 'asc' },
  });
  const tRevision = performance.now() - t5;
  const revisionPayloadBytes = Buffer.byteLength(JSON.stringify(revisions), 'utf8');
  console.log(`[6] /dashboard/revision queries: ${tRevision.toFixed(2)} ms (Payload: ${(revisionPayloadBytes / 1024).toFixed(2)} KB)`);

  // 7. Profile Queries
  const t6 = performance.now();
  const [dbUser, readiness, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    }),
    getReadinessScore(userId),
    prisma.readinessScoreHistory.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 15,
    }),
  ]);
  const tProfile = performance.now() - t6;
  const profilePayloadBytes = Buffer.byteLength(JSON.stringify({ dbUser, readiness, history }), 'utf8');
  console.log(`[7] /dashboard/profile queries: ${tProfile.toFixed(2)} ms (Payload: ${(profilePayloadBytes / 1024).toFixed(2)} KB)`);

  console.log('\n====================================================\n');
}

runProfile().catch(console.error).finally(() => process.exit(0));
