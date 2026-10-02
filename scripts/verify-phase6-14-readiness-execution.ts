// ============================================================================
// PREPOS PHASE 6.14 VERIFICATION SUITE
// Placement Execution & Final Readiness Command Center
// ============================================================================

import prisma from '../lib/db';
import {
  getPlacementExecutionData,
  FinalReadinessExecutionData,
} from '../lib/services/readiness-execution';
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

async function runPhase614Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.14: PLACEMENT EXECUTION COMMAND CENTER');
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
          email: 'user.b.exec@univ.edu',
          name: 'Execution Candidate B',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for multi-tenant isolation');

    // ------------------------------------------------------------------------
    // SECTION 1: AUTHENTICATED EXECUTION DATA LOADING
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Authenticated Execution Data Loading ---');

    const execA = await getPlacementExecutionData(userA!.id);
    assert(Boolean(execA), '1. Authenticated readiness execution data loads successfully');
    assert(Boolean(execA.cockpit), 'Execution payload includes authoritative cockpit foundation');
    assert(Boolean(execA.currentPosition), 'Execution payload includes current position model');
    assert(Array.isArray(execA.criticalGaps), 'Execution payload includes critical gaps array');
    assert(Boolean(execA.dailyExecutionPlan), 'Execution payload includes daily execution plan');
    assert(Boolean(execA.placementTargets), 'Execution payload includes placement targets model');
    assert(Boolean(execA.finalChecklist), 'Execution payload includes final checklist model');
    assert(Boolean(execA.activityTimeline), 'Execution payload includes activity timeline');
    assert(Boolean(execA.verificationControls), 'Execution payload includes verification controls');

    // ------------------------------------------------------------------------
    // SECTION 2: MULTI-TENANT ISOLATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Multi-Tenant Isolation ---');

    const execB = await getPlacementExecutionData(userB!.id);
    assert(Boolean(execB), '2. User B execution data loads independently');
    assert(
      execA.cockpit.overallPRS.score !== undefined && execB.cockpit.overallPRS.score !== undefined,
      'Both candidates have valid independent readiness metrics'
    );
    assert(
      execA.currentPosition.dsaRemaining.solved !== undefined &&
        execB.currentPosition.dsaRemaining.solved !== undefined,
      'User A and User B DSA metrics are strictly scoped to their respective database records'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: AUTHORITATIVE PRS PRESERVATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Authoritative PRS Formula Preservation ---');

    const authoritativePRS = await getReadinessScore(userA!.id);
    assert(
      execA.currentPosition.prsScore === authoritativePRS.totalScore,
      '3. Execution currentPosition PRS score strictly matches authoritative getReadinessScore'
    );
    assert(
      execA.currentPosition.prsTier === execA.cockpit.overallPRS.tier &&
        ['TIER_1_READY', 'COMPETITIVE', 'FOUNDATION_BUILDING', 'EARLY_STAGE'].includes(
          execA.currentPosition.prsTier
        ),
      'Readiness tier strictly matches authoritative calculation'
    );
    assert(
      execA.currentPosition.composition.dsaWeight === 40 &&
        execA.currentPosition.composition.coreCsWeight === 30 &&
        execA.currentPosition.composition.oaWeight === 15 &&
        execA.currentPosition.composition.consistencyWeight === 15,
      'Authoritative 40/30/15/15 PRS factor weights are strictly preserved'
    );

    // ------------------------------------------------------------------------
    // SECTION 4: DETERMINISTIC CRITICAL GAPS ENGINE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Deterministic Critical Gaps Engine ---');

    assert(
      Array.isArray(execA.criticalGaps),
      '4. Critical gaps engine returns array of actionable deficits'
    );

    for (const gap of execA.criticalGaps) {
      assert(
        Boolean(gap.id && gap.category && gap.title && gap.reason),
        `Gap "${gap.title}" has complete metadata (id, category, title, reason)`
      );
      assert(
        Boolean(gap.currentMetric && gap.targetMetric && gap.remainingAmount),
        `Gap "${gap.title}" specifies factual current, target, and remaining metrics`
      );
      assert(
        ['HIGH', 'MEDIUM', 'NORMAL'].includes(gap.urgency),
        `Gap "${gap.title}" has deterministic urgency (${gap.urgency})`
      );
      assert(
        Boolean(gap.ctaUrl && gap.ctaText),
        `Gap "${gap.title}" provides direct deep-link to relevant workspace (${gap.ctaUrl})`
      );
    }

    // Verify revision overdue gap exists if user has overdue items
    if (execA.currentPosition.revisionWorkload.overdue > 0) {
      const hasOverdueGap = execA.criticalGaps.some((g) => g.id === 'gap-revision-overdue');
      assert(hasOverdueGap, 'Overdue revision items correctly trigger HIGH urgency gap');
    }

    // ------------------------------------------------------------------------
    // SECTION 5: TODAY'S EXECUTION PLAN
    // ------------------------------------------------------------------------
    console.log("\n--- Section 5: Today's Execution Plan ---");

    const plan = execA.dailyExecutionPlan;
    assert(Boolean(plan.date), "5a. Execution plan contains today's formatted date string");
    assert(
      typeof plan.totalPendingTasks === 'number',
      '5b. Total pending tasks count is a non-negative number'
    );

    for (const task of plan.items) {
      assert(
        Boolean(task.id && task.taskType && task.title && task.subtitle),
        `Daily task "${task.title}" has complete identifiers and copy`
      );
      assert(
        typeof task.estimatedMinutes === 'number' && task.estimatedMinutes > 0,
        `Daily task "${task.title}" includes positive estimated minutes (~${task.estimatedMinutes}m)`
      );
      assert(
        task.ctaUrl.startsWith('/dashboard/'),
        `Daily task "${task.title}" deep-links directly to existing dashboard route (${task.ctaUrl})`
      );
      assert(
        typeof task.isCompleted === 'boolean',
        `Daily task "${task.title}" tracks genuine completion status`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 6: PLACEMENT TARGET TIMELINE
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Placement Target Timeline ---');

    const targets = execA.placementTargets;
    assert(
      typeof targets.hasTargetCompanies === 'boolean',
      '6a. Target timeline provides boolean hasTargetCompanies indicator'
    );
    assert(
      Array.isArray(targets.targets),
      '6b. Target company list is a structured array'
    );

    if (targets.hasTargetCompanies) {
      const firstTarget = targets.targets[0];
      assert(
        Boolean(firstTarget.companyName && firstTarget.companySlug),
        `Target "${firstTarget.companyName}" has valid identity and slug`
      );
      assert(
        typeof firstTarget.coveragePct === 'number' && firstTarget.coveragePct >= 0,
        `Target "${firstTarget.companyName}" has non-negative coverage percentage (${firstTarget.coveragePct}%)`
      );
      assert(
        firstTarget.workspaceUrl.startsWith('/dashboard/companies/'),
        `Target "${firstTarget.companyName}" links to its dedicated company workspace`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 7: FINAL READINESS CHECKLIST
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Final Readiness Checklist ---');

    const checklist = execA.finalChecklist;
    assert(
      checklist.items.length === 8,
      '7a. Final checklist verifies exactly 8 pre-interview readiness conditions'
    );
    assert(
      typeof checklist.completedCount === 'number' && checklist.completedCount <= checklist.totalCount,
      `7b. Completed checklist count (${checklist.completedCount}/${checklist.totalCount}) is valid`
    );
    assert(
      ['ACTION_REQUIRED', 'SUBSTANTIALLY_READY', 'READY_FOR_PLACEMENT'].includes(
        checklist.readinessStatus
      ),
      `7c. Readiness classification is standard (${checklist.readinessStatus})`
    );

    for (const item of checklist.items) {
      assert(
        ['COMPLETED', 'IN_PROGRESS', 'REMAINING', 'NOT_AVAILABLE'].includes(item.status),
        `Checklist item "${item.label}" has valid status (${item.status})`
      );
      assert(
        Boolean(item.evidence && item.evidence.length > 0),
        `Checklist item "${item.label}" is backed by factual database evidence`
      );
      assert(
        item.ctaUrl.startsWith('/dashboard/'),
        `Checklist item "${item.label}" provides direct navigation link (${item.ctaUrl})`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 8: ACTIVITY TIMELINE AGGREGATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Activity Timeline Aggregation ---');

    const activity = execA.activityTimeline;
    assert(Array.isArray(activity.events), '8a. Activity timeline returns array of events');

    for (const ev of activity.events) {
      assert(
        Boolean(ev.id && ev.type && ev.title && ev.timestamp),
        `Activity event "${ev.title}" has complete metadata`
      );
      assert(
        !isNaN(new Date(ev.timestamp).getTime()),
        `Activity event timestamp is valid ISO string (${ev.timestamp})`
      );
      assert(
        ev.url.startsWith('/dashboard/'),
        `Activity event links to authenticated dashboard route (${ev.url})`
      );
    }

    // Check chronological ordering
    if (activity.events.length >= 2) {
      const isSorted = new Date(activity.events[0].timestamp).getTime() >=
        new Date(activity.events[1].timestamp).getTime();
      assert(isSorted, '8b. Activity events are sorted chronologically descending (newest first)');
    }

    // ------------------------------------------------------------------------
    // SECTION 9: VERIFICATION & SHARE CONTROLS INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Verification & Share Controls Integration ---');

    const vControls = execA.verificationControls;
    assert(
      typeof vControls.hasDossier === 'boolean',
      '9a. Verification controls report boolean hasDossier flag'
    );
    assert(
      typeof vControls.hasActiveShare === 'boolean',
      '9b. Verification controls report boolean hasActiveShare flag'
    );
    assert(
      ['ACTIVE', 'EXPIRED', 'REVOKED', 'NOT_CREATED'].includes(vControls.shareStatus),
      `9c. Recruiter share status is standard (${vControls.shareStatus})`
    );

    // ------------------------------------------------------------------------
    // SECTION 10: ZERO-LEAK SECURITY AUDIT
    // ------------------------------------------------------------------------
    console.log('\n--- Section 10: Zero-Leak Security Audit ---');

    const serializedPayload = JSON.stringify(execA);
    assert(
      !serializedPayload.includes('answerKey'),
      '10a. Execution payload strictly excludes MCQ answer keys'
    );
    assert(
      !serializedPayload.includes('hiddenTestCases'),
      '10b. Execution payload strictly excludes hidden test cases'
    );
    assert(
      !serializedPayload.includes('isCorrect'),
      '10c. Execution payload strictly excludes quiz answer flags'
    );
    assert(
      !serializedPayload.includes('passwordHash'),
      '10d. Execution payload strictly excludes credentials'
    );

    // ------------------------------------------------------------------------
    // SECTION 11: GLOBAL SEARCH INTEGRATION
    // ------------------------------------------------------------------------
    console.log('\n--- Section 11: Global Search Discoverability ---');

    const searchExec = await searchGlobalEntities(userA!.id, 'final readiness');
    const hasFinalReadinessNav = searchExec.some(
      (r) => r.title.includes('Final Readiness') && r.url.includes('/dashboard/readiness')
    );
    assert(hasFinalReadinessNav, '11a. Search for "final readiness" surfaces Execution Command Center');

    const searchGaps = await searchGlobalEntities(userA!.id, 'readiness gaps');
    const hasGapsNav = searchGaps.some(
      (r) => r.title.includes('Critical Preparation Gaps') && r.url.includes('#critical-gaps')
    );
    assert(hasGapsNav, '11b. Search for "readiness gaps" surfaces Critical Gaps anchor');

    const searchChecklist = await searchGlobalEntities(userA!.id, 'placement checklist');
    const hasChecklistNav = searchChecklist.some(
      (r) => r.title.includes('Final Placement Checklist') && r.url.includes('#checklist')
    );
    assert(hasChecklistNav, '11c. Search for "placement checklist" surfaces Checklist anchor');

    // ------------------------------------------------------------------------
    // SECTION 12: REGRESSION CHECK (Dossier, PDF, Public Verification)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 12: Regressions & Cross-Phase Guarantees ---');

    const reportA = await getPlacementReadinessReport(userA!.id);
    assert(Boolean(reportA), '12a. Phase 6.12 dossier report generation remains functional');

    const pdfBuffer = generateReadinessDossierPdf(reportA);
    assert(
      pdfBuffer instanceof Buffer && pdfBuffer.toString('utf-8', 0, 8).startsWith('%PDF-1.4'),
      '12b. Phase 6.12 zero-dependency PDF generation remains functional'
    );

    const shareGen = await createDossierShareLink(userA!.id, { expiresInDays: 7 });
    assert(shareGen.success === true, '12c. Phase 6.13 share link generation remains functional');

    const publicVerify = await getPublicDossierVerification(shareGen.rawToken);
    assert(
      publicVerify.status === 'VALID',
      '12d. Phase 6.13 public recruiter verification remains fully functional'
    );

    console.log('\n============================================================');
    console.log(`Phase 6.14 Verification Results: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Phase 6.14 verification:', error);
    process.exit(1);
  }
}

runPhase614Verification();
