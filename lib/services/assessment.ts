// ============================================================================
// PREPOS ASSESSMENT SERVICE
// Authoritative Lifecycle, Server-Side Timing, MCQ & Coding Delivery
// ============================================================================

import prisma from '../db';
import { getExecutionProvider, SupportedLanguage, SingleTestResult, ExecutionVerdict } from './code-execution';
import { getStarterCode } from './starter-code';
import { evaluateAssessmentAttempt, AssessmentResultSummary } from './assessment-scoring';

export interface ClientAssessmentOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface ClientAssessmentQuestion {
  id: string;
  sectionId: string;
  type: 'CODING' | 'MCQ';
  orderIndex: number;
  marks: number;
  negativeMarks: number;
  // MCQ Payload (Strictly stripped of isCorrect and explanation)
  questionText?: string;
  options?: ClientAssessmentOption[];
  // Coding Payload (Strictly stripped of hidden testcases)
  title?: string;
  statement?: string;
  difficulty?: string;
  constraints?: string;
  expectedTimeComplexity?: string | null;
  expectedSpaceComplexity?: string | null;
  sampleTestCases?: {
    id: string;
    input: string;
    expected: string;
    explanation?: string | null;
  }[];
  starterCode?: string;
  // Student's Saved State
  savedAnswer?: {
    selectedOptionId?: string | null;
    codeDraft?: string | null;
    codeLanguage?: SupportedLanguage | null;
    lastSavedAt?: string;
  };
  // Latest Coding Submission Verdict (if any)
  latestSubmission?: {
    status: string;
    passedTests: number;
    totalTests: number;
    marksEarned: number;
  } | null;
}

export interface ClientAssessmentSection {
  id: string;
  title: string;
  description: string | null;
  type: 'CODING' | 'CORE_CS';
  orderIndex: number;
  totalMarks: number;
  timeLimitMin: number | null;
  questions: ClientAssessmentQuestion[];
}

export interface AssessmentWorkspaceData {
  attemptId: string;
  assessmentId: string;
  slug: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMin: number;
  totalMarks: number;
  passingScorePct: number;
  companyName: string;
  companySlug: string;
  startedAt: string;
  expiresAt: string;
  serverTime: string;
  remainingSeconds: number;
  status: string;
  sections: ClientAssessmentSection[];
}

export interface AssessmentOverviewData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMin: number;
  totalMarks: number;
  passingScorePct: number;
  difficulty: string;
  companyName: string;
  companySlug: string;
  totalQuestions: number;
  sections: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    orderIndex: number;
    totalMarks: number;
    questionsCount: number;
  }[];
  activeAttempt?: {
    attemptId: string;
    status: string;
    remainingSeconds: number;
    expiresAt: string;
  } | null;
  pastAttempts: {
    attemptId: string;
    attemptNumber: number;
    status: string;
    scorePct: number;
    totalScore: number;
    maxPossibleScore: number;
    passed: boolean;
    durationTakenSec: number;
    completedAt: string;
  }[];
}

/**
 * Retrieves assessment metadata, syllabus breakdown, and student attempt history.
 */
