'use client';

import React, { useState, useTransition } from 'react';
import { User, GraduationCap, Code, ShieldCheck, Flame, History, Check, Save } from 'lucide-react';
import { updateProfileAction } from '@/app/dashboard/actions';
import { ProgressBar } from '@/components/ui/student-os';

interface ProfileData {
  name: string;
  email: string;
  gradYear: number;
  targetDegree: string;
  targetRoleTier: string;
  preferredLang: string;
  streakDays: number;
  prsScore: number;
  dsaScore?: number;
  coreCsScore?: number;
  oaScore?: number;
  consistencyScore?: number;
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
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || 'Failed to save changes.');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Profile Settings Form */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base tracking-tight">Candidate Profile</h2>
                <p className="text-xs text-slate-500">Configure your placement target attributes.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{profile.streakDays} Day Streak</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={profile.name}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Graduation Year</label>
                <select
                  name="gradYear"
                  defaultValue={profile.gradYear}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value={2024}>2024 (Immediate)</option>
                  <option value={2025}>2025 (Final Year)</option>
                  <option value={2026}>2026 (Pre-Final Year)</option>
                  <option value={2027}>2027 (Sophomore)</option>
                  <option value={2028}>2028 (Freshman)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Role Tier</label>
                <select
                  name="targetRoleTier"
                  defaultValue={profile.targetRoleTier}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="PRODUCT_TIER_1">Tier-1 Product & Tech Giants</option>
                  <option value="TECH_TIER_2">Tier-2 High-Growth Tech & Fintech</option>
                  <option value="SERVICE_TIER_3">Tier-3 IT Services & Drives</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Preferred DSA Language</label>
                <select
                  name="preferredLang"
                  defaultValue={profile.preferredLang}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="CPP">C++ (Standard)</option>
                  <option value="JAVA">Java (Collections)</option>
                  <option value="PYTHON">Python (Standard)</option>
                  <option value="JAVASCRIPT">JavaScript (Node/V8)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Degree</label>
                <input
                  name="targetDegree"
                  defaultValue={profile.targetDegree}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {saveError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4" /> Changes saved successfully!
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-all"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Placement Readiness Score Audit Trail</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Current: {profile.prsScore}%
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Every submission, diagnostic quiz, and spaced revision updates your score on the server with full audit traceability.
          </p>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {history.map((h, idx) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">
                    {idx === 0 ? 'Active PRS Recalibration' : `Audit Check-point #${history.length - idx}`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Recorded on {h.recordedAt}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {h.score}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">PRS Index</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
