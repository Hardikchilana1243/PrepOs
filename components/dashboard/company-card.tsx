import React from 'react';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';

interface CompanyCardProps {
  companies: {
    slug: string;
    name: string;
    logoUrl: string | null;
    topPattern: string;
    problemCount: number;
  }[];
}

export function CompanyCard({ companies }: CompanyCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Company Hubs
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {companies.length} Firms
          </span>
        </div>

        {/* Company Pills */}
        <div className="space-y-2 mt-3">
          {companies.slice(0, 3).map((comp) => (
            <Link
              key={comp.slug}
              href={`/dashboard/companies?company=${comp.slug}`}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-200 transition-all text-xs group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                {comp.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                {comp.topPattern}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/companies"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group"
        >
          <span>All Company Patterns</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
