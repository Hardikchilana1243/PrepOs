'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  plan: 'Preparation Plan',
  dsa: 'DSA Roadmap',
  'core-cs': 'Core CS',
  revision: 'Spaced Revision',
  companies: 'Company Hubs',
  assessments: 'Mock Assessments',
  profile: 'Readiness Profile',
  problem: 'Problem',
  attempt: 'Attempt',
  result: 'Results',
};

export function Breadcrumbs({ customItems, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If custom items are passed, use them directly
  let items: BreadcrumbItem[] = [];

  if (customItems && customItems.length > 0) {
    items = customItems;
  } else {
    // Generate dynamically from pathname
    const segments = pathname.split('/').filter(Boolean);
    let accumulatedPath = '';

    items = segments.map((seg, idx) => {
      accumulatedPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const formattedLabel =
        ROUTE_NAME_MAP[seg] ||
        seg
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

      return {
        label: formattedLabel,
        href: isLast ? undefined : accumulatedPath,
      };
    });
  }

  if (items.length <= 1) {
    return null; // Don't show solitary "Dashboard" breadcrumb
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs text-slate-500 font-medium mb-4 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true" />
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 transition-colors truncate max-w-[120px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-400 truncate max-w-[120px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
