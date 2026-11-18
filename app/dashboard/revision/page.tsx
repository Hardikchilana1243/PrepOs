import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getRevisionDashboardData } from '@/lib/services/revision';
import { getNotificationCenterData } from '@/lib/services/notifications';
import { RevisionQueue } from '@/components/revision/revision-queue';
import { Bell, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch complete revision dashboard data and active revision reminders with authenticated user scoping
  const [dashboardData, notificationData] = await Promise.all([
    getRevisionDashboardData(user.id),
    getNotificationCenterData(user.id),
  ]);

  const revisionNotifs = notificationData.notifications.filter(
    (n) => (n.category === 'OVERDUE' || n.category === 'DUE_TODAY') && n.status === 'UNREAD'
  );

  return (
    <div className="space-y-6">
      {revisionNotifs.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {revisionNotifs.length} Active Spaced Recall Alert{revisionNotifs.length > 1 ? 's' : ''}
              </h4>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                {revisionNotifs[0].description}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/notifications"
            className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
          >
            <span>Reminder Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <RevisionQueue data={dashboardData} />
    </div>
  );
}
