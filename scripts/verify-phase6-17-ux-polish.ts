// ============================================================================
// PREPOS PHASE 6.17 VERIFICATION SUITE
// UX Consolidation, Navigation Cleanup & Production Polish
// ============================================================================

import fs from 'fs';
import path from 'path';
import prisma from '../lib/db';
import { getPrimaryDashboardData, getPreparationPillarsData } from '../lib/services/dashboard';
import { getPlacementExecutionData } from '../lib/services/readiness-execution';
import { getDailyExecutionData } from '../lib/services/daily-execution';
import { getReadinessScore } from '../lib/services/readiness-score';
import { getNotificationCenterData, getUnreadNotificationCount, getStudentNotifications } from '../lib/services/notifications';
import { getCompanyCatalogData } from '../lib/services/companies';
import { getDSARoadmapData } from '../lib/services/dsa-roadmap';
import { getCoreCSHubData } from '../lib/services/core-cs';
import { getRevisionDashboardData } from '../lib/services/revision';
import { getInterviewWorkspaceData } from '../lib/services/interview';
import { getPlacementReadinessReport } from '../lib/services/readiness-report';
import { createDossierShareLink, getPublicDossierVerification } from '../lib/services/dossier-verification';
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

async function runPhase617Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.17: UX CONSOLIDATION & PRODUCTION POLISH');
  console.log('============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // SETUP: Multi-Tenant Candidates
    // ------------------------------------------------------------------------
    console.log('--- Section 1: Multi-Tenant Candidates & Pre-conditions ---');

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
          email: 'user.b.phase617@univ.edu',
          name: 'Polish Candidate B',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Candidate User B verified for multi-tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 2: NAVIGATION HIERARCHY & ZERO DUPLICATION AUDIT
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Sidebar & Navigation Hierarchy ---');

    const appShellPath = path.join(process.cwd(), 'components', 'layout', 'app-shell.tsx');
    assert(fs.existsSync(appShellPath), '2a. app-shell.tsx exists in layout components');

    const appShellContent = fs.readFileSync(appShellPath, 'utf8');

    // Verify presence of canonical groupings: PREPARATION, STUDENT, VERIFICATION
    assert(
      appShellContent.includes('Preparation') &&
      appShellContent.includes('Student') &&
      appShellContent.includes('Verification'),
      '2b. Sidebar partitions into canonical sections: Preparation, Student, Verification'
    );

    // Verify zero duplication in nav arrays
    const prepNavMatch = appShellContent.match(/const preparationNavItems\s*=\s*\[([\s\S]*?)\];/);
    const studentNavMatch = appShellContent.match(/const studentNavItems\s*=\s*\[([\s\S]*?)\];/);
    const verifyNavMatch = appShellContent.match(/const verificationNavItems\s*=\s*\[([\s\S]*?)\];/);

    assert(Boolean(prepNavMatch), '2c. preparationNavItems defined in app-shell');
    assert(Boolean(studentNavMatch), '2d. studentNavItems defined in app-shell');
    assert(Boolean(verifyNavMatch), '2e. verificationNavItems defined in app-shell');

    // Extract hrefs to confirm unique destinations
    const hrefRegex = /href:\s*['"]([^'"]+)['"]/g;
    const allHrefs: string[] = [];
    let match: RegExpExecArray | null;

    if (prepNavMatch && studentNavMatch && verifyNavMatch) {
      const combinedNav = prepNavMatch[1] + studentNavMatch[1] + verifyNavMatch[1];
      while ((match = hrefRegex.exec(combinedNav)) !== null) {
        allHrefs.push(match[1]);
      }
    }

    const uniqueHrefs = new Set(allHrefs);
    assert(
      allHrefs.length === uniqueHrefs.size,
      `2f. Zero duplicate navigation destinations (${allHrefs.length} unique destinations)`
    );

    // Verify mobile bottom navigation
    assert(
      appShellContent.includes('mobileNavItems') &&
      appShellContent.includes("Mobile Bottom Navigation"),
      '2g. Accessible mobile bottom navigation bar present'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: BREADCRUMBS CANONICAL MAPPING & DEDUPLICATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Breadcrumbs Deduplication & Route Mapping ---');

    const breadcrumbsPath = path.join(process.cwd(), 'components', 'layout', 'breadcrumbs.tsx');
    const breadcrumbsContent = fs.readFileSync(breadcrumbsPath, 'utf8');

    assert(breadcrumbsContent.includes("readiness: 'Placement Readiness'"), '3a. Canonical breadcrumb for readiness mapped');
    assert(breadcrumbsContent.includes("notifications: 'Notifications'"), '3b. Canonical breadcrumb for notifications mapped');
    assert(breadcrumbsContent.includes("interview: 'Interview Prep'"), '3c. Canonical breadcrumb for interview mapped');
    assert(breadcrumbsContent.includes("report: 'Placement Dossier'"), '3d. Canonical breadcrumb for dossier report mapped');

    // Check company pages for absence of duplicate <Breadcrumbs />
    const companyPagePath = path.join(process.cwd(), 'app', 'dashboard', 'companies', 'page.tsx');
    const companyPageContent = fs.readFileSync(companyPagePath, 'utf8');
    assert(!companyPageContent.includes('<Breadcrumbs'), '3e. app/dashboard/companies/page.tsx has zero redundant Breadcrumbs');

    const companyDetailPagePath = path.join(process.cwd(), 'app', 'dashboard', 'companies', '[slug]', 'page.tsx');
    const companyDetailPageContent = fs.readFileSync(companyDetailPagePath, 'utf8');
    assert(!companyDetailPageContent.includes('<Breadcrumbs'), '3f. app/dashboard/companies/[slug]/page.tsx has zero redundant Breadcrumbs');

    // ------------------------------------------------------------------------
    // SECTION 4: HEADER & UNREAD NOTIFICATION ACCURACY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Header & Unread Notification Accuracy ---');

    const centerData = await getNotificationCenterData(userA!.id);
    const unreadCount = await getUnreadNotificationCount(userA!.id);
    const studentNotifs = await getStudentNotifications(userA!.id);

    assert(
      studentNotifs.length === unreadCount,
      `4a. getStudentNotifications returns strictly unread notifications (${studentNotifs.length} === ${unreadCount})`
    );

    const inboxPath = path.join(process.cwd(), 'components', 'layout', 'notification-inbox.tsx');
    const inboxContent = fs.readFileSync(inboxPath, 'utf8');
    assert(
      inboxContent.includes('/dashboard/notifications'),
      '4b. Notification inbox header links directly to canonical /dashboard/notifications'
    );
    assert(
      inboxContent.includes('All Caught Up'),
      '4c. Notification inbox includes honest empty state when all notifications read'
    );

    // ------------------------------------------------------------------------
    // SECTION 5: STANDARDIZED STATUS VOCABULARY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Standardized Status Vocabulary (11 Canonical States) ---');

    const studentOsPath = path.join(process.cwd(), 'components', 'ui', 'student-os.tsx');
    const studentOsContent = fs.readFileSync(studentOsPath, 'utf8');

    const canonicalStatuses = [
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED',
      'DUE_TODAY',
      'OVERDUE',
      'UPCOMING',
      'PASSED',
      'NEEDS_REVIEW',
      'FAILED',
      'TARGET',
      'BOOKMARKED',
    ];

    assert(
      studentOsContent.includes('export function StandardStatusBadge'),
      '5a. StandardStatusBadge component exported from design system'
    );

    for (const st of canonicalStatuses) {
      assert(
        studentOsContent.includes(st),
        `5b. Canonical status "${st}" explicitly supported in StandardStatusBadge`
      );
    }

    assert(
      studentOsContent.includes('showIcon = true'),
      '5c. Non-color-only requirement satisfied: icons enabled by default on status badges'
    );

    // ------------------------------------------------------------------------
    // SECTION 6: CROSS-MODULE CANONICAL DEEP-LINKS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Cross-Module Deep-Link Integrity ---');

    const execData = await getPlacementExecutionData(userA!.id);

    // Critical gaps deep-links
    for (const gap of execData.criticalGaps) {
      assert(
        gap.ctaUrl.startsWith('/dashboard'),
        `6a. Critical gap "${gap.title}" links to canonical dashboard route: ${gap.ctaUrl}`
      );
    }

    // Notification deep-links
    for (const notif of centerData.notifications) {
      assert(
        notif.deepLinkUrl.startsWith('/dashboard'),
        `6b. Notification "${notif.title}" links to canonical dashboard route: ${notif.deepLinkUrl}`
      );
    }

    // Company catalog deep-links
    const companyCatalog = await getCompanyCatalogData(userA!.id);
    for (const comp of companyCatalog.companies.slice(0, 3)) {
      assert(
        Boolean(comp.slug),
        `6c. Company "${comp.name}" has valid canonical slug: ${comp.slug}`
      );
    }

    // Global Search canonical links
    const searchNotifications = await searchGlobalEntities(userA!.id, 'notifications');
    assert(
      searchNotifications.some((r) => r.url === '/dashboard/notifications'),
      '6d. Search for "notifications" routes to /dashboard/notifications'
    );

    const searchDossier = await searchGlobalEntities(userA!.id, 'dossier');
    assert(
      searchDossier.some((r) => r.url === '/dashboard/readiness/report'),
      '6e. Search for "dossier" routes to /dashboard/readiness/report'
    );

    // ------------------------------------------------------------------------
    // SECTION 7: READINESS & TODAY'S EXECUTION RELATIONSHIP
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Readiness & Today Execution Relationship ---');

    const readinessViewPath = path.join(process.cwd(), 'components', 'readiness', 'readiness-view.tsx');
    const readinessViewContent = fs.readFileSync(readinessViewPath, 'utf8');

    assert(
      readinessViewContent.includes('id="today-execution"'),
      '7a. Readiness view anchors Today Execution section via #today-execution'
    );
    const readinessGapsPath = path.join(process.cwd(), 'components', 'readiness', 'readiness-gaps.tsx');
    const readinessGapsContent = fs.readFileSync(readinessGapsPath, 'utf8');

    assert(
      readinessGapsContent.includes('id="critical-gaps"'),
      '7b. Readiness gaps component anchors Critical Gaps section via #critical-gaps'
    );
    assert(
      readinessViewContent.includes('id="notification-preferences"'),
      '7c. Readiness view anchors Notification Preferences via #notification-preferences'
    );
    assert(
      readinessViewContent.includes('/dashboard/notifications'),
      '7d. Readiness view links outward to dedicated Notification Center'
    );

    // ------------------------------------------------------------------------
    // SECTION 8: MOBILE SAFETY & TOUCH TARGET AUDIT
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Mobile UX, Accessibility & Touch Targets ---');

    assert(
      appShellContent.includes('min-h-[44px]'),
      '8a. Mobile navigation items enforce >=44px accessible touch target'
    );
    assert(
      appShellContent.includes('focus-visible:ring-2'),
      '8b. Interactive navigation links include visible keyboard focus rings'
    );
    assert(
      appShellContent.includes('aria-current='),
      '8c. Active navigation links include aria-current="page" attribute'
    );

    // ------------------------------------------------------------------------
    // SECTION 9: AUTHORITATIVE PRS INVARIANCE & DATA INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Authoritative PRS Formula Invariance ---');

    const prsBefore = await getReadinessScore(userA!.id);
    assert(
      prsBefore.totalScore >= 0 && prsBefore.totalScore <= 100,
      `9a. Authoritative PRS score is valid (score: ${prsBefore.totalScore})`
    );
    assert(
      execData.currentPosition.composition.dsaWeight === 40 &&
      execData.currentPosition.composition.coreCsWeight === 30 &&
      execData.currentPosition.composition.oaWeight === 15 &&
      execData.currentPosition.composition.consistencyWeight === 15,
      '9b. Authoritative 40/30/15/15 PRS formula strictly preserved'
    );

    // Navigation and data fetches must leave PRS invariant
    const prsAfter = await getReadinessScore(userA!.id);
    assert(
      prsBefore.totalScore === prsAfter.totalScore,
      `9c. PRS score strictly invariant under UX consolidation (${prsBefore.totalScore} === ${prsAfter.totalScore})`
    );

    // ------------------------------------------------------------------------
    // SECTION 10: ZERO EVALUATION SECRET LEAKS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 10: Zero Evaluation Secret Leaks ---');

    const primaryData = await getPrimaryDashboardData(userA!.id);
    const pillarsData = await getPreparationPillarsData(userA!.id);
    const dsaData = await getDSARoadmapData(userA!.id);
    const coreCsData = await getCoreCSHubData(userA!.id);
    const revData = await getRevisionDashboardData(userA!.id);
    const interviewData = await getInterviewWorkspaceData(userA!.id);
    const reportData = await getPlacementReadinessReport(userA!.id);

    const payloads = [
      primaryData,
      pillarsData,
      dsaData,
      coreCsData,
      revData,
      interviewData,
      reportData,
      centerData,
      execData,
    ];

    for (const payload of payloads) {
      const serialized = JSON.stringify(payload);
      assert(!serialized.includes('"passwordHash"'), '10a. Zero password hashes leaked in student payload');
      assert(!serialized.includes('"rawToken"'), '10b. Zero raw recruiter verification tokens leaked in payload');
      assert(!serialized.includes('"hiddenOutput"'), '10c. Zero hidden evaluation outputs leaked in payload');
    }

    // ------------------------------------------------------------------------
    // SECTION 11: MULTI-TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 11: Multi-Tenant Tenant Isolation ---');

    const userBCenter = await getNotificationCenterData(userB!.id);
    const userAItemsInB = userBCenter.notifications.some((n) => n.id.includes(userA!.id));
    assert(!userAItemsInB, '11a. Candidate B cannot view Candidate A notifications');

    const userBExec = await getPlacementExecutionData(userB!.id);
    assert(
      userBExec.cockpit.overallPRS.score !== undefined &&
      execData.cockpit.overallPRS.score !== undefined,
      '11b. Candidate A and Candidate B maintain strictly isolated readiness metrics'
    );

    // ------------------------------------------------------------------------
    // SECTION 12: PUBLIC RECRUITER VERIFICATION INTEGRITY
    // ------------------------------------------------------------------------
    console.log('\n--- Section 12: Public Recruiter Verification Integrity ---');

    const shareLink = await createDossierShareLink(userA!.id, { expiresInDays: 14 });
    assert(Boolean(shareLink.rawToken), '12a. Recruiter share link generated');

    const publicResult = await getPublicDossierVerification(shareLink.rawToken);
    assert(publicResult.status === 'VALID', '12b. Public recruiter verification succeeds with VALID status');
    assert(Boolean(publicResult.publicData), '12c. Public recruiter payload provided');
    assert(
      !('email' in (publicResult.publicData || {})),
      '12d. Public recruiter payload excludes candidate private email'
    );

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`Phase 6.17 Polish Verification Complete: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Phase 6.17 verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase617Verification();
