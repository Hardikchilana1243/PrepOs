'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { CoreCSTopic } from '@/lib/services/core-cs-curriculum';

interface TopicExplorerProps {
  subjectTitle: string;
  subjectSlug: 'dbms' | 'os';
  topics: CoreCSTopic[];
  onStartDrill: (quizSlug: string) => void;
  activeTopicSlug?: string;
}

export function TopicExplorer({
  subjectTitle,
  subjectSlug,
  topics,
  onStartDrill,
  activeTopicSlug,
}: TopicExplorerProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (activeTopicSlug) {
      const match = topics.find((t) => t.slug === activeTopicSlug);
      if (match) return match.id;
    }
    return topics[0]?.id || '';
  });

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];
  const quizSlug = subjectSlug === 'dbms' ? 'dbms-placement-quiz' : 'os-placement-quiz';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Topic List Sidebar */}
        <div className="w-full md:w-80 shrink-0 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Placement Topics ({topics.length})
          </div>

          <div className="space-y-1.5">
            {topics.map((t, idx) => {
              const isSelected = t.id === selectedTopic.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500/80 text-blue-950 ring-1 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate leading-tight">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {t.questionIndices.length} High-Yield MCQs
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Content Panel */}
        {selectedTopic && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
            {/* Header */}
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                    {subjectTitle}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    Topic {topics.findIndex((t) => t.id === selectedTopic.id) + 1} of {topics.length}
                  </span>
                </div>

                <button
                  onClick={() => onStartDrill(quizSlug)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Subject Drill</span>
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {selectedTopic.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {selectedTopic.shortDescription}
              </p>
            </div>

            {/* Placement Relevance Pill */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-blue-800">Placement Frequency: </span>
                {selectedTopic.placementRelevance}
              </div>
            </div>

            {/* Core Placement Concepts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Essential Placement Concepts</span>
              </div>

              <div className="space-y-2">
                {selectedTopic.keyConcepts.map((concept, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{concept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Traps & Placement Advice */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Interview Pitfalls & Tips</span>
              </div>

              <div className="space-y-2">
                {selectedTopic.interviewTips.map((tip, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Drill Launcher */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Covers questions in the timed <span className="font-semibold text-slate-700">{subjectTitle} speed drill</span>.
              </div>
              <button
                onClick={() => onStartDrill(quizSlug)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group"
              >
                <span>Take 10-Question Diagnostic</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
