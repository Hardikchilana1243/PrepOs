// ============================================================================
// PREPOS SERVER-SIDE PDF VERIFICATION ENGINE
// Zero-Dependency, Authoritative PDF 1.4 Generator for Placement Dossiers
// ============================================================================

import { PlacementReadinessReport } from './readiness-report';

/**
 * Escapes characters for PDF literal text strings: \( \) and \\
 */
function escapePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Clean to printable ASCII for WinAnsi
}

interface PageStream {
  content: string[];
}

export function generateReadinessDossierPdf(report: PlacementReadinessReport): Buffer {
  const pages: PageStream[] = [];
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // --------------------------------------------------------------------------
  // PAGE 1: COVER, EXECUTIVE SUMMARY, PRS BREAKDOWN & 5-DIMENSION MATRIX
  // --------------------------------------------------------------------------
  const p1: PageStream = { content: [] };

  // Background Header Banner
  p1.content.push('0.06 0.09 0.16 rg'); // Slate-900
  p1.content.push(`0 ${pageHeight - 90} ${pageWidth} 90 re f`);

  // PrepOS Logo & Title
  p1.content.push('BT /F2 18 Tf 1 1 1 rg 40 785 Td (PrepOS | Placement Readiness Dossier) Tj ET');
  p1.content.push('BT /F1 9 Tf 0.6 0.7 0.85 rg 40 765 Td (Official Candidate Technical Preparation & Placement Verification Report) Tj ET');

  // Document Metadata Bar (Right-aligned in header)
  p1.content.push(`BT /F2 8 Tf 1 1 1 rg 400 785 Td (REPORT ID: ${escapePdfText(report.metadata.reportId)}) Tj ET`);
  p1.content.push(`BT /F1 8 Tf 0.7 0.8 0.9 rg 400 772 Td (DATE: ${escapePdfText(report.metadata.generatedAt)}  |  REV: ${escapePdfText(report.metadata.version)}) Tj ET`);
  p1.content.push(`BT /F3 8 Tf 0.85 0.9 1 rg 400 759 Td (HASH: ${escapePdfText(report.metadata.verificationHash)}) Tj ET`);

  // Candidate Identity Box
  p1.content.push('0.96 0.97 0.99 rg 0.85 0.88 0.92 RG 1 w');
  p1.content.push(`40 660 ${pageWidth - 80} 70 re B`);

  p1.content.push('0.06 0.09 0.16 rg');
  p1.content.push(`BT /F2 13 Tf 55 705 Td (${escapePdfText(report.candidate.name)}) Tj ET`);
  p1.content.push(`BT /F1 9 Tf 0.35 0.4 0.5 rg 55 690 Td (${escapePdfText(report.candidate.email)}  |  Degree: ${escapePdfText(report.candidate.targetDegree)}  |  Class of ${report.candidate.gradYear || 'N/A'}) Tj ET`);
  p1.content.push(`BT /F1 9 Tf 0.35 0.4 0.5 rg 55 675 Td (Target Role: ${escapePdfText(report.candidate.targetRoleTier)}  |  Target Firm: ${escapePdfText(report.candidate.targetCompanyName || 'General Placement')}  |  Streak: ${report.candidate.streakDays} Days) Tj ET`);

  // Authoritative PRS Score Hero Box
  p1.content.push('0.06 0.09 0.16 rg');
  p1.content.push(`40 535 150 105 re f`);

  p1.content.push('1 1 1 rg');
  p1.content.push('BT /F2 9 Tf 55 615 Td (OVERALL PRS SCORE) Tj ET');
  p1.content.push(`BT /F2 36 Tf 55 565 Td (${report.readinessSummary.prsScore}) Tj ET`);
  p1.content.push('BT /F1 9 Tf 0.7 0.75 0.85 rg 55 548 Td (/ 100 Maximum Points) Tj ET');

  // PRS Status & 4-Factor Breakdown Box
  p1.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 1 w');
  p1.content.push(`200 535 ${pageWidth - 240} 105 re B`);

  p1.content.push('0.06 0.09 0.16 rg');
  p1.content.push(`BT /F2 12 Tf 215 615 Td (Status: ${escapePdfText(report.readinessSummary.prsTierLabel)}) Tj ET`);
  p1.content.push(`BT /F1 8.5 Tf 0.35 0.4 0.5 rg 215 598 Td (Overall Preparation Completion: ${report.readinessSummary.completionPct}% of verified curriculum) Tj ET`);

  // 4-Factor Formula Table
  p1.content.push('0.15 0.35 0.75 rg');
  p1.content.push(`BT /F2 8.5 Tf 215 575 Td (DSA Component (40% weight): ${report.readinessSummary.breakdown.dsaScore} pts) Tj ET`);
  p1.content.push(`BT /F2 8.5 Tf 215 560 Td (Core CS Component (30% weight): ${report.readinessSummary.breakdown.coreCsScore} pts) Tj ET`);
  p1.content.push(`BT /F2 8.5 Tf 380 575 Td (Mock OA (15% weight): ${report.readinessSummary.breakdown.oaScore} pts) Tj ET`);
  p1.content.push(`BT /F2 8.5 Tf 380 560 Td (Consistency (15% weight): ${report.readinessSummary.breakdown.consistencyScore} pts) Tj ET`);
  p1.content.push(`BT /F1 7.5 Tf 0.45 0.5 0.55 rg 215 544 Td (Authoritative formula: PRS = 0.4*DSA + 0.3*CoreCS + 0.15*OA + 0.15*Consistency) Tj ET`);

  // Section Heading: 5-Pillar Readiness Breakdown
  p1.content.push('0.06 0.09 0.16 rg');
  p1.content.push('BT /F2 12 Tf 40 500 Td (1. PREPARATION PILLARS AUDIT & VERIFICATION MATRIX) Tj ET');
  p1.content.push('0.85 0.88 0.92 RG 1 w 40 492 m 555 492 l S');

  // Matrix Table Header
  p1.content.push('0.92 0.94 0.96 rg 40 465 515 20 re f');
  p1.content.push('0.06 0.09 0.16 rg');
  p1.content.push('BT /F2 8 Tf 45 471 Td (PILLAR) Tj ET');
  p1.content.push('BT /F2 8 Tf 150 471 Td (SCORE) Tj ET');
  p1.content.push('BT /F2 8 Tf 215 471 Td (STATUS) Tj ET');
  p1.content.push('BT /F2 8 Tf 305 471 Td (KEY VERIFIED METRIC) Tj ET');
  p1.content.push('BT /F2 8 Tf 465 471 Td (BENCHMARK) Tj ET');

  // Matrix Rows
  const pillars = [
    {
      name: 'Algorithms & DSA',
      score: `${report.dsaCompetency.score}/100`,
      status: report.dsaCompetency.status,
      metric: `${report.dsaCompetency.solvedCount}/${report.dsaCompetency.totalProblems} Solved (${report.dsaCompetency.solvedPct}%)`,
      benchmark: '60+ Problems',
    },
    {
      name: 'Core CS Foundations',
      score: `${report.coreCsReport.score}/100`,
      status: report.coreCsReport.status,
      metric: `Avg: ${report.coreCsReport.avgScorePct}% (${report.coreCsReport.quizAttemptsCount} quizzes)`,
      benchmark: '70% Diagnostic Cutoff',
    },
    {
      name: 'Target Company Prep',
      score: `${report.companyPrepReport.score}/100`,
      status: report.companyPrepReport.status,
      metric: `${report.companyPrepReport.patternsCovered}/${report.companyPrepReport.totalPatterns} Patterns (${report.companyPrepReport.targetCompanyName || 'Tier 2'})`,
      benchmark: '60% Pattern Coverage',
    },
    {
      name: 'Mock Online Assessments',
      score: `${report.mockAssessmentsReport.score}/100`,
      status: report.mockAssessmentsReport.status,
      metric: `${report.mockAssessmentsReport.passedCount}/${report.mockAssessmentsReport.attemptsCount} Passed (Best: ${report.mockAssessmentsReport.bestScorePct}%)`,
      benchmark: '1+ Full OA Simulation',
    },
    {
      name: 'Spaced Repetition & Recall',
      score: `${report.spacedRevisionReport.score}/100`,
      status: report.spacedRevisionReport.status,
      metric: `Retention: ${report.spacedRevisionReport.retentionHealthPct}% (${report.spacedRevisionReport.inScheduleCount} Active Cards)`,
      benchmark: '85% On-Time Recall',
    },
  ];

  let currentY = 445;
  pillars.forEach((p, idx) => {
    if (idx % 2 === 1) {
      p1.content.push(`0.97 0.98 0.99 rg 40 ${currentY - 5} 515 20 re f`);
    }
    p1.content.push('0.06 0.09 0.16 rg');
    p1.content.push(`BT /F2 8 Tf 45 ${currentY} Td (${escapePdfText(p.name)}) Tj ET`);
    p1.content.push(`BT /F3 8 Tf 150 ${currentY} Td (${escapePdfText(p.score)}) Tj ET`);
    p1.content.push(`BT /F1 8 Tf 215 ${currentY} Td (${escapePdfText(p.status)}) Tj ET`);
    p1.content.push(`BT /F1 8 Tf 305 ${currentY} Td (${escapePdfText(p.metric)}) Tj ET`);
    p1.content.push(`BT /F1 8 Tf 465 ${currentY} Td (${escapePdfText(p.benchmark)}) Tj ET`);
    currentY -= 22;
  });

  // Section: Priority Actions Snapshot
  p1.content.push('0.06 0.09 0.16 rg');
  p1.content.push('BT /F2 12 Tf 40 310 Td (2. IMMEDIATE PLACEMENT PRIORITY ACTIONS) Tj ET');
  p1.content.push('0.85 0.88 0.92 RG 1 w 40 302 m 555 302 l S');

  let actionY = 280;
  report.priorityActions.slice(0, 3).forEach((act) => {
    p1.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w');
    p1.content.push(`40 ${actionY - 18} 515 36 re B`);
    p1.content.push('0.06 0.09 0.16 rg');
    p1.content.push(`BT /F2 8.5 Tf 50 ${actionY + 5} Td (#${act.priorityOrder} [${escapePdfText(act.badgeText)}] ${escapePdfText(act.title)}) Tj ET`);
    p1.content.push(`BT /F1 7.5 Tf 0.35 0.4 0.45 rg 50 ${actionY - 8} Td (${escapePdfText(act.rationale)}) Tj ET`);
    actionY -= 42;
  });

  // Page 1 Footer
  p1.content.push('0.85 0.88 0.92 RG 0.5 w 40 50 m 555 50 l S');
  p1.content.push('BT /F1 7.5 Tf 0.5 0.55 0.6 rg 40 38 Td (PrepOS Placement Intelligence System  |  Page 1 of 3  |  Authoritative Server Record) Tj ET');
  p1.content.push(`BT /F3 7.5 Tf 0.5 0.55 0.6 rg 450 38 Td (DOC HASH: ${escapePdfText(report.metadata.verificationHash.slice(0, 8))}) Tj ET`);

  pages.push(p1);

  // --------------------------------------------------------------------------
  // PAGE 2: DSA COMPETENCY DEEP-DIVE & CORE CS DIAGNOSTIC AUDIT
  // --------------------------------------------------------------------------
  const p2: PageStream = { content: [] };

  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push(`0 ${pageHeight - 50} ${pageWidth} 50 re f`);
  p2.content.push('BT /F2 12 Tf 1 1 1 rg 40 805 Td (PrepOS Placement Readiness Dossier  |  Section II: Technical Foundations) Tj ET');
  p2.content.push(`BT /F1 8 Tf 0.7 0.8 0.9 rg 430 805 Td (Candidate: ${escapePdfText(report.candidate.name)}) Tj ET`);

  // Section 3: DSA Competency Deep-Dive
  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push('BT /F2 12 Tf 40 760 Td (3. DATA STRUCTURES & ALGORITHMS AUDIT) Tj ET');
  p2.content.push('0.85 0.88 0.92 RG 1 w 40 752 m 555 752 l S');

  // DSA Stat Cards
  const dsaCards = [
    { title: 'Solved Problems', val: `${report.dsaCompetency.solvedCount} / ${report.dsaCompetency.totalProblems}` },
    { title: 'Success Rate', val: `${report.dsaCompetency.submissionSuccessRate}%` },
    { title: 'WA / TLE Failures', val: `${report.dsaCompetency.wrongAnswerCount} WA / ${report.dsaCompetency.tleCount} TLE` },
    { title: 'Company Tagged', val: `${report.dsaCompetency.companyTaggedSolved} / ${report.dsaCompetency.companyTaggedTotal}` },
  ];

  let cardX = 40;
  dsaCards.forEach((c) => {
    p2.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w');
    p2.content.push(`${cardX} 695 120 45 re B`);
    p2.content.push('0.4 0.45 0.5 rg');
    p2.content.push(`BT /F1 7.5 Tf ${cardX + 8} 725 Td (${escapePdfText(c.title)}) Tj ET`);
    p2.content.push('0.06 0.09 0.16 rg');
    p2.content.push(`BT /F2 11 Tf ${cardX + 8} 706 Td (${escapePdfText(c.val)}) Tj ET`);
    cardX += 130;
  });

  // Difficulty Distribution Bar
  p2.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w 40 635 515 45 re B');
  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push('BT /F2 8.5 Tf 50 663 Td (Difficulty Distribution:) Tj ET');
  p2.content.push(`BT /F1 8.5 Tf 0.1 0.5 0.2 rg 160 663 Td (Easy: ${report.dsaCompetency.solvedByDifficulty.easy} / ${report.dsaCompetency.totalByDifficulty.easy}) Tj ET`);
  p2.content.push(`BT /F1 8.5 Tf 0.7 0.4 0.0 rg 270 663 Td (Medium: ${report.dsaCompetency.solvedByDifficulty.medium} / ${report.dsaCompetency.totalByDifficulty.medium}) Tj ET`);
  p2.content.push(`BT /F1 8.5 Tf 0.8 0.1 0.1 rg 395 663 Td (Hard: ${report.dsaCompetency.solvedByDifficulty.hard} / ${report.dsaCompetency.totalByDifficulty.hard}) Tj ET`);
  p2.content.push(`BT /F1 7.5 Tf 0.4 0.45 0.5 rg 50 645 Td (Topic Coverage: ${report.dsaCompetency.topicCoverageCount} of ${report.dsaCompetency.totalTopicsCount} core algorithmic categories verified) Tj ET`);

  // DSA Highlights
  let dsaHlY = 615;
  report.dsaCompetency.highlights.forEach((hl) => {
    p2.content.push(`BT /F1 8 Tf 0.2 0.25 0.3 rg 50 ${dsaHlY} Td (* ${escapePdfText(hl)}) Tj ET`);
    dsaHlY -= 14;
  });

  // Section 4: Core Computer Science Foundations
  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push('BT /F2 12 Tf 40 545 Td (4. CORE COMPUTER SCIENCE FOUNDATIONS & DIAGNOSTICS) Tj ET');
  p2.content.push('0.85 0.88 0.92 RG 1 w 40 537 m 555 537 l S');

  const coreCards = [
    { title: 'Quizzes Taken', val: `${report.coreCsReport.quizAttemptsCount} Completed` },
    { title: 'Average Score', val: `${report.coreCsReport.avgScorePct}%` },
    { title: 'Peak Diagnostic', val: `${report.coreCsReport.bestScorePct}%` },
    { title: 'Benchmark (70%)', val: report.coreCsReport.benchmarkMet ? 'PASSED' : 'ATTENTION' },
  ];

  let coreCardX = 40;
  coreCards.forEach((c) => {
    p2.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w');
    p2.content.push(`${coreCardX} 480 120 45 re B`);
    p2.content.push('0.4 0.45 0.5 rg');
    p2.content.push(`BT /F1 7.5 Tf ${coreCardX + 8} 510 Td (${escapePdfText(c.title)}) Tj ET`);
    p2.content.push('0.06 0.09 0.16 rg');
    p2.content.push(`BT /F2 11 Tf ${coreCardX + 8} 491 Td (${escapePdfText(c.val)}) Tj ET`);
    coreCardX += 130;
  });

  // Core CS Highlights
  let coreHlY = 460;
  report.coreCsReport.highlights.forEach((hl) => {
    p2.content.push(`BT /F1 8 Tf 0.2 0.25 0.3 rg 50 ${coreHlY} Td (* ${escapePdfText(hl)}) Tj ET`);
    coreHlY -= 14;
  });

  // Section 5: Mock Assessment Simulations
  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push('BT /F2 12 Tf 40 400 Td (5. MOCK ONLINE ASSESSMENT (OA) SIMULATIONS) Tj ET');
  p2.content.push('0.85 0.88 0.92 RG 1 w 40 392 m 555 392 l S');

  const oaCards = [
    { title: 'Attempts Count', val: `${report.mockAssessmentsReport.attemptsCount} Logged` },
    { title: 'Passed Assessments', val: `${report.mockAssessmentsReport.passedCount} Passed` },
    { title: 'Average Score', val: `${report.mockAssessmentsReport.avgScorePct}%` },
    { title: 'Best OA Score', val: `${report.mockAssessmentsReport.bestScorePct}%` },
  ];

  let oaCardX = 40;
  oaCards.forEach((c) => {
    p2.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w');
    p2.content.push(`${oaCardX} 335 120 45 re B`);
    p2.content.push('0.4 0.45 0.5 rg');
    p2.content.push(`BT /F1 7.5 Tf ${oaCardX + 8} 365 Td (${escapePdfText(c.title)}) Tj ET`);
    p2.content.push('0.06 0.09 0.16 rg');
    p2.content.push(`BT /F2 11 Tf ${oaCardX + 8} 346 Td (${escapePdfText(c.val)}) Tj ET`);
    oaCardX += 130;
  });

  // OA Highlights
  let oaHlY = 315;
  report.mockAssessmentsReport.highlights.forEach((hl) => {
    p2.content.push(`BT /F1 8 Tf 0.2 0.25 0.3 rg 50 ${oaHlY} Td (* ${escapePdfText(hl)}) Tj ET`);
    oaHlY -= 14;
  });

  // Section 6: Target Company Alignment
  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push('BT /F2 12 Tf 40 255 Td (6. TARGET COMPANY PREPARATION ALIGNMENT) Tj ET');
  p2.content.push('0.85 0.88 0.92 RG 1 w 40 247 m 555 247 l S');

  p2.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w 40 180 515 55 re B');
  p2.content.push('0.06 0.09 0.16 rg');
  p2.content.push(`BT /F2 9.5 Tf 50 218 Td (Target Firm: ${escapePdfText(report.companyPrepReport.targetCompanyName || 'Not Configured')}  |  Tier: ${escapePdfText(report.companyPrepReport.targetRoleTier)}) Tj ET`);
  p2.content.push(`BT /F1 8.5 Tf 0.3 0.35 0.4 rg 50 202 Td (Verified Pattern Coverage: ${report.companyPrepReport.patternsCovered} of ${report.companyPrepReport.totalPatterns} Archetypes Covered) Tj ET`);
  p2.content.push(`BT /F1 8.5 Tf 0.3 0.35 0.4 rg 50 188 Td (Company-Specific Problems Solved: ${report.companyPrepReport.companyProblemsSolved} of ${report.companyPrepReport.totalCompanyProblems} verified problems) Tj ET`);

  // Page 2 Footer
  p2.content.push('0.85 0.88 0.92 RG 0.5 w 40 50 m 555 50 l S');
  p2.content.push('BT /F1 7.5 Tf 0.5 0.55 0.6 rg 40 38 Td (PrepOS Placement Intelligence System  |  Page 2 of 3  |  Authoritative Server Record) Tj ET');
  p2.content.push(`BT /F3 7.5 Tf 0.5 0.55 0.6 rg 450 38 Td (DOC HASH: ${escapePdfText(report.metadata.verificationHash.slice(0, 8))}) Tj ET`);

  pages.push(p2);

  // --------------------------------------------------------------------------
  // PAGE 3: REVISION HEALTH, MILESTONES, INSIGHTS & VERIFICATION DECLARATION
  // --------------------------------------------------------------------------
  const p3: PageStream = { content: [] };

  p3.content.push('0.06 0.09 0.16 rg');
  p3.content.push(`0 ${pageHeight - 50} ${pageWidth} 50 re f`);
  p3.content.push('BT /F2 12 Tf 1 1 1 rg 40 805 Td (PrepOS Placement Readiness Dossier  |  Section III: Milestones & Verification) Tj ET');
  p3.content.push(`BT /F1 8 Tf 0.7 0.8 0.9 rg 430 805 Td (Candidate: ${escapePdfText(report.candidate.name)}) Tj ET`);

  // Section 7: Spaced Revision Health
  p3.content.push('0.06 0.09 0.16 rg');
  p3.content.push('BT /F2 12 Tf 40 760 Td (7. SPACED REPETITION & LONG-TERM MEMORY HEALTH (SM-2)) Tj ET');
  p3.content.push('0.85 0.88 0.92 RG 1 w 40 752 m 555 752 l S');

  const revCards = [
    { title: 'Due Today', val: `${report.spacedRevisionReport.dueTodayCount} Cards` },
    { title: 'Overdue Backlog', val: `${report.spacedRevisionReport.overdueCount} Cards` },
    { title: 'Active Schedule', val: `${report.spacedRevisionReport.inScheduleCount} Items` },
    { title: 'Retention Health', val: `${report.spacedRevisionReport.retentionHealthPct}%` },
  ];

  let revCardX = 40;
  revCards.forEach((c) => {
    p3.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w');
    p3.content.push(`${revCardX} 695 120 45 re B`);
    p3.content.push('0.4 0.45 0.5 rg');
    p3.content.push(`BT /F1 7.5 Tf ${revCardX + 8} 725 Td (${escapePdfText(c.title)}) Tj ET`);
    p3.content.push('0.06 0.09 0.16 rg');
    p3.content.push(`BT /F2 11 Tf ${revCardX + 8} 706 Td (${escapePdfText(c.val)}) Tj ET`);
    revCardX += 130;
  });

  // Section 8: Readiness Milestones Roadmap
  p3.content.push('0.06 0.09 0.16 rg');
  p3.content.push('BT /F2 12 Tf 40 655 Td (8. AUTHENTICATED PREPARATION MILESTONES) Tj ET');
  p3.content.push('0.85 0.88 0.92 RG 1 w 40 647 m 555 647 l S');

  let milestoneY = 625;
  report.milestones.slice(0, 5).forEach((m) => {
    const isCompleted = m.status === 'COMPLETED';
    const statusText = isCompleted ? '[COMPLETED]' : m.status === 'IN_PROGRESS' ? '[IN PROGRESS]' : '[UPCOMING]';
    const colorCmd = isCompleted ? '0.1 0.55 0.25 rg' : '0.2 0.35 0.6 rg';

    p3.content.push(`${colorCmd}`);
    p3.content.push(`BT /F2 8 Tf 50 ${milestoneY} Td (${escapePdfText(statusText)} ${escapePdfText(m.title)}) Tj ET`);
    p3.content.push('0.4 0.45 0.5 rg');
    p3.content.push(`BT /F1 7.5 Tf 50 ${milestoneY - 10} Td (${escapePdfText(m.description)}) Tj ET`);
    milestoneY -= 28;
  });

  // Section 9: Diagnostic Readiness Insights
  p3.content.push('0.06 0.09 0.16 rg');
  p3.content.push('BT /F2 12 Tf 40 480 Td (9. DETERMINISTIC READINESS INSIGHTS) Tj ET');
  p3.content.push('0.85 0.88 0.92 RG 1 w 40 472 m 555 472 l S');

  let insightY = 450;
  report.insights.slice(0, 3).forEach((ins) => {
    p3.content.push('0.97 0.98 0.99 rg 0.85 0.88 0.92 RG 0.5 w');
    p3.content.push(`40 ${insightY - 20} 515 38 re B`);
    p3.content.push('0.06 0.09 0.16 rg');
    p3.content.push(`BT /F2 8.5 Tf 50 ${insightY + 3} Td ([${escapePdfText(ins.severity)}] ${escapePdfText(ins.title)}) Tj ET`);
    p3.content.push(`BT /F1 7.5 Tf 0.35 0.4 0.45 rg 50 ${insightY - 10} Td (Evidence: ${escapePdfText(ins.supportingMetric)}  |  ${escapePdfText(ins.whyItMatters)}) Tj ET`);
    insightY -= 44;
  });

  // Section 10: Official Verification Seal & Integrity Guarantee
  p3.content.push('0.95 0.96 0.98 rg 0.8 0.84 0.9 RG 1 w');
  p3.content.push(`40 180 515 110 re B`);

  p3.content.push('0.06 0.09 0.16 rg');
  p3.content.push('BT /F2 10 Tf 55 268 Td (PREPOS VERIFICATION & TAMPER-EVIDENT DECLARATION) Tj ET');
  p3.content.push('BT /F1 8 Tf 0.3 0.35 0.4 rg 55 252 Td (This document certifies verified preparation activity recorded in the PrepOS platform database.) Tj ET');
  p3.content.push('BT /F1 8 Tf 0.3 0.35 0.4 rg 55 238 Td (Every metric, score, milestone, and diagnostic result reflects authenticated execution and timers.) Tj ET');
  p3.content.push('BT /F1 8 Tf 0.3 0.35 0.4 rg 55 224 Td (No predictive AI or fabricated indicators were introduced in the generation of this dossier.) Tj ET');
  p3.content.push(`BT /F3 8 Tf 0.15 0.3 0.6 rg 55 204 Td (CRYPTOGRAPHIC HASH: ${escapePdfText(report.metadata.verificationHash)}  |  REPORT: ${escapePdfText(report.metadata.reportId)}) Tj ET`);
  p3.content.push(`BT /F1 7.5 Tf 0.5 0.55 0.6 rg 55 190 Td (Generated on ${escapePdfText(report.metadata.generatedAt)} via PrepOS Engine v${escapePdfText(report.metadata.version)}  |  Online Recruiter Verification: /verify/dossier/) Tj ET`);

  // Page 3 Footer
  p3.content.push('0.85 0.88 0.92 RG 0.5 w 40 50 m 555 50 l S');
  p3.content.push('BT /F1 7.5 Tf 0.5 0.55 0.6 rg 40 38 Td (PrepOS Placement Intelligence System  |  Page 3 of 3  |  Authoritative Server Record) Tj ET');
  p3.content.push(`BT /F3 7.5 Tf 0.5 0.55 0.6 rg 450 38 Td (DOC HASH: ${escapePdfText(report.metadata.verificationHash.slice(0, 8))}) Tj ET`);

  pages.push(p3);

  // --------------------------------------------------------------------------
  // ASSEMBLE COMPLETE PDF 1.4 BINARY OBJECT GRAPH
  // --------------------------------------------------------------------------
  const objects: string[] = [];
  // 1: Catalog
  // 2: Pages
  // 3: Font Helvetica
  // 4: Font Helvetica-Bold
  // 5: Font Courier
  // 6.. : Page and Content objects

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');

  const pageObjIds: number[] = [];
  const contentObjIds: number[] = [];
  let nextObjId = 6;

  for (let i = 0; i < pages.length; i++) {
    pageObjIds.push(nextObjId);
    contentObjIds.push(nextObjId + 1);
    nextObjId += 2;
  }

  // 2: Pages object
  const kidsStr = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  objects.push(`<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>`);

  // 3: Font Helvetica
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

  // 4: Font Helvetica-Bold
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  // 5: Font Courier
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');

  // Page and Content objects
  for (let i = 0; i < pages.length; i++) {
    const pageId = pageObjIds[i];
    const contentId = contentObjIds[i];
    const streamContent = pages[i].content.join('\n');

    // Page object
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> >>`
    );

    // Content stream object
    const streamBuffer = Buffer.from(streamContent, 'utf-8');
    objects.push(
      `<< /Length ${streamBuffer.length} >>\nstream\n${streamContent}\nendstream`
    );
  }

  // Build the complete file with byte offsets for xref table
  let pdfOutput = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdfOutput, 'utf-8'));
    pdfOutput += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startXref = Buffer.byteLength(pdfOutput, 'utf-8');
  pdfOutput += 'xref\n';
  pdfOutput += `0 ${objects.length + 1}\n`;
  pdfOutput += '0000000000 65535 f \n';

  for (let i = 0; i < offsets.length; i++) {
    const offStr = offsets[i].toString().padStart(10, '0');
    pdfOutput += `${offStr} 00000 n \n`;
  }

  pdfOutput += 'trailer\n';
  pdfOutput += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdfOutput += 'startxref\n';
  pdfOutput += `${startXref}\n`;
  pdfOutput += '%%EOF\n';

  return Buffer.from(pdfOutput, 'utf-8');
}
