import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// 1. PAGE HEADER
// ============================================================================
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  tag,
  badge,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-1">
        {(tag || badge) && (
          <div className="flex items-center gap-2">
            {tag && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {tag}
              </span>
            )}
            {badge}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ============================================================================
// 2. SECTION HEADER
// ============================================================================
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  count?: number | string;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  actionHref,
  onAction,
  count,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {actionText && (
        actionHref ? (
          <Link
            href={actionHref}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors shrink-0"
          >
            <span>{actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors shrink-0"
          >
            <span>{actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )
      )}
    </div>
  );
}

// ============================================================================
// 3. PROGRESS BAR
// ============================================================================
export interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'emerald' | 'amber' | 'indigo';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = 'md',
  color = 'blue',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
          <span>Progress</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 4. DIFFICULTY BADGE
// ============================================================================
export interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | string;
  size?: 'sm' | 'md';
}

export function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const d = difficulty.toUpperCase();

  const styles = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200/80',
    HARD: 'bg-rose-50 text-rose-700 border-rose-200/80',
  }[d] || 'bg-slate-50 text-slate-700 border-slate-200';

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${styles} ${sizeClass}`}
    >
      {d.charAt(0) + d.slice(1).toLowerCase()}
    </span>
  );
}

// ============================================================================
// 5. STATUS INDICATOR
// ============================================================================
export interface StatusIndicatorProps {
  status: 'SOLVED' | 'ATTEMPTED' | 'BOOKMARKED' | 'UNSOLVED' | string;
  showText?: boolean;
}

export function StatusIndicator({ status, showText = false }: StatusIndicatorProps) {
  const s = status.toUpperCase();

  switch (s) {
    case 'SOLVED':
      return (
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium" title="Solved">
          <CheckCircle2 className="w-4 h-4 fill-emerald-50 text-emerald-600" />
          {showText && <span>Solved</span>}
        </div>
      );
    case 'ATTEMPTED':
      return (
        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium" title="Attempted">
          <Clock className="w-4 h-4" />
          {showText && <span>Attempted</span>}
        </div>
      );
    case 'BOOKMARKED':
      return (
        <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium" title="Bookmarked">
          <Bookmark className="w-4 h-4 fill-blue-500 text-blue-600" />
          {showText && <span>Saved</span>}
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5 text-slate-300 text-xs" title="Not Started">
          <Circle className="w-4 h-4" />
          {showText && <span className="text-slate-400">Todo</span>}
        </div>
      );
  }
}

// ============================================================================
// 6. CARD WRAPPER
// ============================================================================
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm ${
        hoverable ? 'hover:border-slate-300 hover:shadow transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 7. EMPTY STATE
// ============================================================================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
      {icon && <div className="mx-auto w-10 h-10 text-slate-400 mb-3 flex items-center justify-center">{icon}</div>}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
        {description}
      </p>
      {actionText && (
        <div className="mt-4">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
