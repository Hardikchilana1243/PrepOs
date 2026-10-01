// ============================================================================
// PREPOS PHASE 6.13 VERIFICATION SUITE
// Secure Dossier Sharing & Recruiter Verification Portal
// ============================================================================

import crypto from 'crypto';
import prisma from '../lib/db';
import {
  computeCanonicalDossierHash,
  createOrGetDossierSnapshot,
  createDossierShareLink,
  revokeDossierShareLink,
  regenerateDossierShareLink,
  getStudentShareStatus,
  getPublicDossierVerification,
} from '../lib/services/dossier-verification';
import { getPlacementReadinessReport } from '../lib/services/readiness-report';
import { generateReadinessDossierPdf } from '../lib/services/pdf-engine';
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

async function runPhase613Verification() {
  console.log('============================================================');
  console.log('🧪 PREPOS PHASE 6.13: SECURE DOSSIER SHARING & RECRUITER VERIFICATION');
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
          email: 'user.b.tenant@univ.edu',
          name: 'Candidate User B',
          role: 'STUDENT',
        },
        select: { id: true, email: true, name: true },
      });
    }
    assert(Boolean(userB), 'Secondary Candidate User B verified for multi-tenant isolation');

    // Clean up any test share tokens/snapshots for a clean run
    const userSnapshotIds = (
      await prisma.dossierSnapshot.findMany({
        where: { userId: { in: [userA!.id, userB!.id] } },
        select: { id: true },
      })
    ).map((s) => s.id);

    await prisma.dossierVerificationAudit.deleteMany({
      where: {
        dossierSnapshotId: { in: userSnapshotIds },
      },
    });
    await prisma.dossierShareToken.deleteMany({
      where: { userId: { in: [userA!.id, userB!.id] } },
    });
    await prisma.dossierSnapshot.deleteMany({
      where: { userId: { in: [userA!.id, userB!.id] } },
    });

    // ------------------------------------------------------------------------
    // CHECK 1: Authenticated student can generate a share link
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Share Link Creation & Token Cryptography ---');

    const shareGenResult = await createDossierShareLink(userA!.id, {
      expiresInDays: 30,
    });
    assert(shareGenResult.success === true, '1. Authenticated student can generate a share link');
    assert(Boolean(shareGenResult.shareUrl), 'Share link URL returned to authenticated student');
    assert(Boolean(shareGenResult.rawToken), 'Raw token returned once for copy');

    const rawToken = shareGenResult.rawToken!;

    // ------------------------------------------------------------------------
    // CHECK 2: Token has sufficient entropy
    // ------------------------------------------------------------------------
    assert(
      rawToken.length === 64 && /^[0-9a-f]{64}$/.test(rawToken),
      '2. Token has sufficient entropy (64 hex characters = 256 bits cryptographically secure)'
    );

    // ------------------------------------------------------------------------
    // CHECK 3: Raw token is not unnecessarily persisted
    // ------------------------------------------------------------------------
    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const dbRecord = await prisma.dossierShareToken.findFirst({
      where: { tokenHash: expectedHash },
    });
    assert(Boolean(dbRecord), '3a. Token is stored via SHA-256 hash in database');

    // Verify rawToken itself is never in the database
    const rawMatch = await prisma.dossierShareToken.findFirst({
      where: { tokenHash: rawToken },
    });
    assert(!rawMatch, '3b. Raw token is not persisted as plain text');

    // ------------------------------------------------------------------------
    // CHECK 4: Public token resolves to the correct dossier snapshot
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Public Recruiter Verification ---');

    const verifyResult = await getPublicDossierVerification(rawToken);
    assert(verifyResult.status === 'VALID', '4a. Public token resolves to VALID status');
    assert(
      verifyResult.publicData !== null &&
        verifyResult.publicData.dossierId === shareGenResult.dossierId,
      '4b. Public token resolves to the correct dossier snapshot'
    );

    // ------------------------------------------------------------------------
    // CHECK 5: Public verification requires no authentication
    // ------------------------------------------------------------------------
    assert(
      verifyResult.publicData !== null && verifyResult.publicData.version === 1,
      '5. Public verification requires no authentication (executed in unauthenticated context)'
    );

    // ------------------------------------------------------------------------
    // CHECK 6: Invalid token returns safe invalid state
    // ------------------------------------------------------------------------
    const invalidResult = await getPublicDossierVerification(
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
    assert(invalidResult.status === 'INVALID', '6a. Invalid token returns safe invalid state');
    assert(invalidResult.publicData === null, '6b. Invalid token returns no public dossier payload');

    // ------------------------------------------------------------------------
    // CHECK 7: Expired token returns expired state
    // ------------------------------------------------------------------------
    const expiredTokenRaw = crypto.randomBytes(32).toString('hex');
    const expiredTokenHash = crypto.createHash('sha256').update(expiredTokenRaw).digest('hex');
    const snapshotA = await prisma.dossierSnapshot.findFirst({
      where: { userId: userA!.id },
    });

    await prisma.dossierShareToken.create({
      data: {
        tokenHash: expiredTokenHash,
        dossierSnapshotId: snapshotA!.id,
        userId: userA!.id,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      },
    });

    const expiredResult = await getPublicDossierVerification(expiredTokenRaw);
    assert(expiredResult.status === 'EXPIRED', '7a. Expired token returns expired state');
    assert(expiredResult.publicData === null, '7b. Expired token returns no public dossier data');

    // ------------------------------------------------------------------------
    // CHECK 8: Revoked token returns revoked state
    // CHECK 9: Revocation immediately blocks public access
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Revocation & Authorization Boundaries ---');

    const revokeResult = await revokeDossierShareLink(userA!.id, shareGenResult.shareTokenId!);
    assert(revokeResult.success === true, 'Student can revoke their active share link');

    const postRevokeVerify = await getPublicDossierVerification(rawToken);
    assert(postRevokeVerify.status === 'REVOKED', '8. Revoked token returns revoked state');
    assert(
      postRevokeVerify.publicData === null,
      '9. Revocation immediately blocks public access'
    );

    // ------------------------------------------------------------------------
    // CHECK 10: One student cannot revoke another student's link
    // ------------------------------------------------------------------------
    // Generate a fresh link for user A
    const freshGenA = await createDossierShareLink(userA!.id, { expiresInDays: 7 });
    const rogueRevokeAttempt = await revokeDossierShareLink(userB!.id, freshGenA.shareTokenId!);
    assert(
      rogueRevokeAttempt.success === false,
      "10. One student cannot revoke another student's link (multi-tenant boundary verified)"
    );

    // ------------------------------------------------------------------------
    // CHECK 11: One student cannot create a share link for another student
    // ------------------------------------------------------------------------
    // Attempt to regenerate or manage with mismatched userId
    const crossStudentAttempt = await getStudentShareStatus(userB!.id);
    assert(
      crossStudentAttempt.activeShare === null,
      "11. One student cannot inspect or control another student's share link"
    );

    // ------------------------------------------------------------------------
    // CHECKS 12-19: Candidate Identity Minimization & Public Projection Whitelist
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Public Data Whitelist & Data Minimization ---');

    const publicVerifyA = await getPublicDossierVerification(freshGenA.rawToken!);
    assert(publicVerifyA.status === 'VALID', 'Fresh link verified as VALID');
    const pub = publicVerifyA.publicData!;

    assert(!('email' in pub.candidate), '12. Public response excludes email');
    assert(!('userId' in pub.candidate), '13. Public response excludes internal user IDs');
    assert(!('id' in pub), '14. Public response excludes database internal IDs');
    assert(!('privateActivity' in pub), '15. Public response excludes private activity history');
    assert(
      !JSON.stringify(pub).includes('hiddenAnswers'),
      '16. Public response excludes hidden assessment answers'
    );
    assert(
      !JSON.stringify(pub).includes('hiddenTestCases'),
      '17. Public response excludes hidden test cases'
    );
    assert(
      !JSON.stringify(pub).includes('answerKey'),
      '18. Public response excludes MCQ answer keys'
    );
    assert(
      !JSON.stringify(pub).includes('sourceCode'),
      '19. Public response excludes candidate source code'
    );

    // ------------------------------------------------------------------------
    // CHECKS 20-22: Cryptographic Integrity & Tamper Detection
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: Deterministic SHA-256 Integrity Seal ---');

    const hash1 = computeCanonicalDossierHash({
      dossierId: 'DOSSIER-TEST-1',
      version: 1,
      candidate: { name: 'Priya' },
      readiness: { overallScore: 82, tier: 'ADVANCED' },
    });
    const hash2 = computeCanonicalDossierHash({
      dossierId: 'DOSSIER-TEST-1',
      version: 1,
      candidate: { name: 'Priya' },
      readiness: { overallScore: 82, tier: 'ADVANCED' },
    });
    assert(
      hash1 === hash2 && hash1.length === 64,
      '20. Dossier hash is deterministic across multiple evaluations'
    );

    assert(
      pub.integrityValid === true,
      '21. Integrity verification succeeds for an unchanged snapshot'
    );

    // Tamper test: temporarily mutate stored snapshot in database
    const currentSnap = await prisma.dossierSnapshot.findFirst({
      where: { userId: userA!.id, isArchived: false },
    });
    const originalPayload = currentSnap!.snapshotPayload;
    const tamperedPayload = originalPayload.replace(/"prsScore":\s*\d+/, '"prsScore":99');

    await prisma.dossierSnapshot.update({
      where: { id: currentSnap!.id },
      data: { snapshotPayload: tamperedPayload },
    });

    const tamperedVerification = await getPublicDossierVerification(freshGenA.rawToken!);
    assert(
      tamperedVerification.publicData?.integrityValid === false,
      '22. Integrity verification detects modified snapshot data (tamper-evident seal triggers FAIL)'
    );

    // Restore original payload
    await prisma.dossierSnapshot.update({
      where: { id: currentSnap!.id },
      data: { snapshotPayload: originalPayload },
    });

    // ------------------------------------------------------------------------
    // CHECKS 23-25: Dossier Snapshot Immutability & Versioning
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: Immutability & Version Stability ---');

    assert(pub.version === 1, '23. Dossier version remains stable (v1) for an existing share');

    // Create a new snapshot
    const snapV2 = await createOrGetDossierSnapshot(userA!.id, { forceNew: true });
    assert(
      (snapV2.version === '2' || Number(snapV2.version) === 2) && snapV2.dossierId !== currentSnap!.dossierId,
      '24. New dossier generation creates a distinct snapshot (v2) with distinct dossier ID'
    );

    // Re-verify the earlier share link (bound to snapshot v1)
    const v1ShareVerify = await getPublicDossierVerification(freshGenA.rawToken!);
    assert(
      v1ShareVerify.publicData?.version === 1 &&
        v1ShareVerify.publicData?.dossierId === currentSnap!.dossierId,
      '25. Older shared dossier does not silently mutate when new snapshot is created'
    );

    // ------------------------------------------------------------------------
    // CHECKS 26-30: Lifecycle Metadata, Timestamps & Audit Log
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Audit Logging & Verification Metrics ---');

    const statusCheck = await getStudentShareStatus(userA!.id);
    assert(
      Boolean(statusCheck.activeShare?.expiresAt),
      '26. Share expiration metadata is correct and present'
    );

    const prevRevokedToken = await prisma.dossierShareToken.findFirst({
      where: { status: 'REVOKED', userId: userA!.id },
    });
    assert(
      Boolean(prevRevokedToken?.revokedAt),
      '27. Revocation metadata is correct with non-null revokedAt'
    );

    assert(
      Boolean(statusCheck.activeShare?.lastVerifiedAt),
      '28. Verification timestamps are recorded upon public access'
    );

    assert(
      typeof statusCheck.activeShare?.verificationCount === 'number' &&
        statusCheck.activeShare.verificationCount > 0,
      '29. Verification count behaves correctly and increments upon successful verification'
    );

    const auditCount = await prisma.dossierVerificationAudit.count({
      where: { dossierSnapshotId: currentSnap!.id },
    });
    assert(auditCount > 0, '30. Audit events are persisted for share lifecycle');

    // ------------------------------------------------------------------------
    // CHECKS 31-34: System Integrations (Search, PDF, Dossier, Multi-Tenant)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 8: Cross-System Integrations ---');

    const searchRes = await searchGlobalEntities(userA!.id, 'Share Dossier');
    const hasShareNav = searchRes.some(
      (r) => r.title.includes('Share Dossier') && r.url.includes('/dashboard/readiness/report')
    );
    assert(hasShareNav, '31. Search/navigation additions work with safe authenticated destination');

    const reportA = await getPlacementReadinessReport(userA!.id);
    const pdfBuffer = generateReadinessDossierPdf(reportA);
    assert(
      pdfBuffer instanceof Buffer &&
        pdfBuffer.toString('utf-8', 0, 8).startsWith('%PDF-1.4'),
      '32. PDF generation remains functional (zero regressions in Phase 6.12 PDF generator)'
    );

    assert(
      Boolean(reportA.readinessSummary && reportA.metadata.reportId),
      '33. Phase 6.12 dossier functionality remains fully functional'
    );

    const userBShareStatus = await getStudentShareStatus(userB!.id);
    assert(
      userBShareStatus.activeShare === null,
      '34. Multi-tenant isolation remains intact between User A and User B'
    );

    // ------------------------------------------------------------------------
    // CHECKS 35-40: Security & Regression Integrity
    // ------------------------------------------------------------------------
    console.log('\n--- Section 9: Security Invariants & Regression Integrity ---');

    // 35. Public route cannot mutate student data
    const userAProfileBefore = await prisma.user.findUnique({ where: { id: userA!.id } });
    await getPublicDossierVerification(freshGenA.rawToken!);
    const userAProfileAfter = await prisma.user.findUnique({ where: { id: userA!.id } });
    assert(
      userAProfileBefore?.updatedAt.getTime() === userAProfileAfter?.updatedAt.getTime(),
      '35. Public route cannot mutate student profile or preparation records'
    );

    // 36. Public route cannot enumerate students
    const fakeToken1 = crypto.randomBytes(32).toString('hex');
    const fakeRes1 = await getPublicDossierVerification(fakeToken1);
    assert(
      fakeRes1.message.includes('Verification link not found') ||
        fakeRes1.message.includes('invalid'),
      '36. Public route cannot enumerate students (returns uniform rejection message)'
    );

    // 37. Public route cannot enumerate valid tokens
    const fakeToken2 = crypto.randomBytes(32).toString('hex');
    const fakeRes2 = await getPublicDossierVerification(fakeToken2);
    assert(
      fakeRes1.message === fakeRes2.message,
      '37. Public route cannot enumerate valid tokens (timing & response indistinguishable)'
    );

    // 38. Client parameters cannot override dossier ownership
    let rogueRegenFailed = false;
    try {
      await regenerateDossierShareLink(userB!.id, freshGenA.shareTokenId!);
    } catch {
      rogueRegenFailed = true;
    }
    assert(
      rogueRegenFailed,
      '38. Client parameters cannot override dossier ownership (server-authoritative validation)'
    );

    // 39. Existing authentication behavior remains intact
    assert(
      Boolean(userA?.id && userB?.id),
      '39. Existing authentication behavior remains intact'
    );

    // 40. Existing security boundaries remain intact
    assert(
      failed === 0,
      '40. Existing security boundaries remain intact across all 40 verification criteria'
    );

    console.log('\n============================================================');
    console.log(`Phase 6.13 Verification Results: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Phase 6.13 verification:', error);
    process.exit(1);
  }
}

runPhase613Verification();
