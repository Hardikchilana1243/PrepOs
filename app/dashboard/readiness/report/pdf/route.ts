import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getPlacementReadinessReport } from '@/lib/services/readiness-report';
import { generateReadinessDossierPdf } from '@/lib/services/pdf-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return new NextResponse('Unauthorized: Valid student session required to generate readiness dossier.', {
      status: 401,
    });
  }

  try {
    // 1. Authoritative server-side report model generation scoped strictly to authenticated student
    const report = await getPlacementReadinessReport(user.id);

    // 2. Authoritative server-side PDF 1.4 compilation
    const pdfBuffer = generateReadinessDossierPdf(report);

    const safeName = (report.candidate.name || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `PrepOS_Readiness_Dossier_${safeName}_${report.metadata.generatedAt}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating readiness PDF dossier:', error);
    return new NextResponse('Internal Error compiling readiness dossier PDF', {
      status: 500,
    });
  }
}
