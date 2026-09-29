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
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Company Patterns
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {companies.length} Firms
          </span>
        </div>

        {/* Company Pills */}
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Top Hiring Tracks
          </div>
          <div className="space-y-1.5">
            {companies.slice(0, 3).map((comp) => (
              <Link
                key={comp.slug}
                href={`/dashboard/companies?company=${comp.slug}`}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors text-xs group"
              >
                <span className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                  {comp.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[110px] ml-2 shrink-0">
                  {comp.topPattern}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/companies"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <span>All Company Hubs</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
