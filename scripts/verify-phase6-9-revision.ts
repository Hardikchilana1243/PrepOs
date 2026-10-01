// ============================================================================
// PREPOS PHASE 6.9 VERIFICATION SUITE
// Revision & Spaced Repetition Workspace Redesign
// Authoritative SM-2 Scheduling, Queue Partitioning, Analytics & User Isolation
// ============================================================================

import prisma from '../lib/db';
import {
  getRevisionDashboardData,
  recordRevisionReview,
  toggleProblemBookmark,
  RevisionQueueItem,
  RevisionDashboardData,
} from '../lib/services/revision';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

async function runPhase69Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.9: REVISION & SPACED REPETITION ENGINE');
  console.log('============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: CANDIDATE ACCOUNTS & SEED DATA
    // ------------------------------------------------------------------------
    console.log('--- Section 1: Candidate Sourcing & Isolation Setup ---');

    let userA = await prisma.user.findFirst({
      where: { email: 'priya.candidate@univ.edu' },
      select: { id: true, email: true, name: true },
    });
    if (!userA) {
      userA = await prisma.user.findFirst({
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userA), 'Candidate User A exists');

    let userB = await prisma.user.findFirst({
      where: { id: { not: userA!.id } },
      select: { id: true, email: true, name: true },
    });
    if (!userB) {
      userB = await prisma.user.create({
        data: {
          email: 'isolation.test.rev@univ.edu',
          name: 'Isolation Rev Candidate',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B exists for multi-tenant isolation');

    const sampleProblem = await prisma.problem.findFirst({
      select: { id: true, title: true, slug: true, difficulty: true },
    });
    assert(Boolean(sampleProblem), 'Sample DSA problem available in database');

    // ------------------------------------------------------------------------
    // SECTION 2: REVISION DASHBOARD DATA LOADING & PROJECTIONS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Dashboard Data Loading & Field Projections ---');

    // Seed a known revision item for User A if none exists
    let testRevisionA = await prisma.revision.findFirst({
      where: { userId: userA!.id, problemId: sampleProblem!.id },
    });
    if (!testRevisionA) {
      const pastDue = new Date();
      pastDue.setDate(pastDue.getDate() - 2); // 2 days overdue
      testRevisionA = await prisma.revision.create({
        data: {
          userId: userA!.id,
          problemId: sampleProblem!.id,
          intervalDays: 3,
          confidence: 'HARD',
          dueAt: pastDue,
        },
      });
    }
    assert(Boolean(testRevisionA), 'User A test revision item prepared in database');

    const dashboardA: RevisionDashboardData = await getRevisionDashboardData(userA!.id);
    assert(Boolean(dashboardA), 'getRevisionDashboardData returned payload');
    assert(typeof dashboardA.summary === 'object', 'Summary object present in dashboard');
    assert(Array.isArray(dashboardA.items), 'Items array present in dashboard');
    assert(typeof dashboardA.analytics === 'object', 'Analytics object present in dashboard');
    assert(Array.isArray(dashboardA.topics), 'Topics array present in dashboard');
    assert(Array.isArray(dashboardA.companies), 'Companies array present in dashboard');

    // Check summary metrics
    const { summary } = dashboardA;
    assert(typeof summary.dueTodayCount === 'number', 'Summary dueTodayCount is number');
    assert(typeof summary.overdueCount === 'number', 'Summary overdueCount is number');
    assert(typeof summary.upcomingCount === 'number', 'Summary upcomingCount is number');
    assert(typeof summary.completedTodayCount === 'number', 'Summary completedTodayCount is number');
    assert(typeof summary.remainingTodayCount === 'number', 'Summary remainingTodayCount is number');
    assert(
      summary.remainingTodayCount === summary.dueTodayCount + summary.overdueCount,
      'Invariant: remainingTodayCount == dueTodayCount + overdueCount'
    );
    assert(
      summary.totalTracked === dashboardA.items.length,
      'Invariant: totalTracked matches item count'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: HIERARCHY PARTITIONING LOGIC
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Hierarchy Partitioning (Due, Overdue, Upcoming, Reviewed) ---');

    let overdueFound = 0;
    let dueTodayFound = 0;
    let upcomingFound = 0;
    let reviewedFound = 0;

    const now = new Date();
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    for (const item of dashboardA.items) {
      if (item.completedAt) {
        reviewedFound++;
      } else if (item.daysOverdue > 0) {
        overdueFound++;
        const dueDate = new Date(item.dueAtRaw);
        assert(dueDate < todayMidnight, `Overdue item "${item.title}" due date strictly precedes today`);
      } else if (item.isDue) {
        dueTodayFound++;
      } else {
        upcomingFound++;
        const dueDate = new Date(item.dueAtRaw);
        assert(dueDate > now, `Upcoming item "${item.title}" due date is in the future`);
      }
    }

    assert(overdueFound === summary.overdueCount, 'Overdue items count matches summary overdueCount');
    assert(dueTodayFound === summary.dueTodayCount, 'Due today items count matches summary dueTodayCount');
    assert(upcomingFound === summary.upcomingCount, 'Upcoming items count matches summary upcomingCount');

    // ------------------------------------------------------------------------
    // SECTION 4: SUPERMEMO SM-2 INTERVAL CALCULATIONS (SERVER AUTHORITATIVE)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: SuperMemo SM-2 Interval Authoritative Engine ---');

    // 4.1 Rating AGAIN resets interval to 1 day
    const againRes = await recordRevisionReview(userA!.id, testRevisionA.id, 'AGAIN');
    assert(againRes.nextIntervalDays === 1, 'Rating AGAIN sets interval to exactly 1 day');
    const expectedAgainDue = new Date();
    expectedAgainDue.setDate(expectedAgainDue.getDate() + 1);
    assert(
      againRes.nextDue.getDate() === expectedAgainDue.getDate(),
      'Rating AGAIN schedules next review for tomorrow'
    );

    // 4.2 Rating HARD sets interval to 2 days
    const hardRes = await recordRevisionReview(userA!.id, testRevisionA.id, 'HARD');
    assert(hardRes.nextIntervalDays === 2, 'Rating HARD sets interval to exactly 2 days');

    // 4.3 Rating GOOD applies 1.5x interval multiplier (min 7 days)
    // Starting with interval 2: Math.max(7, Math.round(2 * 1.5)) = 7
    const goodRes1 = await recordRevisionReview(userA!.id, testRevisionA.id, 'GOOD');
    assert(goodRes1.nextIntervalDays === 7, 'Rating GOOD on base 2 sets interval to min 7 days');

    // GOOD on base 10: Math.round(10 * 1.5) = 15
    await prisma.revision.update({
      where: { id: testRevisionA.id },
      data: { intervalDays: 10 },
    });
    const goodRes2 = await recordRevisionReview(userA!.id, testRevisionA.id, 'GOOD');
    assert(goodRes2.nextIntervalDays === 15, 'Rating GOOD on base 10 sets interval to 15 days');

    // 4.4 Rating EASY applies 2x interval multiplier (min 14 days)
    // Starting with interval 4: Math.max(14, 4 * 2) = 14
    await prisma.revision.update({
      where: { id: testRevisionA.id },
      data: { intervalDays: 4 },
    });
    const easyRes1 = await recordRevisionReview(userA!.id, testRevisionA.id, 'EASY');
    assert(easyRes1.nextIntervalDays === 14, 'Rating EASY on base 4 sets interval to min 14 days');

    // EASY on base 12: 12 * 2 = 24
    await prisma.revision.update({
      where: { id: testRevisionA.id },
      data: { intervalDays: 12 },
    });
    const easyRes2 = await recordRevisionReview(userA!.id, testRevisionA.id, 'EASY');
    assert(easyRes2.nextIntervalDays === 24, 'Rating EASY on base 12 sets interval to 24 days');

    // 4.5 Verify database persistence of review
    const updatedRevision = await prisma.revision.findUnique({
      where: { id: testRevisionA.id },
    });
    assert(updatedRevision?.confidence === 'EASY', 'Persisted confidence is EASY');
    assert(updatedRevision?.intervalDays === 24, 'Persisted intervalDays is 24');
    assert(Boolean(updatedRevision?.completedAt), 'Persisted completedAt timestamp is recorded');

    // ------------------------------------------------------------------------
    // SECTION 5: STREAK & PROGRESS EVENT RECORDING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: StreakEvent & ProgressEvent Persistence ---');

    const streakEvent = await prisma.streakEvent.findFirst({
      where: {
        userId: userA!.id,
        activityType: 'REVISION',
        date: todayMidnight,
      },
    });
    assert(Boolean(streakEvent && streakEvent.count >= 1), 'StreakEvent recorded for REVISION today');

    const progressEvent = await prisma.progressEvent.findFirst({
      where: {
        userId: userA!.id,
        eventType: 'REVISION_COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });
    assert(Boolean(progressEvent), 'ProgressEvent REVISION_COMPLETED logged in database');

    if (progressEvent?.metadata) {
      const meta = JSON.parse(progressEvent.metadata as string);
      assert(meta.confidence === 'EASY', 'ProgressEvent metadata recorded correct confidence rating');
      assert(meta.nextIntervalDays === 24, 'ProgressEvent metadata recorded correct nextIntervalDays');
    }

    // ------------------------------------------------------------------------
    // SECTION 6: MULTI-TENANT ISOLATION & SECURITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Multi-Tenant Isolation & Mutation Protection ---');

    // User B attempting to review User A's revision item must fail
    let userBCannotMutateUserARevision = false;
    try {
      await recordRevisionReview(userB!.id, testRevisionA.id, 'GOOD');
    } catch (err: any) {
      if (err.message.includes('not found or not owned')) {
        userBCannotMutateUserARevision = true;
      }
    }
    assert(
      userBCannotMutateUserARevision,
      'User B cannot review or alter User A revision record (tenant isolation enforced)'
    );

    // User B dashboard does not contain User A items
    const dashboardB = await getRevisionDashboardData(userB!.id);
    const userAItemInB = dashboardB.items.some((i) => i.id === testRevisionA.id);
    assert(!userAItemInB, 'User B revision dashboard excludes User A items');

    // ------------------------------------------------------------------------
    // SECTION 7: BOOKMARK TOGGLING & PERSISTENCE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Bookmark Toggling & State Synchronization ---');

    // Clean initial bookmark
    await prisma.bookmark.deleteMany({
      where: { userId: userA!.id, problemId: sampleProblem!.id },
    });

    const bmRes1 = await toggleProblemBookmark(userA!.id, sampleProblem!.id);
    assert(bmRes1.success && bmRes1.isBookmarked === true, 'toggleProblemBookmark sets bookmark to TRUE');

    const persistedBm = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: userA!.id,
          problemId: sampleProblem!.id,
        },
      },
    });
    assert(Boolean(persistedBm), 'Bookmark persisted in database');

    const bmRes2 = await toggleProblemBookmark(userA!.id, sampleProblem!.id);
    assert(bmRes2.success && bmRes2.isBookmarked === false, 'toggleProblemBookmark toggles bookmark to FALSE');

    // ------------------------------------------------------------------------
    // SECTION 8: SOURCE PILLARS & RELATIONSHIPS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Multi-Source Pillar Integration (DSA, Core CS, OA, Company) ---');

    // Check item attributes
    for (const item of dashboardA.items) {
      assert(
        ['DSA', 'CORE_CS', 'ASSESSMENT', 'COMPANY'].includes(item.sourceType),
        `Item "${item.title.substring(0, 20)}..." has valid source type ${item.sourceType}`
      );
      assert(typeof item.title === 'string' && item.title.length > 0, 'Item has non-empty title');
      assert(typeof item.topicTitle === 'string' && item.topicTitle.length > 0, 'Item has topic title');
      assert(typeof item.intervalDays === 'number', 'Item has numeric intervalDays');
      assert(typeof item.dueAt === 'string', 'Item has formatted dueAt date');
    }

    // ------------------------------------------------------------------------
    // SECTION 9: PERSISTED ANALYTICS INTEGRITY (ZERO FABRICATION)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Persisted Analytics Integrity (No Synthetic Scores) ---');

    const { analytics } = dashboardA;
    assert(typeof analytics.dueVsCompleted === 'object', 'dueVsCompleted present in analytics');
    assert(typeof analytics.sourceDistribution === 'object', 'sourceDistribution present in analytics');
    assert(typeof analytics.intervalDistribution === 'object', 'intervalDistribution present in analytics');
    assert(Array.isArray(analytics.dailyTrend), 'dailyTrend array present in analytics');
    assert(Array.isArray(analytics.recentActivity), 'recentActivity array present in analytics');

    // Interval distribution adds up to total items
    const intervalTotal =
      analytics.intervalDistribution.learning +
      analytics.intervalDistribution.earlyRetention +
      analytics.intervalDistribution.intermediate +
      analytics.intervalDistribution.longTerm;
    assert(
      intervalTotal === dashboardA.items.length,
      `Interval distribution total (${intervalTotal}) matches item count (${dashboardA.items.length})`
    );

    // Source distribution sum
    const sourceTotal =
      analytics.sourceDistribution.dsa +
      analytics.sourceDistribution.coreCs +
      analytics.sourceDistribution.assessment;
    assert(
      sourceTotal === dashboardA.items.length,
      `Source distribution sum (${sourceTotal}) matches item count (${dashboardA.items.length})`
    );

    // Verify daily trend is from real StreakEvent entries
    for (const trendPoint of analytics.dailyTrend) {
      assert(typeof trendPoint.date === 'string', 'Trend point has valid date string');
      assert(typeof trendPoint.count === 'number' && trendPoint.count >= 0, 'Trend count is non-negative number');
    }

    // ------------------------------------------------------------------------
    // SECTION 10: EMPTY STATE & NEW USER RESILIENCE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 10: Empty State & New Candidate Resilience ---');

    // Create a temporary brand-new candidate with 0 history
    const freshUser = await prisma.user.create({
      data: {
        email: `fresh.candidate.${Date.now()}@univ.edu`,
        name: 'Fresh Candidate',
        role: 'STUDENT',
      },
    });

    const freshDashboard = await getRevisionDashboardData(freshUser.id);
    assert(freshDashboard.items.length === 0, 'Fresh candidate starts with 0 revision items');
    assert(freshDashboard.summary.dueTodayCount === 0, 'Fresh candidate has 0 dueToday');
    assert(freshDashboard.summary.overdueCount === 0, 'Fresh candidate has 0 overdue');
    assert(freshDashboard.summary.remainingTodayCount === 0, 'Fresh candidate has 0 remaining');
    assert(freshDashboard.summary.streakDays === 0, 'Fresh candidate has 0 streak');
    assert(freshDashboard.analytics.dailyTrend.length === 0, 'Fresh candidate has empty dailyTrend (honest empty state)');

    // Cleanup fresh test user
    await prisma.user.delete({ where: { id: freshUser.id } });
    assert(true, 'Fresh test user cleanly removed');
  } catch (err) {
    console.error('Unhandled verification error:', err);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`PHASE 6.9 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase69Verification()
  .catch((e) => {
    console.error('Fatal test runner error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
