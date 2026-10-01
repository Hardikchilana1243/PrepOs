'use client';

// ============================================================================
// PREPOS REVISION SECTION COMPONENT
// Collapsible, structured queue section container with counts & rationale
// ============================================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { RevisionQueueItem } from '@/lib/services/revision';
import { RevisionItemRow } from './revision-item-row';

interface RevisionSectionProps {
  title: string;
  icon: LucideIcon;
  badgeCount: number;
  badgeVariant?: 'amber' | 'rose' | 'slate' | 'emerald';
  description: string;
  items: RevisionQueueItem[];
  onOpenWorkspace: (item: RevisionQueueItem) => void;
  defaultExpanded?: boolean;
}

export function RevisionSection({
  title,
  icon: Icon,
  badgeCount,
  badgeVariant = 'slate',
  description,
  items,
  onOpenWorkspace,
  defaultExpanded = true,
}: RevisionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (items.length === 0) return null;

  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50/70 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border font-mono ${getBadgeStyle()}`}
              >
                {badgeCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{description}</p>
          </div>
        </div>

        <div className="text-slate-400 p-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Item List */}
      {isExpanded && (
        <div className="space-y-2.5 pl-1 sm:pl-2 animate-in fade-in duration-150">
          {items.map((item) => (
            <RevisionItemRow
              key={item.id}
              item={item}
              onOpenWorkspace={onOpenWorkspace}
            />
          ))}
        </div>
      )}
    </div>
  );
}
