'use client';

// ============================================================================
// PREPOS REVISION RATING COMPONENT
// SuperMemo SM-2 recall rating controls with projected interval calculation previews
// ============================================================================

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { RevisionConfidenceRating } from '@/lib/services/revision';

interface RevisionRatingProps {
  currentIntervalDays: number;
  onRate: (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => void;
  isPending: boolean;
  disabled?: boolean;
}

export function RevisionRating({
  currentIntervalDays,
  onRate,
  isPending,
  disabled = false,
}: RevisionRatingProps) {
  const goodInterval = Math.max(7, Math.round(currentIntervalDays * 1.5));
  const easyInterval = Math.max(14, currentIntervalDays * 2);

  const ratings: Array<{
    id: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
    label: string;
    sublabel: string;
    preview: string;
    variant: 'again' | 'hard' | 'good' | 'easy';
  }> = [
    {
      id: 'AGAIN',
      label: 'Again',
      sublabel: 'Blanked out',
      preview: '1 day',
      variant: 'again',
    },
    {
      id: 'HARD',
      label: 'Hard',
      sublabel: 'Struggled',
      preview: '2 days',
      variant: 'hard',
    },
    {
      id: 'GOOD',
      label: 'Good',
      sublabel: 'Optimal recall',
      preview: `${goodInterval} days`,
      variant: 'good',
    },
    {
      id: 'EASY',
      label: 'Easy',
      sublabel: 'Immediate',
      preview: `${easyInterval} days`,
      variant: 'easy',
    },
  ];

  const getVariantStyles = (variant: 'again' | 'hard' | 'good' | 'easy') => {
    switch (variant) {
      case 'again':
        return 'border-rose-200 bg-white hover:bg-rose-50 text-rose-800';
      case 'hard':
        return 'border-amber-200 bg-white hover:bg-amber-50 text-amber-800';
      case 'good':
        return 'border-blue-200 bg-white hover:bg-blue-50 text-blue-800';
      case 'easy':
        return 'border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          <span>Rate Your Active Recall (SM-2 Interval Scheduling)</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Authoritative server calculation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ratings.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={isPending || disabled}
            onClick={() => onRate(r.id)}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all disabled:opacity-50 min-h-[50px] shadow-2xs ${getVariantStyles(
              r.variant
            )}`}
          >
            <div className="font-bold text-xs">{r.label}</div>
            <div className="text-[10px] text-slate-400 font-medium">{r.sublabel}</div>
            <div className="text-[10px] font-mono font-semibold mt-0.5 text-slate-600">
              +{r.preview}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
