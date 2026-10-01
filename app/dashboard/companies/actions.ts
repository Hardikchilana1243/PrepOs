'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import { toggleTargetCompany } from '@/lib/services/companies';

export async function toggleTargetCompanyAction(
  companySlug: string,
  isTarget: boolean
): Promise<{ success: boolean; isTarget: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, isTarget: !isTarget, error: 'Unauthorized' };
    }

    if (!companySlug || typeof companySlug !== 'string') {
      return { success: false, isTarget: !isTarget, error: 'Invalid company slug' };
    }

    const result = await toggleTargetCompany(user.id, companySlug, isTarget);

    revalidatePath('/dashboard/companies');
    revalidatePath(`/dashboard/companies/${companySlug}`);
    revalidatePath('/dashboard');

    return result;
  } catch (err: any) {
    console.error('Error toggling target company:', err);
    return { success: false, isTarget: !isTarget, error: err?.message || 'Server error' };
  }
}
