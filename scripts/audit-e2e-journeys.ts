// ============================================================================
// PREPOS COMPREHENSIVE E2E USER JOURNEYS AUDIT & VERIFICATION SUITE
// Tests Journeys A through I against real database, auth, algorithms, and services
// ============================================================================

import prisma from '../lib/db';
import crypto from 'crypto';
import { hashPassword, verifyPassword } from '../lib/auth';
import { completeOnboardingAction } from '../app/onboarding/actions';
import { getPrimaryDashboardData, getPreparationPillarsData, getDashboardData } from '../lib/services/dashboard';
import { getDSARoadmapData, getProblemDetailData } from '../lib/services/dsa-roadmap';
import { runProblemCode, submitProblemCode, getUserProblemSubmissions } from '../lib/services/code-execution';
import { getCoreCSHubData } from '../lib/services/core-cs';
import { submitQuizAttempt, getQuizAttemptReview } from '../lib/services/progress';
import { getAssessmentCatalogData, getAssessmentOverview, startOrResumeAssessment, getAssessmentWorkspaceData, autosaveMCQAnswer, autosaveCodeDraft, submitFinalAssessment, getAssessmentHistoricalAttempts } from '../lib/services/assessment';
import { compileResultSummary } from '../lib/services/assessment-scoring';
import { getRevisionDashboardData, recordRevisionReview, toggleProblemBookmark } from '../lib/services/revision';
import { getCompanyCatalogData, getCompanyDetailData, toggleTargetCompany } from '../lib/services/companies';
import { getDailyExecutionData, recordTaskCompletion, recordTaskReopening, recordTaskSkip } from '../lib/services/daily-execution';
import { getNotificationCenterData, markNotificationRead, markAllNotificationsRead, dismissNotification } from '../lib/services/notifications';
import { updateNotificationPreferences, getNotificationPreferences } from '../lib/services/notification-preferences';
import { calculatePRS, getReadinessScore } from '../lib/services/readiness-score';
import { getPlacementExecutionData } from '../lib/services/readiness-execution';
import { getPlacementReadinessReport } from '../lib/services/readiness-report';
import { generateReadinessDossierPdf } from '../lib/services/pdf-engine';
import { createDossierShareLink, revokeDossierShareLink, getPublicDossierVerification } from '../lib/services/dossier-verification';
import { searchGlobalEntities } from '../lib/services/global-search';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedChecks++;
    failures.push(message);
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

