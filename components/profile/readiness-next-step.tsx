import React from 'react';
import Link from 'next/link';
import { Target, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NextStepProps {
  revisionsDueCount: number;
  quizAttemptsCount: number;
  coreCsAvgScore: number;
  oaAttemptsCount: number;
  dsaSolvedCount: number;
}

export function ReadinessNextStep({
  revisionsDueCount,
  quizAttemptsCount,
  coreCsAvgScore,
  oaAttemptsCount,
  dsaSolvedCount,
}: NextStepProps) {
  // Deterministic rule engine based solely on real DB measurements
  const getRecommendation = () => {
    if (revisionsDueCount > 0) {
      return {
        priority: 'HIGH PRIORITY',
        title: `Clear ${revisionsDueCount} Spaced Revision Items`,
        description:
          'Your active recall queue contains due problems. Reviewing these now locks in memory consolidation and boosts your PRS consistency score.',
        href: '/dashboard/revision',
        ctaText: 'Open Spaced Revision Queue',
        color: 'border-rose-200 bg-rose-50/50 text-rose-900',
        badgeColor: 'bg-rose-100 text-rose-700',
      };
    }

    if (quizAttemptsCount === 0) {
      return {
        priority: 'CALIBRATION',
        title: 'Complete First Core CS Diagnostic Drill',
        description:
          'Core CS makes up 30% of your Placement Readiness Score. Take the 10-minute DBMS or OS diagnostic to calibrate your fundamentals score.',
        href: '/dashboard/core-cs',
        ctaText: 'Launch Core CS Hub',
        color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900',
        badgeColor: 'bg-indigo-100 text-indigo-700',
      };
    }

    if (oaAttemptsCount === 0) {
      return {
        priority: 'SIMULATION',
        title: 'Attempt an Online Assessment (OA) Simulation',
        description:
          'Mock OA Simulations contribute 15% to PRS. Test your coding execution and time management in a full 60-minute company simulation.',
        href: '/dashboard/assessments',
        ctaText: 'Explore Mock Assessments',
        color: 'border-purple-200 bg-purple-50/50 text-purple-900',
        badgeColor: 'bg-purple-100 text-purple-700',
      };
    }

    if (coreCsAvgScore < 70) {
      return {
        priority: 'IMPROVEMENT',
        title: 'Raise Core CS Average to 70% Benchmark',
        description:
          `Your current diagnostic average is ${coreCsAvgScore}%. Review mistake explanations and retake the diagnostic to clear the placement benchmark.`,
        href: '/dashboard/core-cs',
        ctaText: 'Review Core CS Mistakes',
        color: 'border-amber-200 bg-amber-50/50 text-amber-900',
        badgeColor: 'bg-amber-100 text-amber-700',
      };
    }

    if (dsaSolvedCount < 10) {
      return {
        priority: 'MOMENTUM',
        title: 'Advance DSA Roadmap Problem Solving',
        description:
          'DSA accounts for 40% of overall PRS weight. Solve the next problem in your active module to push coverage higher.',
        href: '/dashboard/dsa',
        ctaText: 'Continue DSA Roadmap',
        color: 'border-blue-200 bg-blue-50/50 text-blue-900',
        badgeColor: 'bg-blue-100 text-blue-700',
      };
    }

    return {
      priority: 'MASTERY',
      title: 'Practice Target Company Patterns',
      description:
        'All baseline readiness pillars are calibrated. Focus on verified interview patterns and tagged problems for your target companies.',
      href: '/dashboard/companies',
      ctaText: 'Explore Company Hubs',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    };
  };

  const rec = getRecommendation();

  return (
    <div className={`rounded-2xl border p-5 shadow-subtle space-y-3 ${rec.color}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${rec.badgeColor}`}>
          Deterministic Next Action • {rec.priority}
        </span>
        <Target className="w-4 h-4 opacity-70" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
      </div>

      <div className="pt-2">
        <Link
          href={rec.href}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <span>{rec.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
