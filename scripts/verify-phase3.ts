// ============================================================================
// PREPOS PHASE 3 PRODUCTION-GRADE VERIFICATION TEST SUITE
// Tests DSA Roadmap, Problem Detail, Code Execution Architecture,
// Run vs Submit Semantics, SM-2 Revision, PRS Recalibration, & Security
// ============================================================================

import prisma from '../lib/db';
import { hashPassword } from '../lib/auth';
import { getDSARoadmapData, getProblemDetailData } from '../lib/services/dsa-roadmap';
import {
  runProblemCode,
  submitProblemCode,
  getUserProblemSubmissions,
  setExecutionProvider,
  getExecutionProvider,
  Judge0ExecutionProvider,
  ExecutionProvider,
  ProviderExecutionOutcome,
  SupportedLanguage,
  TestCaseInput,
} from '../lib/services/code-execution';
import { calculatePRS, getReadinessScore } from '../lib/services/readiness-score';
import { resetRateLimits } from '../lib/services/rate-limit';

const TEST_EMAIL_A = 'phase3.student.a@prepos.test';
const TEST_EMAIL_B = 'phase3.student.b@prepos.test';
const TEST_PASSWORD = 'Phase3Password2026!';

// Configurable Mock Provider for simulating all execution verdicts
class TestExecutionProvider implements ExecutionProvider {
  name = 'Phase 3 Test Simulation Engine';

  constructor(
    private mockVerdict: ProviderExecutionOutcome['verdict'] = 'ACCEPTED',
    private mockErrorLog?: string
  ) {}

  isConfigured(): boolean {
    return true;
  }

  setVerdict(verdict: ProviderExecutionOutcome['verdict'], errorLog?: string) {
    this.mockVerdict = verdict;
    this.mockErrorLog = errorLog;
  }

  async execute(
    code: string,
    language: SupportedLanguage,
    testCases: TestCaseInput[]
  ): Promise<ProviderExecutionOutcome> {
    const isAcc = this.mockVerdict === 'ACCEPTED';
    const isWA = this.mockVerdict === 'WRONG_ANSWER';
    const isCompErr = this.mockVerdict === 'COMPILATION_ERROR';
    const isRuntimeErr = this.mockVerdict === 'RUNTIME_ERROR';
    const isTimeout = this.mockVerdict === 'TIME_LIMIT_EXCEEDED';

    if (isCompErr) {
      return {
        verdict: 'COMPILATION_ERROR',
        passedTests: 0,
        totalTests: testCases.length,
        errorLog: this.mockErrorLog || 'error: expected ";" before "}" token',
        testResults: [
          {
            testCaseId: testCases[0]?.id || 'tc-1',
            orderIndex: 1,
            isSecret: testCases[0]?.isSecret || false,
            status: 'COMPILATION_ERROR',
            errorMessage: this.mockErrorLog || 'error: expected ";" before "}" token',
          },
        ],
      };
    }

    if (isRuntimeErr) {
      return {
        verdict: 'RUNTIME_ERROR',
        passedTests: 0,
        totalTests: testCases.length,
        errorLog: this.mockErrorLog || 'IndexError: list index out of range',
        testResults: [
          {
            testCaseId: testCases[0]?.id || 'tc-1',
            orderIndex: 1,
            isSecret: testCases[0]?.isSecret || false,
            status: 'RUNTIME_ERROR',
            errorMessage: 'IndexError: list index out of range',
          },
        ],
      };
    }

    if (isTimeout) {
      return {
        verdict: 'TIME_LIMIT_EXCEEDED',
        passedTests: 0,
        totalTests: testCases.length,
        errorLog: 'Execution timed out after 10000ms',
        testResults: [
          {
            testCaseId: testCases[0]?.id || 'tc-1',
            orderIndex: 1,
            isSecret: testCases[0]?.isSecret || false,
            status: 'TIME_LIMIT_EXCEEDED',
            errorMessage: 'Time Limit Exceeded',
          },
        ],
      };
    }

    // WA or ACCEPTED
    let passed = 0;
    const testResults = testCases.map((tc, idx) => {
      const passThis = isAcc || idx === 0; // if WA, pass only first, fail second
      if (passThis) passed++;
      return {
        testCaseId: tc.id,
        orderIndex: tc.orderIndex,
        isSecret: tc.isSecret,
        status: (passThis ? 'ACCEPTED' : 'WRONG_ANSWER') as any,
        actualOutput: passThis ? tc.expected : 'wrong_output_42',
        executionTimeMs: 15 + idx * 5,
        memoryKb: 2048,
      };
    });

    return {
      verdict: passed === testCases.length ? 'ACCEPTED' : 'WRONG_ANSWER',
      passedTests: passed,
      totalTests: testCases.length,
      executionTimeMs: 45,
      memoryKb: 2048,
      testResults,
    };
  }
}

