import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Code2,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InterviewEmptyStateProps {
  type?: 'NO_MISTAKES' | 'NO_TARGETS' | 'NO_RESULTS' | 'BRAND_NEW_STUDENT';
  customTitle?: string;
  customMessage?: string;
}

export function InterviewEmptyState({
  type = 'BRAND_NEW_STUDENT',
  customTitle,
  customMessage,
}: InterviewEmptyStateProps) {
  if (type === 'NO_MISTAKES') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">
          {customTitle || 'No Interview Mistakes Identified'}
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {customMessage ||
            'You do not have any unresolved failed submissions, low diagnostic scores, or overdue revision items. All past attempts are verified clean.'}
        </p>
      </div>
    );
  }

  if (type === 'NO_TARGETS') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">
          {customTitle || 'No Target Companies Configured'}
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {customMessage ||
            'Select target employers in the Company Hubs to enable company-specific interview pattern tracking and dedicated preparation modules.'}
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/companies"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Explore Company Hubs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-xs space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-900">
          {customTitle || 'Start Your Interview Preparation'}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {customMessage ||
            'Choose an algorithmic challenge or Core CS technical drill from the catalog below to launch your first verified practice session.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href="#catalog"
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Code2 className="w-4 h-4" />
          <span>Browse Question Catalog</span>
        </a>

        <Link
          href="/dashboard/companies"
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-colors"
        >
          <Building2 className="w-4 h-4" />
          <span>Target a Recruiter</span>
        </Link>
      </div>
    </div>
  );
}
