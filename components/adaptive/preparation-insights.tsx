'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Flag,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { PreparationInsightItem } from '@/lib/services/adaptive-preparation';
import { Badge } from '@/components/ui/student-os';

interface PreparationInsightsProps {
  insights: PreparationInsightItem[];
  className?: string;
}

export function PreparationInsights({
  insights,
  className = '',
}: PreparationInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'gap':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Flag className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'strength':
        return 'success';
      case 'risk':
        return 'warning';
      case 'gap':
        return 'danger';
      default:
        return 'primary';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <Lightbulb className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Preparation Insights
          </h3>
          <p className="text-xs text-slate-500">
            Real data observations derived from curriculum progress and diagnostic drills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={getBadgeVariant(insight.type) as any} size="sm">
                  <span className="flex items-center gap-1">
                    {getInsightIcon(insight.type)}
                    <span>{insight.category}</span>
                  </span>
                </Badge>
              </div>

              <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                {insight.title}
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed">
                {insight.detail}
              </p>
            </div>

            {insight.href && insight.actionLabel && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Link
                  href={insight.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>{insight.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