export async function getAssessmentOverview(
  assessmentSlugOrId: string,
  userId?: string
): Promise<AssessmentOverviewData | null> {
  const assessment = await prisma.assessment.findFirst({
    where: {
      OR: [{ id: assessmentSlugOrId }, { slug: assessmentSlugOrId }],
      status: 'PUBLISHED',
    },
    include: {
      company: true,
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          questions: { select: { id: true } },
        },
      },
    },
  });

  if (!assessment) return null;

  let activeAttempt: AssessmentOverviewData['activeAttempt'] = null;
  let pastAttempts: AssessmentOverviewData['pastAttempts'] = [];

  if (userId) {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        assessmentId: assessment.id,
        userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const active = attempts.find(
      (a) => (a.status === 'STARTED' || a.status === 'IN_PROGRESS') && a.expiresAt > now
    );

    if (active) {
      const remainingSeconds = Math.max(0, Math.floor((active.expiresAt.getTime() - now.getTime()) / 1000));
      activeAttempt = {
        attemptId: active.id,
        status: active.status,
        remainingSeconds,
        expiresAt: active.expiresAt.toISOString(),
      };
    }

    pastAttempts = attempts
      .filter((a) => a.status === 'EVALUATED' || a.status === 'SUBMITTED' || a.status === 'EXPIRED')
      .map((a) => ({
        attemptId: a.id,
        attemptNumber: a.attemptNumber,
        status: a.status,
        scorePct: a.scorePct,
        totalScore: a.totalScore,
        maxPossibleScore: a.maxPossibleScore,
        passed: a.passed,
        durationTakenSec: a.durationTakenSec,
        completedAt: (a.submittedAt ?? a.updatedAt).toISOString(),
      }));
  }

  const totalQuestions = assessment.sections.reduce((acc, s) => acc + s.questions.length, 0);

  return {
    id: assessment.id,
    slug: assessment.slug,
    title: assessment.title,
    description: assessment.description,
    instructions: assessment.instructions,
    durationMin: assessment.durationMin,
    totalMarks: assessment.totalMarks,
    passingScorePct: assessment.passingScorePct,
    difficulty: assessment.difficulty,
    companyName: assessment.company.name,
    companySlug: assessment.company.slug,
    totalQuestions,
    sections: assessment.sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      type: s.type,
      orderIndex: s.orderIndex,
      totalMarks: s.totalMarks,
      questionsCount: s.questions.length,
    })),
    activeAttempt,
    pastAttempts,
  };
}

/**
 * Starts a new assessment attempt or resumes an active one.
 * Authoritative Server-Side Timing: startedAt = now(), expiresAt = now() + durationMin.
 */
export async function startOrResumeAssessment(
  userId: string,
  assessmentSlugOrId: string
): Promise<{ attemptId: string; expiresAt: string; isResumed: boolean }> {
  const assessment = await prisma.assessment.findFirst({
    where: {
      OR: [{ id: assessmentSlugOrId }, { slug: assessmentSlugOrId }],
      status: 'PUBLISHED',
    },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    throw new Error('Assessment not found or not published');
  }

  const now = new Date();

  // 1. Check for existing active attempt
  const existingAttempt = await prisma.assessmentAttempt.findFirst({
    where: {
      userId,
      assessmentId: assessment.id,
      status: { in: ['STARTED', 'IN_PROGRESS'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existingAttempt) {
    // If expired, trigger evaluation and don't resume
    if (now > existingAttempt.expiresAt) {
      await evaluateAssessmentAttempt(existingAttempt.id).catch(() => null);
    } else {
      // Resume valid attempt
      if (existingAttempt.status === 'STARTED') {
        await prisma.assessmentAttempt.update({
          where: { id: existingAttempt.id },
          data: { status: 'IN_PROGRESS' },
        });
      }
      return {
        attemptId: existingAttempt.id,
        expiresAt: existingAttempt.expiresAt.toISOString(),
        isResumed: true,
      };
    }
  }

  // 2. Create New Attempt
  const pastAttemptsCount = await prisma.assessmentAttempt.count({
    where: { userId, assessmentId: assessment.id },
  });

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + assessment.durationMin * 60 * 1000);

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      userId,
      assessmentId: assessment.id,
      attemptNumber: pastAttemptsCount + 1,
      status: 'IN_PROGRESS',
      startedAt,
      expiresAt,
    },
  });

  // 3. Pre-seed initial AssessmentAnswer rows with default starter code for coding questions
  const allQuestions = assessment.sections.flatMap((s) => s.questions);
  for (const q of allQuestions) {
    let initialDraft: string | undefined = undefined;
    let initialLang: 'CPP' | undefined = undefined;

    if (q.type === 'CODING' && q.problem) {
      initialDraft = getStarterCode(q.problem.slug, 'CPP');
      initialLang = 'CPP';
    }

    await prisma.assessmentAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        codeDraft: initialDraft,
        codeLanguage: initialLang,
      },
    });
  }

  return {
    attemptId: attempt.id,
    expiresAt: expiresAt.toISOString(),
    isResumed: false,
  };
}

/**
 * Loads clean, client-safe workspace data for an active attempt.
 * CRITICAL SECURITY:
 * 1. Strips isCorrect and explanation from MCQ options and questions.
 * 2. Strips hidden testcases (isSecret: true) from coding problems.
 */
