// ============================================================================
// PREPOS GLOBAL SEARCH & UNIFIED COMMAND CENTER SERVICE
// High-Performance Cross-Entity Discovery, Continue Preparation & Cross-Pillar Feed
// ============================================================================

import prisma from '../db';

export type SearchEntityType =
  | 'DSA_PROBLEM'
  | 'DSA_TOPIC'
  | 'CORE_CS'
  | 'COMPANY'
  | 'ASSESSMENT'
  | 'REVISION'
  | 'NAVIGATION'
  | 'ACTION';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  entityType: SearchEntityType;
  url: string;
  badgeText?: string;
  badgeVariant?: 'blue' | 'purple' | 'emerald' | 'amber' | 'slate' | 'indigo' | 'rose';
  iconName: string;
  relevanceScore: number;
}

export interface ContinuePreparationItem {
  id: string;
  type: 'ASSESSMENT' | 'DSA' | 'REVISION' | 'CORE_CS' | 'COMPANY';
  title: string;
  subtitle: string;
  state: string;
  url: string;
  ctaText: string;
  badgeText: string;
  badgeVariant: 'amber' | 'blue' | 'purple' | 'emerald' | 'indigo' | 'rose';
  lastActivity?: string;
}

export interface CrossPillarActivityItem {
  id: string;
  type:
    | 'DSA_SUBMISSION'
    | 'PROBLEM_SOLVED'
    | 'QUIZ_COMPLETED'
    | 'ASSESSMENT_SUBMITTED'
    | 'REVISION_COMPLETED';
  title: string;
  description: string;
  timestamp: string;
  url?: string;
  statusText?: string;
  statusVariant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'indigo';
}

// Static Navigation and High-Productivity Preparation Destinations
const STATIC_NAVIGATION_ITEMS: Omit<SearchResultItem, 'relevanceScore'>[] = [
  {
    id: 'nav-dashboard',
    title: 'Dashboard Overview',
    subtitle: 'Placement Readiness Index, Daily Missions & Progress Summary',
    entityType: 'NAVIGATION',
    url: '/dashboard',
    badgeText: 'Home',
    badgeVariant: 'slate',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'nav-readiness',
    title: 'Placement Readiness Command Center',
    subtitle: 'Authoritative PRS Score, 5-Pillar Breakdown, Insights & Trends',
    entityType: 'NAVIGATION',
    url: '/dashboard/readiness',
    badgeText: 'Readiness',
    badgeVariant: 'blue',
    iconName: 'ShieldCheck',
  },
  {
    id: 'nav-readiness-report',
    title: 'Placement Readiness Dossier & Placement Report',
    subtitle: 'Official Placement Report, Verification Dossier & Tamper-Evident Export',
    entityType: 'NAVIGATION',
    url: '/dashboard/readiness/report',
    badgeText: 'Dossier',
    badgeVariant: 'blue',
    iconName: 'ShieldCheck',
  },
  {
    id: 'nav-share-dossier',
    title: 'Share Dossier (Recruiter Verification)',
    subtitle: 'Generate secure, student-controlled recruiter verification link',
    entityType: 'NAVIGATION',
    url: '/dashboard/readiness/report',
    badgeText: 'Share',
    badgeVariant: 'emerald',
    iconName: 'Share2',
  },
  {
    id: 'nav-verify-dossier',
    title: 'Verify Placement Dossier',
    subtitle: 'Review and manage active recruiter verification snapshots',
    entityType: 'NAVIGATION',
    url: '/dashboard/readiness/report',
    badgeText: 'Verify',
    badgeVariant: 'purple',
    iconName: 'ShieldCheck',
  },
  {
    id: 'nav-plan',
    title: 'Preparation Plan & Quotas',
    subtitle: 'Adaptive Study Orchestration & Weekly Targets',
    entityType: 'NAVIGATION',
    url: '/dashboard/plan',
    badgeText: 'Plan',
    badgeVariant: 'blue',
    iconName: 'CalendarDays',
  },
  {
    id: 'nav-dsa',
    title: 'DSA Roadmap & Workspace',
    subtitle: '14 Modules, 20 Verified Patterns & Code Execution',
    entityType: 'NAVIGATION',
    url: '/dashboard/dsa',
    badgeText: 'Algorithms',
    badgeVariant: 'blue',
    iconName: 'Code2',
  },
  {
    id: 'nav-core-cs',
    title: 'Core CS Learning Hub',
    subtitle: 'DBMS & Operating Systems Diagnostic Quizzes',
    entityType: 'NAVIGATION',
    url: '/dashboard/core-cs',
    badgeText: 'Foundations',
    badgeVariant: 'indigo',
    iconName: 'Cpu',
  },
  {
    id: 'nav-companies',
    title: 'Target Company Hubs',
    subtitle: 'Tier-1 & Product Company Patterns and OA Drills',
    entityType: 'NAVIGATION',
    url: '/dashboard/companies',
    badgeText: 'Recruiters',
    badgeVariant: 'purple',
    iconName: 'Building2',
  },
  {
    id: 'nav-assessments',
    title: 'Mock Assessment Engine',
    subtitle: 'Timed Coding & Core CS Online Assessment Simulations',
    entityType: 'NAVIGATION',
    url: '/dashboard/assessments',
    badgeText: 'OA Exams',
    badgeVariant: 'emerald',
    iconName: 'Target',
  },
  {
    id: 'nav-revision',
    title: 'Spaced Revision Command Center',
    subtitle: 'SuperMemo SM-2 Active Recall Intervals & Queue',
    entityType: 'NAVIGATION',
    url: '/dashboard/revision',
    badgeText: 'Recall',
    badgeVariant: 'amber',
    iconName: 'RotateCcw',
  },
  {
    id: 'nav-profile',
    title: 'Placement Readiness Profile',
    subtitle: 'PRS v1 4-Factor Breakdown & Target Career Settings',
    entityType: 'NAVIGATION',
    url: '/dashboard/profile',
    badgeText: 'Profile',
    badgeVariant: 'slate',
    iconName: 'User',
  },
];

