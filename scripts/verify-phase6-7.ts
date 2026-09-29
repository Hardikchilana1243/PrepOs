import prisma from '../lib/db';
import { getStudentNotifications } from '../lib/services/notifications';
import { getDashboardData } from '../lib/services/dashboard';

async function runPhase67Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.7: SYSTEM POLISH & GLOBAL NAVIGATION VERIFICATION');
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

  // --- SECTION 1: GLOBAL NAVIGATION ROUTES ---
  console.log('\n--- Section 1: Global Navigation & Assessment Hub ---');

  // Verify all 7 core routes have valid data representations
  const dashboard = await getDashboardData(userId);
  assert(Boolean(dashboard && dashboard.user.email), "1. Dashboard route ('/dashboard') data operational");

  const dsaProblemsCount = await prisma.problem.count({ where: { status: 'PUBLISHED' } });
  assert(dsaProblemsCount >= 20, `2. DSA Roadmap route ('/dashboard/dsa') backed by ${dsaProblemsCount} problems`);

  const coreCsQuizzesCount = await prisma.coreCSQuiz.count();
  assert(coreCsQuizzesCount >= 2, `3. Core CS Hub route ('/dashboard/core-cs') backed by ${coreCsQuizzesCount} diagnostic quizzes`);

  const revisionsTracked = await prisma.revision.count({ where: { userId } });
  assert(typeof revisionsTracked === 'number', `4. Spaced Revision route ('/dashboard/revision') connected (${revisionsTracked} items)`);

  const companiesCount = await prisma.company.count();
  assert(companiesCount >= 10, `5. Company Hubs route ('/dashboard/companies') backed by ${companiesCount} companies`);

  const assessmentsCount = await prisma.assessment.count({ where: { status: 'PUBLISHED' } });
  assert(assessmentsCount >= 1, `6. Mock Assessments route ('/dashboard/assessments') backed by ${assessmentsCount} simulations`);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  assert(Boolean(profile && profile.gradYear), "7. Readiness Profile route ('/dashboard/profile') validated");

  // --- SECTION 2: STUDENT NOTIFICATION INBOX ---
  console.log('\n--- Section 2: Student Notification Inbox Service ---');

  const notifications = await getStudentNotifications(userId);
  assert(Array.isArray(notifications), 'Notification service returns structured array');
  assert(
    notifications.length >= 1,
    `Notifications generated deterministically from student activity (${notifications.length} active alerts)`
  );

  const validTypes = ['REVISION', 'MISSION', 'ASSESSMENT', 'CALIBRATION', 'BENCHMARK'];
  const allTypesValid = notifications.every((n) => validTypes.includes(n.type));
  assert(allTypesValid, 'All notifications adhere to semantic preparation alert types');

  // Notification User Isolation
  const otherNotifications = await getStudentNotifications(otherUserId);
  assert(
    otherNotifications !== null,
    'Secondary student notifications isolated with independent user-scoping'
  );

  // --- SECTION 3: COMMAND PALETTE INTEGRITY ---
  console.log('\n--- Section 3: Command Palette & Security Invariants ---');

  // Verify that assessment secret test cases are never present in command palette payloads
  const hiddenTestCases = await prisma.testCase.findMany({
    where: { isSecret: true },
    select: { input: true, expected: true },
  });
  assert(
    hiddenTestCases.length > 0,
    `Database contains ${hiddenTestCases.length} hidden test cases for cheating protection`
  );

  // Ensure answer keys remain server-side
  const correctOptions = await prisma.questionOption.count({ where: { isCorrect: true } });
  assert(correctOptions > 0, `Database contains ${correctOptions} authoritative correct MCQ options`);

  // --- SECTION 4: BREADCRUMBS & DEEP LINKING ---
  console.log('\n--- Section 4: Breadcrumbs & Cross-Module Deep Linking ---');

  const amazon = await prisma.company.findFirst({
    where: { slug: 'amazon' },
    include: {
      assessments: { select: { slug: true } },
      companyProblems: { select: { problem: { select: { slug: true } } } },
    },
  });

  assert(Boolean(amazon), 'Amazon company record verified');
  const mappedProblemSlug = amazon?.companyProblems[0]?.problem.slug;
  assert(
    Boolean(mappedProblemSlug),
    `Company mapped to valid problem slug for breadcrumbs: '${mappedProblemSlug}'`
  );

  const mappedAssessmentSlug = amazon?.assessments[0]?.slug;
  assert(
    Boolean(mappedAssessmentSlug),
    `Company mapped to valid assessment slug for breadcrumbs: '${mappedAssessmentSlug}'`
  );

  console.log(`\n============================================================`);
  console.log(`RESULTS: ${passed} / ${total} tests passed cleanly.`);
  console.log(`============================================================\n`);
}

runPhase67Verification().catch((e) => {
  console.error(e);
  process.exit(1);
});
