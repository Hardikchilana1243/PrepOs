'use client';

import React, { useState, useTransition } from 'react';
import { User, GraduationCap, Code, ShieldCheck, Flame, History, Check, Save } from 'lucide-react';
import { updateProfileAction } from '@/app/dashboard/actions';

interface ProfileData {
  name: string;
  email: string;
  gradYear: number;
  targetDegree: string;
  targetRoleTier: string;
  preferredLang: string;
  streakDays: number;
  prsScore: number;
}

interface ScoreHistoryItem {
  id: string;
  score: number;
  recordedAt: string;
}

interface ProfileEditorProps {
  profile: ProfileData;
  history: ScoreHistoryItem[];
}

export function ProfileEditor({ profile, history }: ProfileEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateProfileAction(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Profile Settings Form */}
      <div className="lg:col-span-6 space-y-6">
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base tracking-tight">Candidate Profile</h2>
                <p className="text-xs text-slate-400">Configure your placement target attributes.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile.streakDays} Day Streak</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={profile.name}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Graduation Year</label>
                <select
                  name="gradYear"
                  defaultValue={profile.gradYear}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value={2024}>2024 (Immediate)</option>
                  <option value={2025}>2025 (Final Year)</option>
                  <option value={2026}>2026 (Pre-Final Year)</option>
                  <option value={2027}>2027 (Sophomore)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Target Role Tier</label>
                <select
                  name="targetRoleTier"
                  defaultValue={profile.targetRoleTier}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="TIER_1_PRODUCT">Tier-1 Product & Tech</option>
                  <option value="UNICORN_STARTUP">High-Growth Unicorn</option>
                  <option value="ENTERPRISE_SYSTEMS">Enterprise Systems</option>
                  <option value="CORE_IT">High-Impact IT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Preferred DSA Language</label>
                <select
                  name="preferredLang"
                  defaultValue={profile.preferredLang}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="C++">C++ (Standard)</option>
                  <option value="Java">Java (Collections)</option>
                  <option value="Python">Python (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Target Degree</label>
                <input
                  name="targetDegree"
                  defaultValue={profile.targetDegree}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4" /> Changes saved successfully!
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isPending ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: PRS Historical Audit Log */}
      <div className="lg:col-span-6 space-y-4">
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Placement Readiness Score Audit Trail</h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Current: {profile.prsScore}%
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Every submission, diagnostic quiz, and revision recalibrates your score on the server with full cryptographic traceability.
          </p>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {history.map((h, idx) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-medium text-white">
                    {idx === 0 ? 'Active PRS Recalibration' : `Audit Check-point #${history.length - idx}`}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Recorded on {h.recordedAt}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-cyan-400">
                    {h.score}%
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">PRS Index</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
