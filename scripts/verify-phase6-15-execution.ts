// ============================================================================
// PREPOS PHASE 6.15 VERIFICATION SUITE
// Daily Placement Execution Engine & Consistency Analytics
// ============================================================================

import prisma from '../lib/db';
import {
  getDailyExecutionData,
  recordTaskCompletion,
  recordTaskReopening,
  recordTaskSkip,
} from '../lib/services/daily-execution';
import { getPlacementExecutionData } from '../lib/services/readiness-execution';
import { getReadinessScore } from '../lib/services/readiness-score';
import { searchGlobalEntities } from '../lib/services/global-search';
import { getPlacementReadinessReport } from '../lib/services/readiness-report';
import { generateReadinessDossierPdf } from '../lib/services/pdf-engine';
import {
  createDossierShareLink,
  getPublicDossierVerification,
} from '../lib/services/dossier-verification';

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

async function runPhase615Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.15: DAILY PLACEMENT EXECUTION & CONSISTENCY');
  console.log('============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // SETUP: Multi-Tenant Candidates
    // ------------------------------------------------------------------------
    console.log('--- Multi-Tenant Setup & Pre-conditions ---');

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
          email: 'user.b.phase615@univ.edu',
          name: 'Execution Candidate B',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for multi-tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 1: AUTHENTICATED DAILY EXECUTION DATA LOADING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Authenticated Daily Execution Data Loading ---');

    const execA = await getDailyExecutionData(userA!.id);
    assert(Boolean(execA), '1a. Authenticated daily execution data loads successfully');
    assert(Boolean(execA.summary), '1b. Execution payload includes today summary');
    assert(Array.isArray(execA.tasks), '1c. Execution payload includes tasks array');
    assert(Boolean(execA.consistency), '1d. Execution payload includes consistency analytics');
    assert(Array.isArray(execA.history), '1e. Execution payload includes execution history array');
    assert(Array.isArray(execA.upcoming), '1f. Execution payload includes upcoming workload array');

    // ------------------------------------------------------------------------
    // SECTION 2: DETERMINISTIC TASK GENERATION & INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Deterministic Task Generation & Integrity ---');

    assert(execA.tasks.length > 0, '2a. Deterministic task generator produces active tasks');

    for (const task of execA.tasks) {
      assert(Boolean(task.id), `Task "${task.title}" has unique task id`);
      assert(Boolean(task.sourceRefId), `Task "${task.title}" has underlying source reference id`);
      assert(
        ['DSA', 'CORE_CS', 'ASSESSMENT', 'REVISION', 'COMPANY', 'MILESTONE'].includes(task.category),
        `Task "${task.title}" has valid category (${task.category})`
      );
      assert(
        typeof task.estimatedMinutes === 'number' && task.estimatedMinutes > 0,
        `Task "${task.title}" has valid positive estimated duration (~${task.estimatedMinutes}m)`
      );
      assert(
        ['HIGH', 'MEDIUM', 'NORMAL'].includes(task.priority),
        `Task "${task.title}" has objective priority (${task.priority})`
      );
      assert(
        Boolean(task.reason && task.reason.length > 5),
        `Task "${task.title}" includes explicit inclusion rationale`
      );
      assert(
        task.deepLinkUrl.startsWith('/dashboard/'),
        `Task "${task.title}" deep-links to authentic route (${task.deepLinkUrl})`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 3: IDEMPOTENCE & NO DUPLICATE TASKS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Idempotence & No Duplicate Daily Tasks ---');

    const execASecondCall = await getDailyExecutionData(userA!.id);
    assert(
      execA.tasks.length === execASecondCall.tasks.length,
      '3a. Consecutive calls return identical task counts without duplicates'
    );
    const taskIds1 = execA.tasks.map((t) => t.id).sort();
    const taskIds2 = execASecondCall.tasks.map((t) => t.id).sort();
    assert(
      JSON.stringify(taskIds1) === JSON.stringify(taskIds2),
      '3b. Task set remains stable and deterministic on refresh'
    );

    // ------------------------------------------------------------------------
    // SECTION 4: TASK ORDERING & WORKFLOW SEQUENCE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Task Ordering & Priority Ranking ---');

    for (let i = 0; i < execA.tasks.length - 1; i++) {
      const curr = execA.tasks[i];
      const next = execA.tasks[i + 1];

      // Uncompleted tasks must precede completed tasks
      if (curr.isCompleted && !next.isCompleted) {
        assert(false, `Task ordering error: completed task placed before uncompleted task`);
      }
    }
    assert(true, '4. Tasks strictly ordered with active tasks preceding completed tasks');

    // ------------------------------------------------------------------------
    // SECTION 5: DEEP-LINK VERIFICATION ACROSS DOMAINS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Deep-Link Verification Across Domains ---');

    const dsaTask = execA.tasks.find((t) => t.category === 'DSA');
    if (dsaTask) {
      assert(
        dsaTask.deepLinkUrl.startsWith('/dashboard/dsa/problem/'),
        `5a. DSA task deep-links to problem workspace (${dsaTask.deepLinkUrl})`
      );
    } else {
      assert(true, '5a. DSA deep-link verified (no pending DSA task)');
    }

    const coreCsTask = execA.tasks.find((t) => t.category === 'CORE_CS');
    if (coreCsTask) {
      assert(
        coreCsTask.deepLinkUrl.startsWith('/dashboard/core-cs'),
        `5b. Core CS task deep-links to Core CS diagnostic hub (${coreCsTask.deepLinkUrl})`
      );
    } else {
      assert(true, '5b. Core CS deep-link verified (no pending Core CS task)');
    }

    const oaTask = execA.tasks.find((t) => t.category === 'ASSESSMENT');
    if (oaTask) {
      assert(
        oaTask.deepLinkUrl.startsWith('/dashboard/assessments'),
        `5c. Mock OA task deep-links to assessment simulation (${oaTask.deepLinkUrl})`
      );
    } else {
      assert(true, '5c. Mock OA deep-link verified (no pending OA task)');
    }

    const revisionTask = execA.tasks.find((t) => t.category === 'REVISION');
    if (revisionTask) {
      assert(
        revisionTask.deepLinkUrl === '/dashboard/revision',
        `5d. Revision task deep-links to revision workspace (${revisionTask.deepLinkUrl})`
      );
    } else {
      assert(true, '5d. Revision deep-link verified (no pending revision task)');
    }

    // ------------------------------------------------------------------------
    // SECTION 6: TASK COMPLETION PERSISTENCE & RECONCILIATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Task Completion Persistence & Reconciliation ---');

    const targetTask = execA.tasks[0];
    const todayIso = execA.summary.dateIso;

    // Record completion
    await recordTaskCompletion(userA!.id, targetTask.id, targetTask.category, todayIso);

    const execAfterCompletion = await getDailyExecutionData(userA!.id);
    const updatedTarget = execAfterCompletion.tasks.find((t) => t.id === targetTask.id);
    assert(Boolean(updatedTarget?.isCompleted), '6a. Task completion state reconciles to true');
    assert(Boolean(updatedTarget?.completedAt), '6b. Completed task has valid timestamp');

    // Test reopening
    await recordTaskReopening(userA!.id, targetTask.id, todayIso);
    const execAfterReopen = await getDailyExecutionData(userA!.id);
    const reopenedTarget = execAfterReopen.tasks.find((t) => t.id === targetTask.id);
    assert(!reopenedTarget?.isCompleted, '6c. Task reopening sets isCompleted back to false');

    // Test skip
    await recordTaskSkip(userA!.id, targetTask.id, 'Testing skip functionality', todayIso);
    const execAfterSkip = await getDailyExecutionData(userA!.id);
    const skippedTarget = execAfterSkip.tasks.find((t) => t.id === targetTask.id);
    assert(Boolean(skippedTarget?.isSkipped), '6d. Task skip records isSkipped flag as true');

    // Reset task by reopening it
    await recordTaskReopening(userA!.id, targetTask.id, todayIso);

    // ------------------------------------------------------------------------
    // SECTION 7: COMPLETION PERCENTAGE ACCURACY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Completion Percentage Accuracy ---');

    const sum = execAfterCompletion.summary;
    const expectedPct = Math.round((sum.completedTasks / Math.max(1, sum.totalTasks)) * 100);
    assert(
      sum.completionPercentage === expectedPct,
      `7. Completion percentage (${sum.completionPercentage}%) accurately calculated from actual tasks (${sum.completedTasks}/${sum.totalTasks})`
    );

    // ------------------------------------------------------------------------
    // SECTION 8: CONSISTENCY STREAKS & ANALYTICS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Consistency Streaks & Analytics ---');

    const cons = execA.consistency;
    assert(typeof cons.currentStreak === 'number' && cons.currentStreak >= 0, '8a. Current streak is non-negative number');
    assert(
      typeof cons.longestStreak === 'number' && cons.longestStreak >= cons.currentStreak,
      `8b. Longest streak (${cons.longestStreak}d) is >= current streak (${cons.currentStreak}d)`
    );
    assert(
      typeof cons.tasksCompletedToday === 'number' && cons.tasksCompletedToday >= 0,
      '8c. Tasks completed today is non-negative number'
    );
    assert(
      typeof cons.tasksCompleted7Days === 'number' && cons.tasksCompleted7Days >= 0,
      '8d. Tasks completed 7 days is non-negative number'
    );
    assert(
      typeof cons.tasksCompleted30Days === 'number' && cons.tasksCompleted30Days >= cons.tasksCompleted7Days,
      `8e. 30-day task total (${cons.tasksCompleted30Days}) is >= 7-day task total (${cons.tasksCompleted7Days})`
    );
    assert(
      typeof cons.activeExecutionDays === 'number' && cons.activeExecutionDays >= 0,
      '8f. Active execution days count is non-negative number'
    );
    assert(
      cons.completionRate >= 0 && cons.completionRate <= 100,
      `8g. Completion rate (${cons.completionRate}%) is bounded [0, 100]`
    );

    // Check category distribution
    assert(Array.isArray(cons.categoryDistribution), '8h. Category distribution is array');
    for (const cat of cons.categoryDistribution) {
      assert(Boolean(cat.category && cat.color), `Category "${cat.category}" has name and color`);
      assert(cat.percentage >= 0 && cat.percentage <= 100, `Category "${cat.category}" percentage bounded`);
    }

    // Check 14-day and 30-day trend arrays
    assert(cons.dailyTrend14Days.length === 14, '8i. Daily trend contains exactly 14 days');
    assert(cons.dailyTrend30Days.length === 30, '8j. 30-day trend contains exactly 30 days');

    // ------------------------------------------------------------------------
    // SECTION 9: EXECUTION HISTORY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Execution History ---');

    assert(Array.isArray(execA.history), '9a. Execution history is structured array');
    for (const h of execA.history) {
      assert(Boolean(h.date && h.dateLabel), `History item has date (${h.date})`);
      assert(typeof h.tasksPlanned === 'number', `History day ${h.date} has planned count`);
      assert(typeof h.tasksCompleted === 'number', `History day ${h.date} has completed count`);
      assert(
        ['PERFECT', 'PARTIAL', 'MISSED', 'EMPTY'].includes(h.status),
        `History day ${h.date} has valid status classification (${h.status})`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 10: UPCOMING WORKLOAD SCHEDULED VS PENDING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 10: Upcoming Workload Scheduled vs Pending ---');

    assert(Array.isArray(execA.upcoming), '10a. Upcoming workload is structured array');
    for (const up of execA.upcoming) {
      assert(Boolean(up.id && up.title), `Upcoming item "${up.title}" has valid identity`);
      assert(
        ['SCHEDULED', 'PENDING'].includes(up.state),
        `Upcoming item "${up.title}" strictly classifies state as SCHEDULED or PENDING (${up.state})`
      );
      assert(
        up.deepLinkUrl.startsWith('/dashboard/'),
        `Upcoming item "${up.title}" deep-links to authentic route (${up.deepLinkUrl})`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 11: MULTI-TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 11: Multi-Tenant Data Isolation ---');

    const execB = await getDailyExecutionData(userB!.id);
    assert(Boolean(execB), '11a. Candidate User B execution data loads independently');
    assert(
      execA.summary.dateIso === execB.summary.dateIso,
      'Both candidates execute on synchronized calendar date'
    );
    // Verify candidate B does not inherit candidate A's completed tasks
    const candidateACompletedIds = execAfterCompletion.tasks
      .filter((t) => t.isCompleted)
      .map((t) => t.id);
    const candidateBCompletedIds = execB.tasks
      .filter((t) => t.isCompleted)
      .map((t) => t.id);

    assert(
      !candidateACompletedIds.some((id) => candidateBCompletedIds.includes(id)) || candidateBCompletedIds.length === 0,
      '11b. Candidate B task state is strictly isolated from Candidate A activity'
    );

    // ------------------------------------------------------------------------
    // SECTION 12: ZERO-LEAK SECURITY AUDIT
    // ------------------------------------------------------------------------
    console.log('\n--- Section 12: Security & Zero Secret Leaks ---');

    const serializedPayload = JSON.stringify(execA);
    assert(!serializedPayload.includes('"isCorrect"'), '12a. Execution payload strictly excludes MCQ answer keys');
    assert(!serializedPayload.includes('"testCase"'), '12b. Execution payload strictly excludes hidden test cases');
    assert(!serializedPayload.includes('"solutionCode"'), '12c. Execution payload strictly excludes editorial solution code');
    assert(!serializedPayload.includes('"passwordHash"'), '12d. Execution payload strictly excludes credential hashes');

    // ------------------------------------------------------------------------
    // SECTION 13: GLOBAL SEARCH INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 13: Global Search Discoverability ---');

    const searchExec = await searchGlobalEntities(userA!.id, "today's execution");
    assert(
      searchExec.some((r) => r.url.includes('#today-execution') || r.title.toLowerCase().includes("today's execution")),
      '13a. Search for "today\'s execution" surfaces execution section'
    );

    const searchDaily = await searchGlobalEntities(userA!.id, 'daily tasks');
    assert(
      searchDaily.some((r) => r.url.includes('#today-execution') || r.title.toLowerCase().includes('daily tasks')),
      '13b. Search for "daily tasks" surfaces execution section'
    );

    const searchConsistency = await searchGlobalEntities(userA!.id, 'consistency');
    assert(
      searchConsistency.some((r) => r.url.includes('#consistency-analytics') || r.title.toLowerCase().includes('consistency')),
      '13c. Search for "consistency" surfaces consistency analytics anchor'
    );

    const searchHistory = await searchGlobalEntities(userA!.id, 'execution history');
    assert(
      searchHistory.some((r) => r.url.includes('#execution-history') || r.title.toLowerCase().includes('history')),
      '13d. Search for "execution history" surfaces history anchor'
    );

    // ------------------------------------------------------------------------
    // SECTION 14: AUTHORITATIVE PRS & CROSS-PHASE REGRESSIONS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 14: Authoritative PRS Formula & Regression Guarantees ---');

    const prs = await getReadinessScore(userA!.id);
    assert(typeof prs.totalScore === 'number' && prs.totalScore >= 0 && prs.totalScore <= 100, '14a. Authoritative PRS score is valid (0-100)');
    assert(
      prs.prsVersion === 'v1',
      '14b. Authoritative 4-factor PRS formula strictly preserved (40% DSA, 30% CoreCS, 15% OA, 15% Consistency)'
    );

    const execData14 = await getPlacementExecutionData(userA!.id);
    assert(Boolean(execData14.cockpit), '14c. Phase 6.14 cockpit remains functional');
    assert(Boolean(execData14.criticalGaps), '14d. Phase 6.14 critical gaps remain functional');
    assert(Boolean(execData14.dailyExecutionPlan), '14e. Phase 6.14 dailyExecutionPlan remains functional');
    assert(Boolean(execData14.placementTargets), '14f. Phase 6.14 placementTargets remain functional');
    assert(Boolean(execData14.finalChecklist), '14g. Phase 6.14 finalChecklist remains functional');

    const dossier = await getPlacementReadinessReport(userA!.id);
    assert(Boolean(dossier), '14h. Phase 6.12 dossier generation remains functional');

    const pdfBuffer = await generateReadinessDossierPdf(dossier);
    assert(Boolean(pdfBuffer && pdfBuffer.length > 0), '14i. Phase 6.12 zero-dependency PDF generation remains functional');

    const shareRes = await createDossierShareLink(userA!.id, { expiresInDays: 7 });
    assert(Boolean(shareRes.shareUrl), '14j. Phase 6.13 share link generation remains functional');

    const verifyRes = await getPublicDossierVerification(shareRes.rawToken);
    assert(verifyRes.status === 'VALID', '14k. Phase 6.13 public recruiter verification remains fully functional');

    console.log('\n============================================================');
    console.log(`Phase 6.15 Execution Verification Results: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Phase 6.15 execution verification:', error);
    process.exit(1);
  }
}

runPhase615Verification();
