'use server';

// ============================================================================
// PREPOS DOSSIER SHARE MANAGEMENT SERVER ACTIONS
// Authenticated student operations for generating, revoking, and inspecting share links
// ============================================================================

import { getSessionUser } from '@/lib/auth';
import {
  createDossierShareLink,
  revokeDossierShareLink,
  regenerateDossierShareLink,
  getStudentShareStatus,
  ShareManagementStatus,
} from '@/lib/services/dossier-verification';

export async function generateShareLinkAction(expirationDays: number = 30) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return createDossierShareLink(user.id, { expiresInDays: expirationDays });
}

export async function revokeShareLinkAction(shareTokenId?: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await revokeDossierShareLink(user.id, shareTokenId);
  return { success: true };
}

export async function regenerateShareLinkAction(expirationDays: number = 30) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return regenerateDossierShareLink(user.id, undefined, { expiresInDays: expirationDays });
}

export async function getShareStatusAction(): Promise<ShareManagementStatus | null> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await getStudentShareStatus(user.id);
  return result.status || null;
}
