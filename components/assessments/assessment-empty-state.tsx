import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight, HelpCircle } from 'lucide-react';

interface AssessmentEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function AssessmentEmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: AssessmentEmptyStateProps) {
  return (
    <div
      className={`p-6 sm:p-8 text-center rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>

      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {(actionLabel && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs min-h-[38px]"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors min-h-[38px]"
            >
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
