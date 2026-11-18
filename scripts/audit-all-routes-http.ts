// ============================================================================
// PREPOS COMPLETE HTTP ROUTE AUDIT & INTEGRITY CHECKER
// Validates status codes, redirects, content-types, error boundaries, and empty states
// ============================================================================

import prisma from '../lib/db';
import crypto from 'crypto';
import { createDossierShareLink } from '../lib/services/dossier-verification';

const BASE_URL = 'http://localhost:3000';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedChecks++;
    failures.push(message);
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

async function runRouteAudit() {
  console.log('====================================================================');
  console.log('🌐 PREPOS COMPREHENSIVE HTTP ROUTE AUDIT');
  console.log('====================================================================\n');

  // Setup test session for authenticated routes
  const user = await prisma.user.findFirst({
    where: { email: 'priya.candidate@univ.edu' },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('Test candidate priya.candidate@univ.edu not found');
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const authCookie = `prepos_session=${sessionToken}`;

  // Generate a recruiter share link for testing verification route
  const shareLink = await createDossierShareLink(user.id, { expiresInDays: 7 });

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: PUBLIC & UNAUTHENTICATED ROUTES
    // ------------------------------------------------------------------------
    console.log('--- Section 1: Public & Unauthenticated Routes ---');

    // 1. Landing Page
    const landingRes = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
    assert(landingRes.status === 200, 'GET / returns 200 OK');
    const landingHtml = await landingRes.text();
    assert(landingHtml.includes('PrepOS') && landingHtml.includes('Student OS'), 'Landing page renders branding');

    // 2. Sign In Page (unauthenticated)
    const signInRes = await fetch(`${BASE_URL}/auth/sign-in`, { redirect: 'manual' });
    assert(signInRes.status === 200, 'GET /auth/sign-in returns 200 OK');

    // 3. Sign Up Page (unauthenticated)
    const signUpRes = await fetch(`${BASE_URL}/auth/sign-up`, { redirect: 'manual' });
    assert(signUpRes.status === 200, 'GET /auth/sign-up returns 200 OK');

    // 4. Protected Route without Auth -> Redirects to Sign In
    const unauthDashRes = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    assert(unauthDashRes.status === 307 || unauthDashRes.status === 302, 'GET /dashboard without session redirects (307/302)');
    assert(unauthDashRes.headers.get('location')?.includes('/auth/sign-in') === true, 'Redirect target is /auth/sign-in');

    const unauthOnboardingRes = await fetch(`${BASE_URL}/onboarding`, { redirect: 'manual' });
    assert(unauthOnboardingRes.status === 307 || unauthOnboardingRes.status === 302, 'GET /onboarding without session redirects');

    // ------------------------------------------------------------------------
    // SECTION 2: AUTHENTICATED REDIRECT GUARDS
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Authenticated Redirect Guards ---');

    // Authenticated user visiting /auth/sign-in should redirect to /dashboard
    const authSignInRes = await fetch(`${BASE_URL}/auth/sign-in`, {
      headers: { Cookie: authCookie },
      redirect: 'manual',
    });
    assert(authSignInRes.status === 307 || authSignInRes.status === 302, 'Authenticated GET /auth/sign-in redirects to /dashboard');

    // Authenticated and onboarded user visiting /onboarding should redirect to /dashboard
    const authOnboardingRes = await fetch(`${BASE_URL}/onboarding`, {
      headers: { Cookie: authCookie },
      redirect: 'manual',
    });
    assert(authOnboardingRes.status === 307 || authOnboardingRes.status === 302, 'Onboarded GET /onboarding redirects to /dashboard');

    // ------------------------------------------------------------------------
    // SECTION 3: AUTHENTICATED APPLICATION WORKSPACES
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Authenticated Application Routes ---');

    // 1. Dashboard
    const dashRes = await fetch(`${BASE_URL}/dashboard`, { headers: { Cookie: authCookie } });
    assert(dashRes.status === 200, 'GET /dashboard returns 200 OK');
    const dashHtml = await dashRes.text();
    assert(dashHtml.includes('Priya') || dashHtml.includes('Dashboard'), 'Dashboard renders student context');

    // 2. DSA Roadmap
    const dsaRes = await fetch(`${BASE_URL}/dashboard/dsa`, { headers: { Cookie: authCookie } });
    assert(dsaRes.status === 200, 'GET /dashboard/dsa returns 200 OK');

    // 3. DSA Problem Workspace
    const pRes = await fetch(`${BASE_URL}/dashboard/dsa/problem/array-element-frequency-counter`, { headers: { Cookie: authCookie } });
    assert(pRes.status === 200, 'GET /dashboard/dsa/problem/array-element-frequency-counter returns 200 OK');
    const pHtml = await pRes.text();
    assert(pHtml.includes('Array Element Frequency Counter'), 'Problem workspace renders problem title');

    // 4. DSA Slug Forwarding (Redirects cleanly to /dashboard/dsa/problem/:slug)
    const slugFwdRes = await fetch(`${BASE_URL}/dashboard/dsa/array-element-frequency-counter`, {
      headers: { Cookie: authCookie },
      redirect: 'manual',
    });
    const slugHtml = await slugFwdRes.text();
    const isRedirectOk =
      slugFwdRes.status === 307 ||
      slugFwdRes.status === 302 ||
      slugHtml.includes('__next-page-redirect') ||
      slugHtml.includes('/dashboard/dsa/problem/array-element-frequency-counter');
    assert(isRedirectOk, 'GET /dashboard/dsa/:slug forwards to problem/:slug workspace');

    // 5. Core CS Hub
    const coreCsRes = await fetch(`${BASE_URL}/dashboard/core-cs`, { headers: { Cookie: authCookie } });
    assert(coreCsRes.status === 200, 'GET /dashboard/core-cs returns 200 OK');
    const coreCsHtml = await coreCsRes.text();
    assert(coreCsHtml.includes('DBMS') || coreCsHtml.includes('Database'), 'Core CS Hub renders subjects');

    // 6. Company Hubs Catalog
    const companiesRes = await fetch(`${BASE_URL}/dashboard/companies`, { headers: { Cookie: authCookie } });
    assert(companiesRes.status === 200, 'GET /dashboard/companies returns 200 OK');
    const compHtml = await companiesRes.text();
    assert(compHtml.includes('Amazon') && compHtml.includes('Google'), 'Company catalog lists tier-1 firms');

    // 7. Individual Company Hub (Amazon)
    const amazonRes = await fetch(`${BASE_URL}/dashboard/companies/amazon`, { headers: { Cookie: authCookie } });
    assert(amazonRes.status === 200, 'GET /dashboard/companies/amazon returns 200 OK');
    const amazonHtml = await amazonRes.text();
    assert(amazonHtml.includes('Amazon'), 'Company detail renders Amazon workspace');

    // 8. Individual Company Hub (Google - Empty assessments handled)
    const googleRes = await fetch(`${BASE_URL}/dashboard/companies/google`, { headers: { Cookie: authCookie } });
    assert(googleRes.status === 200, 'GET /dashboard/companies/google returns 200 OK');

    // 9. Invalid Company Slug -> Triggers Company Not Found state
    const invalidCompRes = await fetch(`${BASE_URL}/dashboard/companies/non-existent-company-slug-xyz`, { headers: { Cookie: authCookie } });
    const invalidCompHtml = await invalidCompRes.text();
    assert(
      invalidCompRes.status === 404 || invalidCompHtml.includes('Company Not Found') || invalidCompHtml.includes('not exist'),
      'GET invalid company slug renders Company Not Found state'
    );

    // 10. Mock Assessments Catalog
    const assessmentsRes = await fetch(`${BASE_URL}/dashboard/assessments`, { headers: { Cookie: authCookie } });
    assert(assessmentsRes.status === 200, 'GET /dashboard/assessments returns 200 OK');

    // 11. Mock Assessment Overview
    const oaOverviewRes = await fetch(`${BASE_URL}/dashboard/assessments/amazon-sde1-practice-oa-1`, { headers: { Cookie: authCookie } });
    assert(oaOverviewRes.status === 200, 'GET /dashboard/assessments/amazon-sde1-practice-oa-1 returns 200 OK');

    // 12. Invalid Assessment Slug -> Triggers Assessment Not Found state
    const invalidOaRes = await fetch(`${BASE_URL}/dashboard/assessments/non-existent-oa-xyz`, { headers: { Cookie: authCookie } });
    const invalidOaHtml = await invalidOaRes.text();
    assert(
      invalidOaRes.status === 404 || invalidOaHtml.includes('Assessment Not Found') || invalidOaHtml.includes('Page or Resource Not Found') || invalidOaHtml.includes('not exist'),
      'GET invalid assessment slug renders Assessment Not Found state'
    );

    // 13. Spaced Revision
    const revRes = await fetch(`${BASE_URL}/dashboard/revision`, { headers: { Cookie: authCookie } });
    assert(revRes.status === 200, 'GET /dashboard/revision returns 200 OK');

    // 14. Interview Preparation
    const interviewRes = await fetch(`${BASE_URL}/dashboard/interview`, { headers: { Cookie: authCookie } });
    assert(interviewRes.status === 200, 'GET /dashboard/interview returns 200 OK');

    // 15. Notifications Center
    const notifsRes = await fetch(`${BASE_URL}/dashboard/notifications`, { headers: { Cookie: authCookie } });
    assert(notifsRes.status === 200, 'GET /dashboard/notifications returns 200 OK');

    // 16. Preparation Plan
    const planRes = await fetch(`${BASE_URL}/dashboard/plan`, { headers: { Cookie: authCookie } });
    assert(planRes.status === 200, 'GET /dashboard/plan returns 200 OK');

    // 17. Readiness Profile
    const profileRes = await fetch(`${BASE_URL}/dashboard/profile`, { headers: { Cookie: authCookie } });
    assert(profileRes.status === 200, 'GET /dashboard/profile returns 200 OK');

    // 18. Readiness Command Center
    const readinessRes = await fetch(`${BASE_URL}/dashboard/readiness`, { headers: { Cookie: authCookie } });
    assert(readinessRes.status === 200, 'GET /dashboard/readiness returns 200 OK');

    // 19. Placement Readiness Dossier Report
    const reportRes = await fetch(`${BASE_URL}/dashboard/readiness/report`, { headers: { Cookie: authCookie } });
    assert(reportRes.status === 200, 'GET /dashboard/readiness/report returns 200 OK');

    // 20. PDF Export Endpoint
    const pdfRes = await fetch(`${BASE_URL}/dashboard/readiness/report/pdf`, { headers: { Cookie: authCookie } });
    assert(pdfRes.status === 200, 'GET /dashboard/readiness/report/pdf returns 200 OK');
    assert(pdfRes.headers.get('content-type')?.includes('application/pdf') === true, 'PDF Content-Type is application/pdf');
    assert(pdfRes.headers.get('content-disposition')?.includes('attachment') === true, 'PDF Content-Disposition is attachment');
    const pdfBlob = await pdfRes.arrayBuffer();
    assert(pdfBlob.byteLength > 5000, `PDF response is valid binary size (${pdfBlob.byteLength} bytes)`);

    // ------------------------------------------------------------------------
    // SECTION 4: PUBLIC RECRUITER VERIFICATION PORTAL
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: Public Recruiter Verification Portal ---');

    // 1. Valid Token Verification
    const validRecruiterRes = await fetch(`${BASE_URL}/verify/dossier/${shareLink.rawToken}`);
    assert(validRecruiterRes.status === 200, 'GET /verify/dossier/:validToken returns 200 OK');
    const validRecruiterHtml = await validRecruiterRes.text();
    assert(validRecruiterHtml.includes('Placement Readiness') || validRecruiterHtml.includes('Verification'), 'Recruiter verification page renders portal');
    assert(!validRecruiterHtml.includes(user.email), 'Public recruiter view strictly omits student email address');

    // 2. Invalid Token Verification
    const invalidRecruiterRes = await fetch(`${BASE_URL}/verify/dossier/non-existent-token-12345`);
    assert(invalidRecruiterRes.status === 200, 'GET /verify/dossier/:invalidToken returns 200 OK (renders invalid state)');
    const invalidHtml = await invalidRecruiterRes.text();
    assert(invalidHtml.includes('INVALID') || invalidHtml.includes('Invalid') || invalidHtml.includes('not found'), 'Invalid token renders clear invalid notice');

  } finally {
    // Clean up session
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
  }

  console.log('\n====================================================================');
  console.log(`ROUTE AUDIT RESULTS: ${passedChecks} PASSED, ${failedChecks} FAILED (TOTAL: ${totalChecks})`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  }
  console.log('====================================================================');
}

runRouteAudit().then(() => process.exit(failedChecks > 0 ? 1 : 0));
