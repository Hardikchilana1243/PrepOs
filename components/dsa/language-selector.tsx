'use client';

import React from 'react';
import { RotateCcw, Code } from 'lucide-react';
import { SupportedLanguage } from '@/lib/services/starter-code';

interface LanguageSelectorProps {
  selectedLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  onResetCode: () => void;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedLang,
  onSelectLang,
  onResetCode,
  disabled = false,
}: LanguageSelectorProps) {
  const languages: { id: SupportedLanguage; label: string }[] = [
    { id: 'PYTHON', label: 'Python 3' },
    { id: 'CPP', label: 'C++ 17' },
    { id: 'JAVA', label: 'Java 17' },
    { id: 'JAVASCRIPT', label: 'JavaScript' },
  ];

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs shrink-0 select-none">
      {/* Language Tabs */}
      <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
        {languages.map((lang) => (
          <button
            key={lang.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectLang(lang.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 ${
              selectedLang === lang.id
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Reset Starter Code Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onResetCode}
        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors disabled:opacity-50"
        title="Reset to default starter code template"
      >
        <RotateCcw className="w-3 h-3 text-slate-400" />
        <span>Reset</span>
      </button>
    </div>
  );
}