export async function getAssessmentWorkspaceData(
  userId: string,
  attemptId: string
): Promise<AssessmentWorkspaceData> {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          company: true,
          sections: {
            orderBy: { orderIndex: 'asc' },
            include: {
              questions: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  problem: {
                    include: {
                      testCases: {
                        where: { isSecret: false },
                        orderBy: { orderIndex: 'asc' },
                      },
                    },
                  },
                  mcqQuestion: {
                    include: {
                      options: {
                        orderBy: { orderIndex: 'asc' },
                        select: {
                          id: true,
                          optionText: true,
                          orderIndex: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      answers: true,
      submissions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error('Assessment attempt not found or unauthorized');
  }

  const now = new Date();
  const isTimeExpired = now > attempt.expiresAt;

  // Auto-expire if time has elapsed
  if (isTimeExpired && (attempt.status === 'STARTED' || attempt.status === 'IN_PROGRESS')) {
    await evaluateAssessmentAttempt(attempt.id).catch(() => null);
  }

  const remainingSeconds = Math.max(0, Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000));

  const sections: ClientAssessmentSection[] = attempt.assessment.sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    description: sec.description,
    type: sec.type as 'CODING' | 'CORE_CS',
    orderIndex: sec.orderIndex,
    totalMarks: sec.totalMarks,
    timeLimitMin: sec.timeLimitMin,
    questions: sec.questions.map((q) => {
      const savedAnswer = attempt.answers.find((a) => a.questionId === q.id);
      const questionSubs = attempt.submissions.filter((s) => s.questionId === q.id);
      const latestSub = questionSubs[0] ?? null;

      if (q.type === 'MCQ' && q.mcqQuestion) {
        return {
          id: q.id,
          sectionId: sec.id,
          type: 'MCQ',
          orderIndex: q.orderIndex,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          questionText: q.mcqQuestion.questionText,
          options: q.mcqQuestion.options.map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
            orderIndex: opt.orderIndex,
          })),
          savedAnswer: {
            selectedOptionId: savedAnswer?.selectedOptionId,
            lastSavedAt: savedAnswer?.lastSavedAt.toISOString(),
          },
        };
      }

      // CODING Question
      const prob = q.problem;
      const starterCode = prob ? getStarterCode(prob.slug, (savedAnswer?.codeLanguage as any) ?? 'CPP') : '';

      return {
        id: q.id,
        sectionId: sec.id,
        type: 'CODING',
        orderIndex: q.orderIndex,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        title: prob?.title,
        statement: prob?.statement,
        difficulty: prob?.difficulty,
        constraints: prob?.constraints,
        expectedTimeComplexity: prob?.expectedTimeComplexity,
        expectedSpaceComplexity: prob?.expectedSpaceComplexity,
        sampleTestCases: prob?.testCases.map((tc) => ({
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          explanation: tc.explanation,
        })),
        starterCode,
        savedAnswer: {
          codeDraft: savedAnswer?.codeDraft ?? starterCode,
          codeLanguage: (savedAnswer?.codeLanguage as any) ?? 'CPP',
          lastSavedAt: savedAnswer?.lastSavedAt.toISOString(),
        },
        latestSubmission: latestSub
          ? {
              status: latestSub.status,
              passedTests: latestSub.passedTests,
              totalTests: latestSub.totalTests,
              marksEarned: latestSub.marksEarned,
            }
          : null,
      };
    }),
  }));

  return {
    attemptId: attempt.id,
    assessmentId: attempt.assessment.id,
    slug: attempt.assessment.slug,
    title: attempt.assessment.title,
    description: attempt.assessment.description,
    instructions: attempt.assessment.instructions,
    durationMin: attempt.assessment.durationMin,
    totalMarks: attempt.assessment.totalMarks,
    passingScorePct: attempt.assessment.passingScorePct,
    companyName: attempt.assessment.company.name,
    companySlug: attempt.assessment.company.slug,
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: attempt.expiresAt.toISOString(),
    serverTime: now.toISOString(),
    remainingSeconds,
    status: attempt.status,
    sections,
  };
}

/**
 * Validates attempt ownership, active status, and server-side timer integrity.
 */
async function validateActiveAttempt(userId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error('Unauthorized attempt access');
  }

  if (attempt.status !== 'STARTED' && attempt.status !== 'IN_PROGRESS') {
    throw new Error(`Attempt is already ${attempt.status}`);
  }

  const now = new Date();
  if (now > attempt.expiresAt) {
    // Attempt has expired; trigger evaluation and reject new answer mutation
    await evaluateAssessmentAttempt(attemptId).catch(() => null);
    throw new Error('EXPIRED: Assessment time has elapsed. New answers cannot be accepted.');
  }

  return attempt;
}

