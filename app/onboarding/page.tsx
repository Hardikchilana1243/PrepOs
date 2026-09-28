'use client';

import React, { useState } from 'react';
import { completeOnboardingAction } from './actions';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Brain,
} from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [gradYear, setGradYear] = useState<number>(2026);
  const [targetDegree, setTargetDegree] = useState<string>('B.Tech / B.E.');
  const [targetRoleTier, setTargetRoleTier] = useState<string>('PRODUCT_TIER_1');
  const [preferredLang, setPreferredLang] = useState<'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT'>('CPP');

  // Diagnostic State (Step 2)
  const [dsaAnswer, setDsaAnswer] = useState<string>('O(log N)');
  const [dbmsAnswer, setDbmsAnswer] = useState<string>('Atomicity');
  const [osAnswer, setOsAnswer] = useState<string>('Shared Memory');

  const handleNext = () => {
    setError(null);
    if (!gradYear || gradYear < 2023 || gradYear > 2032) {
      setError('Please choose a valid graduation year.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await completeOnboardingAction({
        gradYear,
        targetDegree,
        targetRoleTier,
        preferredLang,
        diagnosticAnswers: {
          dsaAnswer,
          dbmsAnswer,
          osAnswer,
        },
      });

      if (res.success) {
        window.location.href = '/dashboard';
      } else {
        setError(res.error || 'Failed to submit profile.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit profile.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600 selection:text-white font-sans">
      {/* Header Container */}
      <div className="w-full max-w-xl text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Placement Diagnostic & Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Initialize Your Placement Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Calibrate your roadmap and daily mission cadence.
        </p>

        {/* 2-Step Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
              Student Profile
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200" />

          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
              Baseline Diagnostic
            </span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: STUDENT PROFILE */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Academic & Placement Goals</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target company tier will tailor the difficulty of your daily missions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="gradYear">
                  Graduation Year
                </label>
                <select
                  id="gradYear"
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value={2024}>2024 (Immediate Placement)</option>
                  <option value={2025}>2025 (Final Year)</option>
                  <option value={2026}>2026 (Pre-Final Year / Internships)</option>
                  <option value={2027}>2027 (Sophomore / Foundations)</option>
                  <option value={2028}>2028 (Freshman)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="targetDegree">
                  Degree / Program
                </label>
                <select
                  id="targetDegree"
                  value={targetDegree}
                  onChange={(e) => setTargetDegree(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value="B.Tech / B.E.">B.Tech / B.E. (CSE / IT / ECE)</option>
                  <option value="BCA">BCA (Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="M.Tech">M.Tech / M.E.</option>
                  <option value="B.Sc CS">B.Sc Computer Science</option>
                  <option value="Other">Other Technical Degree</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Target Company Tier
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'PRODUCT_TIER_1',
                    title: 'Tier 1: Product & Tech Giants',
                    desc: 'Amazon, Microsoft, Google, Flipkart, Walmart (Advanced DSA + System Fundamentals)',
                  },
                  {
                    id: 'TECH_TIER_2',
                    title: 'Tier 2: High-Growth Tech & Fintech',
                    desc: 'Fast-paced product firms, unicorn startups (Medium DSA, SQL, OOP)',
                  },
                  {
                    id: 'SERVICE_TIER_3',
                    title: 'Tier 3: IT Services & National Drives',
                    desc: 'TCS NQT, Infosys SP/DSE, Wipro, Accenture (Fundamentals, Arrays, Core CS MCQs)',
                  },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setTargetRoleTier(tier.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      targetRoleTier === tier.id
                        ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{tier.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Preferred Coding Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'CPP', name: 'C++' },
                  { id: 'JAVA', name: 'Java' },
                  { id: 'PYTHON', name: 'Python' },
                  { id: 'JAVASCRIPT', name: 'JavaScript' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setPreferredLang(lang.id as any)}
                    className={`py-2 px-3 rounded-xl text-center text-xs font-semibold border transition-all ${
                      preferredLang === lang.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              <span>Continue to Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: BASELINE DIAGNOSTIC */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>Placement Baseline Diagnostic</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Establish your starting point. No negative marking.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                3 Questions
              </span>
            </div>

            {/* Diagnostic Q1: DSA */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-900 mb-2">
                1. What is the average time complexity of searching in a balanced Binary Search Tree?
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDsaAnswer(opt)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono border text-center transition-all ${
                      dsaAnswer === opt
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Q2: DBMS */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-900 mb-2">
                2. Which ACID property ensures that all transaction operations complete or none take effect?
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Atomicity', 'Consistency', 'Isolation', 'Durability'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDbmsAnswer(opt)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono border text-center transition-all ${
                      dbmsAnswer === opt
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Q3: Operating Systems */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-900 mb-2">
                3. What is the key memory distinction between processes and threads?
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'Shared Memory', label: 'Threads share process heap memory; processes have isolated address spaces' },
                  { id: 'No Concurrency', label: 'Threads cannot execute concurrently across multiple CPU cores' },
                  { id: 'Identical Registers', label: 'Processes share the same stack and CPU registers' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOsAnswer(opt.id)}
                    className={`w-full p-2.5 rounded-lg text-xs text-left border transition-all ${
                      osAnswer === opt.id
                        ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Calculating PRS Baseline...' : 'Complete Setup & Launch Dashboard'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