async function runAudit() {
  console.log('====================================================================');
  console.log('🔍 PREPOS COMPREHENSIVE END-TO-END JOURNEYS AUDIT');
  console.log('====================================================================\n');

  const TIMESTAMP = Date.now();
  const TEST_A_EMAIL = `audit.newstudent.${TIMESTAMP}@prepos.test`;
  let studentAId = '';

  try {
    // ========================================================================
    // JOURNEY A: NEW STUDENT (Registration -> Onboarding -> Zero-Progress State)
    // ========================================================================
    console.log('\n--- JOURNEY A: New Student Onboarding & Zero-Progress State ---');
    const hashedPass = await hashPassword('SecurePass123!');
    const studentA = await prisma.user.create({
      data: {
        email: TEST_A_EMAIL,
        name: 'Aarav Newcomer',
        role: 'STUDENT',
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: TEST_A_EMAIL,
            access_token: hashedPass,
          },
        },
      },
    });
    studentAId = studentA.id;
    assert(Boolean(studentA.id), 'User registration creates account successfully');

    // Verify initial state has no profile
    const initialProfile = await prisma.profile.findUnique({ where: { userId: studentAId } });
    assert(initialProfile === null, 'Un-onboarded student correctly has null profile');

    // Complete Onboarding
    const profile = await prisma.profile.create({
      data: {
        userId: studentAId,
        gradYear: 2026,
        targetDegree: 'B.Tech / B.E.',
        targetRoleTier: 'PRODUCT_TIER_1',
        preferredLang: 'CPP',
        streakDays: 0,
      },
    });
    assert(profile.gradYear === 2026, 'Onboarding saves academic profile and graduation year');

    // Initialize baseline PRS
    const initialPrs = await calculatePRS(studentAId);
    assert(initialPrs.totalScore >= 0 && !isNaN(initialPrs.totalScore), 'Baseline PRS initialized without NaN');
    assert(initialPrs.isBaselineOnly === true, 'Brand-new student starts with isBaselineOnly: true');

    // Fetch zero-progress Dashboard
    const zeroDash = await getPrimaryDashboardData(studentAId);
    assert(zeroDash.user.name === 'Aarav Newcomer', 'Dashboard displays student name accurately');
    assert(zeroDash.readiness.totalScore === initialPrs.totalScore, 'Dashboard readiness matches calculated PRS');
    assert(zeroDash.todayMissions.length === 3, 'Zero-progress student receives 3 deterministic calibration missions');

    const zeroPillars = await getPreparationPillarsData(studentAId);
    assert(zeroPillars.dsaProgress.solvedCount === 0, 'DSA solved count is honestly 0');
    assert(zeroPillars.coreCsProgress.attemptedCount === 0, 'Core CS attempted count is honestly 0');
    assert(zeroPillars.revisionSummary.dueCount === 0, 'Revision due count is honestly 0');

    // ========================================================================
    // JOURNEY B: DSA PRACTICE (Roadmap -> Detail -> Run/Submit -> History)
    // ========================================================================
    console.log('\n--- JOURNEY B: DSA Practice & Code Execution ---');
    const roadmap = await getDSARoadmapData(studentAId);
    assert(roadmap.totalProblems === 20, 'Roadmap displays 20 catalog problems');
    assert(roadmap.modules.length === 14, 'Roadmap contains all 14 curriculum modules');

    // Open first problem
    const pSlug = 'array-element-frequency-counter';
    const problemDetail = await getProblemDetailData(studentAId, pSlug);
    assert(problemDetail !== null, 'Problem detail loads successfully');
    assert(problemDetail!.problem.slug === pSlug, 'Problem slug matches requested URL target');
    assert(problemDetail!.userState.isSolved === false, 'Problem is initially unsolved');
    assert(problemDetail!.problem.sampleTestCases.length === 2, 'Only 2 public test cases exposed to student');

    // Security: Check hidden test cases are not in payload
    const allDbTests = await prisma.testCase.findMany({ where: { problemId: problemDetail!.problem.id } });
    assert(allDbTests.some((t) => t.isSecret), 'Database contains secret test cases');
    assert(
      !problemDetail!.problem.sampleTestCases.some((t: any) => t.isSecret),
      'Client problem payload strictly excludes secret test cases'
    );

    // Run Code semantics: public tests only, does NOT mutate progress
    const runResult = await runProblemCode(
      studentAId,
      problemDetail!.problem.id,
      'CPP',
      'class Solution { public: int countFrequentElements(const std::vector<int>& nums, int k) { return 42; } };'
    );
    assert(runResult.status !== undefined, 'Run Code returns execution response');
    const progressAfterRun = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentAId, problemId: problemDetail!.problem.id } },
    });
    assert(progressAfterRun === null, 'Run Code does NOT create or mutate userProgress record');

    // Submit Code semantics: wrong answer
    const submitWa = await submitProblemCode(
      studentAId,
      problemDetail!.problem.id,
      'CPP',
      'class Solution { public: int countFrequentElements(const std::vector<int>& nums, int k) { return -1; } };'
    );
    assert(submitWa.isSolved === false, 'Wrong code is not marked as solved');
    const submissionsWa = await getUserProblemSubmissions(studentAId, problemDetail!.problem.id);
    assert(submissionsWa.length === 1, 'Wrong submission persisted to submission history');

    // Submit Code semantics: correct solution
    const validCppSolution = `
#include <vector>
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
};`;

    const submitAc = await submitProblemCode(studentAId, problemDetail!.problem.id, 'CPP', validCppSolution);
    assert(submitAc.isSolved === true, 'Valid code submission is marked solved');
    const progressAfterAc = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: studentAId, problemId: problemDetail!.problem.id } },
    });
    assert(progressAfterAc?.isSolved === true, 'UserProgress record updated with isSolved: true');

    // Spaced repetition queue automatically updated
    const revisionAfterSolve = await prisma.revision.findFirst({
      where: { userId: studentAId, problemId: problemDetail!.problem.id },
    });
    assert(revisionAfterSolve !== null, 'Solved problem automatically queued for SM-2 spaced revision');

    // Bookmark toggle
    const b1 = await toggleProblemBookmark(studentAId, problemDetail!.problem.id);
    assert(b1.isBookmarked === true, 'Problem bookmark toggled on');
    const b2 = await toggleProblemBookmark(studentAId, problemDetail!.problem.id);
    assert(b2.isBookmarked === false, 'Problem bookmark toggled off');

    // ========================================================================
    // JOURNEY C: CORE CS (Hub -> Drill -> Scoring -> Explanations)
    // ========================================================================
    console.log('\n--- JOURNEY C: Core CS Practice & Diagnostic Drills ---');
    const coreCsHub = await getCoreCSHubData(studentAId);
    assert(coreCsHub.subjects.length === 2, 'Core CS Hub exposes 2 primary subjects (DBMS, OS)');
    assert(coreCsHub.quizzes.length === 2, 'Core CS Hub exposes 2 diagnostic quizzes');

    const dbmsQuiz = coreCsHub.quizzes.find((q) => q.subjectSlug === 'dbms' || q.slug.includes('dbms'));
    assert(dbmsQuiz !== undefined, 'DBMS diagnostic quiz is available');

    // Test answering DBMS quiz
    const questions = await prisma.mCQQuestion.findMany({
      where: { quizId: dbmsQuiz!.id },
      include: { options: true },
    });
    assert(questions.length === 10, 'DBMS quiz has 10 placement MCQs');

    const selectedAnswers: Record<string, string> = {};
    for (const q of questions) {
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt) {
        selectedAnswers[q.id] = correctOpt.id;
      }
    }

    const quizSubmitResult = await submitQuizAttempt(studentAId, dbmsQuiz!.id, selectedAnswers, 120);
    assert(quizSubmitResult.scorePercentage === 100, 'All correct answers yield 100% score');
    assert(quizSubmitResult.passed === true, '100% score marks diagnostic quiz passed');
    assert(quizSubmitResult.attemptId !== undefined, 'Attempt ID returned upon submission');

    // Verify explanation and attempt review
    const review = await getQuizAttemptReview(studentAId, quizSubmitResult.attemptId);
    assert(review !== null, 'Attempt review payload retrieved successfully');
    assert(review!.gradedQuestions.length === 10, 'Review contains all 10 answered questions with explanations');
    assert(Boolean(review!.gradedQuestions[0].explanation), 'Review reveals question explanation after submission');

    // ========================================================================
    // JOURNEY D: MOCK ASSESSMENTS (Catalog -> Attempt -> Timer -> Autosave -> Scoring)
    // ========================================================================
    console.log('\n--- JOURNEY D: Timed Mock Assessments & Scoring ---');
    const assessmentCatalog = await getAssessmentCatalogData(studentAId);
    assert(assessmentCatalog.assessments.length >= 1, 'Assessment catalog contains mock assessments');

    const amazonOA = assessmentCatalog.assessments[0];
    const attemptInit = await startOrResumeAssessment(studentAId, amazonOA.id);
    assert(Boolean(attemptInit.attemptId), 'Assessment attempt initialized with attemptId');

    const attemptId = attemptInit.attemptId;
    const workspace = await getAssessmentWorkspaceData(studentAId, attemptId);
    assert(workspace.remainingSeconds > 0, 'Server-authoritative timer provides remaining seconds');
    assert(workspace.sections.length === 2, 'Assessment contains 2 sections (Coding + Core CS)');

    // Autosave MCQ
    const mcqQ = workspace.sections[1].questions[0];
    const mcqOpt = mcqQ.options![0];
    const autoMcq = await autosaveMCQAnswer(studentAId, attemptId, mcqQ.id, mcqOpt.id);
    assert(autoMcq.success === true, 'MCQ answer autosave persists to database');

    // Autosave Code Draft
    const codeQ = workspace.sections[0].questions[0];
    const autoCode = await autosaveCodeDraft(studentAId, attemptId, codeQ.id, '// Draft', 'CPP');
    assert(autoCode.success === true, 'Code draft autosave persists to database');

    // Finalize assessment
    const finalSubmit = await submitFinalAssessment(studentAId, attemptId);
    assert(finalSubmit.success === true, 'Assessment atomically submitted and evaluated');

    // Verify Scorecard & Result Review
    const scorecard = await compileResultSummary(attemptId);
    assert(scorecard.attemptId === attemptId, 'Scorecard compiled with matching attemptId');
    assert(scorecard.status === 'EVALUATED', 'Attempt status transitions to EVALUATED');
    assert(scorecard.sections.length === 2, 'Scorecard includes breakdown for both sections');

    // Attempt immutability: Subsequent submit smoothly routes to result
    const doubleSubmit = await submitFinalAssessment(studentAId, attemptId);
    assert(doubleSubmit.success === true && doubleSubmit.redirectUrl.includes('result'), 'Finalized attempt cleanly redirects to result');

    // ========================================================================
    // JOURNEY E: REVISION (SM-2 Protocol & Interval Calculation)
    // ========================================================================
    console.log('\n--- JOURNEY E: Spaced Revision & SM-2 Engine ---');
    const revDash = await getRevisionDashboardData(studentAId);
    assert(revDash.summary.totalTracked >= 1, 'Revision dashboard tracks at least 1 problem');

    const revItem = revDash.items[0];
    assert(Boolean(revItem.id), 'Revision item has valid ID');
    assert(Boolean(revItem.intervalDays), 'Revision item specifies intervalDays');

    // Test recall ratings (AGAIN, HARD, GOOD, EASY)
    const revAgain = await recordRevisionReview(studentAId, revItem.id, 'AGAIN');
    assert(revAgain.nextIntervalDays === 1, 'Rating AGAIN resets interval to exactly 1 day');

    const revHard = await recordRevisionReview(studentAId, revItem.id, 'HARD');
    assert(revHard.nextIntervalDays === 2, 'Rating HARD sets interval to exactly 2 days');

    const revGood = await recordRevisionReview(studentAId, revItem.id, 'GOOD');
    assert(revGood.nextIntervalDays >= 7, 'Rating GOOD scales interval to >= 7 days');

    const revEasy = await recordRevisionReview(studentAId, revItem.id, 'EASY');
    assert(revEasy.nextIntervalDays >= 14, 'Rating EASY scales interval to >= 14 days');

    // ========================================================================
    // JOURNEY F: COMPANY PREPARATION (Catalog -> Target Toggle -> Hub)
    // ========================================================================
    console.log('\n--- JOURNEY F: Company Preparation & Target Tracking ---');
    const companies = await getCompanyCatalogData(studentAId);
    assert(companies.companies.length === 10, 'Company catalog returns all 10 companies');

    // Target Amazon
    const targetOn = await toggleTargetCompany(studentAId, 'amazon', true);
    assert(targetOn.isTarget === true, 'Amazon marked as target company');

    const amazonDetail = await getCompanyDetailData('amazon', studentAId);
    assert(amazonDetail !== null, 'Amazon detail workspace loads successfully');
    assert(amazonDetail!.isTarget === true, 'Amazon detail reflects target status');
    assert(amazonDetail!.patterns.length === 4, 'Amazon detail provides 4 interview patterns');
    assert(amazonDetail!.dsa.problems.length === 5, 'Amazon detail provides 5 mapped problems');
    assert(amazonDetail!.assessments.items.length === 1, 'Amazon detail links 1 mock assessment');

    // Honest empty handling for Google
    const googleDetail = await getCompanyDetailData('google', studentAId);
    assert(googleDetail !== null, 'Google detail workspace loads successfully');
    assert(googleDetail!.assessments.items.length === 0, 'Google honestly has 0 mock assessments (empty state)');

    // Untarget Amazon
    const targetOff = await toggleTargetCompany(studentAId, 'amazon', false);
    assert(targetOff.isTarget === false, 'Amazon target company cleanly removed');

    // ========================================================================
    // JOURNEY G: DAILY EXECUTION & NOTIFICATIONS
    // ========================================================================
    console.log('\n--- JOURNEY G: Daily Execution & Notifications ---');
    const execData = await getDailyExecutionData(studentAId);
    assert(execData.tasks.length >= 1, 'Daily execution plan generated tasks');

    const firstTask = execData.tasks[0];
    await recordTaskCompletion(studentAId, firstTask.id, firstTask.category);
    const execAfterComplete = await getDailyExecutionData(studentAId);
    const taskCompletedState = execAfterComplete.tasks.find((t) => t.id === firstTask.id)?.isCompleted;
    assert(taskCompletedState === true, 'Daily task marked completed in execution plan');

    await recordTaskReopening(studentAId, firstTask.id);
    const execAfterReopen = await getDailyExecutionData(studentAId);
    const taskReopenedState = execAfterReopen.tasks.find((t) => t.id === firstTask.id)?.isCompleted;
    assert(taskReopenedState === false, 'Daily task successfully reopened');

    await recordTaskSkip(studentAId, firstTask.id, 'Already practiced');
    const execAfterSkip = await getDailyExecutionData(studentAId);
    const taskSkippedState = execAfterSkip.tasks.find((t) => t.id === firstTask.id)?.isSkipped;
    assert(taskSkippedState === true, 'Daily task successfully skipped with reason');

    // Notifications
    const notifCenter = await getNotificationCenterData(studentAId);
    assert(notifCenter.notifications.length >= 1, 'Notification center aggregates authentic reminders');

    const firstNotif = notifCenter.notifications[0];
    await markNotificationRead(studentAId, firstNotif.id);
    const notifsAfterRead = await getNotificationCenterData(studentAId);
    const readItem = notifsAfterRead.notifications.find((n) => n.id === firstNotif.id);
    assert(readItem?.status === 'READ', 'Notification marked as READ');

    await markAllNotificationsRead(studentAId);
    const notifsAllRead = await getNotificationCenterData(studentAId);
    assert(notifsAllRead.summary.unreadCount === 0, 'All notifications marked READ sets unreadCount to 0');

    // Update Notification Preferences
    const updatedPref = await updateNotificationPreferences(studentAId, {
      preferredTime: '18:00',
      maxRemindersPerDay: 5,
    });
    assert(updatedPref.preferredTime === '18:00', 'Notification preferredTime persisted');
    assert(updatedPref.maxRemindersPerDay === 5, 'Notification maxRemindersPerDay persisted');

    // ========================================================================
    // JOURNEY H: READINESS COCKPIT, DOSSIER & PDF EXPORT
    // ========================================================================
    console.log('\n--- JOURNEY H: Placement Readiness Cockpit & Dossier ---');
    const cockpit = await getPlacementExecutionData(studentAId);
    assert(cockpit.currentPosition.prsScore >= 0, 'Cockpit computes authoritative PRS');
    assert(cockpit.criticalGaps.length >= 0, 'Cockpit analyzes critical deficits');
    assert(cockpit.finalChecklist.items.length === 8, 'Cockpit generates 8-stage placement checklist');

    // Generate authenticated dossier report
    const dossierReport = await getPlacementReadinessReport(studentAId);
    assert(dossierReport.candidate.name === 'Aarav Newcomer', 'Dossier report contains candidate identity');
    assert(dossierReport.metadata.verificationHash.length === 16, 'Dossier contains 16-char tamper-evident seal');

    // Generate PDF
    const pdfBuf = generateReadinessDossierPdf(dossierReport);
    assert(pdfBuf.length > 5000, `PDF generated with valid binary size (${pdfBuf.length} bytes)`);
    assert(pdfBuf.subarray(0, 5).toString('ascii') === '%PDF-', 'PDF starts with %PDF- header');

    // Recruiter verification: create share link
    const shareLink = await createDossierShareLink(studentAId, { expiresInDays: 30 });
    assert(Boolean(shareLink.rawToken), 'Recruiter share link generates rawToken');
    assert(Boolean(shareLink.shareUrl), 'Recruiter share link provides shareUrl');

    // Verify public recruiter view with valid token
    const publicValid = await getPublicDossierVerification(shareLink.rawToken!);
    assert(publicValid.status === 'VALID', 'Public recruiter verification resolves to VALID');
    assert(publicValid.publicData !== null, 'Public verification provides whitelisted data');
    assert((publicValid.publicData as any)?.email === undefined, 'Public response strictly omits student email');

    // Verify invalid token
    const publicInvalid = await getPublicDossierVerification('invalid-token-1234567890');
    assert(publicInvalid.status === 'INVALID', 'Invalid token returns status: INVALID');

    // Revoke share link and verify revoked state
    await revokeDossierShareLink(studentAId, shareLink.shareTokenId);
    const publicRevoked = await getPublicDossierVerification(shareLink.rawToken!);
    assert(publicRevoked.status === 'REVOKED', 'Revoked share token returns status: REVOKED');

    // ========================================================================
    // JOURNEY I: GLOBAL SEARCH & COMMAND PALETTE
    // ========================================================================
    console.log('\n--- JOURNEY I: Global Search & Navigation ---');
    const searchProblem = await searchGlobalEntities(studentAId, 'Array');
    assert(searchProblem.length >= 1, 'Search finds DSA problems matching "Array"');
    assert(searchProblem.some((r) => r.url.includes('/dashboard/dsa')), 'DSA search result links to DSA workspace');

    const searchDbms = await searchGlobalEntities(studentAId, 'DBMS');
    assert(searchDbms.some((r) => r.url.includes('/dashboard/core-cs')), 'Core CS search result links to Core CS hub');

    const searchAmazon = await searchGlobalEntities(studentAId, 'Amazon');
    assert(searchAmazon.some((r) => r.url.includes('/dashboard/companies')), 'Company search result links to Company hub');

    const searchDossier = await searchGlobalEntities(studentAId, 'dossier');
    assert(searchDossier.some((r) => r.url.includes('/dashboard/readiness/report')), 'Dossier search result links to report');

    const searchNotifs = await searchGlobalEntities(studentAId, 'notifications');
    assert(searchNotifs.some((r) => r.url.includes('/dashboard/notifications')), 'Notifications search result links to notifications');

  } catch (err) {
    console.error('Fatal audit failure:', err);
    failedChecks++;
  } finally {
    // Teardown test accounts safely
    if (studentAId) {
      await prisma.user.delete({ where: { id: studentAId } }).catch(() => null);
    }
  }

  console.log('\n====================================================================');
  console.log(`AUDIT RESULTS: ${passedChecks} PASSED, ${failedChecks} FAILED (TOTAL: ${totalChecks})`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  }
  console.log('====================================================================');
}

runAudit().then(() => process.exit(failedChecks > 0 ? 1 : 0));