/**
 * Autosaves student's selected MCQ option.
 */
export async function autosaveMCQAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  selectedOptionId: string
): Promise<{ success: boolean; savedAt: string }> {
  await validateActiveAttempt(userId, attemptId);

  const answer = await prisma.assessmentAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    update: {
      selectedOptionId,
      lastSavedAt: new Date(),
    },
    create: {
      attemptId,
      questionId,
      selectedOptionId,
      lastSavedAt: new Date(),
    },
  });

  return { success: true, savedAt: answer.lastSavedAt.toISOString() };
}

/**
 * Autosaves student's coding editor draft (debounced from client).
 */
export async function autosaveCodeDraft(
  userId: string,
  attemptId: string,
  questionId: string,
  code: string,
  language: SupportedLanguage
): Promise<{ success: boolean; savedAt: string }> {
  await validateActiveAttempt(userId, attemptId);

  const answer = await prisma.assessmentAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    update: {
      codeDraft: code,
      codeLanguage: language as any,
      lastSavedAt: new Date(),
    },
    create: {
      attemptId,
      questionId,
      codeDraft: code,
      codeLanguage: language as any,
      lastSavedAt: new Date(),
    },
  });

  return { success: true, savedAt: answer.lastSavedAt.toISOString() };
}

/**
 * Executes student code against ONLY public sample testcases.
 * CRITICAL RULE: Run Code NEVER records a submission, never updates scores, never alters DSA progress.
 */
