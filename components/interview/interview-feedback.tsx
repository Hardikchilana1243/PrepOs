'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { addMistakeToRevisionAction } from '@/app/dashboard/interview/actions';

interface InterviewFeedbackProps {
  problemId: string;
  problemTitle: string;
  topicTitle: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  passedTests: number;
  totalTests: number;
  durationSec: number;
  executionTimeMs?: number | null;
  previousAttemptsCount: number;
  isInRevision?: boolean;
}

export function InterviewFeedback({
  problemId,
  problemTitle,
  topicTitle,
  status,
  passedTests,
  totalTests,
  durationSec,
  executionTimeMs,
  previousAttemptsCount,
  isInRevision = false,
}: InterviewFeedbackProps) {
  const [inRevision, setInRevision] = useState(isInRevision);
  const [loading, setLoading] = useState(false);

  const isAccepted = status === 'ACCEPTED';
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const handleAddToRevision = async () => {
    setLoading(true);
    try {
      await addMistakeToRevisionAction(problemId);
      setInRevision(true);
    } catch (err) {
      console.error('Failed to add to revision:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl mx-auto">
      {/* 1. Header Icon and Title */}
      <div className="text-center space-y-2">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs border ${
            isAccepted
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}
        >
          {isAccepted ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <XCircle className="w-8 h-8" />
          )}
        </div>

        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
            isAccepted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {status.replace('_', ' ')}
        </span>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          {isAccepted ? 'Interview Challenge Solved' : 'Interview Practice Complete'}
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isAccepted
            ? `Verified solution recorded for ${problemTitle}. Algorithmic pattern mastery reinforced.`
            : `Test cases did not pass fully. Weakness identified in ${topicTitle} for targeted review.`}
        </p>
      </div>

      {/* 2. Concrete Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Test Cases
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {passedTests} / {totalTests}
          </div>
          <div className="text-[10px] text-slate-400">
            {totalTests > 0 ? `${Math.round((passedTests / totalTests) * 100)}% Pass` : 'Evaluated'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Session Duration
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {formatTime(durationSec)}
          </div>
          <div className="text-[10px] text-slate-400">Interview timer</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Runtime
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {executionTimeMs ? `${executionTimeMs}ms` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400">Execution Speed</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Attempts
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {previousAttemptsCount + 1}
          </div>
          <div className="text-[10px] text-slate-400">Audited attempts</div>
        </div>
      </div>

      {/* 3. Revision Integration Option */}
      <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Spaced Repetition Schedule</span>
          </div>
          <p className="text-[11px] text-indigo-700">
            {inRevision
              ? 'This question is currently active in your SM-2 spaced revision queue.'
              : 'Add this problem to your SM-2 queue to schedule periodic recall intervals.'}
          </p>
        </div>

        {!inRevision ? (
          <button
            type="button"
            onClick={handleAddToRevision}
            disabled={loading}
            className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Revision</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scheduled</span>
          </span>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          href="/dashboard/interview"
          className="w-full sm:w-auto flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <span>Return to Interview Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/dashboard/readiness"
          className="w-full sm:w-auto flex-1 min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>View Readiness Cockpit</span>
        </Link>
      </div>
    </div>
  );
}
