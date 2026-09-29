'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Building2 } from 'lucide-react';
import { CompanyCard, CompanyCardData } from './company-card';

interface CompanyDirectoryProps {
  companies: CompanyCardData[];
  selectedSlug: string;
  onSelectCompany: (slug: string) => void;
}

export function CompanyDirectory({
  companies,
  selectedSlug,
  onSelectCompany,
}: CompanyDirectoryProps) {
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tiers = ['ALL', 'Tier-1 Tech', 'Product', 'Enterprise', 'High-Impact IT'];

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (selectedTier !== 'ALL' && c.tier.toLowerCase() !== selectedTier.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPattern = c.topPattern?.toLowerCase().includes(q);
        if (!matchesName && !matchesPattern) return false;
      }
      return true;
    });
  }, [companies, selectedTier, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Tier Filter Pills */}
      <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-subtle">
        {tiers.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSelectedTier(t)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedTier === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by company name or pattern..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-subtle"
        />
      </div>

      {/* Company Cards List */}
      <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              isSelected={c.slug === selectedSlug}
              onSelect={onSelectCompany}
            />
          ))
        ) : (
          <div className="p-6 text-center rounded-xl bg-white border border-slate-200 text-xs text-slate-400">
            No companies found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
}