export async function runAssessmentCode(
  userId: string,
  attemptId: string,
  questionId: string,
  language: SupportedLanguage,
  code: string
): Promise<{
  success: boolean;
  status: ExecutionVerdict;
  passedTests: number;
  totalTests: number;
  results: SingleTestResult[];
  errorLog?: string;
}> {
  await validateActiveAttempt(userId, attemptId);

  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    include: {
      problem: {
        include: {
          testCases: {
            where: { isSecret: false },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!question || !question.problem) {
    throw new Error('Problem not found');
  }

  const publicTestCases = question.problem.testCases.map((tc) => ({
    id: tc.id,
    orderIndex: tc.orderIndex,
    input: tc.input,
    expected: tc.expected,
    isSecret: false,
  }));

  const provider = getExecutionProvider();
  const outcome = await provider.execute(code, language, publicTestCases);

  const formattedResults: SingleTestResult[] = outcome.testResults.map((r, idx) => ({
    testCaseId: r.testCaseId,
    testCaseNumber: idx + 1,
    isSecret: false,
    status: r.status,
    input: publicTestCases.find((tc) => tc.id === r.testCaseId)?.input,
    expectedOutput: publicTestCases.find((tc) => tc.id === r.testCaseId)?.expected,
    actualOutput: r.actualOutput,
    executionTimeMs: r.executionTimeMs,
    memoryKb: r.memoryKb,
    errorMessage: r.errorMessage,
  }));

  return {
    success: outcome.verdict === 'ACCEPTED',
    status: outcome.verdict,
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
    results: formattedResults,
    errorLog: outcome.errorLog,
  };
}

/**
 * Submits student code for a specific assessment coding question.
 * Evaluates against ALL testcases (public + hidden) using Judge0.
 * Persists AssessmentCodingSubmission and AssessmentExecution.
 * Calculates question marks earned.
 * CRITICAL RULE: Does NOT update UserProgress.isSolved or alter normal DSA roadmap progression.
 */
export async function submitAssessmentCode(
  userId: string,
  attemptId: string,
  questionId: string,
  language: SupportedLanguage,
  code: string
): Promise<{
  success: boolean;
  status: ExecutionVerdict;
  passedTests: number;
  totalTests: number;
  marksEarned: number;
  results: {
    testCaseNumber: number;
    isSecret: boolean;
    status: ExecutionVerdict;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    errorMessage?: string;
  }[];
  errorLog?: string;
}> {
  await validateActiveAttempt(userId, attemptId);

  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    include: {
      problem: {
        include: {
          testCases: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  });

  if (!question || !question.problem) {
    throw new Error('Problem not found');
  }

  const allTestCases = question.problem.testCases.map((tc) => ({
    id: tc.id,
    orderIndex: tc.orderIndex,
    input: tc.input,
    expected: tc.expected,
    isSecret: tc.isSecret,
  }));

  const provider = getExecutionProvider();
  const outcome = await provider.execute(code, language, allTestCases);

  // Map outcome verdict to Prisma SubmissionStatus
  let prismaStatus:
    | 'PENDING'
    | 'ACCEPTED'
    | 'WRONG_ANSWER'
    | 'TIME_LIMIT_EXCEEDED'
    | 'MEMORY_LIMIT_EXCEEDED'
    | 'COMPILATION_ERROR'
    | 'RUNTIME_ERROR';

  switch (outcome.verdict) {
    case 'ACCEPTED':
      prismaStatus = 'ACCEPTED';
      break;
    case 'WRONG_ANSWER':
      prismaStatus = 'WRONG_ANSWER';
      break;
    case 'TIME_LIMIT_EXCEEDED':
      prismaStatus = 'TIME_LIMIT_EXCEEDED';
      break;
    case 'MEMORY_LIMIT_EXCEEDED':
      prismaStatus = 'MEMORY_LIMIT_EXCEEDED';
      break;
    case 'COMPILATION_ERROR':
      prismaStatus = 'COMPILATION_ERROR';
      break;
    case 'RUNTIME_ERROR':
    default:
      prismaStatus = 'RUNTIME_ERROR';
      break;
  }

  // Calculate marks: proportional to passed testcases
  const marksEarned =
    outcome.totalTests > 0
      ? Math.round(((outcome.passedTests / outcome.totalTests) * question.marks) * 10) / 10
      : 0;

  // Persist AssessmentCodingSubmission
  const submission = await prisma.assessmentCodingSubmission.create({
    data: {
      attemptId,
      questionId,
      language: language as any,
      code,
      status: prismaStatus as any,
      passedTests: outcome.passedTests,
      totalTests: outcome.totalTests,
      executionTime: outcome.executionTimeMs,
      memoryKb: outcome.memoryKb,
      errorLog: outcome.errorLog,
      marksEarned,
    },
  });

  // Persist AssessmentExecution for each testcase
  for (const r of outcome.testResults) {
    let itemStatus: typeof prismaStatus = 'RUNTIME_ERROR';
    if (r.status === 'ACCEPTED') itemStatus = 'ACCEPTED';
    else if (r.status === 'WRONG_ANSWER') itemStatus = 'WRONG_ANSWER';
    else if (r.status === 'TIME_LIMIT_EXCEEDED') itemStatus = 'TIME_LIMIT_EXCEEDED';
    else if (r.status === 'MEMORY_LIMIT_EXCEEDED') itemStatus = 'MEMORY_LIMIT_EXCEEDED';
    else if (r.status === 'COMPILATION_ERROR') itemStatus = 'COMPILATION_ERROR';

    await prisma.assessmentExecution.create({
      data: {
        submissionId: submission.id,
        testCaseId: r.testCaseId,
        status: itemStatus as any,
        actualOutput: r.actualOutput,
        executionTimeMs: r.executionTimeMs,
        memoryKb: r.memoryKb,
      },
    });
  }

  // Update latest draft code in AssessmentAnswer
  await prisma.assessmentAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { codeDraft: code, codeLanguage: language as any, lastSavedAt: new Date() },
    create: { attemptId, questionId, codeDraft: code, codeLanguage: language as any, lastSavedAt: new Date() },
  });

  // Client-safe formatted test results (secret test case inputs/outputs strictly omitted)
  const clientResults = outcome.testResults.map((r, idx) => {
    const isSecret = r.isSecret;
    const testInput = isSecret ? undefined : allTestCases.find((tc) => tc.id === r.testCaseId)?.input;
    const testExpected = isSecret ? undefined : allTestCases.find((tc) => tc.id === r.testCaseId)?.expected;
    const testActual = isSecret ? undefined : r.actualOutput;

    return {
      testCaseNumber: idx + 1,
      isSecret,
      status: r.status,
      input: testInput,
      expectedOutput: testExpected,
      actualOutput: testActual,
      errorMessage: r.errorMessage,
    };
  });

  return {
    success: outcome.verdict === 'ACCEPTED',
    status: outcome.verdict,
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
    marksEarned,
    results: clientResults,
    errorLog: outcome.errorLog,
  };
}

/**
 * Submits the complete assessment.
 * Enforces atomic state transition, prevents double submit, and triggers centralized grading.
 */
export async function submitFinalAssessment(
  userId: string,
  attemptId: string
): Promise<{ success: boolean; redirectUrl: string }> {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Already evaluated or submitted
  if (attempt.status === 'EVALUATED' || attempt.status === 'SUBMITTED' || attempt.status === 'EVALUATING') {
    return {
      success: true,
      redirectUrl: `/dashboard/assessments/${attempt.assessmentId}/attempt/${attempt.id}/result`,
    };
  }

  const now = new Date();
  // 15-second grace period strictly for network transit of final click
  const isGraceAllowed = now.getTime() <= attempt.expiresAt.getTime() + 15000;
  const targetStatus = isGraceAllowed ? 'SUBMITTED' : 'EXPIRED';

  // Atomic state transition to prevent double submit
  const updated = await prisma.assessmentAttempt.updateMany({
    where: {
      id: attemptId,
      userId,
      status: { in: ['STARTED', 'IN_PROGRESS'] },
    },
    data: {
      status: targetStatus,
      submittedAt: now,
    },
  });

  if (updated.count === 0) {
    // Another concurrent call already initiated transition
    return {
      success: true,
      redirectUrl: `/dashboard/assessments/${attempt.assessmentId}/attempt/${attempt.id}/result`,
    };
  }

  // Trigger centralized evaluation
  await evaluateAssessmentAttempt(attemptId);

  return {
    success: true,
    redirectUrl: `/dashboard/assessments/${attempt.assessmentId}/attempt/${attempt.id}/result`,
  };
}

export interface AssessmentCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  passingScorePct: number;
  company: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    isTarget: boolean;
  };
  sections: {
    id: string;
    title: string;
    type: 'CODING' | 'CORE_CS';
    totalMarks: number;
    questionsCount: number;
  }[];
  assessmentType: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  attemptsCount: number;
  bestScorePct: number | null;
  latestScorePct: number | null;
  isPassed: boolean;
  activeAttempt: {
    attemptId: string;
    remainingSeconds: number;
  } | null;
  latestAttemptId: string | null;
}

