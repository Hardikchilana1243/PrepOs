'use server';

// ============================================================================
// PREPOS GLOBAL SEARCH ACTIONS
// Authenticated server actions for real-time cross-platform search
// ============================================================================

import { getSessionUser } from '@/lib/auth';
import { searchGlobalEntities, SearchResultItem } from '@/lib/services/global-search';

export async function searchGlobalAction(query: string): Promise<SearchResultItem[]> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return searchGlobalEntities(user.id, query);
}
