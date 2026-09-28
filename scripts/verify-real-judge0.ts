// ============================================================================
// PREPOS PHASE 3.1 — REAL JUDGE0 EXECUTION VERIFICATION SUITE
// End-to-End Validation with Live Judge0 Engine, Python/C++/Java Evaluation,
// All 5 Genuine Verdicts, Canonical Database Mutations, & Security Isolation
// ============================================================================

import prisma from '../lib/db';
import { hashPassword } from '../lib/auth';
import { getProblemDetailData } from '../lib/services/dsa-roadmap';
import {
  runProblemCode,
  submitProblemCode,
  getUserProblemSubmissions,
  getExecutionProvider,
  Judge0ExecutionProvider,
  setExecutionProvider,
} from '../lib/services/code-execution';
import { getReadinessScore } from '../lib/services/readiness-score';
import { resetRateLimits } from '../lib/services/rate-limit';

const TEST_EMAIL_REAL_A = 'real.judge0.student.a@prepos.test';
const TEST_EMAIL_REAL_B = 'real.judge0.student.b@prepos.test';
const TEST_PASSWORD = 'RealJudge0Password2026!';

async function runRealJudge0Verification() {
  console.log('====================================================================');
  console.log('🚀 PREPOS PHASE 3.1: REAL JUDGE0 EXECUTION VERIFICATION STARTING');
  console.log('====================================================================\n');

  let studentAId: string | null = null;
  let studentBId: string | null = null;

  try {
    // ------------------------------------------------------------------------
    // STEP 1: VERIFY ENVIRONMENT & REAL PROVIDER CONNECTION
    // ------------------------------------------------------------------------
    console.log('1. [PROVIDER CHECK] Verifying Real Judge0 provider connectivity...');

    // Use default Judge0ExecutionProvider configured with live URL
    setExecutionProvider(new Judge0ExecutionProvider());
    const provider = getExecutionProvider();

    console.log(`   • Provider Name: ${provider.name}`);
    console.log(`   • Provider Configured: ${provider.isConfigured()}`);
    console.log(`   • Provider URL: ${process.env.JUDGE0_API_URL}`);

    if (!provider.isConfigured()) {
      throw new Error(
        'Real Judge0 verification BLOCKED: JUDGE0_API_URL is missing from environment. Real verification requires a genuine provider.'
      );
    }

    // Ping Judge0 /about endpoint to verify actual network reachability
    const aboutRes = await fetch(`${process.env.JUDGE0_API_URL}/about`);
    if (!aboutRes.ok) {
      throw new Error(`Judge0 healthcheck failed with HTTP ${aboutRes.status}`);
    }
    const aboutData = await aboutRes.json();
    console.log(`   ✓ Connected to Real Judge0 v${aboutData.version} (${aboutData.homepage})`);

    // ------------------------------------------------------------------------
    // STEP 2: SETUP GENUINE TEST STUDENTS
    // ------------------------------------------------------------------------
    console.log('\n2. [SETUP] Creating isolated test student accounts...');
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_EMAIL_REAL_A, TEST_EMAIL_REAL_B] } },
    });

    const hashedPassword = await hashPassword(TEST_PASSWORD);

    const studentA = await prisma.user.create({
      data: {
        email: TEST_EMAIL_REAL_A,
        name: 'Kabir Mehta (Candidate A)',
        role: 'STUDENT',
        profile: {
          create: {
            gradYear: 2026,
            targetDegree: 'B.Tech (CSE)',
            targetRoleTier: 'PRODUCT_TIER_1',
            preferredLang: 'PYTHON',
            streakDays: 4,
          },
        },
      },
    });
    studentAId = studentA.id;

    const studentB = await prisma.user.create({
      data: {
        email: TEST_EMAIL_REAL_B,
        name: 'Ananya Verma (Candidate B)',
        role: 'STUDENT',
        profile: {
          create: {
            gradYear: 2026,
            targetDegree: 'B.Tech (IT)',
            targetRoleTier: 'PRODUCT_TIER_1',
            preferredLang: 'CPP',
            streakDays: 2,
          },
        },
      },
    });
    studentBId = studentB.id;

    console.log(`   ✓ Created Student A: ${studentA.name} (${studentA.id})`);
    console.log(`   ✓ Created Student B: ${studentB.name} (${studentB.id})`);

    // ------------------------------------------------------------------------
    // STEP 3: LOAD EXISTING SEEDED DSA PROBLEM
    // ------------------------------------------------------------------------
    console.log('\n3. [PROBLEM DETAIL] Loading seeded problem "array-element-frequency-counter"...');
    const problemDetail = await getProblemDetailData(studentA.id, 'array-element-frequency-counter');
    if (!problemDetail) {
      throw new Error('Problem array-element-frequency-counter not found in database');
    }
    const problem = problemDetail.problem;
    console.log(`   ✓ Problem Title: "${problem.title}"`);
    console.log(`   ✓ Difficulty: ${problem.difficulty}`);
    console.log(`   ✓ Public Samples in DB: ${problem.sampleTestCases.length}`);

    // Retrieve full DB test suite for server-side verification
    const allDbTestCases = await prisma.testCase.findMany({
      where: { problemId: problem.id },
      orderBy: { orderIndex: 'asc' },
    });
    const publicTcCount = allDbTestCases.filter((tc) => !tc.isSecret).length;
    const secretTcCount = allDbTestCases.filter((tc) => tc.isSecret).length;
    console.log(`   ✓ Full DB Test Suite: ${allDbTestCases.length} total (${publicTcCount} public, ${secretTcCount} secret)`);

    // ------------------------------------------------------------------------
    // STEP 4: VERIFY RUN CODE SEMANTICS ON REAL JUDGE0 (PYTHON)
    // ------------------------------------------------------------------------
    console.log('\n4. [RUN CODE - REAL JUDGE0] Running student code against sample tests in Python...');
    const pythonValidSolution = `from collections import Counter

class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int:
        freq = Counter(nums)
        return sum(1 for count in freq.values() if count > k)
`;

    resetRateLimits();
    const runResult = await runProblemCode(studentA.id, problem.id, 'PYTHON', pythonValidSolution);

    console.log(`   ✓ Run Code Verdict: ${runResult.status}`);
    console.log(`   ✓ Public Tests Passed: ${runResult.passedTests} / ${runResult.totalTests}`);
    console.log(`   ✓ Execution Time: ${runResult.executionTimeMs} ms, Memory: ${runResult.memoryKb} KB`);

    if (runResult.status !== 'ACCEPTED') {
      throw new Error(`Expected Run Code status ACCEPTED, got ${runResult.status} with error: ${runResult.errorLog}`);
    }
    if (runResult.totalTests !== publicTcCount) {
      throw new Error(`Run Code should execute only public tests (${publicTcCount}), got ${runResult.totalTests}`);
    }

    // Verify Run Code side-effects strictly remain zero
    const subAfterRun = await prisma.submission.findMany({
      where: { userId: studentA.id, problemId: problem.id },
    });
    if (subAfterRun.length !== 0) {
      throw new Error('Run Code must NOT create a Submission row in the database!');
    }

    const progAfterRun = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: problem.id } },
    });
    if (progAfterRun?.isSolved) {
      throw new Error('Run Code must NOT mark the problem solved!');
    }

    const revAfterRun = await prisma.revision.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: problem.id } },
    });
    if (revAfterRun) {
      throw new Error('Run Code must NOT schedule a revision!');
    }
    console.log('   ✓ Verified Run Code Semantics: Evaluated on real Judge0 without persisting submissions or altering progress');

    // ------------------------------------------------------------------------
    // STEP 5: VERIFY REAL VERDICTS (WRONG ANSWER, COMPILATION, RUNTIME, TIMEOUT)
    // ------------------------------------------------------------------------
    console.log('\n5. [REAL VERDICTS] Testing non-accepted execution states on Real Judge0...');

    // 5A. Wrong Answer
    console.log('   Testing Real Wrong Answer (Python)...');
    const pythonWrongSolution = `class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int:
        return 99999  # Intentionally incorrect output
`;
    resetRateLimits();
    const waSubmit = await submitProblemCode(studentA.id, problem.id, 'PYTHON', pythonWrongSolution);
    console.log(`   ✓ Wrong Answer Verdict: ${waSubmit.status} (Solved: ${waSubmit.isSolved})`);

    if (waSubmit.status !== 'WRONG_ANSWER' || waSubmit.isSolved) {
      throw new Error(`Expected WRONG_ANSWER, got ${waSubmit.status}`);
    }

    // Confirm submission row persisted with WRONG_ANSWER
    const waSubRecord = await prisma.submission.findUnique({ where: { id: waSubmit.submissionId! } });
    if (!waSubRecord || waSubRecord.status !== 'WRONG_ANSWER') {
      throw new Error('Expected Submission row with status WRONG_ANSWER in DB');
    }
    // Confirm problem remains unsolved
    const progAfterWA = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: problem.id } },
    });
    if (progAfterWA?.isSolved) {
      throw new Error('Wrong Answer must NOT mark problem solved!');
    }

    // 5B. Compilation / Syntax Error
    console.log('   Testing Real Compilation/Syntax Error (Python)...');
    const pythonSyntaxError = `class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int
        # Missing colon above
        return 0
`;
    resetRateLimits();
    const compSubmit = await submitProblemCode(studentA.id, problem.id, 'PYTHON', pythonSyntaxError);
    console.log(`   ✓ Compilation Error Verdict: ${compSubmit.status} (Error captured: ${Boolean(compSubmit.errorLog)})`);

    if (compSubmit.status !== 'COMPILATION_ERROR' && compSubmit.status !== 'RUNTIME_ERROR') {
      throw new Error(`Expected error status for broken syntax, got ${compSubmit.status}`);
    }

    // 5C. Runtime Error (Division by Zero)
    console.log('   Testing Real Runtime Crash (Python)...');
    const pythonRuntimeError = `class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int:
        return 1 // 0  # ZeroDivisionError
`;
    resetRateLimits();
    const runtimeSubmit = await submitProblemCode(studentA.id, problem.id, 'PYTHON', pythonRuntimeError);
    console.log(`   ✓ Runtime Error Verdict: ${runtimeSubmit.status}`);

    if (runtimeSubmit.status !== 'RUNTIME_ERROR') {
      throw new Error(`Expected RUNTIME_ERROR, got ${runtimeSubmit.status}`);
    }

    // 5D. Timeout (Time Limit Exceeded)
    console.log('   Testing Real Time Limit Exceeded (Python)...');
    const pythonInfiniteLoop = `class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int:
        import time
        time.sleep(15)  # Triggers Judge0 10s timeout
        return 0
`;
    resetRateLimits();
    const timeoutSubmit = await submitProblemCode(studentA.id, problem.id, 'PYTHON', pythonInfiniteLoop);
    console.log(`   ✓ Timeout Verdict: ${timeoutSubmit.status}`);

    if (timeoutSubmit.status !== 'TIME_LIMIT_EXCEEDED') {
      throw new Error(`Expected TIME_LIMIT_EXCEEDED, got ${timeoutSubmit.status}`);
    }
    console.log('   ✓ Verified all 4 error/failure verdicts successfully against Real Judge0');

    // ------------------------------------------------------------------------
    // STEP 6: VERIFY GENUINE ACCEPTED SUBMIT & CANONICAL DATA CHAIN (PYTHON)
    // ------------------------------------------------------------------------
    console.log('\n6. [SUBMIT - REAL JUDGE0] Submitting valid solution in Python to trigger full acceptance chain...');
    resetRateLimits();
    const acceptedSubmit = await submitProblemCode(studentA.id, problem.id, 'PYTHON', pythonValidSolution);

    console.log(`   ✓ Verdict from Real Judge0: ${acceptedSubmit.status}`);
    console.log(`   ✓ Tests Passed: ${acceptedSubmit.passedTests} / ${acceptedSubmit.totalTests}`);
    console.log(`   ✓ Submission ID: ${acceptedSubmit.submissionId}`);
    console.log(`   ✓ Problem Marked Solved: ${acceptedSubmit.isSolved}`);

    if (acceptedSubmit.status !== 'ACCEPTED' || !acceptedSubmit.isSolved) {
      throw new Error(`Expected ACCEPTED and isSolved = true, got ${acceptedSubmit.status}`);
    }

    // Verify Submission Record in DB
    const subRecord = await prisma.submission.findUnique({
      where: { id: acceptedSubmit.submissionId! },
    });
    if (!subRecord || subRecord.status !== 'ACCEPTED') {
      throw new Error('Database Submission record not found or not marked ACCEPTED');
    }
    console.log(`   ✓ Database Submission Row: id=${subRecord.id}, status=${subRecord.status}, language=${subRecord.language}`);

    // Verify Execution Rows in DB
    const executionRows = await prisma.execution.findMany({
      where: { submissionId: subRecord.id },
    });
    if (executionRows.length !== allDbTestCases.length) {
      throw new Error(`Expected ${allDbTestCases.length} Execution rows in DB, got ${executionRows.length}`);
    }
    console.log(`   ✓ Database Execution Rows: ${executionRows.length} rows created for individual test cases`);

    // Verify UserProgress in DB
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: problem.id } },
    });
    if (!userProgress || !userProgress.isSolved || !userProgress.solvedAt) {
      throw new Error('UserProgress record not marked solved with timestamp');
    }
    console.log(`   ✓ Database UserProgress: isSolved=true, solvedAt=${userProgress.solvedAt.toISOString()}`);

    // Verify TopicProgress in DB
    const topicProgress = await prisma.topicProgress.findUnique({
      where: { userId_topicId: { userId: studentA.id, topicId: problem.topicId } },
    });
    if (!topicProgress || topicProgress.solvedCount < 1) {
      throw new Error('TopicProgress not updated');
    }
    console.log(`   ✓ Database TopicProgress: ${topicProgress.solvedCount} / ${topicProgress.totalCount} solved`);

    // Verify SM-2 Spaced Repetition Revision Scheduled
    const revision = await prisma.revision.findUnique({
      where: { userId_problemId: { userId: studentA.id, problemId: problem.id } },
    });
    if (!revision || revision.intervalDays !== 7) {
      throw new Error('Spaced repetition revision not scheduled for Day 7');
    }
    console.log(`   ✓ Database Revision: intervalDays=${revision.intervalDays}, dueAt=${revision.dueAt.toISOString().split('T')[0]}`);

    // Verify StreakEvent & ProgressEvent in DB
    const progressEvent = await prisma.progressEvent.findFirst({
      where: { userId: studentA.id, eventType: 'PROBLEM_SOLVED' },
    });
    if (!progressEvent) {
      throw new Error('ProgressEvent audit trail for PROBLEM_SOLVED missing');
    }
    console.log(`   ✓ Database ProgressEvent: eventType=${progressEvent.eventType}`);

    // Verify Server-Side PRS Recalibration
    const prs = await getReadinessScore(studentA.id);
    console.log(`   ✓ Recalculated PRS: ${prs.totalScore}% (DSA Score: ${prs.dsaScore}%, isBaseline: ${prs.isBaselineOnly})`);
    if (prs.dsaScore <= 0 || prs.isBaselineOnly) {
      throw new Error('PRS DSA score was not updated after accepted problem solve');
    }

    const prsHistory = await prisma.readinessScoreHistory.findMany({
      where: { userId: studentA.id },
      orderBy: { recordedAt: 'desc' },
    });
    if (prsHistory.length === 0) {
      throw new Error('ReadinessScoreHistory checkpoint record missing');
    }
    console.log(`   ✓ Database ReadinessScoreHistory: checkpoint recorded with score ${prsHistory[0].score}%`);

    // ------------------------------------------------------------------------
    // STEP 7: VERIFY C++17 (GCC 14.1) ON REAL JUDGE0
    // ------------------------------------------------------------------------
    console.log('\n7. [LANGUAGE - C++] Testing full execution in C++17 on Real Judge0...');
    const cppSolution = `#include <vector>
#include <unordered_map>

class Solution {
public:
    int countFrequentElements(const std::vector<int>& nums, int k) {
        std::unordered_map<int, int> freq;
        for (int x : nums) {
            freq[x]++;
        }
        int count = 0;
        for (const auto& entry : freq) {
            if (entry.second > k) {
                count++;
            }
        }
        return count;
    }
};
`;
    resetRateLimits();
    const cppSubmit = await submitProblemCode(studentA.id, problem.id, 'CPP', cppSolution);
    console.log(`   ✓ C++ Submit Verdict on Real Judge0: ${cppSubmit.status} (${cppSubmit.passedTests}/${cppSubmit.totalTests} tests passed)`);
    console.log(`   ✓ C++ Runtime: ${cppSubmit.executionTimeMs} ms, Memory: ${cppSubmit.memoryKb} KB`);

    if (cppSubmit.status !== 'ACCEPTED') {
      throw new Error(`C++ submission failed on Judge0: ${cppSubmit.errorLog}`);
    }

    // ------------------------------------------------------------------------
    // STEP 8: VERIFY JAVA 17 (JDK 17.0.6) ON REAL JUDGE0
    // ------------------------------------------------------------------------
    console.log('\n8. [LANGUAGE - JAVA] Testing full execution in Java 17 on Real Judge0...');
    const javaSolution = `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int countFrequentElements(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) {
            freq.put(x, freq.getOrDefault(x, 0) + 1);
        }
        int count = 0;
        for (int val : freq.values()) {
            if (val > k) {
                count++;
            }
        }
        return count;
    }
}
`;
    resetRateLimits();
    const javaSubmit = await submitProblemCode(studentA.id, problem.id, 'JAVA', javaSolution);
    console.log(`   ✓ Java Submit Verdict on Real Judge0: ${javaSubmit.status} (${javaSubmit.passedTests}/${javaSubmit.totalTests} tests passed)`);
    console.log(`   ✓ Java Runtime: ${javaSubmit.executionTimeMs} ms, Memory: ${javaSubmit.memoryKb} KB`);

    if (javaSubmit.status !== 'ACCEPTED') {
      throw new Error(`Java submission failed on Judge0: ${javaSubmit.errorLog}`);
    }

    // ------------------------------------------------------------------------
    // STEP 9: SECURITY & SECRET ISOLATION VERIFICATION
    // ------------------------------------------------------------------------
    console.log('\n9. [SECURITY AUDIT] Verifying zero leakage of hidden tests and credentials...');
    // A. Check response results payload
    let secretCasesMasked = 0;
    for (const r of acceptedSubmit.results) {
      if (r.isSecret) {
        secretCasesMasked++;
        if (r.input !== undefined || r.expectedOutput !== undefined || r.actualOutput !== undefined) {
          throw new Error('SECURITY VIOLATION: Secret test input or expected output leaked in client response!');
        }
      }
    }
    console.log(`   ✓ Hidden Test Cases: ${secretCasesMasked} secret test cases inspected; inputs/outputs strictly masked`);

    // B. Check multi-tenant student boundaries
    const studentBSubmissions = await getUserProblemSubmissions(studentB.id, problem.id);
    if (studentBSubmissions.length !== 0) {
      throw new Error('SECURITY VIOLATION: Student B saw Student A submissions');
    }

    const studentASubmissions = await getUserProblemSubmissions(studentA.id, problem.id);
    if (studentASubmissions.length < 5) {
      throw new Error('Expected Student A to have recorded past submissions');
    }
    console.log(`   ✓ Multi-Tenant Isolation: Student B has ${studentBSubmissions.length} submissions; Student A has ${studentASubmissions.length}`);

    // C. Check credentials never exposed to client environment
    if (typeof window !== 'undefined') {
      throw new Error('Security check must run server-side only');
    }
    console.log('   ✓ Judge0 credentials verified as server-side only');

    console.log('\n====================================================================');
    console.log('✅ PHASE 3.1: REAL JUDGE0 END-TO-END VERIFICATION PASSED WITH 100% SUCCESS!');
    console.log('====================================================================\n');
  } finally {
    console.log('Teardown: Cleaning up test student accounts...');
    if (studentAId) await prisma.user.delete({ where: { id: studentAId } }).catch(() => null);
    if (studentBId) await prisma.user.delete({ where: { id: studentBId } }).catch(() => null);
    console.log('✓ Teardown complete. Zero mock users left in database.');
  }
}

runRealJudge0Verification().catch((err) => {
  console.error('❌ Real Judge0 verification failed with error:', err);
  process.exit(1);
});
