// ============================================================================
// PREPOS STUDENT NOTIFICATION SERVICE
// Server-Side Deterministic Notification Signals
// ============================================================================

import prisma from '../db';
import { normalizeUtcMidnight } from '../utils/date';

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: 'REVISION' | 'MISSION' | 'ASSESSMENT' | 'CALIBRATION' | 'BENCHMARK';
  severity: 'urgent' | 'info' | 'success';
  href: string;
  actionText: string;
  createdAt: string;
}

export async function getStudentNotifications(userId: string): Promise<StudentNotification[]> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const today = normalizeUtcMidnight();

  const [
    dueRevisionsCount,
    overdueRevisionsCount,
    pendingMissionsCount,
    unattemptedAssessments,
    recentCompletedQuiz,
  ] = await Promise.all([
    prisma.revision.count({
      where: {
        userId,
        dueAt: { lte: now },
        completedAt: null,
      },
    }),
    prisma.revision.count({
      where: {
        userId,
        dueAt: { lte: oneDayAgo },
        completedAt: null,
      },
    }),
    prisma.dailyMission.count({
      where: {
        userId,
        date: today,
        isCompleted: false,
      },
    }),
    prisma.assessment.findFirst({
      where: {
        status: 'PUBLISHED',
        attempts: {
          none: { userId },
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        durationMin: true,
      },
    }),
    prisma.quizAttempt.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        scorePct: true,
        quiz: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  const notifications: StudentNotification[] = [];

  // 1. Overdue revisions (Urgent)
  if (overdueRevisionsCount > 0) {
    notifications.push({
      id: 'notif-overdue-rev',
      title: 'Spaced Recall Overdue',
      message: `${overdueRevisionsCount} problem${overdueRevisionsCount > 1 ? 's are' : ' is'} overdue for active recall. Review now to avoid forgetting curve decay.`,
      type: 'REVISION',
      severity: 'urgent',
      href: '/dashboard/revision',
      actionText: 'Review Queue',
      createdAt: 'Today',
    });
  } else if (dueRevisionsCount > 0) {
    notifications.push({
      id: 'notif-due-rev',
      title: 'Spaced Revisions Due',
      message: `${dueRevisionsCount} problem${dueRevisionsCount > 1 ? 's are' : ' is'} scheduled for recall intervals today.`,
      type: 'REVISION',
      severity: 'info',
      href: '/dashboard/revision',
      actionText: 'Start Review',
      createdAt: 'Today',
    });
  }

  // 2. Pending Daily Missions
  if (pendingMissionsCount > 0) {
    notifications.push({
      id: 'notif-daily-missions',
      title: "Today's Placement Mission",
      message: `You have ${pendingMissionsCount} uncompleted daily mission${pendingMissionsCount > 1 ? 's' : ''}. Maintain your streak to boost PRS consistency.`,
      type: 'MISSION',
      severity: 'info',
      href: '/dashboard',
      actionText: 'View Missions',
      createdAt: 'Today',
    });
  }

  // 3. Available Mock OA Simulation
  if (unattemptedAssessments) {
    notifications.push({
      id: `notif-oa-${unattemptedAssessments.id}`,
      title: 'Mock Assessment Ready',
      message: `${unattemptedAssessments.title} (${unattemptedAssessments.durationMin} mins) is unattempted. Test your timed exam endurance.`,
      type: 'ASSESSMENT',
      severity: 'info',
      href: `/dashboard/assessments/${unattemptedAssessments.slug}`,
      actionText: 'Take OA Drill',
      createdAt: 'Active',
    });
  }

  // 4. Benchmark accomplishments
  if (recentCompletedQuiz && recentCompletedQuiz.scorePct >= 70) {
    notifications.push({
      id: `notif-quiz-${recentCompletedQuiz.id}`,
      title: 'Placement Benchmark Cleared!',
      message: `Scored ${recentCompletedQuiz.scorePct}% on ${recentCompletedQuiz.quiz.title}. Core CS screening benchmark satisfied.`,
      type: 'BENCHMARK',
      severity: 'success',
      href: '/dashboard/core-cs',
      actionText: 'View Syllabus',
      createdAt: 'Recent',
    });
  }

  return notifications;
}
