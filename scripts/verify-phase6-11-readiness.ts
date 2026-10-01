// ============================================================================
// PREPOS PHASE 6.11 VERIFICATION SUITE
// Placement Readiness Command Center & Intelligence Cockpit
// ============================================================================

import prisma from '../lib/db';
import {
  getPlacementReadinessCockpitData,
  PlacementReadinessCockpit,
} from '../lib/services/readiness-cockpit';
import { getReadinessScore } from '../lib/services/readiness-score';

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

async function runPhase611Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.11: PLACEMENT READINESS COMMAND CENTER');
  console.log('============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: CANDIDATE ACCOUNTS & MULTI-TENANT SETUP
    // ------------------------------------------------------------------------
    console.log('--- Section 1: Candidate Accounts & Multi-Tenant Setup ---');

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
          email: 'isolation.test.readiness@univ.edu',
          name: 'Isolation Readiness Candidate',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 2: AUTHORITATIVE PRS CALCULATION INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Authoritative PRS Calculation Integrity ---');

    const cockpitA = await getPlacementReadinessCockpitData(userA!.id);
    const authoritativePRS = await getReadinessScore(userA!.id);

    assert(
      cockpitA.overallPRS.score === authoritativePRS.totalScore,
      'Cockpit overallPRS matches authoritative getReadinessScore',
      `Cockpit: ${cockpitA.overallPRS.score}, Authoritative: ${authoritativePRS.totalScore}`
    );

    assert(
      cockpitA.overallPRS.dsaScore === authoritativePRS.dsaScore &&
        cockpitA.overallPRS.coreCsScore === authoritativePRS.coreCsScore &&
        cockpitA.overallPRS.oaScore === authoritativePRS.oaScore &&
        cockpitA.overallPRS.consistencyScore === authoritativePRS.consistencyScore,
      '4-factor PRS component scores strictly match authoritative PRS weights'
    );

    assert(
      cockpitA.overallPRS.score >= 0 && cockpitA.overallPRS.score <= 100,
      'Overall PRS score is within bounded 0-100 range'
    );

    assert(
      ['TIER_1_READY', 'COMPETITIVE', 'FOUNDATION_BUILDING', 'EARLY_STAGE'].includes(
        cockpitA.overallPRS.tier
      ),
      'Readiness tier belongs to standard PRS tier bands'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: USER & TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: User & Tenant Isolation ---');

    const cockpitB = await getPlacementReadinessCockpitData(userB!.id);

    assert(
      cockpitA.dimensions.dsa.completedActivity !== undefined &&
        cockpitB.dimensions.dsa.completedActivity !== undefined,
      'Both candidates have valid independent readiness cockpit records'
    );

    // Verify User B does not inadvertently reflect User A's progress
    const userAProgressCount = await prisma.userProgress.count({
      where: { userId: userA!.id, isSolved: true },
    });
    const userBProgressCount = await prisma.userProgress.count({
      where: { userId: userB!.id, isSolved: true },
    });

    assert(
      cockpitA.dimensions.dsa.completedActivity === userAProgressCount,
      'User A DSA solved count strictly reflects User A progress table'
    );
    assert(
      cockpitB.dimensions.dsa.completedActivity === userBProgressCount,
      'User B DSA solved count strictly reflects User B progress table'
    );

    // ------------------------------------------------------------------------
    // SECTION 4: DSA READINESS AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: DSA Readiness Dimension Aggregation ---');

    const dsaDim = cockpitA.dimensions.dsa;
    assert(dsaDim.key === 'DSA', 'DSA dimension key is DSA');
    assert(
      dsaDim.score >= 0 && dsaDim.score <= 100,
      'DSA dimension score is normalized 0-100'
    );
    assert(
      dsaDim.solvedByDifficulty.easy <= dsaDim.totalByDifficulty.easy &&
        dsaDim.solvedByDifficulty.medium <= dsaDim.totalByDifficulty.medium &&
        dsaDim.solvedByDifficulty.hard <= dsaDim.totalByDifficulty.hard,
      'DSA solved difficulty distribution is bounded by total catalog counts'
    );
    assert(
      dsaDim.submissionSuccessRate >= 0 && dsaDim.submissionSuccessRate <= 100,
      'DSA submission success rate is percentage 0-100'
    );
    assert(
      dsaDim.ctaUrl.startsWith('/dashboard/dsa'),
      'DSA dimension CTA links directly to DSA roadmap or workspace'
    );
    assert(dsaDim.highlights.length > 0, 'DSA dimension provides factual highlights');

    // ------------------------------------------------------------------------
    // SECTION 5: CORE CS READINESS AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Core CS Dimension Aggregation ---');

    const coreCsDim = cockpitA.dimensions.coreCs;
    assert(coreCsDim.key === 'CORE_CS', 'Core CS dimension key is CORE_CS');
    assert(
      coreCsDim.score >= 0 && coreCsDim.score <= 100,
      'Core CS dimension score is normalized 0-100'
    );
    assert(
      coreCsDim.avgScorePct >= 0 && coreCsDim.avgScorePct <= 100,
      'Core CS average score percentage is bounded 0-100'
    );
    assert(
      coreCsDim.bestScorePct >= 0 && coreCsDim.bestScorePct <= 100,
      'Core CS best score percentage is bounded 0-100'
    );
    assert(
      coreCsDim.ctaUrl.startsWith('/dashboard/core-cs'),
      'Core CS dimension CTA links directly to /dashboard/core-cs'
    );

    // ------------------------------------------------------------------------
    // SECTION 6: COMPANY PREPARATION READINESS AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Target Company Readiness Aggregation ---');

    const compDim = cockpitA.dimensions.company;
    assert(compDim.key === 'COMPANY', 'Company dimension key is COMPANY');
    assert(
      compDim.patternsCovered <= compDim.totalPatterns,
      'Company patterns covered is bounded by total patterns'
    );
    assert(
      compDim.companyProblemsSolved <= compDim.totalCompanyProblems,
      'Company problems solved is bounded by total company problems'
    );
    assert(
      compDim.ctaUrl.startsWith('/dashboard/companies'),
      'Company dimension CTA links to company hubs'
    );

    // ------------------------------------------------------------------------
    // SECTION 7: MOCK ASSESSMENT READINESS AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Mock Assessment Readiness Aggregation ---');

    const oaDim = cockpitA.dimensions.assessment;
    assert(oaDim.key === 'ASSESSMENT', 'Assessment dimension key is ASSESSMENT');
    assert(
      oaDim.passedCount <= oaDim.attemptsCount,
      'Passed assessments cannot exceed total attempts'
    );
    assert(
      typeof oaDim.hasUnfinishedAttempt === 'boolean',
      'Unfinished attempt is accurately identified as boolean'
    );
    assert(
      oaDim.ctaUrl.startsWith('/dashboard/assessments'),
      'Assessment CTA links to /dashboard/assessments'
    );

    // ------------------------------------------------------------------------
    // SECTION 8: SPACED REVISION READINESS AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Spaced Revision Readiness Aggregation ---');

    const revDim = cockpitA.dimensions.revision;
    assert(revDim.key === 'REVISION', 'Revision dimension key is REVISION');
    assert(
      revDim.dueTodayCount >= 0 && revDim.overdueCount >= 0,
      'Revision counts are non-negative integers'
    );
    assert(
      revDim.retentionHealthPct >= 0 && revDim.retentionHealthPct <= 100,
      'Revision retention health is bounded 0-100%'
    );
    assert(
      revDim.ctaUrl.startsWith('/dashboard/revision'),
      'Revision CTA links directly to /dashboard/revision'
    );

    // ------------------------------------------------------------------------
    // SECTION 9: DETERMINISTIC PRIORITY ACTION PLAN
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Deterministic Priority Action Plan ---');

    assert(
      cockpitA.priorityActions.length >= 1 && cockpitA.priorityActions.length <= 5,
      'Priority action plan produces between 1 and 5 actionable tasks'
    );

    cockpitA.priorityActions.forEach((action, i) => {
      assert(
        action.priorityOrder === i + 1,
        `Action #${i + 1} has sequential priority order ${i + 1}`
      );
      assert(
        ['HIGH', 'MEDIUM', 'NORMAL'].includes(action.urgency),
        `Action #${i + 1} urgency (${action.urgency}) is valid`
      );
      assert(
        ['ASSESSMENT', 'REVISION', 'DSA', 'CORE_CS', 'COMPANY'].includes(action.category),
        `Action #${i + 1} category (${action.category}) is recognized`
      );
      assert(
        action.title.length > 5 && action.rationale.length > 10,
        `Action #${i + 1} contains substantive action title and rationale`
      );
      assert(
        action.ctaUrl.startsWith('/dashboard'),
        `Action #${i + 1} ctaUrl (${action.ctaUrl}) routes to dashboard module`
      );
    });

    // ------------------------------------------------------------------------
    // SECTION 10: DETERMINISTIC INTELLIGENCE & INSIGHTS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 10: Deterministic Intelligence & Insights Engine ---');

    assert(cockpitA.insights.length > 0, 'Readiness insights generated for student');

    cockpitA.insights.forEach((insight, idx) => {
      assert(
        ['URGENT', 'RECOMMENDED', 'POSITIVE', 'INFO'].includes(insight.severity),
        `Insight #${idx + 1} severity is valid (${insight.severity})`
      );
      assert(
        insight.supportingMetric.length > 0,
        `Insight #${idx + 1} contains supporting database evidence (${insight.supportingMetric})`
      );
      assert(
        insight.whyItMatters.length > 10,
        `Insight #${idx + 1} explains placement impact clearly`
      );
      assert(
        insight.ctaUrl.startsWith('/dashboard'),
        `Insight #${idx + 1} CTA links to valid dashboard route`
      );
    });

    // ------------------------------------------------------------------------
    // SECTION 11: HISTORICAL TREND DATA HANDLING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 11: Historical Trend Data Handling ---');

    const trends = cockpitA.trends;
    assert(
      typeof trends.hasSufficientHistory === 'boolean',
      'Trend trajectory hasSufficientHistory flag is boolean'
    );
    assert(
      Array.isArray(trends.prsHistory) &&
        Array.isArray(trends.dsaSubmissions) &&
        Array.isArray(trends.coreCsScores) &&
        Array.isArray(trends.assessmentScores) &&
        Array.isArray(trends.revisionConsistency),
      'All 5 trend series are formatted as valid arrays'
    );

    // ------------------------------------------------------------------------
    // SECTION 12: READINESS MILESTONES ROADMAP
    // ------------------------------------------------------------------------
    console.log('\n--- Section 12: Readiness Milestones Roadmap ---');

    assert(cockpitA.milestones.length >= 5, 'Readiness milestones list contains standard preparation stages');

    cockpitA.milestones.forEach((m, idx) => {
      assert(
        ['COMPLETED', 'IN_PROGRESS', 'UPCOMING'].includes(m.status),
        `Milestone #${idx + 1} (${m.title}) has valid status ${m.status}`
      );
      if (m.status === 'COMPLETED') {
        assert(
          typeof m.completedAt === 'string' || m.completedAt === null,
          `Completed milestone #${idx + 1} has valid date format`
        );
      }
      if (m.status === 'IN_PROGRESS') {
        assert(
          (m.currentProgress ?? 0) <= (m.targetProgress ?? 1),
          `In-progress milestone currentProgress (${m.currentProgress}) <= targetProgress (${m.targetProgress})`
        );
      }
    });

    // ------------------------------------------------------------------------
    // SECTION 13: EVALUATION SECRET DATA LEAKAGE PREVENTION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 13: Security & Secret Data Protection ---');

    const serializedCockpit = JSON.stringify(cockpitA);

    assert(
      !serializedCockpit.includes('hiddenTestCases') &&
        !serializedCockpit.includes('testCases') &&
        !serializedCockpit.includes('expectedOutput') &&
        !serializedCockpit.includes('isCorrectAnswer') &&
        !serializedCockpit.includes('correctAnswerIndex') &&
        !serializedCockpit.includes('mcqAnswerKey'),
      'Cockpit payload does NOT leak hidden test cases, solutions, or MCQ answer keys'
    );

    assert(
      !serializedCockpit.includes('password') &&
        !serializedCockpit.includes('hashedPassword') &&
        !serializedCockpit.includes('sessionToken'),
      'Cockpit payload does NOT leak user credentials or session tokens'
    );

    // ------------------------------------------------------------------------
    // SECTION 14: EMPTY-STATE AND FRESH USER HANDLING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 14: Fresh Candidate Edge Case Handling ---');

    // Generate cockpit for userB (which has 0 or minimal activity)
    const freshCockpit = await getPlacementReadinessCockpitData(userB!.id);
    assert(
      !isNaN(freshCockpit.overallPRS.score),
      'Fresh student overallPRS score is not NaN'
    );
    assert(
      !isNaN(freshCockpit.dimensions.dsa.submissionSuccessRate),
      'Fresh student submissionSuccessRate handles 0 submissions without NaN'
    );
    assert(
      !isNaN(freshCockpit.dimensions.coreCs.avgScorePct),
      'Fresh student Core CS avgScorePct handles 0 attempts without NaN'
    );
    assert(
      !isNaN(freshCockpit.dimensions.revision.retentionHealthPct),
      'Fresh student revision retention health handles empty queue without NaN'
    );
    assert(
      freshCockpit.priorityActions.length >= 1,
      'Fresh student receives actionable starting tasks'
    );

  } catch (error) {
    console.error('Unexpected error in Phase 6.11 verification suite:', error);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase611Verification();
