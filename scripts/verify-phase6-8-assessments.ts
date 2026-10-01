// ============================================================================
// PREPOS PHASE 6.8 VERIFICATION SUITE
// Mock Assessment Engine & Performance Analytics Redesign
// ============================================================================

import prisma from '../lib/db';
import {
  getAssessmentCatalogData,
  getAssessmentOverview,
  getAssessmentWorkspaceData,
  getAssessmentHistoricalAttempts,
  startOrResumeAssessment,
  autosaveMCQAnswer,
  autosaveCodeDraft,
} from '../lib/services/assessment';
import {
  compileResultSummary,
  evaluateAssessmentAttempt,
} from '../lib/services/assessment-scoring';

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

async function runPhase68Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.8: MOCK ASSESSMENT ENGINE & ANALYTICS');
  console.log('============================================================\n');

  try {
    // Setup test candidates
    let userA = await prisma.user.findFirst({
      where: { email: 'priya.candidate@univ.edu' },
      select: { id: true, email: true, name: true },
    });
    if (!userA) {
      userA = await prisma.user.findFirst({
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userA), 'Candidate found in database');

    let userB = await prisma.user.findFirst({
      where: { id: { not: userA!.id } },
      select: { id: true, email: true, name: true },
    });
    if (!userB) {
      userB = await prisma.user.create({
        data: {
          email: 'isolation.test.candidate@univ.edu',
          name: 'Isolation Candidate',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary candidate found for multi-tenant isolation');

    if (!userA || !userB) {
      console.error('Prerequisite users missing. Aborting verification.');
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // SECTION 1: Assessment Catalog Loading & Metadata
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Assessment Catalog Loading & Metadata ---');
    const catalogData = await getAssessmentCatalogData(userA.id);

    assert(Boolean(catalogData), 'Catalog data loads successfully for student');
    assert(catalogData.totalAssessments > 0, `Catalog contains published assessments (${catalogData.totalAssessments})`);
    assert(Array.isArray(catalogData.assessments), 'Catalog returns structured array of assessment items');
    assert(typeof catalogData.attemptedCount === 'number', 'Attempted count is numeric');
    assert(typeof catalogData.passedCount === 'number', 'Passed count is numeric');
    assert(typeof catalogData.averageScorePct === 'number', 'Average score percentage is numeric');

    // Find the published Amazon assessment
    const amazonAssessment = catalogData.assessments.find((a) => a.company.slug === 'amazon');
    assert(Boolean(amazonAssessment), 'Amazon online assessment simulation present in catalog');

    if (amazonAssessment) {
      assert(amazonAssessment.company.name === 'Amazon', 'Company relationship populated accurately');
      assert(amazonAssessment.durationMin > 0, `Duration metadata present: ${amazonAssessment.durationMin} mins`);
      assert(amazonAssessment.totalMarks > 0, `Total marks metadata present: ${amazonAssessment.totalMarks} points`);
      assert(amazonAssessment.totalQuestions > 0, `Question count metadata present: ${amazonAssessment.totalQuestions} questions`);
      assert(amazonAssessment.sections.length >= 2, `Assessment has multi-section structure (${amazonAssessment.sections.length} sections)`);

      const hasCodingSection = amazonAssessment.sections.some((s) => s.type === 'CODING');
      const hasCoreCSSection = amazonAssessment.sections.some((s) => s.type === 'CORE_CS');
      assert(hasCodingSection && hasCoreCSSection, 'Assessment contains both Coding and Core CS sections');
      assert(amazonAssessment.assessmentType === 'Coding + Core CS MCQ', `Assessment type classified: "${amazonAssessment.assessmentType}"`);
      assert(Boolean(amazonAssessment.difficulty), `Difficulty tier present: ${amazonAssessment.difficulty}`);
      assert(Boolean(amazonAssessment.status), `Attempt status categorized: ${amazonAssessment.status}`);
    }

    // ------------------------------------------------------------------------
    // SECTION 2: Target Company Integration with Catalog
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Target Company Integration ---');
    // Ensure Amazon is marked as target for Priya
    await prisma.progressEvent.create({
      data: {
        userId: userA.id,
        eventType: 'TARGET_COMPANY_SET',
        metadata: JSON.stringify({ companySlug: 'amazon', companyName: 'Amazon' }),
      },
    });

    const catalogWithTarget = await getAssessmentCatalogData(userA.id);
    const targetAmazon = catalogWithTarget.assessments.find((a) => a.company.slug === 'amazon');
    assert(targetAmazon?.company.isTarget === true, 'Amazon assessment reflects target company status (isTarget = true)');

    // Verify User B does not have Amazon as target
    const catalogUserB = await getAssessmentCatalogData(userB.id);
    const userBAmazon = catalogUserB.assessments.find((a) => a.company.slug === 'amazon');
    assert(userBAmazon?.company.isTarget === false, 'User B catalog correctly shows Amazon is NOT their target');

    // ------------------------------------------------------------------------
    // SECTION 3: Deep Link & Overview Metadata (/dashboard/assessments/[id])
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Assessment Overview & Deep Links ---');
    const testAssessmentSlug = amazonAssessment!.slug;
    const overview = await getAssessmentOverview(testAssessmentSlug, userA.id);
    assert(Boolean(overview), `Overview loads via slug "${testAssessmentSlug}"`);
    assert(overview?.title.length! > 0, 'Overview contains full assessment title');
    assert(overview?.companySlug === 'amazon', 'Overview contains companySlug for back-link routing');
    assert(overview?.sections.length! >= 2, 'Overview contains detailed section specs');
    assert(Array.isArray(overview?.pastAttempts), 'Overview includes past attempt history');

    // ------------------------------------------------------------------------
    // SECTION 4: Authoritative Server Timer & Security Invariants
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Authoritative Timer & Security Audit ---');
    // Start fresh attempt for Priya
    const startResult = await startOrResumeAssessment(userA.id, testAssessmentSlug);
    assert(Boolean(startResult.attemptId), 'Assessment attempt initialized via startOrResumeAssessment');

    const workspaceData = await getAssessmentWorkspaceData(userA.id, startResult.attemptId);
    assert(Boolean(workspaceData), 'Assessment workspace payload generated');
    assert(workspaceData.remainingSeconds > 0, `Authoritative remaining time calculated: ${workspaceData.remainingSeconds}s`);

    const expiryTime = new Date(workspaceData.expiresAt).getTime();
    const serverTime = new Date(workspaceData.serverTime).getTime();
    const diffMin = Math.round((expiryTime - serverTime) / 60000);
    assert(diffMin === workspaceData.durationMin, `Server-authoritative timer matches durationMin (${diffMin}m == ${workspaceData.durationMin}m)`);

    // Security Audit 1: Answer Key Protection
    let mcqOptionsExposed = false;
    workspaceData.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.type === 'MCQ' && q.options) {
          q.options.forEach((opt: any) => {
            if ('isCorrect' in opt) mcqOptionsExposed = true;
          });
        }
      });
    });
    assert(!mcqOptionsExposed, 'Security Audit: isCorrect is strictly stripped from client MCQ options during attempt');

    // Security Audit 2: Hidden Test Cases Protection
    let hiddenTestCasesExposed = false;
    workspaceData.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.type === 'CODING' && q.sampleTestCases) {
          q.sampleTestCases.forEach((tc: any) => {
            if (tc.isSecret === true) hiddenTestCasesExposed = true;
          });
        }
      });
    });
    assert(!hiddenTestCasesExposed, 'Security Audit: Hidden/secret test cases are strictly excluded from workspace payload');

    // ------------------------------------------------------------------------
    // SECTION 5: Autosave & Attempt Lifecycle
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Autosave & Attempt Lifecycle ---');
    const mcqSection = workspaceData.sections.find((s) => s.type === 'CORE_CS');
    const mcqQuestion = mcqSection?.questions[0];
    assert(Boolean(mcqQuestion), 'Found MCQ question in assessment workspace');

    if (mcqQuestion && mcqQuestion.options && mcqQuestion.options.length > 0) {
      const optionToSelect = mcqQuestion.options[0].id;
      const autosaveRes = await autosaveMCQAnswer(userA.id, startResult.attemptId, mcqQuestion.id, optionToSelect);
      assert(autosaveRes.success === true, 'MCQ answer successfully autosaved to database');

      // Verify persistence in DB
      const persistedAnswer = await prisma.assessmentAnswer.findFirst({
        where: { attemptId: startResult.attemptId, questionId: mcqQuestion.id },
      });
      assert(persistedAnswer?.selectedOptionId === optionToSelect, 'Saved MCQ choice verified in AssessmentAnswer record');
    }

    const codingSection = workspaceData.sections.find((s) => s.type === 'CODING');
    const codingQuestion = codingSection?.questions[0];
    assert(Boolean(codingQuestion), 'Found Coding question in assessment workspace');

    if (codingQuestion) {
      const codeSnippet = 'class Solution { public: int solve() { return 42; } };';
      const codeAutosaveRes = await autosaveCodeDraft(
        userA.id,
        startResult.attemptId,
        codingQuestion.id,
        codeSnippet,
        'CPP'
      );
      assert(codeAutosaveRes.success === true, 'Code draft successfully autosaved to database');

      const persistedDraft = await prisma.assessmentAnswer.findFirst({
        where: { attemptId: startResult.attemptId, questionId: codingQuestion.id },
      });
      assert(persistedDraft?.codeDraft === codeSnippet, 'Saved code draft verified in AssessmentAnswer record');
    }

    // ------------------------------------------------------------------------
    // SECTION 6: Evaluation, Scoring & Negative Marking
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Evaluation, Scoring & Negative Marking ---');
    // Evaluate the attempt
    const evalResult = await evaluateAssessmentAttempt(startResult.attemptId);
    assert(Boolean(evalResult), 'Assessment evaluated by authoritative scoring service');
    assert(evalResult.status === 'EVALUATED', 'Attempt status updated to EVALUATED');
    assert(typeof evalResult.totalScore === 'number', `Total score compiled: ${evalResult.totalScore} pts`);
    assert(evalResult.sections.length >= 2, 'Section score summaries generated');

    // Check section score records in DB
    const sectionScores = await prisma.assessmentSectionScore.findMany({
      where: { attemptId: startResult.attemptId },
    });
    assert(sectionScores.length >= 2, `AssessmentSectionScore persisted in DB (${sectionScores.length} records)`);

    // Verify negative marking structure
    const coreCsScore = sectionScores.find((ss) => ss.sectionId === mcqSection?.id);
    assert(Boolean(coreCsScore), 'Core CS section score record exists');
    assert(coreCsScore!.score >= 0, `Section score is bounded at 0.0 minimum (${coreCsScore!.score} pts)`);

    // ------------------------------------------------------------------------
    // SECTION 7: Comprehensive Performance Scorecard & Review
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Scorecard & Question Review Payload ---');
    const summary = await compileResultSummary(startResult.attemptId);
    assert(summary.attemptId === startResult.attemptId, 'Result summary matches attemptId');
    assert(summary.companySlug === 'amazon', 'Result summary preserves companySlug');
    assert(summary.questions.length > 0, `Review questions compiled (${summary.questions.length} questions)`);

    // Inspect reviewed MCQ
    const reviewedMcq = summary.questions.find((q) => q.type === 'MCQ');
    assert(Boolean(reviewedMcq), 'Reviewed MCQ question found');
    assert(Boolean(reviewedMcq?.correctOptionText), 'Correct answer key is now REVEALED post-evaluation');
    assert(typeof reviewedMcq?.isCorrect === 'boolean', 'Correctness evaluation recorded');
    assert(typeof reviewedMcq?.marksAwarded === 'number', `Marks awarded recorded: ${reviewedMcq?.marksAwarded} pts`);

    // Inspect reviewed Coding question
    const reviewedCoding = summary.questions.find((q) => q.type === 'CODING');
    assert(Boolean(reviewedCoding), 'Reviewed Coding question found');
    assert(Boolean(reviewedCoding?.problemSlug), `Coding question contains deep-link problemSlug: "${reviewedCoding?.problemSlug}"`);
    assert(typeof reviewedCoding?.passedTests === 'number', 'Test case pass count recorded');
    assert(typeof reviewedCoding?.totalTests === 'number', 'Total test count recorded');

    // Historical attempt tracking for trend charts
    const historicalAttempts = await getAssessmentHistoricalAttempts(testAssessmentSlug, userA.id);
    assert(Array.isArray(historicalAttempts), 'Historical attempts returned as array');
    assert(historicalAttempts.length >= 1, `Historical attempts tracked (${historicalAttempts.length} attempts)`);
    assert(typeof historicalAttempts[0].scorePct === 'number', 'Historical attempts contain real scorePct');
    assert(typeof historicalAttempts[0].durationTakenSec === 'number', 'Historical attempts contain real durationTakenSec');

    // ------------------------------------------------------------------------
    // SECTION 8: Multi-tenant User Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Multi-tenant User Isolation ---');
    // User B attempts to access User A's workspace
    let userBAccessBlocked = false;
    try {
      await getAssessmentWorkspaceData(userB.id, startResult.attemptId);
    } catch {
      userBAccessBlocked = true;
    }
    assert(userBAccessBlocked, 'User B cannot access User A active attempt workspace (Strict 404/rejection)');

    // User B historical attempts for Amazon should be separate
    const userBHistory = await getAssessmentHistoricalAttempts(testAssessmentSlug, userB.id);
    const containsUserAAttempt = userBHistory.some((h) => h.id === startResult.attemptId);
    assert(!containsUserAAttempt, 'User B historical attempts list does not leak User A attempts');

    // ------------------------------------------------------------------------
    // SECTION 9: Honest Empty State Integrity
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Honest Empty State Integrity ---');
    // Query historical attempts for an assessment User B hasn't taken
    const unattemptedHistory = await getAssessmentHistoricalAttempts('unattempted-simulation-slug-99', userB.id);
    assert(unattemptedHistory.length === 0, 'Unattempted assessment returns honest empty historical array ([])');

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`RESULTS: ${passed} / ${passed + failed} tests passed.`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal verification error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase68Verification();
