import React from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getPublicDossierVerification } from '@/lib/services/dossier-verification';
import { PublicVerificationHeader } from '@/components/readiness/verification/public-verification-header';
import { PublicVerificationSummary } from '@/components/readiness/verification/public-verification-summary';
import { PublicVerificationFactors } from '@/components/readiness/verification/public-verification-factors';
import { PublicVerificationIntegrity } from '@/components/readiness/verification/public-verification-integrity';
import { PublicVerificationStatus } from '@/components/readiness/verification/public-verification-status';
import { PublicVerificationFooter } from '@/components/readiness/verification/public-verification-footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Placement Readiness Verification | PrepOS',
  description: 'Official recruiter verification portal for PrepOS candidate placement readiness dossiers.',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: {
    token: string;
  };
}

export default async function PublicDossierVerificationPage({ params }: PageProps) {
  const reqHeaders = headers();
  const ip = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || undefined;
  const userAgent = reqHeaders.get('user-agent') || undefined;

  const result = await getPublicDossierVerification(params.token, {
    ip,
    userAgent,
  });

  if (result.status !== 'VALID' || !result.publicData) {
    const errorStatus = (result.status === 'VALID' ? 'INVALID' : result.status) as
      | 'EXPIRED'
      | 'REVOKED'
      | 'INVALID';
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <PublicVerificationStatus
          status={errorStatus}
          message={result.message}
        />
      </main>
    );
  }

  const { publicData } = result;

  return (
    <main className="min-h-screen bg-slate-100/60 py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto space-y-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-10 print:border-none print:shadow-none print:p-0">
        {/* Recruiter Verification Masthead */}
        <PublicVerificationHeader data={publicData} />

        {/* Authoritative PRS and 4-Factor Breakdown */}
        <PublicVerificationSummary data={publicData} />

        {/* 5 Preparation Pillar Metrics and Verified Milestones */}
        <PublicVerificationFactors data={publicData} />

        {/* Cryptographic SHA-256 Tamper Verification Seal */}
        <PublicVerificationIntegrity data={publicData} />

        {/* Official Verification Footer & Privacy Statement */}
        <PublicVerificationFooter data={publicData} />
      </div>
    </main>
  );
}
