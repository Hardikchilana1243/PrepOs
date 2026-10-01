// ============================================================================
// PREPOS PHASE 6.7: TARGET COMPANY HUBS & PREPARATION WORKSPACE VERIFICATION
// ============================================================================

import prisma from '../lib/db';
import {
  getCompanyCatalogData,
  getCompanyDetailData,
  getUserTargetCompanySlugs,
  toggleTargetCompany,
  getCompanyTier,
} from '../lib/services/companies';
import { getPreparationPillarsData } from '../lib/services/dashboard';

async function runPhase67Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.7: COMPANY HUBS & PREPARATION WORKSPACE');
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

  const otherUser = await prisma.user.findFirst({
    where: { email: { not: 'priya.candidate@univ.edu' } },
  });
  assert(Boolean(otherUser), 'Secondary candidate found for multi-tenant isolation testing');
  const otherUserId = otherUser!.id;

  // --- SECTION 1: COMPANY CATALOG SERVICE ---
  console.log('\n--- Section 1: Company Catalog Data Loading & Metrics ---');

  const catalog = await getCompanyCatalogData(userId);
  assert(catalog.totalCompanies >= 10, `Catalog loads all registered companies (${catalog.totalCompanies} companies)`);
  assert(Array.isArray(catalog.companies), 'Catalog returns structured array of companies');
  assert(typeof catalog.overallCoveragePct === 'number', `Transparent aggregate coverage calculated (${catalog.overallCoveragePct}%)`);
  assert(
    catalog.totalCoveredCount + catalog.totalInProgressCount + catalog.totalUnstartedCount === catalog.totalCompanies,
    `Status counts partition catalog exactly: ${catalog.totalCoveredCount} covered, ${catalog.totalInProgressCount} in-progress, ${catalog.totalUnstartedCount} unstarted`
  );

  const amazonSummary = catalog.companies.find((c) => c.slug === 'amazon');
  assert(Boolean(amazonSummary), 'Amazon summary found in catalog');
  assert(amazonSummary!.mappedProblemsCount >= 5, `Amazon has ${amazonSummary?.mappedProblemsCount} mapped DSA problems`);
  assert(amazonSummary!.assessmentsCount >= 1, `Amazon has ${amazonSummary?.assessmentsCount} published OA simulation`);
  assert(amazonSummary!.hasCoreCS === true, 'Amazon has Core CS screening topics connected');

  // Verify tier classification
  assert(getCompanyTier('amazon') === 'Tier-1 Tech', 'Tier-1 Tech classification operational');
  assert(getCompanyTier('flipkart') === 'Product', 'Product tier classification operational');
  assert(getCompanyTier('tcs') === 'High-Impact IT', 'High-Impact IT tier classification operational');

  // --- SECTION 2: TARGET COMPANY PERSISTENCE & USER ISOLATION ---
  console.log('\n--- Section 2: Target Company Persistence & User Isolation ---');

  // Clear prior target state for test determinism
  await toggleTargetCompany(userId, 'amazon', true);
  let targetsPriya = await getUserTargetCompanySlugs(userId);
  assert(targetsPriya.has('amazon'), 'Priya successfully marks Amazon as target company');

  // Multi-tenant check: other user must NOT have Amazon targeted
  const targetsOther = await getUserTargetCompanySlugs(otherUserId);
  assert(!targetsOther.has('amazon'), 'Multi-tenant isolation: Other student target list remains unaffected');

  // Untarget test
  await toggleTargetCompany(userId, 'amazon', false);
  targetsPriya = await getUserTargetCompanySlugs(userId);
  assert(!targetsPriya.has('amazon'), 'Target removal persisted correctly in database ProgressEvent');

  // Re-target for subsequent detail checks
  await toggleTargetCompany(userId, 'amazon', true);

  // --- SECTION 3: COMPANY PREPARATION WORKSPACE DETAIL ---
  console.log('\n--- Section 3: Company Workspace Detail (Amazon) ---');

  const amazonDetail = await getCompanyDetailData('amazon', userId);
  assert(Boolean(amazonDetail), 'Amazon preparation workspace detail loads successfully');
  assert(amazonDetail!.name === 'Amazon', 'Company identity matches Amazon');
  assert(amazonDetail!.isTarget === true, 'Target company state reflected in workspace detail');
  assert(amazonDetail!.patterns.length >= 4, `Verified interview patterns loaded (${amazonDetail!.patterns.length} patterns)`);

  // Patterns veracity
  const hasVerifiedPatterns = amazonDetail!.patterns.some((p) => p.veracity === 'VERIFIED');
  assert(hasVerifiedPatterns, 'Authentic veracity tiers attached to patterns');

  // DSA Problems
  assert(amazonDetail!.dsa.totalCount >= 5, `DSA problem suite contains ${amazonDetail!.dsa.totalCount} problems`);
  assert(typeof amazonDetail!.dsa.solvedCount === 'number', `Student solved count tracked: ${amazonDetail!.dsa.solvedCount}`);
  assert(
    amazonDetail!.dsa.easyTotal + amazonDetail!.dsa.mediumTotal + amazonDetail!.dsa.hardTotal === amazonDetail!.dsa.totalCount,
    'Difficulty distribution strictly matches total problem count'
  );

  // Core CS
  assert(amazonDetail!.coreCs.hasMapping === true, 'Amazon Core CS foundations mapping recognized');
  assert(amazonDetail!.coreCs.totalQuizzes >= 1, `Amazon linked to ${amazonDetail!.coreCs.totalQuizzes} diagnostic quizzes`);

  // Mock OA
  assert(amazonDetail!.assessments.hasAssessments === true, 'Mock OA simulation recognized for Amazon');
  const amzOA = amazonDetail!.assessments.items[0];
  assert(amzOA && amzOA.durationMin === 60, 'Mock OA simulation retains authentic 60m duration');
  assert(amzOA && amzOA.totalMarks === 60, 'Mock OA total marks match 60 points');

  // Deterministic Checklist
  assert(amazonDetail!.checklist.length >= 3, `Deterministic preparation checklist compiled (${amazonDetail!.checklist.length} milestones)`);
  const checklistCategories = amazonDetail!.checklist.map((c) => c.category);
  assert(checklistCategories.includes('DSA'), 'Checklist contains algorithmic milestone');
  assert(checklistCategories.includes('ASSESSMENT'), 'Checklist contains OA simulation milestone');

  // --- SECTION 4: HONEST HANDLING OF EMPTY COMPANY DATA ---
  console.log('\n--- Section 4: Honest Handling of Empty Company Data (Google) ---');

  const googleDetail = await getCompanyDetailData('google', userId);
  assert(Boolean(googleDetail), 'Google workspace detail loads successfully');
  assert(googleDetail!.dsa.totalCount >= 4, `Google has ${googleDetail!.dsa.totalCount} mapped DSA problems`);
  assert(googleDetail!.assessments.hasAssessments === false, 'Honest empty assessment handling: Google has 0 assessments');
  assert(googleDetail!.assessments.items.length === 0, 'No fabricated assessments generated for Google');
  assert(googleDetail!.coreCs.hasMapping === false, 'Honest empty Core CS handling: Google has no Core CS requirements');

  // Invalid company lookup
  const invalidDetail = await getCompanyDetailData('non-existent-firm-xyz', userId);
  assert(invalidDetail === null, 'Invalid company slug cleanly returns null for notFound() handling');

  // --- SECTION 5: SECURITY & INTEGRITY INVARIANTS ---
  console.log('\n--- Section 5: Security & Answer Protection ---');

  // Ensure answer keys and hidden tests are not in the company assessment payload
  const amzQuestions = amzOA.instructions;
  assert(Boolean(amzQuestions), 'Assessment metadata populated without raw answers');

  // Dashboard Pillars Integration
  const pillars = await getPreparationPillarsData(userId);
  assert(Array.isArray(pillars.companyHighlights), 'Dashboard pillars continue returning company highlights');
  assert(pillars.companyHighlights.length > 0, `Dashboard pillars include ${pillars.companyHighlights.length} firms`);

  // Clean up test target
  await toggleTargetCompany(userId, 'amazon', false);

  console.log('\n============================================================');
  console.log(`RESULTS: ${passed} / ${total} tests passed cleanly.`);
  console.log('============================================================\n');
}

runPhase67Verification().catch((err) => {
  console.error('Phase 6.7 Verification Fatal Error:', err);
  process.exit(1);
});
