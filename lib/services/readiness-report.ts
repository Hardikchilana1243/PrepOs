// ============================================================================
// PREPOS PLACEMENT READINESS REPORT & DOSSIER SERVICE
// Authoritative, Deterministic Server Model for Verification & Export
// ============================================================================

import prisma from '../db';
import crypto from 'crypto';
import {
  getPlacementReadinessCockpitData,
  PlacementReadinessCockpit,
  ReadinessMilestone,
  ReadinessInsight,
  PriorityAction,
  ReadinessTrendData,
} from './readiness-cockpit';

export interface PlacementReadinessReport {
  metadata: {
    reportId: string;
    version: string;
    generatedAt: string;
    generatedTimestamp: number;
    verificationHash: string;
    documentType: string;
    authority: string;
  };
  candidate: {
    userId: string;
    name: string;
    email: string;
    targetDegree: string;
    gradYear: number | null;
    targetRoleTier: string;
    preferredLang: string;
    streakDays: number;
    targetCompanyName: string | null;
    targetCompanySlug: string | null;
  };
  readinessSummary: {
    prsScore: number;
    prsTier: 'TIER_1_READY' | 'COMPETITIVE' | 'FOUNDATION_BUILDING' | 'EARLY_STAGE';
    prsTierLabel: string;
    isBaselineOnly: boolean;
    completionPct: number;
    breakdown: {
      dsaScore: number;
      coreCsScore: number;
      oaScore: number;
      consistencyScore: number;
    };
  };
  dsaCompetency: {
    status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL_GAP';
    score: number;
    solvedCount: number;
    totalProblems: number;
    solvedPct: number;
    solvedByDifficulty: { easy: number; medium: number; hard: number };
    totalByDifficulty: { easy: number; medium: number; hard: number };
    submissionSuccessRate: number;
    wrongAnswerCount: number;
    tleCount: number;
    topicCoverageCount: number;
    totalTopicsCount: number;
    companyTaggedSolved: number;
    companyTaggedTotal: number;
    highlights: string[];
    recentActivityDate: string | null;
  };
  coreCsReport: {
    status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL_GAP';
    score: number;
    quizAttemptsCount: number;
    avgScorePct: number;
    bestScorePct: number;
    subjectsAttempted: number;
    totalSubjects: number;
    missedConceptsCount: number;
    benchmarkThresholdPct: number;
    benchmarkMet: boolean;
    highlights: string[];
    recentActivityDate: string | null;
  };
  mockAssessmentsReport: {
    status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL_GAP';
    score: number;
    attemptsCount: number;
    passedCount: number;
    avgScorePct: number;
    bestScorePct: number;
    hasUnfinishedAttempt: boolean;
    highlights: string[];
    recentActivityDate: string | null;
  };
  companyPrepReport: {
    status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL_GAP';
    score: number;
    targetCompanyName: string | null;
    targetCompanySlug: string | null;
    targetRoleTier: string;
    patternsCovered: number;
    totalPatterns: number;
    companyProblemsSolved: number;
    totalCompanyProblems: number;
    highlights: string[];
  };
  spacedRevisionReport: {
    status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL_GAP';
    score: number;
    dueTodayCount: number;
    overdueCount: number;
    inScheduleCount: number;
    streakDays: number;
    retentionHealthPct: number;
    highlights: string[];
  };
  milestones: ReadinessMilestone[];
  insights: ReadinessInsight[];
  priorityActions: PriorityAction[];
  trends: ReadinessTrendData;
}

/**
 * Generates an authoritative, serializable Placement Readiness Report for an authenticated student.
 * Never exposes hidden test cases, MCQ answer keys, solution code, or other students' data.
 */
