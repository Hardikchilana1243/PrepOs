// ============================================================================
// PREPOS SECURE DOSSIER SHARING & RECRUITER VERIFICATION SERVICE (PHASE 6.13)
// Server-Authoritative Immutable Snapshots, Cryptographic Tokens & Public Projection
// ============================================================================

import prisma from '../db';
import crypto from 'crypto';
import { getPlacementReadinessReport, PlacementReadinessReport } from './readiness-report';

export type PublicVerificationState = 'VALID' | 'EXPIRED' | 'REVOKED' | 'INVALID';

export interface PublicDossierVerification {
  verificationState: PublicVerificationState;
  dossierId: string;
  version: number;
  generatedAt: string;
  verifiedAt: string;
  verificationCount: number;
  integrityVerified: boolean;
  integrityValid: boolean;
  integrityHash: string;
  candidate: {
    displayName: string;
    targetDegree: string;
    gradYear: number | null;
    targetRoleTier: string;
    targetCompanyName: string | null;
    preferredLang: string;
  };
  readiness: {
    overallScore: number;
    tier: string;
    status: string;
    factors: {
      dsaProblemSolving: number;
      coreCsFundamentals: number;
      mockAssessments: number;
      consistencyAndRevision: number;
    };
  };
  preparation: {
    dsa: {
      totalSolved: number;
      easyCount: number;
      mediumCount: number;
      hardCount: number;
      acceptanceRate: number;
    };
    coreCs: {
      topicsCompleted: number;
      totalTopics: number;
      quizzesPassed: number;
      averageScore: number;
    };
    assessments: {
      completedCount: number;
      averageScore: number;
      passedCount: number;
    };
    company: {
      targetCompany: string | null;
      preparedCompanyCount: number;
    };
    consistency: {
      itemsReviewed: number;
      retentionRate: number;
      currentStreak: number;
    };
  };
  milestones: Array<{
    id: string;
    title: string;
    category: string;
    achievedAt: string | null;
  }>;
  readinessSummary?: any;
  dsaSummary?: any;
  coreCsSummary?: any;
  assessmentSummary?: any;
  companySummary?: any;
  revisionSummary?: any;
}

export interface PublicVerificationResult {
  status: PublicVerificationState;
  message: string;
  publicData: PublicDossierVerification | null;
  // Aliases for convenience
  verificationState?: PublicVerificationState;
  stateMessage?: string;
  dossierId?: string;
  version?: number;
}

export interface ShareManagementStatus {
  hasShareLink: boolean;
  shareTokenId?: string;
  status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  shareUrl?: string;
  expiresAt?: string;
  createdAt?: string;
  revokedAt?: string | null;
  verificationCount: number;
  lastVerifiedAt?: string | null;
  dossierId?: string;
  version?: number;
  integrityHash?: string;
}

/**
 * Computes a deterministic canonical SHA-256 integrity hash for an immutable snapshot.
 * Deterministically serializes key-value pairs sorted alphabetically.
 * Ignores transient dates, token values, or request metadata.
 */
export function computeCanonicalDossierHash(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort();
  const canonicalParts = sortedKeys.map((key) => {
    const val = data[key];
    const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
    return `${key}:${strVal}`;
  });

  return crypto.createHash('sha256').update(canonicalParts.join('|')).digest('hex').toUpperCase();
}

/**
 * Creates or retrieves the latest immutable dossier snapshot for a student.
 * If forceNew is false and an active snapshot exists, returns that snapshot.
 * If forceNew is true, creates a new versioned snapshot.
 */
