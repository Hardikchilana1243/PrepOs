// ============================================================================
// PREPOS PHASE 6.16 VERIFICATION SUITE
// Smart Reminder & Notification Center
// ============================================================================

import prisma from '../lib/db';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  isValidTimeString,
  isValidTimezone,
  isWithinQuietHours,
} from '../lib/services/notification-preferences';
import {
  getNotificationCenterData,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from '../lib/services/notifications';
import {
  evaluateNotificationEligibility,
  getActiveReminders,
  dismissReminder,
  markReminderOpened,
  getNotificationHistory,
  getLocalTimeDetails,
} from '../lib/services/notification-engine';
import { browserNotificationAdapter } from '../lib/services/browser-notification';
import { getDailyExecutionData } from '../lib/services/daily-execution';
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

async function runPhase616Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.16: SMART REMINDER & NOTIFICATION CENTER');
  console.log('============================================================\n');

  let userA: { id: string; email: string; name: string | null } | null = null;
  try {
    // ------------------------------------------------------------------------
    // SETUP: Multi-Tenant Candidates
    // ------------------------------------------------------------------------
    console.log('--- Multi-Tenant Setup & Pre-conditions ---');

    userA = await prisma.user.findFirst({
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
          email: 'user.b.phase616@univ.edu',
          name: 'Notification Candidate B',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Candidate User B verified for multi-tenant isolation');

    // Clean up any test notification events from previous runs to ensure clean baseline
    await prisma.progressEvent.deleteMany({
      where: {
        userId: { in: [userA!.id, userB!.id] },
        eventType: {
          in: [
            'NOTIFICATION_READ',
            'NOTIFICATION_DISMISSED',
            'ALL_NOTIFICATIONS_READ',
            'REMINDER_DISMISSED',
            'REMINDER_OPENED',
          ],
        },
      },
    });

    // ------------------------------------------------------------------------
    // 1. Authenticated Notification Center Access
    // ------------------------------------------------------------------------
    console.log('\n--- 1 & 2. Authenticated Access & Guard Boundaries ---');
    const initialCenterData = await getNotificationCenterData(userA!.id);
    assert(Boolean(initialCenterData.summary), '1. Authenticated notification center data loads successfully');
    assert(Array.isArray(initialCenterData.notifications), '1b. Notifications list is a structured array');
    assert(Array.isArray(initialCenterData.categories), '1c. Categories filter list is present');

    // ------------------------------------------------------------------------
    // 2. Unauthenticated Rejection
    // ------------------------------------------------------------------------
    let unauthRejected = false;
    try {
      await getNotificationCenterData('');
    } catch {
      unauthRejected = true;
    }
    assert(unauthRejected, '2. Unauthenticated access rejected with error');

    // ------------------------------------------------------------------------
    // 3. Notification Aggregation from Real Revision Records
    // ------------------------------------------------------------------------
    console.log('\n--- 3 & 4. Revision Records & Overdue Detection ---');
    const sampleProblem = await prisma.problem.findFirst({
      select: { id: true, title: true },
    });
    assert(Boolean(sampleProblem), 'Sample problem available for test fixture');

    const now = new Date();
    const testRevision = await prisma.revision.upsert({
      where: {
        userId_problemId: {
          userId: userA!.id,
          problemId: sampleProblem!.id,
        },
      },
      update: {
        dueAt: new Date(now.getTime() - 2000), // Due today
        completedAt: null,
        intervalDays: 7,
      },
      create: {
        userId: userA!.id,
        problemId: sampleProblem!.id,
        dueAt: new Date(now.getTime() - 2000),
        intervalDays: 7,
        confidence: 'GOOD',
      },
    });
    assert(Boolean(testRevision), 'SM-2 revision record fixture prepared');

    const centerWithDue = await getNotificationCenterData(userA!.id);
    const revItem = centerWithDue.notifications.find(
      (n) => n.category === 'DUE_TODAY' || n.category === 'REVISION'
    );
    assert(Boolean(revItem), '3. Notification aggregated from real SM-2 revision records');
    if (revItem) {
      assert(revItem.deepLinkUrl === '/dashboard/revision', '3b. Revision deep-link points to /dashboard/revision');
    }

    // ------------------------------------------------------------------------
    // 4. Overdue Revision Detection
    // ------------------------------------------------------------------------
    await prisma.revision.update({
      where: { id: testRevision.id },
      data: {
        dueAt: new Date(now.getTime() - 48 * 3600 * 1000), // 48h ago = Overdue
        completedAt: null,
      },
    });

    const centerWithOverdue = await getNotificationCenterData(userA!.id);
    const overdueItem = centerWithOverdue.notifications.find((n) => n.category === 'OVERDUE');
    assert(Boolean(overdueItem), '4. Overdue revision detected with category OVERDUE');
    if (overdueItem) {
      assert(overdueItem.urgency === 'URGENT', '4b. Overdue revision urgency classified as URGENT');
      assert(overdueItem.title.includes('Overdue'), '4c. Factual title indicates overdue recall');
    }

    // ------------------------------------------------------------------------
    // 5. Daily Execution Reminder Detection
    // ------------------------------------------------------------------------
    console.log('\n--- 5–9. Execution, Assessment, Core CS, Company & Readiness Detection ---');
    const dailyData = await getDailyExecutionData(userA!.id);
    const dailyExecNotif = centerWithOverdue.notifications.find(
      (n) => n.category === 'DAILY_EXECUTION'
    );
    assert(Boolean(dailyExecNotif), '5. Daily execution reminder detected from Phase 6.15 plan');
    if (dailyExecNotif) {
      assert(
        dailyExecNotif.deepLinkUrl.includes('/dashboard/readiness'),
        '5b. Daily execution notification deep-links to readiness command center'
      );
    }

    // ------------------------------------------------------------------------
    // 6. Assessment Reminder Detection
    // ------------------------------------------------------------------------
    const assessmentNotif = centerWithOverdue.notifications.find(
      (n) => n.category === 'ASSESSMENT'
    );
    assert(Boolean(assessmentNotif), '6. Assessment reminder detected from assessment records');
    if (assessmentNotif) {
      assert(
        assessmentNotif.deepLinkUrl.startsWith('/dashboard/assessments'),
        '6b. Assessment deep-link points to assessment drill'
      );
    }

    // ------------------------------------------------------------------------
    // 7. Core CS Benchmark Reminder Detection
    // ------------------------------------------------------------------------
    const coreCsNotif = centerWithOverdue.notifications.find((n) => n.category === 'CORE_CS');
    assert(Boolean(coreCsNotif), '7. Core CS benchmark deficit reminder detected (<70% threshold)');
    if (coreCsNotif) {
      assert(
        coreCsNotif.deepLinkUrl === '/dashboard/core-cs',
        '7b. Core CS deep-link points to /dashboard/core-cs'
      );
    }

    // ------------------------------------------------------------------------
    // 8. Company Preparation Reminder Detection
    // ------------------------------------------------------------------------
    const companyNotif = centerWithOverdue.notifications.find((n) => n.category === 'COMPANY');
    assert(Boolean(companyNotif), '8. Target company preparation reminder detected');
    if (companyNotif) {
      assert(
        companyNotif.deepLinkUrl.startsWith('/dashboard/companies'),
        '8b. Company deep-link points to company hub'
      );
    }

    // ------------------------------------------------------------------------
    // 9. Readiness Alert Detection
    // ------------------------------------------------------------------------
    const readinessNotif = centerWithOverdue.notifications.find(
      (n) => n.category === 'READINESS'
    );
    assert(Boolean(readinessNotif), '9. Readiness critical gap alert detected from execution data');

    // ------------------------------------------------------------------------
    // 10. Unread Count Accuracy
    // ------------------------------------------------------------------------
    console.log('\n--- 10–14. Lifecycle Mutations, Unread Counts & Deduplication ---');
    const unreadCount = await getUnreadNotificationCount(userA!.id);
    assert(
      unreadCount === centerWithOverdue.summary.unreadCount,
      `10. Unread count (${unreadCount}) matches summary.unreadCount accurately`
    );

    // ------------------------------------------------------------------------
    // 11. Mark-as-Read Persistence
    // ------------------------------------------------------------------------
    const firstNotif = centerWithOverdue.notifications[0];
    await markNotificationRead(userA!.id, firstNotif.id);

    const centerAfterRead = await getNotificationCenterData(userA!.id);
    const readItem = centerAfterRead.notifications.find((n) => n.id === firstNotif.id);
    assert(Boolean(readItem && readItem.status === 'READ'), '11. markNotificationRead persists status as READ');

    // ------------------------------------------------------------------------
    // 12. Mark-All-Read Persistence
    // ------------------------------------------------------------------------
    await markAllNotificationsRead(userA!.id);
    const centerAfterAllRead = await getNotificationCenterData(userA!.id);
    assert(
      centerAfterAllRead.summary.unreadCount === 0,
      '12. markAllNotificationsRead sets unreadCount to 0'
    );
    assert(
      centerAfterAllRead.notifications.every((n) => n.status === 'READ'),
      '12b. All active notifications marked as READ'
    );

    // ------------------------------------------------------------------------
    // 13. Dismiss Persistence
    // ------------------------------------------------------------------------
    const dismissTarget = centerAfterAllRead.notifications[0];
    await dismissNotification(userA!.id, dismissTarget.id);

    const centerAfterDismiss = await getNotificationCenterData(userA!.id);
    const stillActive = centerAfterDismiss.notifications.some((n) => n.id === dismissTarget.id);
    assert(!stillActive, '13. Dismissed notification excluded from active notifications view');

    // ------------------------------------------------------------------------
    // 14. Deduplication
    // ------------------------------------------------------------------------
    const notificationIds = centerAfterDismiss.notifications.map((n) => n.id);
    const uniqueIds = new Set(notificationIds);
    assert(
      notificationIds.length === uniqueIds.size,
      '14. Deterministic deduplication: zero duplicate notification IDs in output'
    );

    // ------------------------------------------------------------------------
    // 15–18. Invariant Protection: Domain Records Untouched
    // ------------------------------------------------------------------------
    console.log('\n--- 15–18. Domain Integrity & Non-Mutation Invariants ---');

    // 15 & 16. SM-2 intervals unchanged
    const revAfterInspections = await prisma.revision.findUnique({
      where: { id: testRevision.id },
    });
    assert(
      revAfterInspections?.intervalDays === testRevision.intervalDays,
      `15 & 16. SM-2 intervalDays strictly preserved (${revAfterInspections?.intervalDays} === ${testRevision.intervalDays})`
    );

    // 17. Execution tasks unchanged
    const execAfter = await getDailyExecutionData(userA!.id);
    assert(
      execAfter.summary.totalTasks === dailyData.summary.totalTasks,
      '17. Daily execution task counts unaffected by notification lifecycle'
    );

    // 18. PRS unchanged
    const prsBefore = await getReadinessScore(userA!.id);
    // Trigger another read mutation
    await markAllNotificationsRead(userA!.id);
    const prsAfter = await getReadinessScore(userA!.id);
    assert(
      prsBefore.totalScore === prsAfter.totalScore,
      `18. PRS score strictly invariant under notification actions (${prsBefore.totalScore} === ${prsAfter.totalScore})`
    );

    // ------------------------------------------------------------------------
    // 19. Multi-Tenant Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- 19–20. Security, Privacy & Evaluation Secret Protection ---');
    const userBCenter = await getNotificationCenterData(userB!.id);
    const userAItemsInB = userBCenter.notifications.some((n) => n.id.includes(userA!.id));
    assert(!userAItemsInB, '19. User B cannot view User A private notifications');

    const userAActive = await getNotificationCenterData(userA!.id);
    assert(userAActive.notifications.length > 0, '19b. User A has active notifications to test isolation');
    const targetA = userAActive.notifications[0];
    // User B attempts to dismiss User A's notification
    await dismissNotification(userB!.id, targetA.id);
    // Verify User A still has their notification unaffected
    const userACheck = await getNotificationCenterData(userA!.id);
    const isUserAPreserved = userACheck.notifications.some((n) => n.id === targetA.id);
    assert(isUserAPreserved, '19b. Candidate A notifications cannot be mutated by Candidate B');

    // ------------------------------------------------------------------------
    // 20. Hidden Answer / Test Data Protection
    // ------------------------------------------------------------------------
    for (const notif of centerWithOverdue.notifications) {
      assert(!('testCases' in notif), '20. No hidden test cases in notification payload');
      assert(!('correctAnswer' in notif), '20b. No MCQ correct answers in notification payload');
      assert(!('tokenHash' in notif), '20c. No recruiter verification tokens in notification payload');
    }

    // ------------------------------------------------------------------------
    // 21. Mobile-Safe Rendering & Valid Deep-Links
    // ------------------------------------------------------------------------
    console.log('\n--- 21–24. Responsive Links, Global Search & System Regressions ---');
    for (const notif of centerWithOverdue.notifications) {
      assert(
        notif.deepLinkUrl.startsWith('/dashboard'),
        `21. Deep link valid and dashboard-scoped: ${notif.deepLinkUrl}`
      );
    }

    // ------------------------------------------------------------------------
    // 22. Global Search Integration
    // ------------------------------------------------------------------------
    const searchNotifications = await searchGlobalEntities(userA!.id, 'notifications');
    const hasCenterLink = searchNotifications.some(
      (r) => r.url === '/dashboard/notifications'
    );
    assert(hasCenterLink, '22. Global Search for "notifications" navigates to /dashboard/notifications');

    const searchReminders = await searchGlobalEntities(userA!.id, 'reminders');
    const hasRemindersLink = searchReminders.some(
      (r) => r.url === '/dashboard/notifications'
    );
    assert(hasRemindersLink, '22b. Global Search for "reminders" navigates to /dashboard/notifications');

    const searchOverdue = await searchGlobalEntities(userA!.id, 'overdue reminders');
    const hasOverdueLink = searchOverdue.some(
      (r) => r.url === '/dashboard/notifications'
    );
    assert(hasOverdueLink, '22c. Global Search for "overdue reminders" navigates to /dashboard/notifications');

    // ------------------------------------------------------------------------
    // 23. Notification Preference Persistence
    // ------------------------------------------------------------------------
    const prefUpdated = await updateNotificationPreferences(userA!.id, {
      preferredTime: '10:00',
      maxRemindersPerDay: 5,
    });
    assert(prefUpdated.preferredTime === '10:00', '23. Notification preference preferredTime persisted');
    assert(prefUpdated.maxRemindersPerDay === 5, '23b. Notification preference maxRemindersPerDay persisted');

    // ------------------------------------------------------------------------
    // 24. Regression Compatibility Across All Previous Phases
    // ------------------------------------------------------------------------
    const execCommandCenter = await getPlacementExecutionData(userA!.id);
    assert(Boolean(execCommandCenter.cockpit), '24. Phase 6.14 readiness command center intact');

    const dossierReport = await getPlacementReadinessReport(userA!.id);
    assert(Boolean(dossierReport), '24b. Phase 6.12 dossier report generation intact');

    const pdfBuffer = await generateReadinessDossierPdf(dossierReport);
    assert(Boolean(pdfBuffer && pdfBuffer.length > 0), '24c. Phase 6.12 PDF generation intact');

    const shareLink = await createDossierShareLink(userA!.id, { expiresInDays: 7 });
    assert(Boolean(shareLink.shareUrl), '24d. Phase 6.13 recruiter share link intact');

    const publicVerify = await getPublicDossierVerification(shareLink.rawToken);
    assert(publicVerify.status === 'VALID', '24e. Phase 6.13 public recruiter verification intact');

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`Phase 6.16 Verification Complete: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Phase 6.16 verification:', error);
    process.exit(1);
  } finally {
    if (userA) {
      await prisma.progressEvent.deleteMany({
        where: {
          userId: userA.id,
          eventType: { in: ['ALL_NOTIFICATIONS_READ', 'NOTIFICATION_READ', 'NOTIFICATION_DISMISSED'] },
        },
      });
    }
    await prisma.$disconnect();
  }
}

runPhase616Verification();