// Quick Preparation Actions
const QUICK_ACTION_ITEMS: Omit<SearchResultItem, 'relevanceScore'>[] = [
  {
    id: 'act-view-readiness',
    title: 'Check Placement Readiness Cockpit',
    subtitle: 'Inspect PRS score, bottlenecks, priority action plan, and preparation gaps',
    entityType: 'ACTION',
    url: '/dashboard/readiness',
    badgeText: 'Readiness',
    badgeVariant: 'blue',
    iconName: 'ShieldCheck',
  },
  {
    id: 'act-export-dossier',
    title: 'Generate Placement Readiness Dossier & Placement Report',
    subtitle: 'Export authoritative placement report PDF with verified DSA and Core CS metrics',
    entityType: 'ACTION',
    url: '/dashboard/readiness/report',
    badgeText: 'Dossier',
    badgeVariant: 'blue',
    iconName: 'ShieldCheck',
  },
  {
    id: 'act-solve-dsa',
    title: 'Solve Next Algorithmic Problem',
    subtitle: 'Open the coding workspace with sample and edge cases',
    entityType: 'ACTION',
    url: '/dashboard/dsa',
    badgeText: 'Action',
    badgeVariant: 'blue',
    iconName: 'Code2',
  },
  {
    id: 'act-start-quiz',
    title: 'Take Core CS Diagnostic Quiz',
    subtitle: 'Test ACID, Normalization, Paging, and Mutex in 10 questions',
    entityType: 'ACTION',
    url: '/dashboard/core-cs',
    badgeText: 'Diagnostic',
    badgeVariant: 'indigo',
    iconName: 'Cpu',
  },
  {
    id: 'act-review-due',
    title: 'Review Due Spaced Revisions',
    subtitle: 'Test your active recall on items due today',
    entityType: 'ACTION',
    url: '/dashboard/revision',
    badgeText: 'Due Recall',
    badgeVariant: 'amber',
    iconName: 'RotateCcw',
  },
  {
    id: 'act-start-oa',
    title: 'Start Practice Assessment',
    subtitle: 'Take a timed 60-minute mock OA with automated evaluation',
    entityType: 'ACTION',
    url: '/dashboard/assessments',
    badgeText: 'Simulate',
    badgeVariant: 'emerald',
    iconName: 'Target',
  },
];

