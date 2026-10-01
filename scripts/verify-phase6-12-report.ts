// ============================================================================
// PREPOS PHASE 6.12 VERIFICATION SUITE
// Placement Readiness Dossier & PDF Verification Engine
// ============================================================================

import prisma from '../lib/db';
import { getPlacementReadinessReport } from '../lib/services/readiness-report';
import { generateReadinessDossierPdf } from '../lib/services/pdf-engine';
import { getReadinessScore } from '../lib/services/readiness-score';
import { searchGlobalEntities } from '../lib/services/global-search';

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

async function runPhase612Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.12: PLACEMENT READINESS DOSSIER & PDF ENGINE');
  console.log('============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: CANDIDATE SOURCING & MULTI-TENANT SETUP
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
          email: 'isolation.test.report@univ.edu',
          name: 'Isolation Report Candidate',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 2: AUTHENTICATED REPORT GENERATION & METADATA
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Authenticated Report Generation & Metadata ---');

    const reportA = await getPlacementReadinessReport(userA!.id);

    assert(Boolean(reportA), 'Authenticated report generation succeeds for User A');
    assert(reportA.candidate.userId === userA!.id, 'Report candidate userId strictly matches authenticated User A');
    assert(reportA.metadata.reportId.startsWith('DOSSIER-'), 'Report ID follows official DOSSIER-[YEAR]-[HASH] format');
    assert(reportA.metadata.verificationHash.length === 16, 'Tamper-evident verification hash has correct 16-character length');
    assert(reportA.metadata.version === '1.0.0-PROD', 'Report metadata records production engine version');
    assert(typeof reportA.metadata.generatedTimestamp === 'number', 'Report metadata includes numeric unix timestamp');

    // ------------------------------------------------------------------------
    // SECTION 3: MULTI-TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Multi-Tenant Isolation ---');

    const reportB = await getPlacementReadinessReport(userB!.id);

    assert(reportB.candidate.userId === userB!.id, 'User B report strictly reflects User B identity');
    assert(reportA.metadata.reportId !== reportB.metadata.reportId, 'Each student receives unique report ID and verification hash');
    assert(reportA.candidate.email !== reportB.candidate.email, 'User A email does not leak into User B report');

    // Verify non-existent user rejected
    let nonExistentRejected = false;
    try {
      await getPlacementReadinessReport('non-existent-user-id-xyz');
    } catch {
      nonExistentRejected = true;
    }
    assert(nonExistentRejected, 'Unregistered or invalid userId is strictly rejected with error');

    // ------------------------------------------------------------------------
    // SECTION 4: DATA INTEGRITY & SOURCE RECONCILIATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Data Integrity & Source Reconciliation ---');

    const authoritativePRS = await getReadinessScore(userA!.id);
    assert(
      reportA.readinessSummary.prsScore === authoritativePRS.totalScore,
      'Report PRS score exactly matches authoritative getReadinessScore calculation',
      `Report: ${reportA.readinessSummary.prsScore}, Authoritative: ${authoritativePRS.totalScore}`
    );

    assert(
      reportA.readinessSummary.breakdown.dsaScore === authoritativePRS.dsaScore &&
        reportA.readinessSummary.breakdown.coreCsScore === authoritativePRS.coreCsScore &&
        reportA.readinessSummary.breakdown.oaScore === authoritativePRS.oaScore &&
        reportA.readinessSummary.breakdown.consistencyScore === authoritativePRS.consistencyScore,
      'Report 4-factor breakdown scores exactly match authoritative PRS component weights'
    );

    // Verify DSA Source Reconciliation
    const realUserASolved = await prisma.userProgress.count({
      where: { userId: userA!.id, isSolved: true },
    });
    assert(
      reportA.dsaCompetency.solvedCount === realUserASolved,
      'Report DSA solved count strictly matches UserProgress table',
      `Report: ${reportA.dsaCompetency.solvedCount}, Table: ${realUserASolved}`
    );

    const totalProblemsCatalog = await prisma.problem.count();
    assert(
      reportA.dsaCompetency.totalProblems === totalProblemsCatalog,
      'Report total problems matches catalog Problem count'
    );

    // Verify Core CS Source Reconciliation
    const realCoreAttempts = await prisma.quizAttempt.count({
      where: { userId: userA!.id },
    });
    assert(
      reportA.coreCsReport.quizAttemptsCount === realCoreAttempts,
      'Report Core CS attempts strictly matches QuizAttempt table'
    );

    // Verify Assessment Source Reconciliation
    const realAssessmentAttempts = await prisma.assessmentAttempt.count({
      where: { userId: userA!.id },
    });
    assert(
      reportA.mockAssessmentsReport.attemptsCount === realAssessmentAttempts,
      'Report mock assessment attempts matches AssessmentAttempt table'
    );

    // ------------------------------------------------------------------------
    // SECTION 5: SECURITY AUDIT & SECRET DATA PROTECTION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Security Audit & Secret Data Protection ---');

    const serializedReport = JSON.stringify(reportA);

    assert(
      !serializedReport.includes('hiddenTestCases') &&
        !serializedReport.includes('testCases') &&
        !serializedReport.includes('expectedOutput') &&
        !serializedReport.includes('isCorrectAnswer') &&
        !serializedReport.includes('correctAnswerIndex') &&
        !serializedReport.includes('mcqAnswerKey'),
      'Report model strictly excludes hidden test cases, solutions, and MCQ answer keys'
    );

    assert(
      !serializedReport.includes('password') &&
        !serializedReport.includes('hashedPassword') &&
        !serializedReport.includes('sessionToken'),
      'Report model strictly excludes credentials and session tokens'
    );

    // ------------------------------------------------------------------------
    // SECTION 6: PDF GENERATION & BINARY INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: PDF Generation & Binary Integrity ---');

    const pdfBuffer = generateReadinessDossierPdf(reportA);

    assert(Buffer.isBuffer(pdfBuffer), 'PDF generator produces valid Buffer');
    assert(pdfBuffer.length > 1000, `PDF file size is non-empty (${pdfBuffer.length} bytes)`);

    const pdfHeader = pdfBuffer.toString('utf-8', 0, 8);
    assert(pdfHeader.startsWith('%PDF-1.4'), 'PDF starts with valid %PDF-1.4 magic header');

    const pdfString = pdfBuffer.toString('utf-8');
    assert(pdfString.includes('%%EOF'), 'PDF concludes with valid %%EOF trailer marker');
    assert(pdfString.includes('/Type /Catalog'), 'PDF includes document Catalog dictionary');
    assert(pdfString.includes('/Type /Pages'), 'PDF includes Pages object tree');
    assert(pdfString.includes('/Count 3'), 'PDF contains exactly 3 authoritative document pages');
    assert(pdfString.includes('Placement Readiness Dossier'), 'PDF stream contains Dossier title text');
    assert(pdfString.includes(reportA.metadata.reportId), 'PDF stream contains official Report ID');
    assert(pdfString.includes(reportA.metadata.verificationHash), 'PDF stream embeds cryptographic verification hash');

    // Security check on PDF content
    assert(
      !pdfString.includes('hiddenTestCases') &&
        !pdfString.includes('testCases') &&
        !pdfString.includes('correctAnswerIndex') &&
        !pdfString.includes('mcqAnswerKey'),
      'PDF binary stream strictly contains ZERO hidden test cases or evaluation secrets'
    );

    // ------------------------------------------------------------------------
    // SECTION 7: EMPTY / FRESH CANDIDATE ACCOUNT RESILIENCE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Fresh Candidate Account Resilience ---');

    const freshReport = await getPlacementReadinessReport(userB!.id);

    assert(!isNaN(freshReport.readinessSummary.prsScore), 'Fresh student report PRS score is not NaN');
    assert(!isNaN(freshReport.dsaCompetency.solvedPct), 'Fresh student DSA solved percentage handles 0 solved without NaN');
    assert(!isNaN(freshReport.dsaCompetency.submissionSuccessRate), 'Fresh student success rate handles 0 submissions without NaN');
    assert(!isNaN(freshReport.coreCsReport.avgScorePct), 'Fresh student Core CS avgScorePct handles 0 attempts without NaN');
    assert(!isNaN(freshReport.spacedRevisionReport.retentionHealthPct), 'Fresh student revision retention health handles empty queue without NaN');

    const freshPdf = generateReadinessDossierPdf(freshReport);
    assert(freshPdf.length > 1000, 'Fresh student PDF dossier generates successfully without runtime errors');

    // ------------------------------------------------------------------------
    // SECTION 8: GLOBAL SEARCH DISCOVERABILITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Global Search Discoverability ---');

    const searchResults = await searchGlobalEntities(userA!.id, 'dossier');
    assert(searchResults.length > 0, 'Search for "dossier" returns matching items');

    const dossierItem = searchResults.find(
      (r) => r.url === '/dashboard/readiness/report'
    );
    assert(Boolean(dossierItem), 'Search surfaces destination /dashboard/readiness/report for "dossier" query');

    const placementSearch = await searchGlobalEntities(userA!.id, 'placement report');
    const reportItem = placementSearch.find(
      (r) => r.url === '/dashboard/readiness/report'
    );
    assert(Boolean(reportItem), 'Search surfaces destination /dashboard/readiness/report for "placement report" query');

  } catch (error) {
    console.error('Unexpected error in Phase 6.12 verification suite:', error);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase612Verification();
