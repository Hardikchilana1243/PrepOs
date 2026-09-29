'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { CoreCSTopic } from '@/lib/services/core-cs-curriculum';

interface TopicSectionProps {
  subjectTitle: string;
  subjectSlug: 'dbms' | 'os';
  topics: CoreCSTopic[];
  onStartQuiz: (quizSlug: string) => void;
  initialTopicSlug?: string;
}

export function TopicSection({
  subjectTitle,
  subjectSlug,
  topics,
  onStartQuiz,
  initialTopicSlug,
}: TopicSectionProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (initialTopicSlug) {
      const match = topics.find((t) => t.slug === initialTopicSlug);
      if (match) return match.id;
    }
    return topics[0]?.id || '';
  });

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];
  const quizSlug = subjectSlug === 'dbms' ? 'dbms-placement-quiz' : 'os-placement-quiz';

  if (!topics || topics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
        No topics configured for this subject yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Topic List Sidebar / Selector */}
        <div className="w-full md:w-80 shrink-0 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {subjectTitle} Curriculum ({topics.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {topics.map((t, idx) => {
              const isSelected = t.id === selectedTopic.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 text-xs ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate leading-snug">{t.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate font-normal">
                      {t.questionIndices.length} High-Yield Questions
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Content Panel */}
        {selectedTopic && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Topic Header & Direct Action */}
            <div className="pb-4 border-b border-slate-100 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {subjectTitle}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    Topic {topics.findIndex((t) => t.id === selectedTopic.id) + 1} of{' '}
                    {topics.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onStartQuiz(quizSlug)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Subject Drill</span>
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {selectedTopic.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedTopic.shortDescription}
              </p>
            </div>

            {/* Placement Relevance Pill */}
            <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-950">Placement Frequency: </span>
                <span>{selectedTopic.placementRelevance}</span>
              </div>
            </div>

            {/* Essential Placement Concepts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Essential Placement Concepts</span>
              </div>

              <div className="space-y-2">
                {selectedTopic.keyConcepts.map((concept, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-sans"
                  >
                    <span className="font-semibold text-slate-900 mr-1.5">
                      {concept.split(':')[0]}:
                    </span>
                    <span>{concept.split(':').slice(1).join(':')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Yield Interview Tips */}
            {selectedTopic.interviewTips.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Interview Tips & Gotchas</span>
                </div>

                <div className="space-y-1.5">
                  {selectedTopic.interviewTips.map((tip, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/70 text-xs text-amber-950 leading-relaxed flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