/**
 * Computes deterministic relevance score between a target text and a search query.
 * Exact match (100) > Prefix match (80) > Keyword match (60) > Substring match (40)
 */
function calculateDeterministicRelevance(target: string, query: string): number {
  const t = target.toLowerCase().trim();
  const q = query.toLowerCase().trim();

  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;

  // Word boundary match
  const words = t.split(/\s+/);
  if (words.some((w) => w.startsWith(q))) return 70;
  if (words.some((w) => w.includes(q))) return 50;

  // Multi-word query token matching (e.g. "placement report")
  const queryTokens = q.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    const allTokensPresent = queryTokens.every((token) =>
      words.some((w) => w.startsWith(token) || w.includes(token))
    );
    if (allTokensPresent) return 55;
    const someTokensCount = queryTokens.filter((token) =>
      words.some((w) => w.startsWith(token) || w.includes(token))
    ).length;
    if (someTokensCount > 0) {
      return Math.round((someTokensCount / queryTokens.length) * 45);
    }
  }

  return 0;
}

/**
 * Searches across all preparation entities (DSA, Core CS, Companies, Assessments, Revision, Navigation)
 * strictly scoped to the authenticated student where user-specific records are involved.
 */
export async function searchGlobalEntities(
  userId: string,
  rawQuery: string
): Promise<SearchResultItem[]> {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    // Return standard navigation and top quick actions when query is empty
    return [
      ...STATIC_NAVIGATION_ITEMS.map((item) => ({ ...item, relevanceScore: 10 })),
      ...QUICK_ACTION_ITEMS.map((item) => ({ ...item, relevanceScore: 5 })),
    ];
  }

  // Parallel database queries with lightweight projections
  const [problems, topics, subjects, quizzes, companies, assessments, userRevisions] =
    await Promise.all([
      // 1. DSA Problems (Public catalog, zero secret test cases or code solutions)
      prisma.problem.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { slug: { contains: query } },
            { topic: { title: { contains: query } } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          topic: { select: { title: true } },
          companyProblems: {
            take: 1,
            select: { company: { select: { name: true } } },
          },
        },
        take: 15,
      }),

      // 2. DSA Topics & Modules
      prisma.topic.findMany({
        where: {
          OR: [{ title: { contains: query } }, { slug: { contains: query } }],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          module: { select: { title: true } },
        },
        take: 8,
      }),

      // 3. Core CS Subjects
      prisma.coreCSSubject.findMany({
        where: {
          OR: [{ title: { contains: query } }, { slug: { contains: query } }],
        },
        select: {
          id: true,
          slug: true,
          title: true,
        },
        take: 5,
      }),

      // 4. Core CS Quizzes (Zero question answers or explanations)
      prisma.coreCSQuiz.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { subject: { title: { contains: query } } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          subject: { select: { title: true, slug: true } },
        },
        take: 6,
      }),

      // 5. Target Companies
      prisma.company.findMany({
        where: {
          OR: [{ name: { contains: query } }, { slug: { contains: query } }],
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
        take: 8,
      }),

      // 6. Mock Assessments (Zero answers or private test data)
      prisma.assessment.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { slug: { contains: query } },
            { company: { name: { contains: query } } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          durationMin: true,
          difficulty: true,
          company: { select: { name: true } },
        },
        take: 8,
      }),

      // 7. Student Revision Items (Strictly scoped by authenticated userId)
      prisma.revision.findMany({
        where: {
          userId,
          problem: {
            OR: [
              { title: { contains: query } },
              { topic: { title: { contains: query } } },
            ],
          },
        },
        select: {
          id: true,
          intervalDays: true,
          dueAt: true,
          completedAt: true,
          problem: {
            select: {
              title: true,
              slug: true,
              topic: { select: { title: true } },
            },
          },
        },
        take: 6,
      }),
    ]);

  const results: SearchResultItem[] = [];

  // Transform DSA Problems
  for (const prob of problems) {
    const score = Math.max(
      calculateDeterministicRelevance(prob.title, query),
      calculateDeterministicRelevance(prob.topic.title, query) * 0.7
    );
    const companyTag = prob.companyProblems[0]?.company?.name;

    results.push({
      id: `dsa-${prob.id}`,
      title: prob.title,
      subtitle: `${prob.topic.title}${companyTag ? ` • ${companyTag}` : ''}`,
      entityType: 'DSA_PROBLEM',
      url: `/dashboard/dsa/problem/${prob.slug}`,
      badgeText: prob.difficulty,
      badgeVariant:
        prob.difficulty === 'EASY' ? 'emerald' : prob.difficulty === 'MEDIUM' ? 'amber' : 'rose',
      iconName: 'Code2',
      relevanceScore: score,
    });
  }

  // Transform DSA Topics
  for (const topic of topics) {
    const score = calculateDeterministicRelevance(topic.title, query);
    results.push({
      id: `topic-${topic.id}`,
      title: topic.title,
      subtitle: `DSA Module: ${topic.module.title}`,
      entityType: 'DSA_TOPIC',
      url: `/dashboard/dsa`,
      badgeText: 'Topic',
      badgeVariant: 'blue',
      iconName: 'Code2',
      relevanceScore: score,
    });
  }

  // Transform Core CS Subjects & Quizzes
  for (const sub of subjects) {
    const score = calculateDeterministicRelevance(sub.title, query);
    results.push({
      id: `sub-${sub.id}`,
      title: `${sub.title} Hub`,
      subtitle: `Foundational CS Diagnostic Hub`,
      entityType: 'CORE_CS',
      url: `/dashboard/core-cs?subject=${sub.slug}`,
      badgeText: 'Subject',
      badgeVariant: 'indigo',
      iconName: 'Cpu',
      relevanceScore: score,
    });
  }

  for (const quiz of quizzes) {
    const score = calculateDeterministicRelevance(quiz.title, query);
    results.push({
      id: `quiz-${quiz.id}`,
      title: quiz.title,
      subtitle: `Core CS: ${quiz.subject.title}`,
      entityType: 'CORE_CS',
      url: `/dashboard/core-cs?subject=${quiz.subject.slug}`,
      badgeText: 'Quiz',
      badgeVariant: 'indigo',
      iconName: 'Cpu',
      relevanceScore: score,
    });
  }

  // Transform Companies
  for (const comp of companies) {
    const score = calculateDeterministicRelevance(comp.name, query);
    results.push({
      id: `company-${comp.id}`,
      title: `${comp.name} Placement Hub`,
      subtitle: `Recruiter Preparation Hub & Patterns`,
      entityType: 'COMPANY',
      url: `/dashboard/companies/${comp.slug}`,
      badgeText: 'Recruiter',
      badgeVariant: 'purple',
      iconName: 'Building2',
      relevanceScore: score,
    });
  }

  // Transform Mock Assessments
  for (const ass of assessments) {
    const score = calculateDeterministicRelevance(ass.title, query);
    results.push({
      id: `assessment-${ass.id}`,
      title: ass.title,
      subtitle: `${ass.durationMin} mins • ${ass.company?.name || 'Standard OA'}`,
      entityType: 'ASSESSMENT',
      url: `/dashboard/assessments/${ass.slug}`,
      badgeText: `${ass.durationMin}m`,
      badgeVariant: 'emerald',
      iconName: 'Target',
      relevanceScore: score,
    });
  }

  // Transform User Revision Items
  const now = new Date();
  for (const rev of userRevisions) {
    const score = calculateDeterministicRelevance(rev.problem.title, query);
    const isDue = rev.dueAt <= now && !rev.completedAt;

    results.push({
      id: `rev-${rev.id}`,
      title: rev.problem.title,
      subtitle: `Recall Interval: ${rev.intervalDays}d • ${rev.problem.topic.title}`,
      entityType: 'REVISION',
      url: `/dashboard/revision`,
      badgeText: isDue ? 'Due' : `${rev.intervalDays}d`,
      badgeVariant: isDue ? 'rose' : 'slate',
      iconName: 'RotateCcw',
      relevanceScore: score,
    });
  }

  // Check Static Navigation & Actions for Matches
  for (const nav of STATIC_NAVIGATION_ITEMS) {
    const score = Math.max(
      calculateDeterministicRelevance(nav.title, query),
      calculateDeterministicRelevance(nav.subtitle, query) * 0.6
    );
    if (score > 0) {
      results.push({ ...nav, relevanceScore: score });
    }
  }

  for (const act of QUICK_ACTION_ITEMS) {
    const score = Math.max(
      calculateDeterministicRelevance(act.title, query),
      calculateDeterministicRelevance(act.subtitle, query) * 0.6
    );
    if (score > 0) {
      results.push({ ...act, relevanceScore: score });
    }
  }

  // Sort strictly by deterministic relevance score descending
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results.slice(0, 30);
}

