'use client';

// ============================================================================
// PREPOS SEARCH RESULTS COMPONENT
// Grouped search results with unified keyboard navigation mapping
// ============================================================================

import React, { useMemo } from 'react';
import { SearchResultItem } from '@/lib/services/global-search';
import { SearchResultGroup } from './search-result-group';
import { SearchResultRow } from './search-result-row';

interface SearchResultsProps {
  items: SearchResultItem[];
  selectedIndex: number;
  onSelect: (item: SearchResultItem) => void;
  onHighlight: (index: number) => void;
}

export function SearchResults({
  items,
  selectedIndex,
  onSelect,
  onHighlight,
}: SearchResultsProps) {
  // Map each item to its index in the original flat items array for keyboard navigation
  const groups = useMemo(() => {
    const dsaItems: Array<{ item: SearchResultItem; flatIndex: number }> = [];
    const coreCsItems: Array<{ item: SearchResultItem; flatIndex: number }> = [];
    const companyItems: Array<{ item: SearchResultItem; flatIndex: number }> = [];
    const assessmentItems: Array<{ item: SearchResultItem; flatIndex: number }> = [];
    const revisionItems: Array<{ item: SearchResultItem; flatIndex: number }> = [];
    const navAndActionItems: Array<{ item: SearchResultItem; flatIndex: number }> = [];

    items.forEach((item, flatIndex) => {
      switch (item.entityType) {
        case 'DSA_PROBLEM':
        case 'DSA_TOPIC':
          dsaItems.push({ item, flatIndex });
          break;
        case 'CORE_CS':
          coreCsItems.push({ item, flatIndex });
          break;
        case 'COMPANY':
          companyItems.push({ item, flatIndex });
          break;
        case 'ASSESSMENT':
          assessmentItems.push({ item, flatIndex });
          break;
        case 'REVISION':
          revisionItems.push({ item, flatIndex });
          break;
        case 'NAVIGATION':
        case 'ACTION':
        default:
          navAndActionItems.push({ item, flatIndex });
          break;
      }
    });

    return [
      { title: 'DSA Problems & Topics', list: dsaItems },
      { title: 'Core CS Foundations', list: coreCsItems },
      { title: 'Company Preparation Hubs', list: companyItems },
      { title: 'Mock Assessments & OAs', list: assessmentItems },
      { title: 'Spaced Revision Queue', list: revisionItems },
      { title: 'Navigation & Quick Actions', list: navAndActionItems },
    ].filter((g) => g.list.length > 0);
  }, [items]);

  return (
    <div className="space-y-3 p-2">
      {groups.map((group) => (
        <SearchResultGroup key={group.title} title={group.title} count={group.list.length}>
          {group.list.map(({ item, flatIndex }) => (
            <SearchResultRow
              key={item.id}
              item={item}
              isSelected={flatIndex === selectedIndex}
              onSelect={onSelect}
              onMouseEnter={() => onHighlight(flatIndex)}
            />
          ))}
        </SearchResultGroup>
      ))}
    </div>
  );
}