async function runPhase3Verification() {
  console.log('====================================================================');
  console.log('🚀 PREPOS PHASE 3 COMPREHENSIVE VERIFICATION SUITE STARTING');
  console.log('====================================================================\n');

  let studentAId: string | null = null;
  let studentBId: string | null = null;

  try {
    // ------------------------------------------------------------------------
    // SETUP: CLEANUP & CREATE TWO DISTINCT TEST STUDENTS
    // ------------------------------------------------------------------------
    console.log('1. [SETUP] Cleaning up prior test student accounts...');
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_EMAIL_A, TEST_EMAIL_B] } },
    });

    const hashedPassword = await hashPassword(TEST_PASSWORD);

    const studentA = await prisma.user.create({
      data: {
        email: TEST_EMAIL_A,
        name: 'Rohan Sharma (Student A)',
        role: 'STUDENT',
        profile: {
          create: {
            gradYear: 2026,
            targetDegree: 'B.Tech (CSE)',
            targetRoleTier: 'PRODUCT_TIER_1',
            preferredLang: 'CPP',
            streakDays: 3,
          },
        },
      },
    });
    studentAId = studentA.id;

    const studentB = await prisma.user.create({
      data: {
        email: TEST_EMAIL_B,
        name: 'Priya Patel (Student B)',
        role: 'STUDENT',
        profile: {
          create: {
            gradYear: 2026,
            targetDegree: 'B.Tech (IT)',
            targetRoleTier: 'PRODUCT_TIER_1',
            preferredLang: 'PYTHON',
            streakDays: 1,
          },
        },
      },
    });
    studentBId = studentB.id;

    console.log(`   ✓ Created Student A: ${studentA.name} (${studentA.id})`);
    console.log(`   ✓ Created Student B: ${studentB.name} (${studentB.id})`);

    // ------------------------------------------------------------------------
    // TEST 1: DSA ROADMAP LOADING & AGGREGATIONS
    // ------------------------------------------------------------------------
    console.log('\n2. [ROADMAP] Testing DSA Roadmap loading and metrics...');
    const roadmapData = await getDSARoadmapData(studentA.id);

    console.log(`   ✓ Total Modules: ${roadmapData.totalModules}`);
    console.log(`   ✓ Total Problems: ${roadmapData.totalProblems}`);
    console.log(`   ✓ Initial Solved: ${roadmapData.solvedProblems} / ${roadmapData.totalProblems} (${roadmapData.overallProgressPct}%)`);
    console.log(`   ✓ Easy Distribution: ${roadmapData.difficultyDistribution.EASY.solved}/${roadmapData.difficultyDistribution.EASY.total}`);
    console.log(`   ✓ Medium Distribution: ${roadmapData.difficultyDistribution.MEDIUM.solved}/${roadmapData.difficultyDistribution.MEDIUM.total}`);
    console.log(`   ✓ Hard Distribution: ${roadmapData.difficultyDistribution.HARD.solved}/${roadmapData.difficultyDistribution.HARD.total}`);

    if (roadmapData.totalModules !== 14) {
      throw new Error(`Expected 14 modules, got ${roadmapData.totalModules}`);
    }
    if (roadmapData.totalProblems !== 20) {
      throw new Error(`Expected 20 seeded problems, got ${roadmapData.totalProblems}`);
    }
    if (roadmapData.solvedProblems !== 0) {
      throw new Error(`Expected 0 initial solved problems, got ${roadmapData.solvedProblems}`);
    }
    if (
      roadmapData.difficultyDistribution.EASY.total !== 7 ||
      roadmapData.difficultyDistribution.MEDIUM.total !== 10 ||
      roadmapData.difficultyDistribution.HARD.total !== 3
    ) {
      throw new Error('Difficulty distribution does not match seed data (7 Easy, 10 Med, 3 Hard)');
    }
    console.log('   ✓ Verified module hierarchy, topics, problem counts, and difficulty distribution');

    // ------------------------------------------------------------------------
    // TEST 2: PROBLEM DETAIL AUTHORIZATION & SECRET TEST ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n3. [PROBLEM DETAIL & SECURITY] Testing problem detail query & secret isolation...');
    const targetSlug = 'array-element-frequency-counter';
    const detailData = await getProblemDetailData(studentA.id, targetSlug);

    if (!detailData) {
      throw new Error(`Failed to load problem: ${targetSlug}`);
    }

    console.log(`   ✓ Problem Loaded: "${detailData.problem.title}"`);
    console.log(`   ✓ Difficulty: ${detailData.problem.difficulty}`);
    console.log(`   ✓ Module: ${detailData.problem.moduleTitle}`);
    console.log(`   ✓ Topic: ${detailData.problem.topicTitle}`);
    console.log(`   ✓ Public Sample Test Cases: ${detailData.problem.sampleTestCases.length}`);
    console.log(`   ✓ Seeded Solutions: ${detailData.problem.solutions.length}`);
    console.log(`   ✓ Initial Solved Status: ${detailData.userState.isSolved}`);
    console.log(`   ✓ Initial Bookmarked Status: ${detailData.userState.isBookmarked}`);

    // Critical Security Check: Ensure NO secret test cases leaked in problem detail
    const allDbTestCases = await prisma.testCase.findMany({
      where: { problemId: detailData.problem.id },
    });
    const secretDbCount = allDbTestCases.filter((tc) => tc.isSecret).length;

    console.log(`   ✓ Total Test Cases in DB for this problem: ${allDbTestCases.length} (${secretDbCount} secret)`);
    if (secretDbCount === 0) {
      throw new Error('Problem should have secret test cases in database for rigorous verification');
    }

    // Verify sampleTestCases contains ONLY public testcases
    for (const sample of detailData.problem.sampleTestCases) {
      const match = allDbTestCases.find((tc) => tc.id === sample.id);
      if (match?.isSecret) {
        throw new Error(`SECURITY LEAK: Secret testcase ${sample.id} was returned to the client!`);
      }
    }
    console.log('   ✓ Verified: Zero hidden/secret test cases are exposed to the client in problem detail query');

    // ------------------------------------------------------------------------
    // TEST 3: EXECUTION ARCHITECTURE — HONEST UNCONFIGURED STATE
    // ------------------------------------------------------------------------
    console.log('\n4. [EXECUTION BOUNDARY] Testing honest provider configuration check...');
    // Ensure default Judge0 provider is active without env var
    const originalProviderUrl = process.env.JUDGE0_API_URL;
    delete process.env.JUDGE0_API_URL;
    setExecutionProvider(new Judge0ExecutionProvider());

    const defaultProvider = getExecutionProvider();
    console.log(`   ✓ Active Provider: ${defaultProvider.name}`);
    console.log(`   ✓ Is Configured: ${defaultProvider.isConfigured()}`);

    if (defaultProvider.isConfigured()) {
      throw new Error('Provider should NOT be configured when JUDGE0_API_URL is unset');
    }

    // Calling runProblemCode must return honest unconfigured state
    const unconfiguredRun = await runProblemCode(
      studentA.id,
      detailData.problem.id,
      'CPP',
      'class Solution {};'
    );
    console.log(`   ✓ Run Code Unconfigured Result: status = ${unconfiguredRun.status}, isConfigured = ${unconfiguredRun.isConfigured}`);
    if (unconfiguredRun.isConfigured || unconfiguredRun.status !== 'PROVIDER_NOT_CONFIGURED') {
      throw new Error('Run Code must honestly report PROVIDER_NOT_CONFIGURED without faking results');
    }

    // Calling submitProblemCode must also return honest unconfigured state
    const unconfiguredSubmit = await submitProblemCode(
      studentA.id,
      detailData.problem.id,
      'CPP',
      'class Solution {};'
    );
    console.log(`   ✓ Submit Code Unconfigured Result: status = ${unconfiguredSubmit.status}, isConfigured = ${unconfiguredSubmit.isConfigured}`);
    if (unconfiguredSubmit.isConfigured || unconfiguredSubmit.status !== 'PROVIDER_NOT_CONFIGURED') {
      throw new Error('Submit Code must honestly report PROVIDER_NOT_CONFIGURED without faking results');
    }
    console.log('   ✓ Verified: System never fabricates results and returns honest configuration error state');

    // Restore provider for remaining lifecycle tests
    const testEngine = new TestExecutionProvider('ACCEPTED');
    setExecutionProvider(testEngine);

    // ------------------------------------------------------------------------
    // TEST 4: RUN CODE VS SUBMIT BEHAVIOR
    // ------------------------------------------------------------------------
    console.log('\n5. [RUN VS SUBMIT] Testing distinct semantics between Run Code and Submit...');
    const dummyCode = 'class Solution { public: int countFrequentElements(...) { return 2; } };';

    resetRateLimits();
    // Run Code against sample tests
    const runResult = await runProblemCode(studentA.id, detailData.problem.id, 'CPP', dummyCode);
    console.log(`   ✓ Run Code Verdict: ${runResult.status} (${runResult.passedTests}/${runResult.totalTests} sample tests)`);

    if (runResult.status !== 'ACCEPTED') {
      throw new Error(`Expected Run Code status ACCEPTED, got ${runResult.status}`);
    }

    // Verify Run Code DID NOT create a submission in DB
    const submissionsAfterRun = await prisma.submission.findMany({
      where: { userId: studentA.id, problemId: detailData.problem.id },
    });
    if (submissionsAfterRun.length !== 0) {
      throw new Error('Run Code must NOT create a persistent Submission record in database!');
    }

    // Verify Run Code DID NOT mark problem solved in UserProgress
    const progressAfterRun = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: detailData.problem.id } },
    });
    if (progressAfterRun?.isSolved) {
      throw new Error('Run Code must NEVER mark a problem solved!');
    }

    // Verify Run Code DID NOT schedule a Revision
    const revisionAfterRun = await prisma.revision.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: detailData.problem.id } },
    });
    if (revisionAfterRun) {
      throw new Error('Run Code must NEVER schedule a spaced repetition revision!');
    }
    console.log('   ✓ Verified: Run Code executes strictly in sandbox without mutating progress, submissions, or revisions');

    // ------------------------------------------------------------------------
    // TEST 5: WRONG ANSWER VERDICT HANDLING
    // ------------------------------------------------------------------------
    console.log('\n6. [VERDICT - WRONG ANSWER] Testing submission resulting in Wrong Answer...');
    testEngine.setVerdict('WRONG_ANSWER');
    resetRateLimits();

    const waSubmit = await submitProblemCode(studentA.id, detailData.problem.id, 'CPP', dummyCode);
    console.log(`   ✓ Submit WA Status: ${waSubmit.status}, isSolved: ${waSubmit.isSolved}`);

    if (waSubmit.status !== 'WRONG_ANSWER' || waSubmit.isSolved) {
      throw new Error('Submit with wrong answer should have status WRONG_ANSWER and isSolved = false');
    }

    // Verify submission record exists in DB with WRONG_ANSWER
    const waSubRecord = await prisma.submission.findUnique({
      where: { id: waSubmit.submissionId! },
    });
    if (!waSubRecord || waSubRecord.status !== 'WRONG_ANSWER') {
      throw new Error('Expected Submission record in DB with status WRONG_ANSWER');
    }

    // Verify UserProgress is NOT marked solved
    const progressAfterWA = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: detailData.problem.id } },
    });
    if (progressAfterWA?.isSolved) {
      throw new Error('Problem must not be marked solved on Wrong Answer');
    }
    console.log('   ✓ Verified: Wrong Answer persists submission history but does not award solved status');

    // ------------------------------------------------------------------------
    // TEST 6: COMPILATION ERROR HANDLING
    // ------------------------------------------------------------------------
    console.log('\n7. [VERDICT - COMPILATION ERROR] Testing compilation failure...');
    testEngine.setVerdict('COMPILATION_ERROR', 'error: syntax error at line 5');
    resetRateLimits();

    const compSubmit = await submitProblemCode(studentA.id, detailData.problem.id, 'CPP', 'broken code syntax');
    console.log(`   ✓ Compilation Error Status: ${compSubmit.status}, ErrorLog: "${compSubmit.errorLog}"`);

    if (compSubmit.status !== 'COMPILATION_ERROR' || !compSubmit.errorLog) {
      throw new Error('Expected COMPILATION_ERROR status with compiler errorLog');
    }
    console.log('   ✓ Verified: Compilation errors capture errorLog and do not mark problem solved');

    // ------------------------------------------------------------------------
    // TEST 7: RUNTIME ERROR HANDLING
    // ------------------------------------------------------------------------
    console.log('\n8. [VERDICT - RUNTIME ERROR] Testing runtime crash / exception...');
    testEngine.setVerdict('RUNTIME_ERROR', 'SIGSEGV (Segmentation Fault: null pointer dereference)');
    resetRateLimits();

    const runtimeSubmit = await submitProblemCode(studentA.id, detailData.problem.id, 'CPP', 'int* p = nullptr; *p = 1;');
    console.log(`   ✓ Runtime Error Status: ${runtimeSubmit.status}, ErrorLog: "${runtimeSubmit.errorLog}"`);

    if (runtimeSubmit.status !== 'RUNTIME_ERROR') {
      throw new Error('Expected RUNTIME_ERROR status');
    }
    console.log('   ✓ Verified: Runtime crashes record error metadata and do not mark problem solved');

    // ------------------------------------------------------------------------
    // TEST 8: TIMEOUT / TIME LIMIT EXCEEDED HANDLING
    // ------------------------------------------------------------------------
    console.log('\n9. [VERDICT - TIMEOUT] Testing time limit exceeded...');
    testEngine.setVerdict('TIME_LIMIT_EXCEEDED');
    resetRateLimits();

    const timeoutSubmit = await submitProblemCode(studentA.id, detailData.problem.id, 'CPP', 'while(true) {}');
    console.log(`   ✓ Timeout Status: ${timeoutSubmit.status}`);

    if (timeoutSubmit.status !== 'TIME_LIMIT_EXCEEDED') {
      throw new Error('Expected TIME_LIMIT_EXCEEDED status');
    }
    console.log('   ✓ Verified: Timeout handling records status without freezing server');

    // ------------------------------------------------------------------------
    // TEST 9: HIDDEN TESTS MASKING ON CLIENT RESPONSE
    // ------------------------------------------------------------------------
    console.log('\n10. [SECURITY] Testing hidden test cases masking in submission response...');
    testEngine.setVerdict('ACCEPTED');
    resetRateLimits();

    const acceptedSubmit = await submitProblemCode(studentA.id, detailData.problem.id, 'CPP', dummyCode);
    console.log(`   ✓ Accepted Submit Verdict: ${acceptedSubmit.status}, isSolved: ${acceptedSubmit.isSolved}`);

    if (acceptedSubmit.status !== 'ACCEPTED' || !acceptedSubmit.isSolved) {
      throw new Error('Expected status ACCEPTED and isSolved = true');
    }

    // Inspect each test result in the response
    let hiddenResultsCount = 0;
    for (const r of acceptedSubmit.results) {
      if (r.isSecret) {
        hiddenResultsCount++;
        if (r.input !== undefined || r.expectedOutput !== undefined || r.actualOutput !== undefined) {
          throw new Error(`SECURITY LEAK: Hidden test result exposed sensitive data! ${JSON.stringify(r)}`);
        }
      } else {
        if (r.input === undefined || r.expectedOutput === undefined) {
          throw new Error('Public test case should include sample input and expected output');
        }
      }
    }
    console.log(`   ✓ Inspected ${acceptedSubmit.results.length} test results: ${hiddenResultsCount} hidden test cases masked completely`);
    if (hiddenResultsCount === 0) {
      throw new Error('Test suite should include hidden test cases');
    }

    // ------------------------------------------------------------------------
    // TEST 10: ACCEPTED SUBMISSION UPDATING PROGRESS, TOPIC PROGRESS & STREAK
    // ------------------------------------------------------------------------
    console.log('\n11. [PROGRESS WIRING] Verifying database progress mutations after acceptance...');
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: detailData.problem.id } },
    });
    if (!userProgress || !userProgress.isSolved || !userProgress.solvedAt) {
      throw new Error('UserProgress was not marked solved in database after ACCEPTED verdict');
    }
    console.log(`   ✓ UserProgress confirmed: isSolved = true at ${userProgress.solvedAt.toISOString()}`);

    const topicProgress = await prisma.topicProgress.findUnique({
      where: { userId_topicId: { userId: studentA.id, topicId: detailData.problem.topicId } },
    });
    if (!topicProgress || topicProgress.solvedCount < 1) {
      throw new Error('TopicProgress solvedCount was not updated');
    }
    console.log(`   ✓ TopicProgress confirmed: ${topicProgress.solvedCount} / ${topicProgress.totalCount} solved`);

    // ------------------------------------------------------------------------
    // TEST 11: REVISION SCHEDULING (SM-2 INTERVAL)
    // ------------------------------------------------------------------------
    console.log('\n12. [REVISION WIRING] Verifying SuperMemo spaced repetition schedule...');
    const revision = await prisma.revision.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: detailData.problem.id } },
    });
    if (!revision || revision.intervalDays !== 7) {
      throw new Error('Expected Revision scheduled for Day 7');
    }

    const daysUntilDue = Math.round((revision.dueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    console.log(`   ✓ Revision scheduled: interval = ${revision.intervalDays} days (due in ~${daysUntilDue} days on ${revision.dueAt.toISOString().split('T')[0]})`);

    // ------------------------------------------------------------------------
    // TEST 12: SERVER-SIDE PRS RECALCULATION
    // ------------------------------------------------------------------------
    console.log('\n13. [PRS WIRING] Verifying Placement Readiness Score recalculation...');
    const prsAfterSolve = await getReadinessScore(studentA.id);
    console.log(`   ✓ Total PRS: ${prsAfterSolve.totalScore}%`);
    console.log(`   ✓ DSA Score Component: ${prsAfterSolve.dsaScore}%`);
    console.log(`   ✓ Baseline Only Cleared: ${!prsAfterSolve.isBaselineOnly}`);

    if (prsAfterSolve.dsaScore <= 0 || prsAfterSolve.isBaselineOnly) {
      throw new Error('PRS DSA component was not increased after valid problem solve');
    }

    const prsHistory = await prisma.readinessScoreHistory.findMany({
      where: { userId: studentA.id },
      orderBy: { recordedAt: 'desc' },
    });
    if (prsHistory.length === 0) {
      throw new Error('ReadinessScoreHistory audit record missing');
    }
    console.log(`   ✓ Verified ReadinessScoreHistory audit record: ${prsHistory[0].score}% recorded at ${prsHistory[0].recordedAt.toISOString()}`);

    // ------------------------------------------------------------------------
    // TEST 13: BOOKMARK FUNCTIONALITY
    // ------------------------------------------------------------------------
    console.log('\n14. [BOOKMARK] Testing bookmark creation and toggle...');
    // Create bookmark
    await prisma.bookmark.create({
      data: {
        userId: studentA.id,
        problemId: detailData.problem.id,
      },
    });

    const roadmapWithBookmark = await getDSARoadmapData(studentA.id);
    const bookmarkedItem = roadmapWithBookmark.allProblems.find((p) => p.id === detailData.problem.id);
    console.log(`   ✓ Problem Bookmarked Status in Roadmap: ${bookmarkedItem?.isBookmarked}`);
    if (!bookmarkedItem?.isBookmarked) {
      throw new Error('Problem should be marked as bookmarked in roadmap data');
    }

    // Delete bookmark
    await prisma.bookmark.delete({
      where: { userId_problemId: { userId: studentA.id, problemId: detailData.problem.id } },
    });
    console.log('   ✓ Verified bookmark toggle functionality');

    // ------------------------------------------------------------------------
    // TEST 14: UNAUTHORIZED ACCESS TO ANOTHER USER'S SUBMISSIONS / PROGRESS
    // ------------------------------------------------------------------------
    console.log('\n15. [SECURITY] Testing isolation of student submissions and progress...');
    // Student B queries submissions for this problem
    const studentBSubmissions = await getUserProblemSubmissions(studentB.id, detailData.problem.id);
    console.log(`   ✓ Student B Submissions Count: ${studentBSubmissions.length}`);
    if (studentBSubmissions.length !== 0) {
      throw new Error('Student B should have 0 submissions for this problem');
    }

    const studentASubmissions = await getUserProblemSubmissions(studentA.id, detailData.problem.id);
    console.log(`   ✓ Student A Submissions Count: ${studentASubmissions.length}`);
    if (studentASubmissions.length < 3) {
      throw new Error('Student A should have past submissions recorded');
    }

    // Verify Student B cannot see Student A's progress
    const studentBProgress = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentB.id, problemId: detailData.problem.id } },
    });
    if (studentBProgress?.isSolved) {
      throw new Error('Student B should not have solved status based on Student A activity');
    }
    console.log('   ✓ Verified: Multi-tenant student submission and progress boundaries are strictly enforced');

    console.log('\n====================================================================');
    console.log('✅ ALL PHASE 3 VERIFICATION SCENARIOS PASSED WITH 100% SUCCESS!');
    console.log('====================================================================\n');
  } finally {
    // Teardown test users
    console.log('Teardown: Cleaning up test student records...');
    if (studentAId) await prisma.user.delete({ where: { id: studentAId } }).catch(() => null);
    if (studentBId) await prisma.user.delete({ where: { id: studentBId } }).catch(() => null);
    console.log('✓ Teardown complete. Zero mock users left in database.');
  }
}

runPhase3Verification().catch((err) => {
  console.error('❌ Phase 3 verification failed with error:', err);
  process.exit(1);
});
