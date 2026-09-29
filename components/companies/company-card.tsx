import React from 'react';
import { Building2, Layers, CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';

export interface CompanyCardData {
  id: string;
  slug: string;
  name: string;
  tier: string;
  topPattern?: string;
  problemCount: number;
  solvedCount: number;
  assessmentCount: number;
  assessmentAttempted: boolean;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

interface CompanyCardProps {
  company: CompanyCardData;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

export function CompanyCard({ company, isSelected, onSelect }: CompanyCardProps) {
  const getStatusBadge = () => {
    if (company.status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    }
    if (company.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        <Circle className="w-2.5 h-2.5 text-slate-400" />
        <span>Not Started</span>
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(company.slug)}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/20 shadow-sm'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-subtle'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
          <h3 className="font-bold text-slate-900 text-sm truncate">{company.name}</h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          {company.tier}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate max-w-[160px] text-slate-600 text-[11px]">
          {company.topPattern || 'Core Algorithms'}
        </span>
        <span className="font-mono text-xs font-semibold text-slate-800">
          {company.solvedCount}/{company.problemCount} Solved
        </span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        {getStatusBadge()}

        <span className="text-[11px] font-medium text-blue-600 flex items-center gap-0.5 group">
          <span>Explore</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
