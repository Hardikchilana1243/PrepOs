import prisma from '../lib/db';
import { getPrimaryDashboardData, getPreparationPillarsData } from '../lib/services/dashboard';
import { getDSARoadmapData, getProblemDetailData } from '../lib/services/dsa-roadmap';
import { getCoreCSHubData } from '../lib/services/core-cs';
import { getAssessmentOverview, getAssessmentWorkspaceData } from '../lib/services/assessment';
import { compileResultSummary } from '../lib/services/assessment-scoring';
import { calculatePRS } from '../lib/services/readiness-score';

interface CapturedQuery {
  model?: string;
  action: string;
  args?: any;
}

const capturedQueries: CapturedQuery[] = [];

(prisma as any).$use(async (params: any, next: any) => {
  capturedQueries.push({
    model: params.model,
    action: params.action,
    args: params.args,
  });
  return next(params);
});

async function runBaseline() {
  console.log('====================================================');
  console.log('PREPOS BASELINE PERFORMANCE & EXACT QUERY AUDIT');
  console.log('====================================================\n');

  const user = await prisma.user.findFirst({
    where: { email: 'priya.candidate@univ.edu' },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('Test user not found');
  }

  const userId = user.id;

  interface BenchmarkRecord {
    operation: string;
    durationMs: number;
    queryCount: number;
    payloadKb: number;
    queryList: string[];
  }

  const records: BenchmarkRecord[] = [];

  async function benchmark(name: string, fn: () => Promise<any>): Promise<any> {
    capturedQueries.length = 0;
    const start = performance.now();
    const result = await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const payloadBytes = Buffer.byteLength(JSON.stringify(result || {}));
    const queryList = capturedQueries.map(
      (q) => `${q.model ? q.model + '.' : ''}${q.action}`
    );
    records.push({
      operation: name,
      durationMs,
      queryCount: capturedQueries.length,
      payloadKb: Math.round((payloadBytes / 1024) * 100) / 100,
      queryList: [...queryList],
    });
    return result;
  }

  // 1. Primary Dashboard Data
  await benchmark('1. Primary Dashboard Data', () => getPrimaryDashboardData(userId));

  // 2. Preparation Pillars Data
  await benchmark('2. Preparation Pillars Data', () => getPreparationPillarsData(userId));

  // 3. Combined Dashboard Page Data (as executed in app/dashboard/page.tsx)
  await benchmark('3. Combined Dashboard Full Load', async () => {
    const primary = await getPrimaryDashboardData(userId);
    const pillars = await getPreparationPillarsData(userId);
    return { primary, pillars };
  });

  // 4. calculatePRS in isolation
  await benchmark('4. calculatePRS (in isolation)', () => calculatePRS(userId));

  // 5. DSA Roadmap Data
  await benchmark('5. DSA Roadmap Data', () => getDSARoadmapData(userId));

  // 6. DSA Problem Detail
  await benchmark('6. DSA Problem Detail (array-element-frequency-counter)', () =>
    getProblemDetailData(userId, 'array-element-frequency-counter')
  );

  // 7. Core CS Hub Data
  await benchmark('7. Core CS Hub Data', () => getCoreCSHubData(userId));

  // 8. Companies Page Query
  await benchmark('8. Companies Page Data', async () => {
    return prisma.company.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        patterns: {
          orderBy: { frequencyPct: 'desc' },
          select: { patternName: true, frequencyPct: true },
        },
        assessments: {
          where: { status: 'PUBLISHED' },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            durationMin: true,
            totalMarks: true,
            totalQuestions: true,
            difficulty: true,
            sections: {
              select: { id: true, title: true, type: true, totalMarks: true },
            },
            attempts: {
              where: { userId },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { id: true, status: true, scorePct: true, totalScore: true, passed: true },
            },
          },
        },
        companyProblems: {
          select: {
            problem: {
              select: { id: true, slug: true, title: true, difficulty: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  });

  // 9. Revision Page Data
  await benchmark('9. Revision Page Data', async () => {
    return Promise.all([
      prisma.revision.findMany({
        where: { userId },
        include: { problem: { select: { id: true, title: true, slug: true, difficulty: true } } },
      }),
      prisma.quizAnswer.findMany({
        where: { isCorrect: false, attempt: { userId } },
        take: 20,
      }),
    ]);
  });

  // 10. Assessment Overview
  const assessment = await prisma.assessment.findFirst({
    where: { status: 'PUBLISHED' },
  });
  if (assessment) {
    await benchmark(`10. Assessment Overview (${assessment.slug})`, () =>
      getAssessmentOverview(assessment.slug, userId)
    );

    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (attempt) {
      await benchmark(`11. Assessment Result Summary (${attempt.id})`, () =>
        compileResultSummary(attempt.id)
      );
    }
  }

  console.log('\n--- BASELINE BENCHMARK SUMMARY ---');
  console.table(
    records.map((r) => ({
      Operation: r.operation,
      'Duration (ms)': r.durationMs,
      'Query Count': r.queryCount,
      'Payload (KB)': r.payloadKb,
    }))
  );

  // Detailed Analysis of Dashboard Queries
  const dashboardRecord = records.find((r) => r.operation === '3. Combined Dashboard Full Load');
  if (dashboardRecord) {
    console.log('\n--- DETAILED COMBINED DASHBOARD QUERIES ---');
    console.log(`Total queries executed on Dashboard: ${dashboardRecord.queryCount}`);
    dashboardRecord.queryList.forEach((q, i) => {
      console.log(`  Query #${i + 1}: ${q}`);
    });

    // Detect duplicates
    const counts: Record<string, number> = {};
    dashboardRecord.queryList.forEach((q) => {
      counts[q] = (counts[q] || 0) + 1;
    });

    console.log('\n--- DUPLICATE QUERY PATTERNS DETECTED ON DASHBOARD ---');
    let hasDup = false;
    for (const [q, count] of Object.entries(counts)) {
      if (count > 1) {
        hasDup = true;
        console.log(`  * ${q} called ${count} times during a single dashboard load!`);
      }
    }
    if (!hasDup) {
      console.log('  No duplicate model.action detected.');
    }
  }

  // DSA Roadmap Analysis
  const dsaRecord = records.find((r) => r.operation === '5. DSA Roadmap Data');
  if (dsaRecord) {
    console.log('\n--- DSA ROADMAP QUERIES ---');
    console.log(`Total queries: ${dsaRecord.queryCount} | Payload: ${dsaRecord.payloadKb} KB`);
    dsaRecord.queryList.forEach((q, i) => {
      console.log(`  Query #${i + 1}: ${q}`);
    });
  }
}

runBaseline().catch(console.error);