/**
 * Retrieves deterministic 'Continue Preparation' action items derived from real DB records.
 * Prioritizes:
 * 1. Unfinished active assessment attempt (`status: 'IN_PROGRESS'`)
 * 2. Next due or overdue spaced revision item
 * 3. Latest attempted or unsolved DSA problem
 * 4. Incomplete Core CS quiz attempt or diagnostic
 * 5. Target company with preparation milestones
 */
export async function getContinuePreparationItems(
  userId: string
): Promise<ContinuePreparationItem[]> {
  const items: ContinuePreparationItem[] = [];
  const now = new Date();

  // 1. Check for unfinished active assessment
  const activeAssessmentAttempt = await prisma.assessmentAttempt.findFirst({
    where: {
      userId,
      status: 'IN_PROGRESS',
      expiresAt: { gt: now },
    },
    select: {
      id: true,
      startedAt: true,
      expiresAt: true,
      assessment: {
        select: {
          id: true,
          title: true,
          slug: true,
          durationMin: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  if (activeAssessmentAttempt) {
    const minsLeft = Math.max(
      1,
      Math.round((activeAssessmentAttempt.expiresAt.getTime() - now.getTime()) / 60000)
    );
    items.push({
      id: `continue-oa-${activeAssessmentAttempt.id}`,
      type: 'ASSESSMENT',
      title: activeAssessmentAttempt.assessment.title,
      subtitle: `In-progress attempt • ${minsLeft} minutes remaining on timer`,
      state: 'IN_PROGRESS',
      url: `/dashboard/assessments/${activeAssessmentAttempt.assessment.id}/attempt/${activeAssessmentAttempt.id}`,
      ctaText: 'Resume Assessment',
      badgeText: `${minsLeft}m Left`,
      badgeVariant: 'rose',
      lastActivity: 'Active Exam Session',
    });
  }

  // 2. Check for next due revision item
  const dueRevision = await prisma.revision.findFirst({
    where: {
      userId,
      completedAt: null,
      dueAt: { lte: now },
    },
    select: {
      id: true,
      intervalDays: true,
      dueAt: true,
      problem: {
        select: {
          title: true,
          slug: true,
          difficulty: true,
          topic: { select: { title: true } },
        },
      },
    },
    orderBy: { dueAt: 'asc' },
  });

  if (dueRevision) {
    items.push({
      id: `continue-rev-${dueRevision.id}`,
      type: 'REVISION',
      title: dueRevision.problem.title,
      subtitle: `Due for active recall today • Topic: ${dueRevision.problem.topic.title}`,
      state: 'DUE',
      url: `/dashboard/revision`,
      ctaText: 'Review Recall',
      badgeText: 'Due Recall',
      badgeVariant: 'amber',
      lastActivity: 'Memory Decay Threshold',
    });
  }

  // 3. Check for latest DSA problem submission or in-progress problem
  const latestSubmission = await prisma.submission.findFirst({
    where: { userId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          topic: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (latestSubmission && latestSubmission.status !== 'ACCEPTED') {
    items.push({
      id: `continue-dsa-${latestSubmission.id}`,
      type: 'DSA',
      title: latestSubmission.problem.title,
      subtitle: `Last status: ${latestSubmission.status.replace('_', ' ')} • ${latestSubmission.problem.topic.title}`,
      state: latestSubmission.status,
      url: `/dashboard/dsa/problem/${latestSubmission.problem.slug}`,
      ctaText: 'Solve Problem',
      badgeText: latestSubmission.problem.difficulty,
      badgeVariant: 'blue',
      lastActivity: new Date(latestSubmission.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    });
  }

  // 4. Check for incomplete or unattempted Core CS subject
  const userQuizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    select: { quizId: true },
  });
  const attemptedQuizIds = new Set(userQuizAttempts.map((q) => q.quizId));

  const unattemptedQuiz = await prisma.coreCSQuiz.findFirst({
    where: {
      id: { notIn: Array.from(attemptedQuizIds) },
    },
    select: {
      id: true,
      title: true,
      subject: { select: { title: true, slug: true } },
    },
  });

  if (unattemptedQuiz) {
    items.push({
      id: `continue-quiz-${unattemptedQuiz.id}`,
      type: 'CORE_CS',
      title: unattemptedQuiz.title,
      subtitle: `Diagnostic not yet taken • ${unattemptedQuiz.subject.title}`,
      state: 'UNATTEMPTED',
      url: `/dashboard/core-cs?subject=${unattemptedQuiz.subject.slug}`,
      ctaText: 'Start Diagnostic',
      badgeText: 'Core CS',
      badgeVariant: 'indigo',
    });
  }

  // 5. Target Company Context
  const targetCompany = await prisma.company.findFirst({
    select: {
      name: true,
      slug: true,
    },
  });

  if (targetCompany && items.length < 3) {
    items.push({
      id: `continue-comp-${targetCompany.slug}`,
      type: 'COMPANY',
      title: `${targetCompany.name} Placement Hub`,
      subtitle: `Prepare target recruiter patterns and past OA questions`,
      state: 'ACTIVE',
      url: `/dashboard/companies/${targetCompany.slug}`,
      ctaText: 'Open Hub',
      badgeText: 'Company',
      badgeVariant: 'purple',
    });
  }

  return items.slice(0, 4);
}

/**
 * Aggregates recent authenticated activity events across DSA, Core CS, Assessments, and Revision.
 * Strictly scoped to authenticated userId.
 */
export async function getRecentCrossPillarActivity(
  userId: string,
  limit: number = 6
): Promise<CrossPillarActivityItem[]> {
  const [submissions, quizAttempts, assessmentAttempts, progressEvents] = await Promise.all([
    // 1. DSA Submissions
    prisma.submission.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        language: true,
        createdAt: true,
        problem: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    // 2. Core CS Quiz Attempts
    prisma.quizAttempt.findMany({
      where: { userId },
      select: {
        id: true,
        scorePct: true,
        correctQs: true,
        totalQs: true,
        completedAt: true,
        quiz: {
          select: {
            title: true,
            subject: { select: { title: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    }),

    // 3. Evaluated Assessments
    prisma.assessmentAttempt.findMany({
      where: {
        userId,
        status: 'EVALUATED',
      },
      select: {
        id: true,
        totalScore: true,
        maxPossibleScore: true,
        scorePct: true,
        submittedAt: true,
        updatedAt: true,
        assessment: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    }),

    // 4. Spaced Revision Completed Events
    prisma.progressEvent.findMany({
      where: {
        userId,
        eventType: 'REVISION_COMPLETED',
      },
      select: {
        id: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  const rawEvents: Array<{ date: Date; item: CrossPillarActivityItem }> = [];

  // Map DSA Submissions
  for (const sub of submissions) {
    const isAccepted = sub.status === 'ACCEPTED';
    rawEvents.push({
      date: sub.createdAt,
      item: {
        id: `act-sub-${sub.id}`,
        type: isAccepted ? 'PROBLEM_SOLVED' : 'DSA_SUBMISSION',
        title: isAccepted ? `Problem Solved: ${sub.problem.title}` : `Submitted ${sub.problem.title}`,
        description: `${sub.language} code run • ${sub.status.replace('_', ' ')}`,
        timestamp: sub.createdAt.toISOString(),
        url: `/dashboard/dsa/problem/${sub.problem.slug}`,
        statusText: isAccepted ? 'Accepted' : sub.status.replace('_', ' '),
        statusVariant: isAccepted ? 'emerald' : 'rose',
      },
    });
  }

  // Map Core CS Quiz Attempts
  for (const qa of quizAttempts) {
    rawEvents.push({
      date: qa.completedAt,
      item: {
        id: `act-quiz-${qa.id}`,
        type: 'QUIZ_COMPLETED',
        title: `Completed ${qa.quiz.title}`,
        description: `Scored ${qa.correctQs}/${qa.totalQs} in ${qa.quiz.subject.title}`,
        timestamp: qa.completedAt.toISOString(),
        url: `/dashboard/core-cs`,
        statusText: `${Math.round(qa.scorePct)}%`,
        statusVariant: 'indigo',
      },
    });
  }

  // Map Assessment Attempts
  for (const aa of assessmentAttempts) {
    const date = aa.submittedAt || aa.updatedAt;
    rawEvents.push({
      date,
      item: {
        id: `act-oa-${aa.id}`,
        type: 'ASSESSMENT_SUBMITTED',
        title: `Evaluated: ${aa.assessment.title}`,
        description: `Scored ${aa.totalScore.toFixed(1)}/${aa.maxPossibleScore} marks`,
        timestamp: date.toISOString(),
        url: `/dashboard/assessments/${aa.assessment.slug}`,
        statusText: `${Math.round(aa.scorePct)}%`,
        statusVariant: 'emerald',
      },
    });
  }

  // Map Revision Completed Events
  for (const pe of progressEvents) {
    let problemTitle = 'DSA Spaced Revision';
    let confidence = 'GOOD';
    let nextIntervalDays = 7;

    if (pe.metadata) {
      try {
        const meta = typeof pe.metadata === 'string' ? JSON.parse(pe.metadata) : (pe.metadata as any);
        if (meta?.problemTitle) problemTitle = meta.problemTitle;
        if (meta?.confidence) confidence = meta.confidence;
        if (meta?.nextIntervalDays) nextIntervalDays = meta.nextIntervalDays;
      } catch {
        // Fallback to defaults
      }
    }

    rawEvents.push({
      date: pe.createdAt,
      item: {
        id: `act-rev-${pe.id}`,
        type: 'REVISION_COMPLETED',
        title: `Recall Logged: ${problemTitle}`,
        description: `SM-2 scheduled to +${nextIntervalDays} days (${confidence})`,
        timestamp: pe.createdAt.toISOString(),
        url: `/dashboard/revision`,
        statusText: `+${nextIntervalDays}d`,
        statusVariant: 'amber',
      },
    });
  }

  // Sort all events chronologically descending
  rawEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return rawEvents.slice(0, limit).map((r) => r.item);
}