export interface AssessmentCatalogData {
  totalAssessments: number;
  attemptedCount: number;
  passedCount: number;
  averageScorePct: number;
  assessments: AssessmentCatalogItem[];
}

/**
 * Fetches structured assessment catalog with company links, student attempt records,
 * and high-scanability metadata for /dashboard/assessments.
 */
export async function getAssessmentCatalogData(userId: string): Promise<AssessmentCatalogData> {
  const [assessments, userAttempts, targetEvents] = await Promise.all([
    prisma.assessment.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        company: true,
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            questions: { select: { id: true } },
          },
        },
        attempts: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.assessmentAttempt.findMany({
      where: { userId },
      select: {
        assessmentId: true,
        scorePct: true,
        passed: true,
        status: true,
      },
    }),
    prisma.progressEvent.findMany({
      where: {
        userId,
        eventType: 'TARGET_COMPANY_SET',
      },
      select: { metadata: true },
    }),
  ]);

  const targetSet = new Set<string>();
  for (const ev of targetEvents) {
    if (!ev.metadata) continue;
    try {
      const meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata) : (ev.metadata as any);
      if (meta?.companySlug) targetSet.add(meta.companySlug);
    } catch {
      // Ignore
    }
  }

  const now = new Date();
  const catalogItems: AssessmentCatalogItem[] = assessments.map((a) => {
    const isTarget = targetSet.has(a.company.slug);
    const active = a.attempts.find(
      (att) => (att.status === 'STARTED' || att.status === 'IN_PROGRESS') && att.expiresAt > now
    );

    const completedAttempts = a.attempts.filter(
      (att) => att.status === 'EVALUATED' || att.status === 'SUBMITTED' || att.status === 'EXPIRED'
    );

    const bestScorePct =
      completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((att) => att.scorePct))
        : null;

    const latestAttempt = completedAttempts[0];
    const latestScorePct = latestAttempt ? latestAttempt.scorePct : null;
    const isPassed = completedAttempts.some((att) => att.passed);

    let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
    if (active) {
      status = 'IN_PROGRESS';
    } else if (completedAttempts.length > 0) {
      status = 'COMPLETED';
    }

    // Determine assessment type based on sections
    const hasCoding = a.sections.some((s) => s.type === 'CODING');
    const hasCoreCS = a.sections.some((s) => s.type === 'CORE_CS');
    let assessmentType = 'Full-Length Simulation';
    if (hasCoding && hasCoreCS) assessmentType = 'Coding + Core CS MCQ';
    else if (hasCoding) assessmentType = 'Algorithmic Coding Only';
    else if (hasCoreCS) assessmentType = 'Core CS Screening Only';

    const remainingSeconds = active
      ? Math.max(0, Math.floor((active.expiresAt.getTime() - now.getTime()) / 1000))
      : 0;

    let tier = 'High-Impact IT';
    if (['google', 'microsoft', 'amazon', 'uber', 'atlassian'].includes(a.company.slug)) {
      tier = 'Tier-1 Tech';
    } else if (['flipkart', 'goldman-sachs', 'walmart'].includes(a.company.slug)) {
      tier = 'Product';
    }

    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description,
      durationMin: a.durationMin,
      totalMarks: a.totalMarks,
      totalQuestions: a.sections.reduce((sum, s) => sum + s.questions.length, 0),
      difficulty: a.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      passingScorePct: a.passingScorePct,
      company: {
        id: a.company.id,
        name: a.company.name,
        slug: a.company.slug,
        tier,
        isTarget,
      },
      sections: a.sections.map((s) => ({
        id: s.id,
        title: s.title,
        type: s.type as 'CODING' | 'CORE_CS',
        totalMarks: s.totalMarks,
        questionsCount: s.questions.length,
      })),
      assessmentType,
      status,
      attemptsCount: a.attempts.length,
      bestScorePct,
      latestScorePct,
      isPassed,
      activeAttempt: active
        ? {
            attemptId: active.id,
            remainingSeconds,
          }
        : null,
      latestAttemptId: latestAttempt ? latestAttempt.id : null,
    };
  });

  const uniqueAttemptedAssessments = new Set(userAttempts.map((att) => att.assessmentId));
  const uniquePassedAssessments = new Set(
    userAttempts.filter((att) => att.passed).map((att) => att.assessmentId)
  );

  const completedAttempts = userAttempts.filter(
    (att) => att.status === 'EVALUATED' || att.status === 'SUBMITTED'
  );
  const averageScorePct =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, att) => sum + att.scorePct, 0) / completedAttempts.length)
      : 0;

  return {
    totalAssessments: catalogItems.length,
    attemptedCount: uniqueAttemptedAssessments.size,
    passedCount: uniquePassedAssessments.size,
    averageScorePct,
    assessments: catalogItems,
  };
}

