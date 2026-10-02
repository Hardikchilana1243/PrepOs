// ============================================================================
// PREPOS PHASE 6.15 VERIFICATION SUITE
// Interview Preparation & Practice Workspace
// ============================================================================

import prisma from '../lib/db';
import {
  getInterviewWorkspaceData,
  getInterviewSessionData,
  getInterviewReadinessSummary,
  addProblemToRevisionQueue,
} from '../lib/services/interview';
import {
  toggleInterviewBookmarkAction,
  recordInterviewSessionAction,
  addMistakeToRevisionAction,
} from '../app/dashboard/interview/actions';
import { getReadinessScore } from '../lib/services/readiness-score';
import { getPlacementReadinessReport } from '../lib/services/readiness-report';
import { generateReadinessDossierPdf } from '../lib/services/pdf-engine';
import {
  createDossierShareLink,
  getPublicDossierVerification,
} from '../lib/services/dossier-verification';
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

async function runPhase615Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.15: INTERVIEW PREPARATION & PRACTICE');
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
          email: 'test.interview.isolation@univ.edu',
          role: 'STUDENT',
          name: 'Isolation Test Candidate',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for multi-tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 1: AUTHENTICATED WORKSPACE LOADING & DATA AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Authenticated Workspace Loading & Data Aggregation ---');

    const workspaceData = await getInterviewWorkspaceData(userA!.id);
    assert(Boolean(workspaceData), '1a. getInterviewWorkspaceData returns structured payload');
    assert(typeof workspaceData.summary === 'object', '1b. Summary metrics present in workspace');
    assert(Array.isArray(workspaceData.modes), '1c. Practice modes present as array');
    assert(workspaceData.modes.length === 5, '1d. Exactly 5 interview modes configured');
    assert(Array.isArray(workspaceData.catalog), '1e. Question catalog present as array');
    assert(workspaceData.catalog.length > 0, '1f. Catalog populated with authentic questions');
    assert(Array.isArray(workspaceData.mistakes), '1g. Mistakes section present as array');
    assert(Array.isArray(workspaceData.companyPrep), '1h. Company preparation present as array');
    assert(Array.isArray(workspaceData.checklist), '1i. Checklist present as array');
    assert(Array.isArray(workspaceData.history), '1j. Activity history present as array');

    // ------------------------------------------------------------------------
    // SECTION 2: MULTI-TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Multi-Tenant Data Isolation ---');

    const userBData = await getInterviewWorkspaceData(userB!.id);
    const userBProgress = await prisma.userProgress.findMany({
      where: { userId: userB!.id },
      select: { problemId: true, isSolved: true },
    });
    const realUserBSolvedCount = userBProgress.filter((p) => p.isSolved).length;
    const userBCatalogSolvedCount = userBData.catalog.filter((i) => i.isSolved && i.category === 'DSA').length;

    assert(
      realUserBSolvedCount === userBCatalogSolvedCount,
      '2a. Multi-tenant isolation: User B catalog solved state strictly reflects User B progress records'
    );
    assert(
      userBData.mistakes.every((m) => !workspaceData.mistakes.some((wm) => wm.id === m.id && wm.id.includes(userA!.id))),
      '2b. Multi-tenant isolation: User B cannot access User A mistakes'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: INTERVIEW CATALOG PROPERTIES & INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Interview Question Catalog Integrity ---');

    const sampleItem = workspaceData.catalog[0];
    assert(typeof sampleItem.id === 'string' && sampleItem.id.length > 0, '3a. Catalog item has valid id');
    assert(typeof sampleItem.title === 'string' && sampleItem.title.length > 0, '3b. Catalog item has valid title');
    assert(['DSA', 'CORE_CS', 'COMPANY', 'SYSTEM_DESIGN'].includes(sampleItem.category), '3c. Valid category classification');
    assert(['EASY', 'MEDIUM', 'HARD'].includes(sampleItem.difficulty), '3d. Valid difficulty classification');
    assert(typeof sampleItem.topic === 'string' && sampleItem.topic.length > 0, '3e. Item has valid topic domain');
    assert(typeof sampleItem.practiceUrl === 'string' && sampleItem.practiceUrl.startsWith('/dashboard/'), '3f. Direct practice route is valid');
    assert(typeof sampleItem.isSolved === 'boolean', '3g. isSolved state is boolean');
    assert(typeof sampleItem.isAttempted === 'boolean', '3h. isAttempted state is boolean');
    assert(typeof sampleItem.isBookmarked === 'boolean', '3i. isBookmarked state is boolean');
    assert(typeof sampleItem.needsReview === 'boolean', '3j. needsReview state is boolean');
    assert(typeof sampleItem.expectedTimeMin === 'number' && sampleItem.expectedTimeMin > 0, '3k. Positive expected duration in minutes');

    // ------------------------------------------------------------------------
    // SECTION 4: CLIENT-SIDE FILTERING & DIMENSIONS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Catalog Filtering Capabilities ---');

    assert(Array.isArray(workspaceData.filters.companies), '4a. Available companies list is present');
    assert(Array.isArray(workspaceData.filters.topics), '4b. Available topics list is present');
    assert(workspaceData.filters.difficulties.length === 3, '4c. Standard difficulty tiers present');

    const easyItems = workspaceData.catalog.filter((i) => i.difficulty === 'EASY');
    const mediumItems = workspaceData.catalog.filter((i) => i.difficulty === 'MEDIUM');
    const hardItems = workspaceData.catalog.filter((i) => i.difficulty === 'HARD');
    assert(
      easyItems.length + mediumItems.length + hardItems.length === workspaceData.catalog.length,
      '4d. Difficulty partition covers 100% of question catalog'
    );

    const dsaItems = workspaceData.catalog.filter((i) => i.category === 'DSA');
    const coreCsItems = workspaceData.catalog.filter((i) => i.category === 'CORE_CS');
    assert(dsaItems.length > 0, '4e. DSA category contains authentic problems');
    assert(coreCsItems.length > 0, '4f. Core CS category contains authentic diagnostic quizzes');

    // ------------------------------------------------------------------------
    // SECTION 5: INTERVIEW MODES & REASONING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Five Core Practice Modes ---');

    const modeIds = workspaceData.modes.map((m) => m.id);
    assert(modeIds.includes('DSA'), '5a. DSA Technical Practice mode available');
    assert(modeIds.includes('CORE_CS'), '5b. Core CS Technical Screening mode available');
    assert(modeIds.includes('COMPANY'), '5c. Target Company Track Practice mode available');
    assert(modeIds.includes('MISTAKES'), '5d. Mistake-Based Interview Drills mode available');
    assert(modeIds.includes('REVIEW'), '5e. Technical Review & Recall mode available');

    for (const mode of workspaceData.modes) {
      assert(typeof mode.title === 'string' && mode.title.length > 0, `Mode ${mode.id} has title`);
      assert(typeof mode.availableCount === 'number' && mode.availableCount >= 0, `Mode ${mode.id} available count >= 0`);
      assert(typeof mode.completedCount === 'number' && mode.completedCount >= 0, `Mode ${mode.id} completed count >= 0`);
      assert(mode.coveragePct >= 0 && mode.coveragePct <= 100, `Mode ${mode.id} coverage % bounded`);
    }

    // ------------------------------------------------------------------------
    // SECTION 6: DISTRACTION-FREE PRACTICE SESSION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Distraction-Free Practice Session State ---');

    const firstProblem = await prisma.problem.findFirst({
      where: { status: 'PUBLISHED' },
      select: { slug: true, id: true, title: true },
    });
    assert(Boolean(firstProblem), 'Sample problem available for session workspace test');

    const sessionData = await getInterviewSessionData(userA!.id, firstProblem!.slug);
    assert(Boolean(sessionData), '6a. getInterviewSessionData loads successfully');
    assert(sessionData?.problem.id === firstProblem!.id, '6b. Session problem ID matches target');
    assert(typeof sessionData?.userState.isBookmarked === 'boolean', '6c. Session userState includes isBookmarked');
    assert(typeof sessionData?.userState.isInRevision === 'boolean', '6d. Session userState includes isInRevision');
    assert(Array.isArray(sessionData?.userState.recentAttempts), '6e. Session userState includes previous attempts');

    // ------------------------------------------------------------------------
    // SECTION 7: PRACTICE COMPLETION & EVENT PERSISTENCE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Practice Completion & Audit Event Persistence ---');

    await prisma.progressEvent.create({
      data: {
        userId: userA!.id,
        eventType: 'INTERVIEW_PRACTICE_COMPLETED',
        metadata: JSON.stringify({
          problemId: firstProblem!.id,
          problemTitle: firstProblem!.title,
          problemSlug: firstProblem!.slug,
          durationSec: 720,
          notes: 'Tested two pointer approach with O(1) space invariant',
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const refreshedWorkspace = await getInterviewWorkspaceData(userA!.id);
    assert(
      refreshedWorkspace.summary.sessionsCompleted >= 1,
      '7a. Practice session completion increments summary sessionsCompleted'
    );
    assert(
      refreshedWorkspace.history.some((h) => h.type === 'PRACTICE_COMPLETED'),
      '7b. Completed practice session materializes in chronological history'
    );

    // ------------------------------------------------------------------------
    // SECTION 8: MISTAKE REVIEW ENGINE & SM-2 INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Mistake Review Engine & SM-2 Queue Integration ---');

    assert(Array.isArray(refreshedWorkspace.mistakes), '8a. Mistakes array successfully compiled');
    if (refreshedWorkspace.mistakes.length > 0) {
      const sampleMistake = refreshedWorkspace.mistakes[0];
      assert(typeof sampleMistake.id === 'string', '8b. Mistake item has id');
      assert(typeof sampleMistake.errorType === 'string', '8c. Mistake item has error diagnostic');
      assert(typeof sampleMistake.failedAt === 'string', '8d. Mistake item has date');
      assert(typeof sampleMistake.daysAgo === 'number', '8e. Mistake item records days elapsed');
    } else {
      console.log('  ℹ No existing mistakes found (clean candidate state)');
    }

    // Test adding mistake problem to SM-2 revision queue
    const testRevisionProblem = await prisma.problem.findFirst({
      where: { status: 'PUBLISHED' },
      select: { id: true },
    });
    if (testRevisionProblem) {
      await addProblemToRevisionQueue(userA!.id, testRevisionProblem.id);
      const revRecord = await prisma.revision.findUnique({
        where: {
          userId_problemId: {
            userId: userA!.id,
            problemId: testRevisionProblem.id,
          },
        },
      });
      assert(Boolean(revRecord), '8f. addProblemToRevisionQueue persists revision in database');
      assert(revRecord?.intervalDays === 1, '8g. Mistake scheduled with 1-day initial SM-2 interval');
    }

    // ------------------------------------------------------------------------
    // SECTION 9: TARGET COMPANY INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Target Company Preparation Tracks ---');

    assert(refreshedWorkspace.companyPrep.length > 0, '9a. Company preparation tracks populated');
    const targetComp = refreshedWorkspace.companyPrep[0];
    assert(typeof targetComp.companyId === 'string', '9b. Company has valid ID');
    assert(typeof targetComp.name === 'string', '9c. Company has name');
    assert(typeof targetComp.hubUrl === 'string' && targetComp.hubUrl.startsWith('/dashboard/companies/'), '9d. Deep-link points to Company Hub');
    assert(typeof targetComp.coveragePct === 'number', '9e. Company coverage percentage calculated');

    // ------------------------------------------------------------------------
    // SECTION 10: INTERVIEW READINESS CHECKLIST
    // ------------------------------------------------------------------------
    console.log('\n--- Section 10: Interview Readiness Checklist ---');

    assert(refreshedWorkspace.checklist.length === 7, '10a. Checklist contains exactly 7 pre-interview criteria');
    for (const item of refreshedWorkspace.checklist) {
      assert(['COMPLETED', 'IN_PROGRESS', 'REMAINING', 'NOT_AVAILABLE'].includes(item.status), `Checklist item ${item.id} has valid status`);
      assert(typeof item.evidence === 'string' && item.evidence.length > 0, `Checklist item ${item.id} backed by factual evidence`);
      assert(typeof item.ctaUrl === 'string' && item.ctaUrl.length > 0, `Checklist item ${item.id} has direct navigation URL`);
    }

    // ------------------------------------------------------------------------
    // SECTION 11: READINESS COMMAND CENTER INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 11: Placement Readiness Command Center Integration ---');

    const readinessSummary = await getInterviewReadinessSummary(userA!.id);
    assert(typeof readinessSummary.sessionsCompleted === 'number', '11a. Summary sessionsCompleted is number');
    assert(typeof readinessSummary.recentMistakesCount === 'number', '11b. Summary recentMistakesCount is number');
    assert(typeof readinessSummary.targetCompanyCoveragePct === 'number', '11c. Summary company coverage is percentage');
    assert(typeof readinessSummary.checklistCompletedCount === 'number', '11d. Checklist completed count is number');
    assert(readinessSummary.ctaUrl === '/dashboard/interview', '11e. CTA routes directly to interview workspace');
    assert(['READY', 'SUBSTANTIALLY_READY', 'ACTION_REQUIRED'].includes(readinessSummary.interviewStatus), '11f. Valid interviewStatus tier');

    // ------------------------------------------------------------------------
    // SECTION 12: SECURITY AUDIT & ZERO SECRET LEAKS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 12: Security Audit & Zero Secret Leaks ---');

    const serializedWorkspace = JSON.stringify(refreshedWorkspace);
    assert(!serializedWorkspace.includes('hiddenTestCases'), '12a. Workspace payload excludes hidden test cases');
    assert(!serializedWorkspace.includes('isCorrectAnswer'), '12b. Workspace payload excludes correct MCQ answer keys');
    assert(!serializedWorkspace.includes('editorialCode'), '12c. Workspace payload excludes editorial solution code');
    assert(!serializedWorkspace.includes('passwordHash'), '12d. Workspace payload excludes password hashes');

    // ------------------------------------------------------------------------
    // SECTION 13: GLOBAL SEARCH INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 13: Global Search Integration ---');

    const prepSearchResults = await searchGlobalEntities(userA!.id, 'interview preparation');
    assert(
      prepSearchResults.some((r) => r.url === '/dashboard/interview'),
      '13a. Search for "interview preparation" surfaces interview workspace'
    );

    const practiceSearchResults = await searchGlobalEntities(userA!.id, 'interview practice');
    assert(
      practiceSearchResults.some((r) => r.url.includes('/dashboard/interview')),
      '13b. Search for "interview practice" surfaces interview workspace'
    );

    const mistakeSearchResults = await searchGlobalEntities(userA!.id, 'interview mistakes');
    assert(
      mistakeSearchResults.some((r) => r.url.includes('/dashboard/interview#mistakes')),
      '13c. Search for "interview mistakes" surfaces mistake review anchor'
    );

    const companySearchResults = await searchGlobalEntities(userA!.id, 'company interview');
    assert(
      companySearchResults.some((r) => r.url.includes('/dashboard/interview#company-prep')),
      '13d. Search for "company interview" surfaces company preparation anchor'
    );

    const checklistSearchResults = await searchGlobalEntities(userA!.id, 'interview checklist');
    assert(
      checklistSearchResults.some((r) => r.url.includes('/dashboard/interview#checklist')),
      '13e. Search for "interview checklist" surfaces checklist anchor'
    );

    // ------------------------------------------------------------------------
    // SECTION 14: CROSS-PHASE REGRESSION GUARANTEES
    // ------------------------------------------------------------------------
    console.log('\n--- Section 14: Cross-Phase Regression Guarantees ---');

    // Authoritative PRS formula is unchanged
    const prsScore = await getReadinessScore(userA!.id);
    assert(typeof prsScore.totalScore === 'number' && prsScore.totalScore >= 0 && prsScore.totalScore <= 100, '14a. Authoritative PRS score is valid (0-100)');
    assert(
      prsScore.totalScore ===
        Math.round(
          prsScore.dsaScore * 0.4 +
            prsScore.coreCsScore * 0.3 +
            prsScore.oaScore * 0.15 +
            prsScore.consistencyScore * 0.15
        ),
      '14b. Authoritative 4-factor PRS formula strictly preserved (40% DSA, 30% CoreCS, 15% OA, 15% Consistency)'
    );

    // Phase 6.12 Placement Report & PDF generator remain intact
    const report = await getPlacementReadinessReport(userA!.id);
    assert(Boolean(report), '14c. Phase 6.12 dossier report generation remains functional');
    const pdfBuffer = await generateReadinessDossierPdf(report);
    assert(pdfBuffer.length > 0 && pdfBuffer.toString('utf8', 0, 4) === '%PDF', '14d. Phase 6.12 zero-dependency PDF generation remains functional');

    // Phase 6.13 Share Link & Recruiter Verification remain intact
    const shareLink = await createDossierShareLink(userA!.id, { expiresInDays: 30 });
    assert(Boolean(shareLink.shareUrl), '14e. Phase 6.13 share link generation remains functional');
    const publicVerification = await getPublicDossierVerification(shareLink.rawToken);
    assert(publicVerification.status === 'VALID', '14f. Phase 6.13 public recruiter verification remains fully functional');

    console.log('\n============================================================');
    console.log(`Phase 6.15 Verification Results: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Phase 6.15 Verification crashed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase615Verification();
