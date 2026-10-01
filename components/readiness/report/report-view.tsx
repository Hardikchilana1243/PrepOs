'use client';

// ============================================================================
// PREPOS PLACEMENT READINESS REPORT MASTER VIEW
// Interactive Document Surface with Print & Download Action Controls
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Printer,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { PlacementReadinessReport } from '@/lib/services/readiness-report';
import { ReportHeader } from './report-header';
import { ReportSummary } from './report-summary';
import { ReportDsa } from './report-dsa';
import { ReportCoreCs } from './report-core-cs';
import { ReportAssessments } from './report-assessments';
import { ReportCompany } from './report-company';
import { ReportRevision } from './report-revision';
import { ReportMilestones } from './report-milestones';
import { ReportInsights } from './report-insights';
import { ReportActions } from './report-actions';
import { ReportTrends } from './report-trends';
import { ShareDossierCard } from '@/components/readiness/verification/share-dossier-card';

interface ReportViewProps {
  report: PlacementReadinessReport;
}

export function ReportView({ report }: ReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Top Action Toolbar (Hidden during browser print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <Link
          href="/dashboard/readiness"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Readiness Command Center</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-2xs min-h-[44px]"
            title="Recalibrate and refresh report"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-2xs min-h-[44px]"
            title="Print or Save via Browser"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Dossier</span>
          </button>

          <a
            href="/dashboard/readiness/report/pdf"
            download={`PrepOS_Readiness_Dossier_${report.candidate.name.replace(/\s+/g, '_')}_${report.metadata.generatedAt}.pdf`}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-xs min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      </div>

      {/* Recruiter Verification Share Management (Hidden during print) */}
      <div className="print:hidden max-w-4xl mx-auto">
        <ShareDossierCard />
      </div>

      {/* 2. Formal Printable Document Sheet */}
      <article
        id="readiness-dossier-document"
        className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Document Header & Identity */}
        <ReportHeader report={report} />

        {/* Executive Summary & Authoritative PRS Breakdown */}
        <ReportSummary summary={report.readinessSummary} />

        {/* Section 1: DSA Competency */}
        <ReportDsa dsa={report.dsaCompetency} />

        {/* Section 2: Core CS Foundations */}
        <ReportCoreCs coreCs={report.coreCsReport} />

        {/* Section 3: Mock Online Assessments */}
        <ReportAssessments assessment={report.mockAssessmentsReport} />

        {/* Section 4: Target Company Alignment */}
        <ReportCompany company={report.companyPrepReport} />

        {/* Section 5: Spaced Repetition & Retention */}
        <ReportRevision revision={report.spacedRevisionReport} />

        {/* Section 6: Milestones Roadmap */}
        <ReportMilestones milestones={report.milestones} />

        {/* Section 7: Diagnostic Insights */}
        <ReportInsights insights={report.insights} />

        {/* Section 8: Priority Actions */}
        <ReportActions actions={report.priorityActions} />

        {/* Section 9: Historical Trajectory */}
        <ReportTrends trends={report.trends} />

        {/* Document Footer & Cryptographic Verification Seal */}
        <div className="border-t-2 border-slate-900 pt-6 mt-10 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>PrepOS Verification & Tamper-Evident Declaration</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px] max-w-xl">
                This Placement Readiness Dossier is compiled from real-time database records of verified algorithmic problem submissions, diagnostic quizzes, and timed assessment attempts. No predictive AI or synthetic mastery estimates are used.
              </p>
            </div>

            <div className="text-right shrink-0 space-y-0.5">
              <div className="font-mono text-[10px] text-slate-400 uppercase">Cryptographic Digest</div>
              <div className="font-mono font-bold text-slate-800 text-xs">{report.metadata.verificationHash}</div>
              <div className="text-[10px] text-slate-400 font-mono">Engine v{report.metadata.version}</div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