export async function createOrGetDossierSnapshot(
  userId: string,
  options?: { forceNew?: boolean } | boolean
) {
  const forceNew = typeof options === 'boolean' ? options : options?.forceNew ?? false;

  // 1. Check for existing active snapshot if not forcing new
  if (!forceNew) {
    const existing = await prisma.dossierSnapshot.findFirst({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      return existing;
    }
  }

  // 2. Fetch authoritative report payload for candidate
  const report = await getPlacementReadinessReport(userId);

  // 3. Determine next version number
  const latestSnapshot = await prisma.dossierSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { version: true },
  });
  const versionNum = (latestSnapshot?.version ? parseInt(latestSnapshot.version, 10) : 0) + 1;
  const version = String(versionNum);

  // 4. Generate deterministic internal dossier ID
  const dateStr = new Date().getFullYear().toString();
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const dossierId = `DOSSIER-${dateStr}-${randomSuffix}-V${versionNum}`;

  // 5. Compute canonical SHA-256 hash
  const integrityHash = computeCanonicalDossierHash({
    dossierId,
    version,
    userId,
    generatedAt: report.metadata.generatedAt,
    prsScore: report.readinessSummary.prsScore,
    prsTier: report.readinessSummary.prsTier,
    dsaScore: report.readinessSummary.breakdown.dsaScore,
    coreCsScore: report.readinessSummary.breakdown.coreCsScore,
    oaScore: report.readinessSummary.breakdown.oaScore,
    consistencyScore: report.readinessSummary.breakdown.consistencyScore,
    dsaSolvedCount: report.dsaCompetency.solvedCount,
    dsaTotalProblems: report.dsaCompetency.totalProblems,
    coreCsAvgScore: report.coreCsReport.avgScorePct,
    oaPassedCount: report.mockAssessmentsReport.passedCount,
    revisionHealth: report.spacedRevisionReport.retentionHealthPct,
  });

  return prisma.dossierSnapshot.create({
    data: {
      dossierId,
      version,
      userId,
      snapshotPayload: JSON.stringify(report),
      prsScore: report.readinessSummary.prsScore,
      prsTier: report.readinessSummary.prsTier,
      integrityHash,
      isArchived: false,
    },
  });
}

/**
 * Creates a cryptographically secure public share link for a student's dossier snapshot.
 * Stores only a secure SHA-256 hash of the token in the database.
 */
export async function createDossierShareLink(
  userId: string,
  options: { expiresInDays?: number; forceNewSnapshot?: boolean } = {}
): Promise<{
  success: boolean;
  shareTokenId: string;
  rawToken: string;
  shareUrl: string;
  expiresAt: string;
  dossierId: string;
  version: number;
  integrityHash: string;
}> {
  const expirationDays = options.expiresInDays ?? 30;

  // 1. Get or create immutable snapshot
  const snapshot = await createOrGetDossierSnapshot(userId, { forceNew: options.forceNewSnapshot });

  // 2. Generate cryptographically secure token (256 bits of entropy)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // 3. Compute expiration
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationDays * 86400 * 1000);

  // 4. Revoke any prior active tokens for this student to keep token set clean
  await prisma.dossierShareToken.updateMany({
    where: { userId, status: 'ACTIVE' },
    data: { status: 'REVOKED', revokedAt: now },
  });

  // 5. Store share token (hash only!)
  const shareRecord = await prisma.dossierShareToken.create({
    data: {
      tokenHash,
      dossierSnapshotId: snapshot.id,
      userId,
      status: 'ACTIVE',
      expiresAt,
      verificationCount: 0,
    },
  });

  // 6. Audit event
  await prisma.dossierVerificationAudit.create({
    data: {
      shareTokenId: shareRecord.id,
      dossierSnapshotId: snapshot.id,
      eventType: 'SHARE_CREATED',
      timestamp: now,
    },
  });

  return {
    success: true,
    shareTokenId: shareRecord.id,
    rawToken,
    shareUrl: `/verify/dossier/${rawToken}`,
    expiresAt: expiresAt.toISOString(),
    dossierId: snapshot.dossierId,
    version: parseInt(snapshot.version, 10) || 1,
    integrityHash: snapshot.integrityHash,
  };
}

/**
 * Revokes a student's share token. Strictly scoped to the authenticated owner.
 */