export async function getPlacementReadinessReport(
  userId: string
): Promise<PlacementReadinessReport> {
  const [cockpitData, user] = await Promise.all([
    getPlacementReadinessCockpitData(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            gradYear: true,
            targetDegree: true,
            targetRoleTier: true,
            preferredLang: true,
            streakDays: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    throw new Error(`Candidate with id ${userId} not found`);
  }

  const now = new Date();
  const generatedAt = now.toISOString().split('T')[0];
  const generatedTimestamp = now.getTime();

  // Compute a deterministic verification hash from student id, generated date, and authoritative score
  const hashPayload = `${user.id}:${cockpitData.overallPRS.score}:${generatedAt}:prepos-prs-v1`;
  const verificationHash = crypto.createHash('sha256').update(hashPayload).digest('hex').slice(0, 16).toUpperCase();
  const reportId = `DOSSIER-${now.getFullYear()}-${verificationHash.slice(0, 8)}`;

  const profile = user.profile;

  const totalDsa = cockpitData.dimensions.dsa.totalActivity;
  const solvedDsa = cockpitData.dimensions.dsa.completedActivity;
  const dsaSolvedPct = totalDsa > 0 ? Math.round((solvedDsa / totalDsa) * 100) : 0;

  const coreCsBenchmarkMet = cockpitData.dimensions.coreCs.avgScorePct >= 70;

  return {
    metadata: {
      reportId,
      version: '1.0.0-PROD',
      generatedAt,
      generatedTimestamp,
      verificationHash,
      documentType: 'Official Placement Readiness Dossier',
      authority: 'PrepOS Verification & Placement Intelligence Engine',
    },
    candidate: {
      userId: user.id,
      name: user.name || 'Candidate',
      email: user.email,
      targetDegree: profile?.targetDegree || 'B.Tech / B.E.',
      gradYear: profile?.gradYear || null,
      targetRoleTier: profile?.targetRoleTier || cockpitData.dimensions.company.targetRoleTier || 'TECH_TIER_2',
      preferredLang: profile?.preferredLang || 'CPP',
      streakDays: profile?.streakDays ?? cockpitData.overallPRS.streakDays,
      targetCompanyName: cockpitData.dimensions.company.targetCompanyName || null,
      targetCompanySlug: cockpitData.dimensions.company.targetCompanySlug || null,
    },
    readinessSummary: {
      prsScore: cockpitData.overallPRS.score,
      prsTier: cockpitData.overallPRS.tier,
      prsTierLabel: cockpitData.overallPRS.tierLabel,
      isBaselineOnly: cockpitData.overallPRS.isBaselineOnly,
      completionPct: cockpitData.overallPRS.completionPct,
      breakdown: {
        dsaScore: cockpitData.overallPRS.dsaScore,
        coreCsScore: cockpitData.overallPRS.coreCsScore,
        oaScore: cockpitData.overallPRS.oaScore,
        consistencyScore: cockpitData.overallPRS.consistencyScore,
      },
    },
    dsaCompetency: {
      status: cockpitData.dimensions.dsa.status,
      score: cockpitData.dimensions.dsa.score,
      solvedCount: solvedDsa,
      totalProblems: totalDsa,
      solvedPct: dsaSolvedPct,
      solvedByDifficulty: cockpitData.dimensions.dsa.solvedByDifficulty,
      totalByDifficulty: cockpitData.dimensions.dsa.totalByDifficulty,
      submissionSuccessRate: cockpitData.dimensions.dsa.submissionSuccessRate,
      wrongAnswerCount: cockpitData.dimensions.dsa.wrongAnswerCount,
      tleCount: cockpitData.dimensions.dsa.tleCount,
      topicCoverageCount: cockpitData.dimensions.dsa.topicCoverageCount,
      totalTopicsCount: cockpitData.dimensions.dsa.totalTopicsCount,
      companyTaggedSolved: cockpitData.dimensions.dsa.companyTaggedSolved,
      companyTaggedTotal: cockpitData.dimensions.dsa.companyTaggedTotal,
      highlights: cockpitData.dimensions.dsa.highlights,
      recentActivityDate: cockpitData.dimensions.dsa.lastActivityDate,
    },
    coreCsReport: {
      status: cockpitData.dimensions.coreCs.status,
      score: cockpitData.dimensions.coreCs.score,
      quizAttemptsCount: cockpitData.dimensions.coreCs.quizAttemptsCount,
      avgScorePct: cockpitData.dimensions.coreCs.avgScorePct,
      bestScorePct: cockpitData.dimensions.coreCs.bestScorePct,
      subjectsAttempted: cockpitData.dimensions.coreCs.subjectsAttempted,
      totalSubjects: cockpitData.dimensions.coreCs.totalSubjects,
      missedConceptsCount: cockpitData.dimensions.coreCs.missedConceptsCount,
      benchmarkThresholdPct: 70,
      benchmarkMet: coreCsBenchmarkMet,
      highlights: cockpitData.dimensions.coreCs.highlights,
      recentActivityDate: cockpitData.dimensions.coreCs.lastActivityDate,
    },
    mockAssessmentsReport: {
      status: cockpitData.dimensions.assessment.status,
      score: cockpitData.dimensions.assessment.score,
      attemptsCount: cockpitData.dimensions.assessment.attemptsCount,
      passedCount: cockpitData.dimensions.assessment.passedCount,
      avgScorePct: cockpitData.dimensions.assessment.avgScorePct,
      bestScorePct: cockpitData.dimensions.assessment.bestScorePct,
      hasUnfinishedAttempt: cockpitData.dimensions.assessment.hasUnfinishedAttempt,
      highlights: cockpitData.dimensions.assessment.highlights,
      recentActivityDate: cockpitData.dimensions.assessment.lastActivityDate,
    },
    companyPrepReport: {
      status: cockpitData.dimensions.company.status,
      score: cockpitData.dimensions.company.score,
      targetCompanyName: cockpitData.dimensions.company.targetCompanyName || null,
      targetCompanySlug: cockpitData.dimensions.company.targetCompanySlug || null,
      targetRoleTier: cockpitData.dimensions.company.targetRoleTier,
      patternsCovered: cockpitData.dimensions.company.patternsCovered,
      totalPatterns: cockpitData.dimensions.company.totalPatterns,
      companyProblemsSolved: cockpitData.dimensions.company.companyProblemsSolved,
      totalCompanyProblems: cockpitData.dimensions.company.totalCompanyProblems,
      highlights: cockpitData.dimensions.company.highlights,
    },
    spacedRevisionReport: {
      status: cockpitData.dimensions.revision.status,
      score: cockpitData.dimensions.revision.score,
      dueTodayCount: cockpitData.dimensions.revision.dueTodayCount,
      overdueCount: cockpitData.dimensions.revision.overdueCount,
      inScheduleCount: cockpitData.dimensions.revision.inScheduleCount,
      streakDays: cockpitData.dimensions.revision.streakDays,
      retentionHealthPct: cockpitData.dimensions.revision.retentionHealthPct,
      highlights: cockpitData.dimensions.revision.highlights,
    },
    milestones: cockpitData.milestones,
    insights: cockpitData.insights,
    priorityActions: cockpitData.priorityActions,
    trends: cockpitData.trends,
  };
}
