'use client';

import React, { useState, useTransition } from 'react';
import { User, GraduationCap, Code, ShieldCheck, Flame, Check, Save } from 'lucide-react';
import { updateProfileAction } from '@/app/dashboard/actions';

interface ProfileData {
  name: string;
  email: string;
  gradYear: number;
  targetDegree: string;
  targetRoleTier: string;
  preferredLang: string;
  streakDays: number;
}

interface ProfileEditorProps {
  profile: ProfileData;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
              Candidate Placement Profile
            </h2>
            <p className="text-xs text-slate-500">Configure your graduation year and target hiring tier.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{profile.streakDays} Day Streak</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-all min-h-[40px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isPending ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