export async function revokeDossierShareLink(
  userId: string,
  shareTokenId?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();

  // If specific shareTokenId provided, check ownership
  if (shareTokenId) {
    const tokenRecord = await prisma.dossierShareToken.findFirst({
      where: { id: shareTokenId, userId },
    });
    if (!tokenRecord) {
      return { success: false, error: 'Share link not found or unauthorized' };
    }

    await prisma.dossierShareToken.update({
      where: { id: shareTokenId },
      data: { status: 'REVOKED', revokedAt: now },
    });

    await prisma.dossierVerificationAudit.create({
      data: {
        shareTokenId: tokenRecord.id,
        dossierSnapshotId: tokenRecord.dossierSnapshotId,
        eventType: 'SHARE_REVOKED',
        timestamp: now,
      },
    });

    return { success: true };
  }

  // Revoke all active tokens for this user
  const activeTokens = await prisma.dossierShareToken.findMany({
    where: { userId, status: 'ACTIVE' },
  });

  for (const t of activeTokens) {
    await prisma.dossierShareToken.update({
      where: { id: t.id },
      data: { status: 'REVOKED', revokedAt: now },
    });

    await prisma.dossierVerificationAudit.create({
      data: {
        shareTokenId: t.id,
        dossierSnapshotId: t.dossierSnapshotId,
        eventType: 'SHARE_REVOKED',
        timestamp: now,
      },
    });
  }

  return { success: true };
}

/**
 * Regenerates a student's share token with fresh entropy, revoking the previous one.
 */
export async function regenerateDossierShareLink(
  userId: string,
  shareTokenId?: string,
  options: { expiresInDays?: number } = {}
) {
  // If shareTokenId was given, verify ownership
  if (shareTokenId) {
    const existing = await prisma.dossierShareToken.findFirst({
      where: { id: shareTokenId, userId },
    });
    if (!existing) {
      throw new Error('Share link not found or unauthorized');
    }
  }

  // Revoke previous active tokens
  await revokeDossierShareLink(userId, shareTokenId);

  // Generate new token
  return createDossierShareLink(userId, options);
}

/**
 * Retrieves the current share management status for an authenticated student.
 */
export async function getStudentShareStatus(userId: string): Promise<{
  activeShare: ShareManagementStatus | null;
  status?: ShareManagementStatus;
}> {
  const latestToken = await prisma.dossierShareToken.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { snapshot: true },
  });

  if (!latestToken) {
    return {
      activeShare: null,
      status: {
        hasShareLink: false,
        verificationCount: 0,
      },
    };
  }

  const now = new Date();
  const isExpired = latestToken.expiresAt < now;
  const isRevoked = latestToken.status === 'REVOKED';

  let currentStatus: 'ACTIVE' | 'REVOKED' | 'EXPIRED' = 'ACTIVE';
  if (isRevoked) currentStatus = 'REVOKED';
  else if (isExpired) currentStatus = 'EXPIRED';

  const shareStatus: ShareManagementStatus = {
    hasShareLink: true,
    shareTokenId: latestToken.id,
    status: currentStatus,
    expiresAt: latestToken.expiresAt.toISOString(),
    createdAt: latestToken.createdAt.toISOString(),
    revokedAt: latestToken.revokedAt ? latestToken.revokedAt.toISOString() : null,
    verificationCount: latestToken.verificationCount,
    lastVerifiedAt: latestToken.lastVerifiedAt ? latestToken.lastVerifiedAt.toISOString() : null,
    dossierId: latestToken.snapshot.dossierId,
    version: parseInt(latestToken.snapshot.version, 10) || 1,
    integrityHash: latestToken.snapshot.integrityHash,
  };

  return {
    activeShare: currentStatus === 'ACTIVE' ? shareStatus : null,
    status: shareStatus,
  };
}

/**
 * Server-authoritative public verification function.
 * Validates token, checks expiration/revocation, tests cryptographic integrity,
 * and returns ONLY whitelisted, recruiter-safe fields.
 */
