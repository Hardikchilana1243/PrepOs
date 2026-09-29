'use client';

import React from 'react';
import { Database, Cpu, BookOpen, Play, CheckCircle2, Clock } from 'lucide-react';
import { SubjectStats } from '@/lib/services/core-cs';
import { ProgressBar } from '@/components/ui/student-os';

interface SubjectCardProps {
  subject: SubjectStats;
  onOpenTopics: (subjectSlug: string) => void;
  onStartQuiz: (quizSlug: string) => void;
}

export function SubjectCard({
  subject,
  onOpenTopics,
  onStartQuiz,
}: SubjectCardProps) {
  const isDBMS = subject.slug === 'dbms';

  const getStatusBadge = () => {
    if (subject.bestScorePct !== null) {
      if (subject.bestScorePct >= 70) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Best: {subject.bestScorePct}%</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>Best: {subject.bestScorePct}%</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
        <span>Unattempted</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
      {/* Top Header & Subject Identity */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isDBMS
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {isDBMS ? <Database className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Subject
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {subject.title}
              </h2>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {subject.description}
        </p>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-center font-mono text-xs">
          <div>
            <div className="font-bold text-slate-900">{subject.attemptsCount}</div>
            <div className="text-[10px] text-slate-400 uppercase">Attempts</div>
          </div>

          <div className="border-x border-slate-200">
            <div className="font-bold text-slate-900">
              {subject.avgScorePct !== null ? `${subject.avgScorePct}%` : '—'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">Avg Score</div>
          </div>

          <div>
            <div className="font-bold text-slate-900">{subject.topicsCount}</div>
            <div className="text-[10px] text-slate-400 uppercase">Topics</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenTopics(subject.slug)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Syllabus & Topics</span>
        </button>

        <button
          type="button"
          onClick={() => onStartQuiz(subject.quizSlug)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 ${
            isDBMS
              ? 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
              : 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{subject.attemptsCount > 0 ? 'Retake Quiz' : 'Take Quiz'}</span>
        </button>
      </div>
    </div>
  );
}
