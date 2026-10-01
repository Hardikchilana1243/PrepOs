'use client';

// ============================================================================
// PREPOS SEARCH RESULT ROW COMPONENT
// Dense, accessible result row with icons, badges, and keyboard focus states
// ============================================================================

import React from 'react';
import {
  Code2,
  Cpu,
  Building2,
  Target,
  RotateCcw,
  LayoutDashboard,
  CalendarDays,
  User,
  ShieldCheck,
  Sparkles,
  CornerDownLeft,
} from 'lucide-react';
import { SearchResultItem } from '@/lib/services/global-search';

interface SearchResultRowProps {
  item: SearchResultItem;
  isSelected: boolean;
  onSelect: (item: SearchResultItem) => void;
  onMouseEnter: () => void;
}

export function SearchResultRow({
  item,
  isSelected,
  onSelect,
  onMouseEnter,
}: SearchResultRowProps) {
  const getIcon = () => {
    switch (item.iconName) {
      case 'Code2':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'Target':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'RotateCcw':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-4 h-4 text-slate-700" />;
      case 'CalendarDays':
        return <CalendarDays className="w-4 h-4 text-blue-600" />;
      case 'User':
        return <User className="w-4 h-4 text-slate-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeStyles = (variant?: SearchResultItem['badgeVariant']) => {
    switch (variant) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
      className={`w-full p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-left min-h-[44px] ${
        isSelected
          ? 'bg-blue-50/90 text-blue-900 ring-1 ring-blue-200/90'
          : 'hover:bg-slate-50 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
          {getIcon()}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {item.title}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {item.subtitle}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {item.badgeText && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getBadgeStyles(
              item.badgeVariant
            )}`}
          >
            {item.badgeText}
          </span>
        )}

        {isSelected && (
          <CornerDownLeft className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block animate-in fade-in" />
        )}
      </div>
    </div>
  );
}
