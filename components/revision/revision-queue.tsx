'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { recordRevisionReviewAction } from '@/app/dashboard/actions';

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

interface RevisionQueueProps {
  revisions: RevisionItem[];
}

export function RevisionQueue({ revisions }: RevisionQueueProps) {
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
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Protocol Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
            <Brain className="w-4 h-4" />
            <span>SUPERMEMO-DERIVED COGNITIVE RECALL PROTOCOL</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Placement Spaced Repetition Queue
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Every DSA problem you solve is automatically entered into this queue. Scheduled review intervals
            (Day 7, Day 14, Day 30) ensure maximum algorithmic retention during company OA season.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center font-mono">
            <div className="text-2xl font-bold text-emerald-400">{dueItems.length}</div>
            <div className="text-[10px] text-slate-400 uppercase">Due Today</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center font-mono">
            <div className="text-2xl font-bold text-cyan-400">{items.length}</div>
            <div className="text-[10px] text-slate-400 uppercase">In Active Queue</div>
          </div>
        </div>
      </div>

      {/* Due Today Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Due for Review</span>
          <span className="text-xs font-mono text-slate-500">({dueItems.length})</span>
        </h3>

        {dueItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#0F172A] border border-emerald-500/30 p-5 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase">
                      {item.topicTitle}
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
                      {item.problemTitle}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    Previous Interval: {item.intervalDays} days
                  </div>
                  <Link
                    href={`/dashboard/dsa?problem=${item.problemSlug}`}
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                  >
                    View Problem <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Rating Buttons */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Recall Confidence:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'HARD')}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                    >
                      Hard (+2d)
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'GOOD')}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
                    >
                      Good (+10d)
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'EASY')}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                    >
                      Easy (+14d)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Due Revisions Completed</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your spaced repetition queue is current! As you solve more problems from the DSA Roadmap,
              they will be scheduled for recall checkpoints here.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Revisions Section */}
      {upcomingItems.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Upcoming Scheduled Reviews</span>
            <span className="text-xs font-mono text-slate-500">({upcomingItems.length})</span>
          </h3>

          <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] font-mono text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Algorithm Problem</th>
                  <th className="py-2.5 px-4">Topic</th>
                  <th className="py-2.5 px-4">Difficulty</th>
                  <th className="py-2.5 px-4">Interval</th>
                  <th className="py-2.5 px-4">Next Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {upcomingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-white">
                      <Link
                        href={`/dashboard/dsa?problem=${item.problemSlug}`}
                        className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{item.problemTitle}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-500" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{item.topicTitle}</td>
                    <td className="py-3 px-4 uppercase text-slate-400">{item.difficulty}</td>
                    <td className="py-3 px-4 text-slate-400">{item.intervalDays} days</td>
                    <td className="py-3 px-4 text-emerald-400">{item.dueAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
