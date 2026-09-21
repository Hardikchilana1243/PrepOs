// ============================================================================
// PREPOS FULL STUDENT JOURNEY & APPLICATION FOUNDATION VERIFICATION
// Programmatic End-to-End Validation of the Complete Placement Readiness Loop
// ============================================================================

import prisma from '../lib/db';
import { hashPassword, verifyPassword } from '../lib/auth';
import { calculatePRS, getReadinessScore } from '../lib/services/readiness-score';
import { getOrCreateDailyMissions, toggleMissionCompletion } from '../lib/services/daily-mission';
import { getDashboardData } from '../lib/services/dashboard';
import {
  recordProblemSolved,
  submitQuizAttempt,
  recordRevisionReview,
} from '../lib/services/progress';

const TEST_EMAIL = 'journey.test.student@prepos.test';
const TEST_PASSWORD = 'TestPassword2026!';

async function runJourneyVerification() {
  console.log('====================================================================');
  console.log('🚀 PREPOS FULL STUDENT JOURNEY VERIFICATION STARTING');
  console.log('====================================================================\n');

  let testUserId: string | null = null;

  try {
    // ------------------------------------------------------------------------
    // STEP 1: CLEANUP ANY PREVIOUS TEST DATA
    // ------------------------------------------------------------------------
    console.log('1. [CLEANUP] Cleaning up any prior test student records...');
    const existing = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
      console.log('   ✓ Removed lingering test user from previous run');
    }

    // ------------------------------------------------------------------------
    // STEP 2: USER SIGN UP & PASSWORD HASHING
    // ------------------------------------------------------------------------
    console.log('\n2. [AUTH] Simulating student registration & password hashing...');
    const hashedPassword = await hashPassword(TEST_PASSWORD);
    const isValidPass = await verifyPassword(TEST_PASSWORD, hashedPassword);
    if (!isValidPass) throw new Error('Password hash verification failed');

    const user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        name: 'Aryan Placement Candidate',
        role: 'STUDENT',
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: TEST_EMAIL,
            access_token: hashedPassword,
          },
        },
      },
    });
    testUserId = user.id;
    console.log(`   ✓ Created test user: ${user.name} (${user.id})`);

    // ------------------------------------------------------------------------
    // STEP 3: ONBOARDING & PROFILE CALIBRATION
    // ------------------------------------------------------------------------
    console.log('\n3. [ONBOARDING] Simulating 2-step onboarding submission...');
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        gradYear: 2026,
        targetDegree: 'B.Tech / B.E. (Computer Science)',
        targetRoleTier: 'PRODUCT_TIER_1',
        preferredLang: 'CPP',
        streakDays: 1,
      },
    });
    console.log(`   ✓ Profile saved: Class of ${profile.gradYear}, Target: ${profile.targetRoleTier}, Lang: ${profile.preferredLang}`);

    // ------------------------------------------------------------------------
    // STEP 4: INITIAL READINESS SCORE (BASELINE SETUP)
    // ------------------------------------------------------------------------
    console.log('\n4. [PRS BASELINE] Establishing initial Placement Readiness Score...');
    const initialPRS = await calculatePRS(user.id);
    console.log(`   ✓ Total PRS Baseline: ${initialPRS.totalScore}% (isBaselineOnly: ${initialPRS.isBaselineOnly})`);
    console.log(`     - DSA: ${initialPRS.dsaScore}%`);
    console.log(`     - Core CS: ${initialPRS.coreCsScore}%`);
    console.log(`     - Consistency: ${initialPRS.consistencyScore}%`);
    if (initialPRS.totalScore !== 20 || !initialPRS.isBaselineOnly) {
      throw new Error(`Expected baseline 20% with isBaselineOnly=true, got ${initialPRS.totalScore}%`);
    }

    const initialHistory = await prisma.readinessScoreHistory.findMany({ where: { userId: user.id } });
    if (initialHistory.length !== 1 || initialHistory[0].score !== 20) {
      throw new Error('Expected 1 initial history audit record with score 20');
    }
    console.log('   ✓ Verified ReadinessScore and ReadinessScoreHistory audit persistence');

    // ------------------------------------------------------------------------
    // STEP 5: DETERMINISTIC DAILY MISSIONS
    // ------------------------------------------------------------------------
    console.log("\n5. [DAILY MISSION] Generating today's deterministic mission set...");
    const missions1 = await getOrCreateDailyMissions(user.id);
    console.log(`   ✓ Generated ${missions1.length} daily missions:`);
    missions1.forEach((m, idx) => console.log(`     ${idx + 1}. [${m.type}] ${m.title}`));

    if (missions1.length !== 3) {
      throw new Error(`Expected 3 missions, got ${missions1.length}`);
    }

    // Test idempotency: calling again on the same day must not create duplicates
    const missions2 = await getOrCreateDailyMissions(user.id);
    if (missions2.length !== 3 || missions2[0].id !== missions1[0].id) {
      throw new Error('Daily mission generator is not idempotent on subsequent calls!');
    }
    console.log('   ✓ Verified daily mission idempotency (calling again returned existing 3 missions without duplicates)');

    // Toggle mission completion
    const toggled = await toggleMissionCompletion(user.id, missions1[0].id, true);
    if (!toggled) throw new Error('Failed to toggle mission completion');
    console.log(`   ✓ Toggled mission 1 completed state`);

    // ------------------------------------------------------------------------
    // STEP 6: DASHBOARD AGGREGATION QUERY
    // ------------------------------------------------------------------------
    console.log('\n6. [DASHBOARD] Fetching unified server-side dashboard data...');
    const dashData = await getDashboardData(user.id);
    console.log(`   ✓ Candidate: ${dashData.user.name}`);
    console.log(`   ✓ PRS: ${dashData.readiness.totalScore}%`);
    console.log(`   ✓ DSA Solved: ${dashData.dsaProgress.solvedCount}/${dashData.dsaProgress.totalCount} (${dashData.dsaProgress.progressPct}%)`);
    console.log(`   ✓ Next DSA Target: ${dashData.dsaProgress.nextProblem?.title}`);
    console.log(`   ✓ Core CS Quizzes: ${dashData.coreCsProgress.totalQuizzes} available`);
    console.log(`   ✓ Companies Featured: ${dashData.companyHighlights.length}`);
    console.log(`   ✓ Revision Due: ${dashData.revisionSummary.dueCount}`);

    if (dashData.dsaProgress.totalCount !== 20) {
      throw new Error(`Expected 20 total seeded DSA problems, got ${dashData.dsaProgress.totalCount}`);
    }
    if (dashData.companyHighlights.length !== 4) {
      throw new Error(`Expected 4 highlighted companies, got ${dashData.companyHighlights.length}`);
    }

    // ------------------------------------------------------------------------
    // STEP 7: DSA PROBLEM SOLVED ACTIVITY & PRS RECALIBRATION
    // ------------------------------------------------------------------------
    console.log('\n7. [ACTIVITY - DSA] Simulating student solving a DSA problem...');
    const firstProblem = await prisma.problem.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
    });
    if (!firstProblem) throw new Error('No seeded problems found');

    const prsAfterDSA = await recordProblemSolved(user.id, firstProblem.id);
    console.log(`   ✓ Solved problem: "${firstProblem.title}"`);
    console.log(`   ✓ New PRS calculated: ${prsAfterDSA.totalScore}%`);
    console.log(`     - DSA Score: ${prsAfterDSA.dsaScore}%`);
    console.log(`     - Baseline flag cleared: ${!prsAfterDSA.isBaselineOnly}`);

    if (prsAfterDSA.isBaselineOnly) {
      throw new Error('isBaselineOnly should be false after solving a problem');
    }
    if (prsAfterDSA.dsaScore <= 0) {
      throw new Error('DSA score should be greater than 0 after solving a problem');
    }

    // Verify UserProgress
    const up = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: firstProblem.id } },
    });
    if (!up || !up.isSolved) throw new Error('UserProgress not marked solved');
    console.log('   ✓ Verified UserProgress record updated');

    // Verify TopicProgress
    const tp = await prisma.topicProgress.findUnique({
      where: { userId_topicId: { userId: user.id, topicId: firstProblem.topicId } },
    });
    if (!tp || tp.solvedCount < 1) throw new Error('TopicProgress not updated');
    console.log('   ✓ Verified TopicProgress record updated');

    // Verify Spaced Repetition Revision Scheduled
    const rev = await prisma.revision.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: firstProblem.id } },
    });
    if (!rev || rev.intervalDays !== 7) throw new Error('Spaced revision not scheduled for Day 7');
    console.log(`   ✓ Verified Spaced Repetition scheduled: Day ${rev.intervalDays} due on ${rev.dueAt.toISOString().split('T')[0]}`);

    // Verify StreakEvent & ProgressEvent
    const pe = await prisma.progressEvent.findFirst({
      where: { userId: user.id, eventType: 'PROBLEM_SOLVED' },
    });
    if (!pe) throw new Error('ProgressEvent for problem solve not recorded');
    console.log('   ✓ Verified ProgressEvent audit entry created');

    // ------------------------------------------------------------------------
    // STEP 8: CORE CS QUIZ SUBMISSION & SERVER EVALUATION
    // ------------------------------------------------------------------------
    console.log('\n8. [ACTIVITY - CORE CS] Simulating student completing a Core CS quiz...');
    const quiz = await prisma.coreCSQuiz.findFirst({
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
    if (!quiz) throw new Error('No seeded Core CS quizzes found');

    // Build answer map picking the correct option for all questions to verify server scoring
    const answers: Record<string, string> = {};
    for (const q of quiz.questions) {
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt) {
        answers[q.id] = correctOpt.id;
      }
    }

    const quizResult = await submitQuizAttempt(user.id, quiz.id, answers, 90);
    console.log(`   ✓ Quiz evaluated: ${quiz.title}`);
    console.log(`     - Score: ${quizResult.scorePercentage}% (${quizResult.correctQuestions}/${quizResult.totalQuestions})`);
    console.log(`     - Passed: ${quizResult.passed}`);

    if (quizResult.scorePercentage !== 100) {
      throw new Error(`Expected 100% score for correct answers, got ${quizResult.scorePercentage}%`);
    }

    const prsAfterQuiz = await getReadinessScore(user.id);
    console.log(`   ✓ Recalibrated PRS after Quiz: ${prsAfterQuiz.totalScore}%`);
    console.log(`     - Core CS Score: ${prsAfterQuiz.coreCsScore}%`);
    if (prsAfterQuiz.coreCsScore !== 100) {
      throw new Error(`Expected Core CS score of 100%, got ${prsAfterQuiz.coreCsScore}%`);
    }

    // ------------------------------------------------------------------------
    // STEP 9: SPACED REPETITION REVIEW (SM-2 ALGORITHM)
    // ------------------------------------------------------------------------
    console.log('\n9. [ACTIVITY - REVISION] Simulating spaced repetition recall review...');
    if (rev) {
      const revReview = await recordRevisionReview(user.id, rev.id, 'GOOD');
      console.log(`   ✓ Revision reviewed with confidence 'GOOD': Next interval = ${revReview.nextIntervalDays} days`);
      if (revReview.nextIntervalDays < 7) {
        throw new Error('Expected next interval to be at least 7 days for GOOD rating');
      }
    }

    // ------------------------------------------------------------------------
    // STEP 10: VERIFY SCORE HISTORY TRAIL
    // ------------------------------------------------------------------------
    console.log('\n10. [PRS AUDIT LOG] Checking cryptographic score history audit records...');
    const allHistory = await prisma.readinessScoreHistory.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'asc' },
    });
    console.log(`   ✓ Total PRS history checkpoints recorded: ${allHistory.length}`);
    allHistory.forEach((h, idx) => {
      console.log(`     Check-point ${idx + 1}: ${h.score}% at ${h.recordedAt.toISOString()}`);
    });
    if (allHistory.length < 3) {
      throw new Error(`Expected at least 3 score checkpoints (baseline, DSA solve, Quiz attempt), got ${allHistory.length}`);
    }

    console.log('\n====================================================================');
    console.log('✅ COMPLETE STUDENT JOURNEY VERIFICATION PASSED WITH 100% SUCCESS!');
    console.log('====================================================================\n');
  } finally {
    // Clean up test user
    if (testUserId) {
      console.log('Teardown: Cleaning up test user and cascading relations...');
      await prisma.user.delete({ where: { id: testUserId } });
      console.log('✓ Teardown complete. Zero mock users left in database.');
    }
  }
}

runJourneyVerification().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
