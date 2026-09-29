import React from 'react';
import Link from 'next/link';
import { Brain, Database, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

interface CompanyCoreCSSectionProps {
  companyName: string;
}

export function CompanyCoreCSSection({ companyName }: CompanyCoreCSSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-indigo-600" />
          <span>Core CS Placement Syllabus</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">DBMS & OS Screening</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* DBMS Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                <Database className="w-3 h-3" />
                DBMS
              </span>
              <span className="text-[11px] font-mono text-slate-400">10 Questions</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Database Management Systems Diagnostic
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tested frequently by {companyName}: B+ Tree Indexing, ACID transaction isolation, and normalization anomalies.
            </p>
          </div>

          <Link
            href="/dashboard/core-cs?subject=dbms"
            className="pt-2 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between"
          >
            <span>Launch DBMS Diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Operating Systems Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                <Cpu className="w-3 h-3" />
                Operating Systems
              </span>
              <span className="text-[11px] font-mono text-slate-400">10 Questions</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Operating Systems Core Diagnostic
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tested frequently by {companyName}: Virtual memory paging, deadlock prevention, process synchronization, and threads.
            </p>
          </div>

          <Link
            href="/dashboard/core-cs?subject=os"
            className="pt-2 border-t border-slate-100 text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center justify-between"
          >
            <span>Launch OS Diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
