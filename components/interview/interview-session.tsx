'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Bookmark,
  FileText,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Building2,
  X,
  Code2,
} from 'lucide-react';
import { ProblemWorkspace } from '@/components/dsa/problem-workspace';
import { toggleInterviewBookmarkAction, recordInterviewSessionAction } from '@/app/dashboard/interview/actions';

interface InterviewSessionProps {
  problem: any;
  userState: any;
}

export function InterviewSession({ problem, userState }: InterviewSessionProps) {
  const router = useRouter();

  // 1. Timer State (Stopwatch & Countdown)
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerMode, setTimerMode] = useState<'STOPWATCH' | 'COUNTDOWN'>('STOPWATCH');
  const [countdownMinutes, setCountdownMinutes] = useState(45);

  // 2. Candidate Scratchpad Notes
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState('');

  // 3. Bookmark & Review State
  const [isBookmarked, setIsBookmarked] = useState(userState?.isBookmarked || false);
  const [isMarkedForReview, setIsMarkedForReview] = useState(userState?.isInRevision || false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Interval timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Format display time
  const formatTimerDisplay = () => {
    if (timerMode === 'COUNTDOWN') {
      const totalSec = countdownMinutes * 60;
      const remainingSec = Math.max(0, totalSec - seconds);
      const m = Math.floor(remainingSec / 60);
      const s = remainingSec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await toggleInterviewBookmarkAction(problem.id);
      setIsBookmarked(res.isBookmarked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmExit = async () => {
    // Record session before navigating
    try {
      await recordInterviewSessionAction(problem.id, seconds, candidateNotes);
    } catch (e) {
      console.error(e);
    }
    router.push('/dashboard/interview');
  };

  return (
    <div className="space-y-4">
      {/* 1. Distraction-Free Interview Session Masthead */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Session Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExitModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="Exit Interview Session"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Technical Interview Practice
                </span>

                {problem.difficulty && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {problem.difficulty}
                  </span>
                )}

                {problem.topicTitle && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {problem.topicTitle}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{problem.title}</span>
                {problem.companies?.length > 0 && (
                  <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{problem.companies.join(', ')}</span>
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Right: Controls Strip (Timer + Notes + Bookmark + Exit) */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Live Interview Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-mono font-bold text-white tracking-wider">
                {formatTimerDisplay()}
              </span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Candidate Notes Toggle */}
            <button
              type="button"
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                isNotesOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Interview Notes</span>
            </button>

            {/* Bookmark Control */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                isBookmarked
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark for Review'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-300' : ''}`} />
            </button>

            {/* Exit Interview Button */}
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <span>Exit Practice</span>
            </button>
          </div>
        </div>

        {/* 2. Collapsible Candidate Interview Notes Panel */}
        {isNotesOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Candidate Scratchpad (Approach, Invariants &amp; Complexities)</span>
              <span className="text-[11px] text-slate-500">Auto-saved to session metadata</span>
            </div>
            <textarea
              rows={3}
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Jot down preliminary thoughts, edge cases (e.g. empty array, duplicates, integer overflow), and planned time/space complexity before coding..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 3. Authoritative Problem Workspace */}
      <ProblemWorkspace problem={problem} userState={userState} />

      {/* 4. Exit Confirmation Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">End Interview Session?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your practice duration of{' '}
                <strong className="text-slate-900 font-mono">
                  {Math.floor(seconds / 60)}m {seconds % 60}s
                </strong>{' '}
                and scratchpad notes will be recorded in your authenticated interview history.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Continue Practice
              </button>

              <button
                type="button"
                onClick={handleConfirmExit}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
              >
                Confirm Exit &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
