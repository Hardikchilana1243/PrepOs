'use client';

import React, { useState } from 'react';
import { Cpu, Database, Play, CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';
import { QuizRunner } from './quiz-runner';

interface QuizData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMin: number;
  totalQuestions: number;
  subjectTitle: string;
  questions: {
    id: string;
    questionText: string;
    orderIndex: number;
    options: {
      id: string;
      optionText: string;
      orderIndex: number;
    }[];
  }[];
}

interface AttemptData {
  id: string;
  quizTitle: string;
  scorePct: number;
  correctQs: number;
  totalQs: number;
  durationSec: number;
  completedAt: string;
}

interface CoreCSViewProps {
  quizzes: QuizData[];
  attempts: AttemptData[];
  initialQuizSlug?: string;
}

export function CoreCSView({ quizzes, attempts, initialQuizSlug }: CoreCSViewProps) {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(() => {
    if (initialQuizSlug) {
      const match = quizzes.find((q) => q.slug === initialQuizSlug);
      return match ? match.id : null;
    }
    return null;
  });

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);

  if (activeQuiz) {
    return (
      <QuizRunner
        quiz={activeQuiz}
        onExit={() => setActiveQuizId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview & Drills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => {
          const isDBMS = quiz.slug.includes('dbms');
          const quizAttempts = attempts.filter((a) => a.quizTitle === quiz.title);
          const bestScore = quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.scorePct)) : null;

          return (
            <div
              key={quiz.id}
              className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      {isDBMS ? <Database className="w-5 h-5" /> : <Cpu className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        {quiz.subjectTitle}
                      </div>
                      <h3 className="font-bold text-white text-base tracking-tight">{quiz.title}</h3>
                    </div>
                  </div>

                  {bestScore !== null && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Best: {Math.round(bestScore)}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {quiz.description || 'Curated high-yield placement diagnostic MCQs focusing on core concepts and interview traps.'}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{quiz.durationMin} Minutes</span>
                  </div>
                  <div>•</div>
                  <div>{quiz.totalQuestions} Questions</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  {quizAttempts.length} previous attempt{quizAttempts.length === 1 ? '' : 's'}
                </div>
                <button
                  onClick={() => setActiveQuizId(quiz.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Screening Drill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Attempts History Table */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Historical Diagnostic Performance</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {attempts.length} Total Diagnostic Attempts
          </span>
        </div>

        {attempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] font-mono text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Screening Drill</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-white">{att.quizTitle}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          att.scorePct >= 60
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {Math.round(att.scorePct)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {att.correctQs} / {att.totalQs} correct
                    </td>
                    <td className="py-3 px-3 text-slate-400">{att.durationSec}s</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{att.completedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No diagnostic attempts recorded yet. Launch a speed drill above to establish your Core CS benchmark!
          </div>
        )}
      </div>
    </div>
  );
}