export interface HistoricalAttemptItem {
  id: string;
  attemptNumber: number;
  scorePct: number;
  totalScore: number;
  maxPossibleScore: number;
  passed: boolean;
  durationTakenSec: number;
  completedAt: Date;
}

/**
 * Fetches historical attempts for an assessment for performance trend charts.
 */
export async function getAssessmentHistoricalAttempts(
  assessmentSlugOrId: string,
  userId: string
): Promise<HistoricalAttemptItem[]> {
  const assessment = await prisma.assessment.findFirst({
    where: {
      OR: [{ id: assessmentSlugOrId }, { slug: assessmentSlugOrId }],
    },
    select: { id: true },
  });

  if (!assessment) return [];

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      assessmentId: assessment.id,
      userId,
      status: { in: ['EVALUATED', 'SUBMITTED'] },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      attemptNumber: true,
      scorePct: true,
      totalScore: true,
      maxPossibleScore: true,
      passed: true,
      durationTakenSec: true,
      submittedAt: true,
      updatedAt: true,
    },
  });

  return attempts.map((a) => ({
    id: a.id,
    attemptNumber: a.attemptNumber,
    scorePct: a.scorePct,
    totalScore: a.totalScore,
    maxPossibleScore: a.maxPossibleScore,
    passed: a.passed,
    durationTakenSec: a.durationTakenSec,
    completedAt: a.submittedAt ?? a.updatedAt,
  }));
}
