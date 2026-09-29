'use client';

// ============================================================================
// PREPOS ASSESSMENT START / RESUME ACTION BUTTON
// Client Trigger for Starting or Resuming Timed Online Assessments
// ============================================================================

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, Loader2, ArrowRight } from 'lucide-react';
import { startAssessmentAction } from '@/app/dashboard/assessments/actions';

interface StartButtonProps {
  assessmentSlugOrId: string;
  activeAttemptId?: string | null;
  hasActiveAttempt: boolean;
}

export function AssessmentStartButton({
  assessmentSlugOrId,
  activeAttemptId,
  hasActiveAttempt,
}: StartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      try {
        const res = await startAssessmentAction(assessmentSlugOrId);
        router.push(`/dashboard/assessments/${assessmentSlugOrId}/attempt/${res.attemptId}`);
      } catch (err: any) {
        alert(err?.message || 'Failed to start assessment. Please try again.');
      }
    });
  };

  if (hasActiveAttempt && activeAttemptId) {
    return (
      <button
        onClick={() => router.push(`/dashboard/assessments/${assessmentSlugOrId}/attempt/${activeAttemptId}`)}
        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4 animate-spin-reverse" />
        <span>Resume Assessment In Progress</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={isPending}
      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Initializing Assessment Environment...</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4 fill-current" />
          <span>Start Assessment</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </>
      )}
    </button>
  );
}
