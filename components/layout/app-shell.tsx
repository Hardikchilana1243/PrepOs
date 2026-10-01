'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Code2,
  Cpu,
  Building2,
  RotateCcw,
  Target,
  User,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';

import { SearchDialog } from '@/components/search/search-dialog';
import { GlobalSearch } from '@/components/search/global-search';
import { NotificationInbox } from './notification-inbox';
import { Breadcrumbs } from './breadcrumbs';
import { StudentNotification } from '@/lib/services/notifications';

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
  };
  notifications?: StudentNotification[];
  onSignOut: () => Promise<void>;
}

export function AppShell({ children, user, notifications = [], onSignOut }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Distraction-free exam mode: bypass standard application shell during active assessment attempts
  const isExamMode =
    pathname.includes('/assessments/') &&
    pathname.includes('/attempt/') &&
    !pathname.includes('/result');

  if (isExamMode) {
    return <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">{children}</div>;
  }

  // Global keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const preparationNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Readiness Cockpit', href: '/dashboard/readiness', icon: ShieldCheck },
    { name: 'Preparation Plan', href: '/dashboard/plan', icon: CalendarDays },
    { name: 'DSA Roadmap', href: '/dashboard/dsa', icon: Code2 },
    { name: 'Core CS Drills', href: '/dashboard/core-cs', icon: Cpu },
    { name: 'Spaced Revision', href: '/dashboard/revision', icon: RotateCcw },
    { name: 'Company Hubs', href: '/dashboard/companies', icon: Building2 },
    { name: 'Mock Assessments', href: '/dashboard/assessments', icon: Target },
  ];

  const accountNavItems = [
    { name: 'Readiness Cockpit', href: '/dashboard/readiness', icon: ShieldCheck },
    { name: 'Readiness Profile', href: '/dashboard/profile', icon: User },
  ];

  // Mobile Bottom Navigation items (quick-access destinations)
  const mobileNavItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Readiness', href: '/dashboard/readiness', icon: ShieldCheck },
    { name: 'Roadmap', href: '/dashboard/dsa', icon: Code2 },
    { name: 'Core CS', href: '/dashboard/core-cs', icon: Cpu },
    { name: 'Revision', href: '/dashboard/revision', icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top Application Header */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-xs">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                PrepOS
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
                Placement OS
              </span>
            </div>
          </Link>
        </div>

        {/* Global Quick Search Trigger (⌘K / Ctrl+K Shell) */}
        <div className="hidden sm:flex items-center">
          <GlobalSearch onOpen={() => setSearchOpen(true)} />
        </div>

        {/* Header Right Actions: Mobile Search, Notifications, Profile & Sign Out */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Search"
            aria-label="Open Command Center Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Inbox */}
          <NotificationInbox initialNotifications={notifications} />

          {/* Profile Quick Link */}
          <Link
            href="/dashboard/profile"
            className="hidden sm:flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              {(user.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user.name || 'Candidate'}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[120px] leading-tight">
                {user.email}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => onSignOut()}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200/90 bg-white p-4 shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Preparation Tracks
          </div>

          <nav className="space-y-1 flex-1">
            {preparationNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[38px] ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs border border-blue-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                  />
                  <span className="truncate">{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-500 shrink-0" />}
                </Link>
              );
            })}

            <div className="pt-4 pb-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Student & Analytics
              </div>
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[38px] ${
                      isActive
                        ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs border border-blue-100/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span className="truncate">{item.name}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-500 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Minimal Calm Status Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real PRS Evaluation</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every solved problem and diagnostic drill updates your placement score.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex">
            <div className="w-72 bg-white border-r border-slate-200 p-4 flex flex-col h-full animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="font-bold text-sm text-slate-900">PrepOS Navigation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 flex-1 overflow-y-auto">
                {[...preparationNavItems, ...accountNavItems].map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate max-w-[150px]">{user.email}</span>
                <button
                  type="button"
                  onClick={() => onSignOut()}
                  className="text-rose-600 font-medium hover:underline p-1 min-h-[44px] inline-flex items-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto w-full">
            {/* Unified Breadcrumbs on every page */}
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-1 py-1 flex justify-around items-center sticky bottom-0 z-30 shadow-subtle"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] py-1 px-1 rounded-lg text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
