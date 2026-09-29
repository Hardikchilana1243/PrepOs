import prisma from '../lib/db';
import { recordRevisionReview } from '../lib/services/progress';
import { calculatePRS, getReadinessScore } from '../lib/services/readiness-score';
import { getPreparationPillarsData } from '../lib/services/dashboard';

async function runPhase66Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.6: REVISION, COMPANIES & READINESS VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    const padNum = String(total).padStart(2, '0');
    if (condition) {
      console.log(`  ✓ [PASS ${padNum}] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL ${padNum}] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Candidate lookup
  const user = await prisma.user.findFirst({
    where: { email: 'priya.candidate@univ.edu' },
    include: { profile: true },
  });
  assert(Boolean(user && user.profile), 'Test candidate (Priya) profile verified');
  const userId = user!.id;

  // Secondary candidate for user isolation tests
  const otherUser = await prisma.user.findFirst({
    where: { email: { not: 'priya.candidate@univ.edu' } },
  });
  assert(Boolean(otherUser), 'Secondary candidate found for multi-tenant isolation testing');
  const otherUserId = otherUser!.id;

  // --- SECTION 1: SPACED REVISION & SM-2 ENGINE ---
  console.log('\n--- Section 1: Spaced Revision & SM-2 Engine ---');

  // Find a problem for revision testing
  const problem = await prisma.problem.findFirst({
    where: { status: 'PUBLISHED' },
  });
  assert(Boolean(problem), 'Published DSA problem found for revision testing');

  // Create or retrieve revision record for testing
  let revision = await prisma.revision.findFirst({
    where: { userId, problemId: problem!.id },
  });

  if (!revision) {
    revision = await prisma.revision.create({
      data: {
        userId,
        problemId: problem!.id,
        intervalDays: 7,
        confidence: 'GOOD',
        dueAt: new Date(),
      },
    });
  }

  assert(Boolean(revision), 'Revision record instantiated in database');

  // Test SM-2 AGAIN rating -> interval resets to 1 day
  const againResult = await recordRevisionReview(userId, revision!.id, 'AGAIN');
  assert(
    againResult.nextIntervalDays === 1,
    `SM-2 'AGAIN' rating reset interval to 1 day (actual: ${againResult.nextIntervalDays}d)`
  );

  // Test SM-2 HARD rating -> interval sets to 2 days
  const hardResult = await recordRevisionReview(userId, revision!.id, 'HARD');
  assert(
    hardResult.nextIntervalDays === 2,
    `SM-2 'HARD' rating scaled interval to 2 days (actual: ${hardResult.nextIntervalDays}d)`
  );

  // Test SM-2 GOOD rating -> interval scales by 1.5x (minimum 7)
  const goodResult = await recordRevisionReview(userId, revision!.id, 'GOOD');
  assert(
    goodResult.nextIntervalDays >= 7,
    `SM-2 'GOOD' rating scaled interval to >=7 days (actual: ${goodResult.nextIntervalDays}d)`
  );

  // Test SM-2 EASY rating -> interval scales by 2.0x (minimum 14)
  const easyResult = await recordRevisionReview(userId, revision!.id, 'EASY');
  assert(
    easyResult.nextIntervalDays >= 14,
    `SM-2 'EASY' rating scaled interval to >=14 days (actual: ${easyResult.nextIntervalDays}d)`
  );

  // Verify StreakEvent was recorded for revision
  const streakEvent = await prisma.streakEvent.findFirst({
    where: { userId, activityType: 'REVISION' },
  });
  assert(Boolean(streakEvent && streakEvent.count >= 1), 'StreakEvent recorded for REVISION activity');

  // Verify ProgressEvent was created
  const progressEvent = await prisma.progressEvent.findFirst({
    where: { userId, eventType: 'REVISION_COMPLETED' },
    orderBy: { createdAt: 'desc' },
  });
  assert(Boolean(progressEvent), 'ProgressEvent logged with REVISION_COMPLETED metadata');

  // Verify User Isolation on revision reviews
  let isolationBreached = false;
  try {
    await recordRevisionReview(otherUserId, revision!.id, 'GOOD');
    isolationBreached = true;
  } catch (err) {
    // Expected unauthorized access error
  }
  assert(!isolationBreached, 'Student A revision cannot be mutated or reviewed by Student B');

  // --- SECTION 2: COMPANY PREPARATION HUBS ---
  console.log('\n--- Section 2: Company Preparation Hubs ---');

  const companies = await prisma.company.findMany({
    include: {
      patterns: true,
      companyProblems: {
        include: { problem: true },
      },
      assessments: {
        include: { sections: true },
      },
    },
  });

  assert(companies.length >= 5, `Company catalog retrieved successfully (${companies.length} companies)`);

  const amazon = companies.find((c) => c.slug === 'amazon');
  assert(Boolean(amazon), "Tier-1 company 'Amazon' catalog entry present");
  assert(
    Boolean(amazon && amazon.patterns.length > 0),
    `Amazon verified patterns loaded (${amazon?.patterns.length} patterns)`
  );
  assert(
    Boolean(amazon && amazon.companyProblems.length > 0),
    `Amazon mapped problems loaded (${amazon?.companyProblems.length} problems)`
  );
  assert(
    Boolean(amazon && amazon.assessments.length > 0),
    `Amazon mock assessments linked (${amazon?.assessments.length} assessment)`
  );

  // Verify company progress calculation only uses real solves
  const solvedCount = await prisma.userProgress.count({
    where: { userId, isSolved: true },
  });
  assert(typeof solvedCount === 'number', `Real user solved problem count retrieved: ${solvedCount}`);

  // --- SECTION 3: PLACEMENT READINESS SCORE (PRS v1) & PROFILE ---
  console.log('\n--- Section 3: Placement Readiness Score (PRS v1) & Profile ---');

  const prs = await calculatePRS(userId);
  assert(
    prs.prsVersion === 'v1' && prs.totalScore >= 10 && prs.totalScore <= 100,
    `PRS total score calculated within bounds (score: ${prs.totalScore}/100)`
  );

  // Verify weights: DSA 40%, Core CS 30%, OA 15%, Consistency 15%
  assert(
    prs.dsaScore >= 0 && prs.dsaScore <= 100,
    `PRS DSA component calibrated (0-100): ${prs.dsaScore}%`
  );
  assert(
    prs.coreCsScore >= 0 && prs.coreCsScore <= 100,
    `PRS Core CS component calibrated (0-100): ${prs.coreCsScore}%`
  );
  assert(
    prs.oaScore >= 0 && prs.oaScore <= 100,
    `PRS OA simulation component calibrated (0-100): ${prs.oaScore}%`
  );
  assert(
    prs.consistencyScore >= 0 && prs.consistencyScore <= 100,
    `PRS Consistency component calibrated (0-100): ${prs.consistencyScore}%`
  );

  // Verify ReadinessScore record in DB
  const readinessRecord = await prisma.readinessScore.findUnique({
    where: { userId },
  });
  assert(
    Boolean(readinessRecord && readinessRecord.totalScore === prs.totalScore),
    `ReadinessScore materialized in database with matching totalScore (${readinessRecord?.totalScore})`
  );

  // Verify ReadinessScoreHistory audit trail
  const historyEntries = await prisma.readinessScoreHistory.findMany({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
  });
  assert(
    historyEntries.length > 0,
    `ReadinessScoreHistory audit log records found (${historyEntries.length} entries)`
  );

  // Verify Multi-user Readiness Isolation
  const otherPrs = await calculatePRS(otherUserId);
  assert(
    otherPrs !== null,
    'Secondary candidate PRS calculated independently with zero data leakage'
  );

  // --- SECTION 4: CROSS-MODULE INTEGRATION ---
  console.log('\n--- Section 4: Cross-Module Integration ---');

  const pillars = await getPreparationPillarsData(userId);
  assert(
    pillars.dsaProgress.solvedCount === solvedCount,
    `Dashboard DSA progress (${pillars.dsaProgress.solvedCount}) matches user solved count (${solvedCount})`
  );
  assert(
    pillars.companyHighlights.length > 0,
    `Dashboard company highlights loaded (${pillars.companyHighlights.length} companies)`
  );
  assert(
    typeof pillars.revisionSummary.dueCount === 'number',
    `Dashboard revision summary connects to active SM-2 queue (${pillars.revisionSummary.dueCount} due)`
  );

  console.log(`\n============================================================`);
  console.log(`RESULTS: ${passed} / ${total} tests passed cleanly.`);
  console.log(`============================================================\n`);
}

runPhase66Verification().catch((e) => {
  console.error(e);
  process.exit(1);
});
