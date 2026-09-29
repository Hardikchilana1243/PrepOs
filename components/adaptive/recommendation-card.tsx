'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Unlock,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/student-os';
import { AdaptiveRecommendation } from '@/lib/services/adaptive-preparation';

interface RecommendationCardProps {
  recommendation: AdaptiveRecommendation;
  className?: string;
  showPlanLink?: boolean;
}

export function RecommendationCard({
  recommendation,
  className = '',
  showPlanLink = true,
}: RecommendationCardProps) {
  const isCritical = recommendation.priority === 'CRITICAL';
  const isHigh = recommendation.priority === 'HIGH';

  return (
    <section
      aria-labelledby="rec-heading"
      className={`relative overflow-hidden rounded-xl border bg-white p-5 sm:p-6 shadow-xs transition-all ${
        isCritical
          ? 'border-rose-300 ring-1 ring-rose-200/60'
          : isHigh
          ? 'border-amber-300 ring-1 ring-amber-200/50'
          : 'border-slate-200/90'
      } ${className}`}
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isCritical
            ? 'bg-rose-500'
            : isHigh
            ? 'bg-amber-500'
            : 'bg-blue-600'
        }`}
      />

      {/* Header meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Recommended Next Step
          </span>
          {isCritical ? (
            <Badge variant="danger" size="sm" dot>
              Urgent Focus
            </Badge>
          ) : isHigh ? (
            <Badge variant="warning" size="sm" dot>
              High Impact
            </Badge>
          ) : (
            <Badge variant="primary" size="sm">
              Progression
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>~{recommendation.estimatedMinutes} mins effort</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-4 space-y-3">
        <div>
          <h2
            id="rec-heading"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900"
          >
            {recommendation.actionTitle}
          </h2>
          <p className="text-xs font-semibold text-blue-700 mt-0.5">
            {recommendation.title}
          </p>
        </div>

        {/* Why this was selected */}
        <div className="rounded-lg bg-slate-50 border border-slate-200/70 p-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Why this was selected: </span>
              <span>{recommendation.reason}</span>
            </div>
          </div>
        </div>

        {/* Impact & Unlocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="flex items-start gap-2 text-slate-600">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-slate-800">Improves: </span>
              <span>{recommendation.metricImproved}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Unlock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-slate-800">Unlocks: </span>
              <span>{recommendation.unlockDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={recommendation.href}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>{recommendation.ctaText}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>

        {showPlanLink && (
          <Link
            href="/dashboard/plan"
            className="inline-flex items-center justify-center min-h-[44px] px-3 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <span>View Full Preparation Plan</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        )}
      </div>
    </section>
  );
}
