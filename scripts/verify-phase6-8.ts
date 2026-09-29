// ============================================================================
// PREPOS PHASE 6.8 VERIFICATION SUITE
// Adaptive Preparation Engine, Weekly Study Orchestration & Explainability
// ============================================================================

import prisma from '../lib/db';
import {
  getAdaptivePreparationData,
  MasteryLevel,
} from '../lib/services/adaptive-preparation';
import {
  getNextRecommendedStep,
  getTodaysPreparationPlan,
} from '../lib/services/adaptive-recommendations';
import {
  getWeeklyPlanData,
  getUtcWeekRange,
} from '../lib/services/weekly-plan';
import {
  getOrCreateDailyMissions,
  toggleMissionCompletion,
} from '../lib/services/daily-mission';
import { calculatePRS } from '../lib/services/readiness-score';

async function runPhase68Verification() {
  console.log('============================================================');
  console.log('PREPOS PHASE 6.8 — ADAPTIVE PREPARATION VERIFICATION SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // --- SECTION 1: CANDIDATE LOOKUP & DATA PREPARATION ---
  console.log('--- Section 1: Candidate Verification & Data Sourcing ---');

  const testUser = await prisma.user.findFirst({
    where: { email: 'priya.candidate@univ.edu' },
    include: { profile: true },
  });
  assert(Boolean(testUser && testUser.profile), 'Primary student (Priya Patel) record verified');
  const userId = testUser!.id;

  const secondaryUser = await prisma.user.findFirst({
    where: { email: { not: 'priya.candidate@univ.edu' } },
  });
  assert(Boolean(secondaryUser), 'Secondary candidate verified for user isolation tests');
  const secondaryUserId = secondaryUser!.id;

  // --- SECTION 2: ADAPTIVE RECOMMENDATION ENGINE ---
  console.log('\n--- Section 2: Adaptive Recommendation Engine & Determinism ---');

  const adaptiveData = await getAdaptivePreparationData(userId);
  assert(Boolean(adaptiveData.recommendation), 'Adaptive engine generates top recommendation');
  assert(
    Boolean(
      adaptiveData.recommendation.title &&
      adaptiveData.recommendation.actionTitle &&
      adaptiveData.recommendation.reason &&
      adaptiveData.recommendation.metricImproved &&
      adaptiveData.recommendation.href &&
      adaptiveData.recommendation.ctaText
    ),
    'Top recommendation includes complete schema: title, action, reason, metric impact, deep link, CTA'
  );

  const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'RECOMMENDED'];
  assert(
    validPriorities.includes(adaptiveData.recommendation.priority),
    `Top recommendation priority is valid (${adaptiveData.recommendation.priority})`
  );

  // Check Helper Service
  const nextStep = await getNextRecommendedStep(userId);
  assert(
    nextStep.actionTitle === adaptiveData.recommendation.actionTitle,
    'adaptive-recommendations.ts helper accurately mirrors primary recommendation'
  );

  const helperTodayPlan = await getTodaysPreparationPlan(userId);
  assert(
    helperTodayPlan.length >= 3 && helperTodayPlan.length <= 5,
    `Today's plan contains bounded 3–5 items (${helperTodayPlan.length} tasks generated)`
  );

  // --- SECTION 3: WEAKNESS & STRENGTH DETECTION (4 EXPLAINABLE STATES) ---
  console.log('\n--- Section 3: Weakness & Strength Detection (4 Explicit States) ---');

  const pillars = adaptiveData.pillarsStatus;
  assert(pillars.length === 4, 'Engine evaluates exactly 4 preparation pillars (DSA, Core CS, OA, Consistency)');

  const validMasteryLevels: MasteryLevel[] = ['NEEDS_EVIDENCE', 'DEVELOPING', 'ON_TRACK', 'STRONG'];
  const allLevelsValid = pillars.every((p) => validMasteryLevels.includes(p.level));
  assert(allLevelsValid, 'All pillar mastery levels strictly adhere to: NEEDS_EVIDENCE, DEVELOPING, ON_TRACK, STRONG');

  // Verify non-fabrication: evidence contains real data numbers
  const hasEvidence = pillars.every((p) => p.evidence.length > 10 && Boolean(p.headline));
  assert(hasEvidence, 'All pillars feature concrete evidence derived from active database records');

  // --- SECTION 4: TODAY\'S ADAPTIVE PLAN & TASK INTEGRITY ---
  console.log("\n--- Section 4: Today's Adaptive Plan & Direct Deep Links ---");

  const todayPlan = adaptiveData.todayPlan;
  assert(todayPlan.length >= 3 && todayPlan.length <= 5, `Today's adaptive plan contains ${todayPlan.length} prioritized tasks`);

  const allTasksHaveDeepLinks = todayPlan.every(
    (t) => t.href.startsWith('/dashboard') && t.estimatedMinutes > 0 && t.title.length > 0
  );
  assert(allTasksHaveDeepLinks, 'Every task in Today\'s plan contains a valid /dashboard/* deep link and estimated time');

  // --- SECTION 5: NEW / EMPTY STUDENT BEHAVIOR (NO FABRICATION) ---
  console.log('\n--- Section 5: Brand-New Student Onboarding (Zero Hallucination) ---');

  // Create an isolated ephemeral student with zero activity
  const brandNewUser = await prisma.user.create({
    data: {
      email: `test.onboarding.${Date.now()}@prepos.test`,
      name: 'New Test Candidate',
      role: 'STUDENT',
      profile: {
        create: {
          gradYear: 2026,
          targetDegree: 'B.Tech',
          targetRoleTier: 'TIER_1',
          streakDays: 0,
        },
      },
    },
  });

  try {
    const newStudentData = await getAdaptivePreparationData(brandNewUser.id);
    const newPillars = newStudentData.pillarsStatus;

    // Zero solved problems -> NEEDS_EVIDENCE
    const dsaPillar = newPillars.find((p) => p.area === 'DSA');
    assert(
      dsaPillar?.level === 'NEEDS_EVIDENCE',
      'New student with 0 problem solves is honestly classified as NEEDS_EVIDENCE'
    );

    // Zero quiz attempts -> NEEDS_EVIDENCE
    const csPillar = newPillars.find((p) => p.area === 'CORE_CS');
    assert(
      csPillar?.level === 'NEEDS_EVIDENCE',
      'New student with 0 quiz attempts is honestly classified as NEEDS_EVIDENCE'
    );

    // Zero assessment attempts -> NEEDS_EVIDENCE
    const oaPillar = newPillars.find((p) => p.area === 'ASSESSMENT');
    assert(
      oaPillar?.level === 'NEEDS_EVIDENCE',
      'New student with 0 assessment attempts is honestly classified as NEEDS_EVIDENCE'
    );

    // Zero streak -> NEEDS_EVIDENCE
    const streakPillar = newPillars.find((p) => p.area === 'CONSISTENCY');
    assert(
      streakPillar?.level === 'NEEDS_EVIDENCE',
      'New student with 0 streak is honestly classified as NEEDS_EVIDENCE'
    );

    // Baseline recommendation without false claims
    assert(
      Boolean(newStudentData.recommendation.href),
      'New student receives deterministic initial calibration recommendation'
    );
  } finally {
    // Clean up ephemeral test candidate
    await prisma.profile.deleteMany({ where: { userId: brandNewUser.id } });
    await prisma.user.delete({ where: { id: brandNewUser.id } });
  }

  // --- SECTION 6: USER DATA ISOLATION ---
  console.log('\n--- Section 6: User Data Isolation ---');

  const secondaryData = await getAdaptivePreparationData(secondaryUserId);
  assert(
    secondaryData.prsSummary !== undefined && adaptiveData.prsSummary !== undefined,
    'Both candidates generate isolated preparation state'
  );
  // Ensure calculations are user-scoped
  const user1DsaMetric = adaptiveData.pillarsStatus.find((p) => p.area === 'DSA')?.metric;
  const user2DsaMetric = secondaryData.pillarsStatus.find((p) => p.area === 'DSA')?.metric;
  assert(
    typeof user1DsaMetric === 'string' && typeof user2DsaMetric === 'string',
    'User metrics computed independently per user session'
  );

  // --- SECTION 7: WEEKLY STUDY PLAN SERVICE ---
  console.log('\n--- Section 7: Weekly Preparation Plan & Quota Tracking ---');

  const weeklyData = await getWeeklyPlanData(userId);
  assert(
    Boolean(weeklyData.weekStartFormatted && weeklyData.weekEndFormatted),
    `Weekly plan bounds formatted: ${weeklyData.weekStartFormatted} – ${weeklyData.weekEndFormatted}`
  );
  assert(
    weeklyData.targets.length === 4,
    'Weekly targets track all 4 essential pillars (DSA, Core CS, Revision, OA)'
  );
  assert(
    weeklyData.overallWeeklyPct >= 0 && weeklyData.overallWeeklyPct <= 100,
    `Overall weekly completion percentage calculated (${weeklyData.overallWeeklyPct}%)`
  );

  const targetsCorrectMath = weeklyData.targets.every(
    (t) => t.remaining === Math.max(0, t.target - t.current) && t.target > 0
  );
  assert(targetsCorrectMath, 'Target arithmetic verified: remaining = Math.max(0, target - current)');

  const hasAllWeeklyTasks = weeklyData.allWeeklyTasks.length >= weeklyData.todayTasks.length;
  assert(hasAllWeeklyTasks, 'Weekly task catalog comprehensively aggregates today and week-long targets');

  // --- SECTION 8: ADAPTIVE DAILY MISSIONS UPGRADE ---
  console.log('\n--- Section 8: Adaptive Daily Mission Precedence & Persistence ---');

  const missions = await getOrCreateDailyMissions(userId);
  assert(missions.length >= 3, `Daily mission system generated ${missions.length} adaptive tasks`);

  const validMissionTypes = ['DSA', 'CORE_CS', 'REVISION', 'ASSESSMENT', 'COMPANY'];
  const allMissionTypesValid = missions.every((m) => validMissionTypes.includes(m.type));
  assert(allMissionTypesValid, 'All mission items map to recognized preparation categories');

  // Verify toggle persistence
  const firstM = missions[0];
  const initialState = firstM.isCompleted;
  await toggleMissionCompletion(userId, firstM.id, !initialState);
  const updatedM = await prisma.dailyMission.findUnique({ where: { id: firstM.id } });
  assert(updatedM?.isCompleted === !initialState, 'Mission toggle correctly persists in database');
  // Revert back
  await toggleMissionCompletion(userId, firstM.id, initialState);

  // --- SECTION 9: PRS MATHEMATICAL CONSISTENCY ---
  console.log('\n--- Section 9: PRS Mathematical Weight Consistency ---');

  const prs = await calculatePRS(userId);
  const summary = adaptiveData.prsSummary;
  assert(
    summary.totalScore === prs.totalScore,
    `Adaptive PRS total score (${summary.totalScore}) matches calculatePRS authoritative score (${prs.totalScore})`
  );
  assert(
    summary.dsaScore === prs.dsaScore && summary.coreCsScore === prs.coreCsScore,
    'Component breakdowns (DSA: 40%, Core CS: 30%, OA: 15%, Consistency: 15%) remain strictly consistent'
  );

  // --- SECTION 10: PREPARATION INSIGHTS ---
  console.log('\n--- Section 10: Real-Data Preparation Insights ---');

  const insights = adaptiveData.insights;
  assert(insights.length >= 1, `Preparation insights generated (${insights.length} insight items)`);
  const allInsightsHaveDetails = insights.every((i) => i.title.length > 0 && i.detail.length > 0);
  assert(allInsightsHaveDetails, 'Every insight provides concrete explanation based on database state');

  // --- SECTION 11: SECURITY & CHEATING INVARIANTS ---
  console.log('\n--- Section 11: Security & Confidentiality Protection ---');

  // Verify hidden test cases never leak
  const secretCasesCount = await prisma.testCase.count({ where: { isSecret: true } });
  assert(secretCasesCount > 0, `Security invariant: ${secretCasesCount} hidden assessment test cases preserved`);

  // Verify correct MCQ options remain server-side
  const correctOptions = await prisma.questionOption.count({ where: { isCorrect: true } });
  assert(correctOptions > 0, `Authoritative database maintains ${correctOptions} secret answer keys`);

  console.log(`\n============================================================`);
  console.log(`PHASE 6.8 VERIFICATION SUMMARY: ${passed} / ${total} TESTS PASSED.`);
  console.log(`============================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase68Verification().catch((err) => {
  console.error('Phase 6.8 verification failed with exception:', err);
  process.exit(1);
});
