// ============================================================================
// PREPOS PHASE 6.10 VERIFICATION SUITE
// Unified Preparation Command Center & Cross-Platform Search
// ============================================================================

import prisma from '../lib/db';
import {
  searchGlobalEntities,
  getContinuePreparationItems,
  getRecentCrossPillarActivity,
  SearchResultItem,
  ContinuePreparationItem,
  CrossPillarActivityItem,
} from '../lib/services/global-search';

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

async function runPhase610Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.10: UNIFIED COMMAND CENTER & GLOBAL SEARCH');
  console.log('============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: CANDIDATE ACCOUNTS & SEED DATA
    // ------------------------------------------------------------------------
    console.log('--- Section 1: Candidate Sourcing & Multi-Tenant Setup ---');

    let userA = await prisma.user.findFirst({
      where: { email: 'priya.candidate@univ.edu' },
      select: { id: true, email: true, name: true },
    });
    if (!userA) {
      userA = await prisma.user.findFirst({
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userA), 'Candidate User A verified in database');

    let userB = await prisma.user.findFirst({
      where: { id: { not: userA!.id } },
      select: { id: true, email: true, name: true },
    });
    if (!userB) {
      userB = await prisma.user.create({
        data: {
          email: 'isolation.test.search@univ.edu',
          name: 'Isolation Search Candidate',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 2: EMPTY QUERY & DEFAULT DESTINATIONS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Empty Query Default Destinations & Actions ---');

    const emptyResults = await searchGlobalEntities(userA!.id, '');
    assert(emptyResults.length > 0, 'Empty query returns default destinations and actions');

    const navItems = emptyResults.filter((r) => r.entityType === 'NAVIGATION');
    const actionItems = emptyResults.filter((r) => r.entityType === 'ACTION');
    assert(navItems.length >= 7, 'Empty query includes all major navigation destinations');
    assert(actionItems.length >= 4, 'Empty query includes preparation quick actions');

    const hasDashboard = navItems.some((n) => n.url === '/dashboard');
    const hasDsa = navItems.some((n) => n.url === '/dashboard/dsa');
    const hasCoreCs = navItems.some((n) => n.url === '/dashboard/core-cs');
    const hasCompanies = navItems.some((n) => n.url === '/dashboard/companies');
    const hasAssessments = navItems.some((n) => n.url === '/dashboard/assessments');
    const hasRevision = navItems.some((n) => n.url === '/dashboard/revision');
    const hasProfile = navItems.some((n) => n.url === '/dashboard/profile');

    assert(
      hasDashboard && hasDsa && hasCoreCs && hasCompanies && hasAssessments && hasRevision && hasProfile,
      'All 7 preparation pillars represented in navigation destinations'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: CROSS-ENTITY SEARCH CAPABILITIES
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Cross-Entity Global Search (DSA, Core CS, Companies, OAs, Revision) ---');

    // 3.1 DSA Problem Search
    const dsaResults = await searchGlobalEntities(userA!.id, 'Array');
    const foundDsaProb = dsaResults.some((r) => r.entityType === 'DSA_PROBLEM');
    assert(foundDsaProb, 'Search returns matching DSA problems for "Array"');
    const probItem = dsaResults.find((r) => r.entityType === 'DSA_PROBLEM')!;
    assert(probItem.url.startsWith('/dashboard/dsa/problem/'), 'DSA problem URL points to coding workspace');
    assert(Boolean(probItem.badgeText), 'DSA problem displays difficulty badge');

    // 3.2 Core CS Search
    const csResults = await searchGlobalEntities(userA!.id, 'DBMS');
    const foundCs = csResults.some((r) => r.entityType === 'CORE_CS');
    assert(foundCs, 'Search returns Core CS subjects or quizzes for "DBMS"');

    // 3.3 Company Hub Search
    const compResults = await searchGlobalEntities(userA!.id, 'Amazon');
    const foundComp = compResults.some((r) => r.entityType === 'COMPANY');
    assert(foundComp, 'Search returns company preparation hub for "Amazon"');
    const compItem = compResults.find((r) => r.entityType === 'COMPANY')!;
    assert(compItem.url.startsWith('/dashboard/companies/'), 'Company hub URL points to recruiter workspace');

    // 3.4 Mock Assessment Search
    const oaResults = await searchGlobalEntities(userA!.id, 'OA');
    const foundOa = oaResults.some((r) => r.entityType === 'ASSESSMENT');
    assert(foundOa, 'Search returns timed mock assessments for "OA"');

    // 3.5 Spaced Revision Items Search
    // Ensure User A has at least 1 revision item for test
    const sampleProblem = await prisma.problem.findFirst();
    await prisma.revision.upsert({
      where: {
        userId_problemId: {
          userId: userA!.id,
          problemId: sampleProblem!.id,
        },
      },
      update: {},
      create: {
        userId: userA!.id,
        problemId: sampleProblem!.id,
        intervalDays: 7,
        confidence: 'GOOD',
        dueAt: new Date(),
      },
    });

    const revResults = await searchGlobalEntities(userA!.id, sampleProblem!.title.substring(0, 5));
    const foundRev = revResults.some((r) => r.entityType === 'REVISION');
    assert(foundRev, 'Search surfaces student active revision recall items');

    // ------------------------------------------------------------------------
    // SECTION 4: DETERMINISTIC RELEVANCE RANKING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Deterministic Relevance Ranking Invariants ---');

    const exactResults = await searchGlobalEntities(userA!.id, sampleProblem!.title);
    assert(exactResults.length > 0, 'Exact title search returns results');
    const firstResult = exactResults[0];
    assert(
      firstResult.title.toLowerCase() === sampleProblem!.title.toLowerCase(),
      `Top result "${firstResult.title}" matches exact search query`
    );
    assert(firstResult.relevanceScore >= 80, 'Exact or prefix match has high relevance score (>=80)');

    // Invariant: results must be sorted strictly descending by relevanceScore
    let isSorted = true;
    for (let i = 0; i < exactResults.length - 1; i++) {
      if (exactResults[i].relevanceScore < exactResults[i + 1].relevanceScore) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Search results are sorted strictly descending by relevanceScore');

    // ------------------------------------------------------------------------
    // SECTION 5: SECURITY & ZERO SENSITIVE DATA LEAKAGE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Security & Evaluation Key Protection ---');

    for (const item of [...dsaResults, ...csResults, ...oaResults]) {
      // Ensure no raw JSON containing secrets leaked into subtitle or title
      assert(!JSON.stringify(item).includes('expectedOutput'), 'Zero secret test cases exposed in search payload');
      assert(!JSON.stringify(item).includes('isCorrect'), 'Zero correct MCQ answer keys exposed in search payload');
      assert(!JSON.stringify(item).includes('editorial'), 'Zero full editorial solution code leaked in search payload');
      assert(!JSON.stringify(item).includes('password'), 'Zero credentials leaked in search payload');
    }

    // ------------------------------------------------------------------------
    // SECTION 6: MULTI-TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Multi-Tenant Isolation & User Scoping ---');

    // Create unique revision for User A
    const userAProblem = await prisma.problem.findFirst({
      where: { id: sampleProblem!.id },
    });
    const userARev = await prisma.revision.findFirst({
      where: { userId: userA!.id, problemId: userAProblem!.id },
    });

    // User B searching for User A's problem should find the problem (public catalog),
    // but should NOT see User A's REVISION record
    const userBSearch = await searchGlobalEntities(userB!.id, userAProblem!.title);
    const userBSeesUserARevision = userBSearch.some(
      (r) => r.entityType === 'REVISION' && r.id === `rev-${userARev?.id}`
    );
    assert(!userBSeesUserARevision, 'User B search strictly isolates and excludes User A revision records');

    // ------------------------------------------------------------------------
    // SECTION 7: STUDENT CONTINUE PREPARATION PANEL
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Student Continue Preparation Panel (Deterministic Real DB State) ---');

    const continueItems = await getContinuePreparationItems(userA!.id);
    assert(Array.isArray(continueItems), 'getContinuePreparationItems returns an array');
    assert(continueItems.length <= 4, 'Continue preparation is capped at 4 high-priority items');

    for (const item of continueItems) {
      assert(Boolean(item.id), 'Continue item has valid id');
      assert(['ASSESSMENT', 'DSA', 'REVISION', 'CORE_CS', 'COMPANY'].includes(item.type), 'Continue item has valid type');
      assert(typeof item.title === 'string' && item.title.length > 0, 'Continue item has non-empty title');
      assert(typeof item.url === 'string' && item.url.startsWith('/dashboard'), 'Continue item has valid dashboard deep-link');
      assert(typeof item.ctaText === 'string' && item.ctaText.length > 0, 'Continue item has explicit CTA button text');
    }

    // ------------------------------------------------------------------------
    // SECTION 8: CROSS-PILLAR ACTIVITY FEED
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Cross-Pillar Recent Activity Feed ---');

    const activityFeed = await getRecentCrossPillarActivity(userA!.id, 6);
    assert(Array.isArray(activityFeed), 'getRecentCrossPillarActivity returns an array');

    for (const act of activityFeed) {
      assert(Boolean(act.id), 'Activity item has id');
      assert(
        ['DSA_SUBMISSION', 'PROBLEM_SOLVED', 'QUIZ_COMPLETED', 'ASSESSMENT_SUBMITTED', 'REVISION_COMPLETED'].includes(
          act.type
        ),
        `Activity item has valid event type: ${act.type}`
      );
      assert(typeof act.title === 'string' && act.title.length > 0, 'Activity item has title');
      assert(typeof act.timestamp === 'string', 'Activity item has ISO timestamp');
    }

    // Chronological ordering check
    let isChronological = true;
    for (let i = 0; i < activityFeed.length - 1; i++) {
      const dateA = new Date(activityFeed[i].timestamp).getTime();
      const dateB = new Date(activityFeed[i + 1].timestamp).getTime();
      if (dateA < dateB) {
        isChronological = false;
        break;
      }
    }
    assert(isChronological, 'Activity feed is ordered chronologically descending (newest first)');

    // ------------------------------------------------------------------------
    // SECTION 9: EDGE CASES & RESILIENCE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Edge Cases & Input Sanitization ---');

    const gibberishResults = await searchGlobalEntities(userA!.id, 'xyznonexistentterm99999');
    assert(gibberishResults.length === 0, 'Unmatched search query gracefully returns empty array');

    const specialCharsResults = await searchGlobalEntities(userA!.id, '!@#$%^&*()_+');
    assert(Array.isArray(specialCharsResults), 'Special characters query handled safely without crashes');

    const whitespaceResults = await searchGlobalEntities(userA!.id, '     ');
    assert(whitespaceResults.length > 0, 'Whitespace query falls back cleanly to default destinations');

    // Fresh user without activity returns clean empty feed without throwing
    const freshUserActivity = await getRecentCrossPillarActivity(userB!.id, 5);
    assert(Array.isArray(freshUserActivity), 'New candidate activity feed returns empty array without error');
  } catch (err) {
    console.error('Unhandled verification error:', err);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`PHASE 6.10 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase610Verification()
  .catch((e) => {
    console.error('Fatal test runner error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
