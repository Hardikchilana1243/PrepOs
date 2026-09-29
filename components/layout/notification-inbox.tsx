'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { StudentNotification } from '@/lib/services/notifications';

interface NotificationInboxProps {
  initialNotifications: StudentNotification[];
}

export function NotificationInbox({ initialNotifications }: NotificationInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>(initialNotifications);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  const getIcon = (type: StudentNotification['type'], severity: StudentNotification['severity']) => {
    if (severity === 'urgent') return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    if (type === 'REVISION') return <RotateCcw className="w-4 h-4 text-amber-600" />;
    if (type === 'ASSESSMENT') return <Target className="w-4 h-4 text-purple-600" />;
    if (type === 'BENCHMARK') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    return <Sparkles className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Student Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                  {unreadCount} Active
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 block transition-colors hover:bg-slate-50 relative group ${
                    n.severity === 'urgent' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                      {getIcon(n.type, n.severity)}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {n.createdAt}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
                        <span>{n.actionText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(n.id, e)}
                      className="absolute top-3 right-3 p-1 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                <div className="font-bold text-slate-800">All Caught Up</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Zero pending alerts. Your revisions, daily missions, and assessments are current.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
