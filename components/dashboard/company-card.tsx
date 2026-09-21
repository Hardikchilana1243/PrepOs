import React from 'react';
import Link from 'next/link';
import { Building2, ArrowUpRight } from 'lucide-react';

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
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Target Company Hubs</span>
          </div>
          <Link
            href="/dashboard/companies"
            className="text-xs font-medium text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            All 10 Hubs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Curated patterns mapped directly to real seeded assessment algorithms.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {companies.map((comp) => (
            <Link
              key={comp.slug}
              href={`/dashboard/companies?company=${comp.slug}`}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                {comp.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {comp.topPattern}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                {comp.problemCount} mapped problems
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