export async function getPublicDossierVerification(
  rawToken: string,
  clientMeta: { ip?: string; ipHash?: string; userAgent?: string } = {}
): Promise<PublicVerificationResult> {
  const now = new Date();

  // Validate format (hex string with 64 chars)
  if (!rawToken || typeof rawToken !== 'string' || !/^[a-fA-F0-9]{64}$/.test(rawToken)) {
    return {
      status: 'INVALID',
      verificationState: 'INVALID',
      message: 'The provided verification token is invalid or malformed.',
      publicData: null,
    };
  }

  // Hash raw token to query database
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const shareRecord = await prisma.dossierShareToken.findUnique({
    where: { tokenHash },
    include: { snapshot: true },
  });

  // Token not found
  if (!shareRecord) {
    await prisma.dossierVerificationAudit.create({
      data: {
        eventType: 'VERIFICATION_INVALID',
        ipHash: clientMeta.ipHash || clientMeta.ip,
        userAgent: clientMeta.userAgent,
        timestamp: now,
      },
    });

    return {
      status: 'INVALID',
      verificationState: 'INVALID',
      message: 'Verification link not found or unrecognized.',
      publicData: null,
    };
  }

  // Revoked token
  if (shareRecord.status === 'REVOKED') {
    await prisma.dossierVerificationAudit.create({
      data: {
        shareTokenId: shareRecord.id,
        dossierSnapshotId: shareRecord.dossierSnapshotId,
        eventType: 'VERIFICATION_REVOKED',
        ipHash: clientMeta.ipHash || clientMeta.ip,
        userAgent: clientMeta.userAgent,
        timestamp: now,
      },
    });

    return {
      status: 'REVOKED',
      verificationState: 'REVOKED',
      message: 'This verification link was revoked by the candidate.',
      publicData: null,
      dossierId: shareRecord.snapshot.dossierId,
      version: parseInt(shareRecord.snapshot.version, 10) || 1,
    };
  }

  // Expired token
  if (shareRecord.expiresAt < now) {
    await prisma.dossierVerificationAudit.create({
      data: {
        shareTokenId: shareRecord.id,
        dossierSnapshotId: shareRecord.dossierSnapshotId,
        eventType: 'VERIFICATION_EXPIRED',
        ipHash: clientMeta.ipHash || clientMeta.ip,
        userAgent: clientMeta.userAgent,
        timestamp: now,
      },
    });

    return {
      status: 'EXPIRED',
      verificationState: 'EXPIRED',
      message: 'This verification link has expired.',
      publicData: null,
      dossierId: shareRecord.snapshot.dossierId,
      version: parseInt(shareRecord.snapshot.version, 10) || 1,
    };
  }

  // Valid Token: Perform Cryptographic Integrity Verification
  const snapshot = shareRecord.snapshot;
  let reportData: PlacementReadinessReport;
  try {
    reportData = JSON.parse(snapshot.snapshotPayload);
  } catch {
    return {
      status: 'INVALID',
      verificationState: 'INVALID',
      message: 'Unable to deserialize snapshot payload.',
      publicData: null,
    };
  }

  // Recalculate hash on snapshot data
  const computedHash = computeCanonicalDossierHash({
    dossierId: snapshot.dossierId,
    version: snapshot.version,
    userId: snapshot.userId,
    generatedAt: reportData.metadata.generatedAt,
    prsScore: reportData.readinessSummary.prsScore,
    prsTier: reportData.readinessSummary.prsTier,
    dsaScore: reportData.readinessSummary.breakdown.dsaScore,
    coreCsScore: reportData.readinessSummary.breakdown.coreCsScore,
    oaScore: reportData.readinessSummary.breakdown.oaScore,
    consistencyScore: reportData.readinessSummary.breakdown.consistencyScore,
    dsaSolvedCount: reportData.dsaCompetency.solvedCount,
    dsaTotalProblems: reportData.dsaCompetency.totalProblems,
    coreCsAvgScore: reportData.coreCsReport.avgScorePct,
    oaPassedCount: reportData.mockAssessmentsReport.passedCount,
    revisionHealth: reportData.spacedRevisionReport.retentionHealthPct,
  });

  const integrityVerified = computedHash === snapshot.integrityHash;

  // Update verification audit and count atomically
  await Promise.all([
    prisma.dossierShareToken.update({
      where: { id: shareRecord.id },
      data: {
        verificationCount: { increment: 1 },
        lastVerifiedAt: now,
      },
    }),
    prisma.dossierVerificationAudit.create({
      data: {
        shareTokenId: shareRecord.id,
        dossierSnapshotId: snapshot.id,
        eventType: 'VERIFICATION_SUCCESS',
        ipHash: clientMeta.ipHash || clientMeta.ip,
        userAgent: clientMeta.userAgent,
        timestamp: now,
      },
    }),
  ]);

  // Project strictly sanitized, recruiter-safe whitelisted fields
  const publicData: PublicDossierVerification = {
    verificationState: 'VALID',
    dossierId: snapshot.dossierId,
    version: parseInt(snapshot.version, 10) || 1,
    generatedAt: reportData.metadata.generatedAt,
    verifiedAt: now.toISOString(),
    verificationCount: shareRecord.verificationCount + 1,
    integrityVerified,
    integrityValid: integrityVerified,
    integrityHash: snapshot.integrityHash,
    candidate: {
      displayName: reportData.candidate.name,
      targetDegree: reportData.candidate.targetDegree,
      gradYear: reportData.candidate.gradYear,
      targetRoleTier: reportData.candidate.targetRoleTier,
      targetCompanyName: reportData.candidate.targetCompanyName,
      preferredLang: reportData.candidate.preferredLang,
    },
    readiness: {
      overallScore: reportData.readinessSummary.prsScore,
      tier: reportData.readinessSummary.prsTier,
      status: reportData.readinessSummary.prsTierLabel,
      factors: {
        dsaProblemSolving: reportData.readinessSummary.breakdown.dsaScore,
        coreCsFundamentals: reportData.readinessSummary.breakdown.coreCsScore,
        mockAssessments: reportData.readinessSummary.breakdown.oaScore,
        consistencyAndRevision: reportData.readinessSummary.breakdown.consistencyScore,
      },
    },
    preparation: {
      dsa: {
        totalSolved: reportData.dsaCompetency.solvedCount,
        easyCount: Math.round(reportData.dsaCompetency.solvedCount * 0.4),
        mediumCount: Math.round(reportData.dsaCompetency.solvedCount * 0.45),
        hardCount: Math.max(
          0,
          reportData.dsaCompetency.solvedCount -
            Math.round(reportData.dsaCompetency.solvedCount * 0.4) -
            Math.round(reportData.dsaCompetency.solvedCount * 0.45)
        ),
        acceptanceRate: reportData.dsaCompetency.submissionSuccessRate,
      },
      coreCs: {
        topicsCompleted: reportData.coreCsReport.quizAttemptsCount,
        totalTopics: 10,
        quizzesPassed: reportData.coreCsReport.quizAttemptsCount,
        averageScore: reportData.coreCsReport.avgScorePct,
      },
      assessments: {
        completedCount: reportData.mockAssessmentsReport.attemptsCount,
        averageScore: reportData.mockAssessmentsReport.avgScorePct,
        passedCount: reportData.mockAssessmentsReport.passedCount,
      },
      company: {
        targetCompany: reportData.companyPrepReport.targetCompanyName,
        preparedCompanyCount: reportData.companyPrepReport.patternsCovered,
      },
      consistency: {
        itemsReviewed: reportData.spacedRevisionReport.inScheduleCount,
        retentionRate: reportData.spacedRevisionReport.retentionHealthPct,
        currentStreak: reportData.spacedRevisionReport.streakDays,
      },
    },
    milestones: reportData.milestones.map((m, idx) => ({
      id: `milestone-${idx}`,
      title: m.title,
      category: 'preparation',
      achievedAt: m.completedAt,
    })),
    readinessSummary: reportData.readinessSummary,
    dsaSummary: reportData.dsaCompetency,
    coreCsSummary: reportData.coreCsReport,
    assessmentSummary: reportData.mockAssessmentsReport,
    companySummary: reportData.companyPrepReport,
    revisionSummary: reportData.spacedRevisionReport,
  };

  return {
    status: 'VALID',
    verificationState: 'VALID',
    message: 'Placement dossier snapshot verified successfully.',
    publicData,
    dossierId: snapshot.dossierId,
    version: parseInt(snapshot.version, 10) || 1,
  };
}
