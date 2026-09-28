'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Brain,
} from 'lucide-react';
import { recordRevisionReviewAction } from '@/app/dashboard/actions';
import { DifficultyBadge } from '@/components/ui/student-os';

interface RevisionItem {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  difficulty: string;
  topicTitle: string;
  intervalDays: number;
  confidence: string;
  dueAt: string;
  isDue: boolean;
}

export interface CoreCSMistakeItem {
  id: string;
  questionText: string;
  topicTitle: string;
  subjectTitle: string;
  subjectSlug: string;
  missedTimes: number;
  lastMissedAt: string;
}

interface RevisionQueueProps {
  revisions: RevisionItem[];
  coreCsMistakes?: CoreCSMistakeItem[];
}

export function RevisionQueue({ revisions, coreCsMistakes = [] }: RevisionQueueProps) {
  const [items, setItems] = useState(revisions);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  const dueItems = items.filter((i) => i.isDue);
  const upcomingItems = items.filter((i) => !i.isDue);

  const handleReview = (revisionId: string, rating: 'HARD' | 'GOOD' | 'EASY') => {
    startTransition(async () => {
      setNotification(null);
      try {
        const res = await recordRevisionReviewAction(revisionId, rating);
        setItems((prev) =>
          prev.map((i) =>
            i.id === revisionId
              ? {
                  ...i,
                  isDue: false,
                  intervalDays: res.nextIntervalDays,
                  dueAt: new Date(res.nextDue).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }),
                }
              : i
          )
        );
        setNotification(
          `Revision logged as ${rating}! Next interval scheduled in ${res.nextIntervalDays} days. PRS updated.`
        );
      } catch (err) {
        setNotification('Failed to update revision item.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Protocol Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>SuperMemo Spaced Repetition Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Algorithmic Recall Queue
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Every DSA problem you solve is automatically entered into this queue. Scheduled review intervals
            (Day 7, Day 14, Day 30) ensure maximum algorithmic retention during company placement season.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
            <div className="text-2xl font-bold text-emerald-600">{dueItems.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-medium">Due Today</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
            <div className="text-2xl font-bold text-blue-600">{items.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-medium">Total Tracked</div>
          </div>
        </div>
      </div>

      {/* Due Today Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Due for Recall Review</span>
            <span className="text-xs font-medium text-slate-500">({dueItems.length})</span>
          </h3>
        </div>

        {dueItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.topicTitle}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                      {item.problemTitle}
                    </h4>
                  </div>
                  <DifficultyBadge difficulty={item.difficulty} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div>Previous Interval: {item.intervalDays} days</div>
                  <Link
                    href={`/dashboard/dsa/problem/${item.problemSlug}`}
                    className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>View Problem</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Rating Buttons */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Rate Your Recall Confidence:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'HARD')}
                      className="py-1.5 px-2 rounded-lg text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      Hard (+2d)
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'GOOD')}
                      className="py-1.5 px-2 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors disabled:opacity-50"
                    >
                      Good (+10d)
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'EASY')}
                      className="py-1.5 px-2 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors disabled:opacity-50"
                    >
                      Easy (+14d)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">All Due Revisions Completed</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your spaced repetition queue is current. As you solve more problems from the DSA Roadmap,
              they will be scheduled for recall checkpoints here.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Revisions Section */}
      {upcomingItems.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Upcoming Scheduled Reviews</span>
            <span className="text-xs font-medium text-slate-500">({upcomingItems.length})</span>
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Algorithm Problem</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Interval</th>
                  <th className="py-3 px-4">Next Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <Link
                        href={`/dashboard/dsa/problem/${item.problemSlug}`}
                        className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{item.problemTitle}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.topicTitle}</td>
                    <td className="py-3 px-4">
                      <DifficultyBadge difficulty={item.difficulty} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.intervalDays} days</td>
                    <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">{item.dueAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Core CS Concepts Requiring Revision */}
      {coreCsMistakes.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Core CS Concepts Requiring Revision</span>
              <span className="text-xs font-medium text-slate-500">({coreCsMistakes.length})</span>
            </h3>
            <Link
              href="/dashboard/core-cs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Open Core CS Hub</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreCsMistakes.map((mistake) => (
              <div
                key={mistake.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {mistake.subjectTitle}
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      Missed {mistake.missedTimes}x
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {mistake.questionText}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Topic: <span className="font-semibold text-slate-700">{mistake.topicTitle}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Last missed: {mistake.lastMissedAt}
                  </span>
                  <Link
                    href={`/dashboard/core-cs?subject=${mistake.subjectSlug}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Practice Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

