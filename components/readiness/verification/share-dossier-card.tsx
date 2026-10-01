'use client';

// ============================================================================
// PREPOS DOSSIER SHARE MANAGEMENT COMPONENT
// Authenticated student UI for generating, inspecting, copying, and revoking recruiter verification links
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  Clock,
  ExternalLink,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  generateShareLinkAction,
  revokeShareLinkAction,
  regenerateShareLinkAction,
  getShareStatusAction,
} from '@/app/dashboard/readiness/report/actions';
import { ShareManagementStatus } from '@/lib/services/dossier-verification';

interface ShareDossierCardProps {
  initialStatus?: ShareManagementStatus;
}

export function ShareDossierCard({ initialStatus }: ShareDossierCardProps) {
  const [status, setStatus] = useState<ShareManagementStatus | null>(initialStatus ?? null);
  const [expirationDays, setExpirationDays] = useState<number>(30);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load status on mount if not provided
  useEffect(() => {
    if (!initialStatus) {
      getShareStatusAction()
        .then((s) => setStatus(s))
        .catch(() => {});
    }
  }, [initialStatus]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateShareLinkAction(expirationDays);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      setShareUrl(fullUrl);
      const updated = await getShareStatusAction();
      setStatus(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerating this link will immediately revoke the existing link. Continue?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await regenerateShareLinkAction(expirationDays);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      setShareUrl(fullUrl);
      const updated = await getShareStatusAction();
      setStatus(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to regenerate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke public access to this dossier? Recruiters will no longer be able to view this verification.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await revokeShareLinkAction(status?.shareTokenId);
      setShareUrl('');
      const updated = await getShareStatusAction();
      setStatus(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to revoke share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isLinkActive = status?.hasShareLink && status?.status === 'ACTIVE';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Recruiter Verification Link
            </h3>
            <p className="text-xs text-slate-500">
              Generate a secure, read-only public URL for placement cell or recruiter verification
            </p>
          </div>
        </div>

        {status?.status && (
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider self-start sm:self-auto font-mono ${
              status.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : status.status === 'EXPIRED'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {status.status}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Share State & Controls */}
      {!isLinkActive && !shareUrl ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Create an immutable public verification snapshot of your current Placement Readiness Dossier. Recruiters can view verified preparation metrics, benchmark scores, and cryptographic authenticity without requiring a PrepOS login.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="expiration-select" className="text-xs font-semibold text-slate-700">
                Expiration:
              </label>
              <select
                id="expiration-select"
                value={expirationDays}
                onChange={(e) => setExpirationDays(Number(e.target.value))}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              >
                <option value={7}>7 Days (1 Week)</option>
                <option value={30}>30 Days (1 Month)</option>
                <option value={90}>90 Days (1 Quarter)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors min-h-[44px] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{loading ? 'Generating Snapshot...' : 'Generate Verification Link'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active URL & Copy Bar */}
          {shareUrl ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Public Verification URL
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none select-all min-h-[44px]"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[44px] shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors min-h-[44px] shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Active verification link configured</span>
              </div>
              <button
                onClick={() => handleRegenerate()}
                className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-900"
              >
                Reveal / Regenerate URL
              </button>
            </div>
          )}

          {/* Verification Statistics & Expiration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Views / Checks</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {status?.verificationCount ?? 0}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Expires</span>
              <span className="font-mono font-semibold text-slate-800 text-[11px] truncate block">
                {status?.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Snapshot ID</span>
              <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">
                {status?.dossierId ?? 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Last Verified</span>
              <span className="font-mono text-slate-600 text-[11px] truncate block">
                {status?.lastVerifiedAt ? new Date(status.lastVerifiedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors min-h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Regenerate Link with New Expiry</span>
            </button>

            <button
              onClick={handleRevoke}
              disabled={loading}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5 transition-colors min-h-[38px]"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Revoke Public Access</span>
            </button>
          </div>
        </div>
      )}

      {/* Security Privacy Notice */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700">Privacy Guarantee: </strong>
          This public link exposes only the recruiter-safe verification summary. Your email, private dashboard, activity history, test cases, code solutions, MCQ keys, and internal analytics are strictly protected and never exposed.
        </p>
      </div>
    </div>
  );
}
