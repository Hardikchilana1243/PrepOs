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
  User,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

import { CommandPalette } from './command-palette';

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
  };
  onSignOut: () => Promise<void>;
}

export function AppShell({ children, user, onSignOut }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'DSA Roadmap', href: '/dashboard/dsa', icon: Code2 },
    { name: 'Core CS Drills', href: '/dashboard/core-cs', icon: Cpu },
    { name: 'Company Hubs', href: '/dashboard/companies', icon: Building2 },
    { name: 'Revision Queue', href: '/dashboard/revision', icon: RotateCcw },
    { name: 'Student Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col font-sans">
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top Application Bar */}
      <header className="h-16 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-blue-500/20">
              P
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              PrepOS
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-slate-800 text-cyan-400 border border-slate-700">
              v1.0
            </span>
          </Link>
        </div>

        {/* Global Quick Search Trigger (⌘K Shell) */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 text-sm hover:border-slate-700 hover:text-slate-200 transition-colors shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search problems, companies, quizzes...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>


        {/* User Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-200">{user.name || 'Candidate'}</div>
            <div className="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">
              {user.email}
            </div>
          </div>
          <button
            onClick={() => onSignOut()}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/80 bg-[#0F172A]/40 p-4 shrink-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2 font-semibold">
            Preparation Console
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Placement Ready OS</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Real server-side PRS tracking without arbitrary vanity statistics.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
            <div className="w-64 bg-[#0F172A] border-r border-slate-800 p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div className="font-bold text-sm text-slate-300">Menu</div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070A10]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden border-t border-slate-800 bg-[#0F172A] px-2 py-1.5 flex justify-around items-center sticky bottom-0 z-30">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
                isActive ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
