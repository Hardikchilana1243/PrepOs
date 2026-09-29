import React from 'react';
import { History, ShieldCheck, Clock } from 'lucide-react';

export interface ScoreHistoryRecord {
  id: string;
  score: number;
  recordedAt: string;
}

interface ReadinessHistoryProps {
  history: ScoreHistoryRecord[];
  currentScore: number;
}

export function ReadinessHistory({ history, currentScore }: ReadinessHistoryProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Readiness Score Audit Trail
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          Current: {currentScore}%
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        PrepOS logs a permanent server timestamp every time your Placement Readiness Score shifts
        due to coding submissions, diagnostic quizzes, or spaced revision.
      </p>

      {history.length > 0 ? (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {history.map((h, idx) => (
            <div
              key={h.id}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="font-semibold text-slate-800">
                  {idx === 0 ? 'Active PRS Recalibration' : `Audit Checkpoint #${history.length - idx}`}
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
      ) : (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
          <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <div className="font-medium text-slate-700">Audit History Will Record Here</div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Historical readiness tracking becomes available as you complete more coding submissions,
            quizzes, and assessment simulations.
          </p>
        </div>
      )}
    </div>
  );
}
