// ============================================================================
// PREPOS ADAPTIVE RECOMMENDATION SERVICE
// High-level recommendation and next-step orchestrator
// ============================================================================

import {
  getAdaptivePreparationData,
  AdaptiveRecommendation,
  AdaptivePlanTask,
} from './adaptive-preparation';

/**
 * Retrieves the current highest-impact recommended next step for a student.
 * Fully deterministic based on actual database state.
 */
export async function getNextRecommendedStep(
  userId: string
): Promise<AdaptiveRecommendation> {
  const data = await getAdaptivePreparationData(userId);
  return data.recommendation;
}

/**
 * Retrieves the student's prioritized 3-5 action queue for today.
 */
export async function getTodaysPreparationPlan(
  userId: string
): Promise<AdaptivePlanTask[]> {
  const data = await getAdaptivePreparationData(userId);
  return data.todayPlan;
}
