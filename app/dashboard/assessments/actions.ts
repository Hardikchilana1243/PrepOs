'use server';

// ============================================================================
// PREPOS ASSESSMENT SERVER ACTIONS
// Authenticated, Type-Safe Server Actions for Company Assessment Engine
// ============================================================================

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import {
  startOrResumeAssessment,
  autosaveMCQAnswer,
  autosaveCodeDraft,
  runAssessmentCode,
  submitAssessmentCode,
  submitFinalAssessment,
} from '@/lib/services/assessment';
import { compileResultSummary, AssessmentResultSummary } from '@/lib/services/assessment-scoring';
import { SupportedLanguage } from '@/lib/services/code-execution';

export async function startAssessmentAction(assessmentSlugOrId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized. Please sign in.');
  }

  const result = await startOrResumeAssessment(user.id, assessmentSlugOrId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/companies');
  return result;
}

export async function autosaveMCQAnswerAction(
  attemptId: string,
  questionId: string,
  selectedOptionId: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return autosaveMCQAnswer(user.id, attemptId, questionId, selectedOptionId);
}

export async function autosaveCodeDraftAction(
  attemptId: string,
  questionId: string,
  code: string,
  language: SupportedLanguage
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return autosaveCodeDraft(user.id, attemptId, questionId, code, language);
}

export async function runAssessmentCodeAction(
  attemptId: string,
  questionId: string,
  language: SupportedLanguage,
  code: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return runAssessmentCode(user.id, attemptId, questionId, language, code);
}

export async function submitAssessmentCodeAction(
  attemptId: string,
  questionId: string,
  language: SupportedLanguage,
  code: string
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return submitAssessmentCode(user.id, attemptId, questionId, language, code);
}

export async function submitFinalAssessmentAction(attemptId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const result = await submitFinalAssessment(user.id, attemptId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/companies');
  return result;
}

export async function getAssessmentResultAction(attemptId: string): Promise<AssessmentResultSummary> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return compileResultSummary(attemptId);
}
