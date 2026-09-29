// ============================================================================
// PREPOS ASSESSMENT SCORING & EVALUATION SERVICE
// Centralized, Server-Side Authoritative Grading & Diagnostic Analytics
// ============================================================================

import prisma from '../db';
import { calculatePRS } from './readiness-score';

export interface SectionResultSummary {
  sectionId: string;
  title: string;
  type: string;
  score: number;
  maxScore: number;
  scorePct: number;
  questionsAttempted: number;
  questionsCorrect: number;
  totalQuestions: number;
}

export interface QuestionReviewItem {
  questionId: string;
  sectionId: string;
  type: 'CODING' | 'MCQ';
  orderIndex: number;
  title: string;
  marks: number;
  marksAwarded: number;
  isCorrect: boolean;
  isAttempted: boolean;
  // MCQ Review Details
  selectedOptionId?: string | null;
  selectedOptionText?: string | null;
  correctOptionId?: string;
  correctOptionText?: string;
  explanation?: string;
  topicTitle?: string;
  // Coding Review Details
  problemSlug?: string;
  passedTests?: number;
  totalTests?: number;
  codeSnippet?: string;
  codeLanguage?: string;
  statusVerdict?: string;
}

export interface AssessmentResultSummary {
  attemptId: string;
  assessmentId: string;
  assessmentSlug: string;
  assessmentTitle: string;
  companyName: string;
  companySlug: string;
  status: string;
  totalScore: number;
  maxPossibleScore: number;
  scorePct: number;
  passed: boolean;
  passingScorePct: number;
  durationTakenSec: number;
  durationMin: number;
  startedAt: string;
  submittedAt: string | null;
  sections: SectionResultSummary[];
  questions: QuestionReviewItem[];
  strengths: string[];
  weakAreas: string[];
}

/**
 * Centrally evaluates an assessment attempt.
 * Evaluates all MCQs (including negative marking), aggregates best coding submissions,
 * computes section breakdowns and grand total, marks status EVALUATED, and triggers PRS update.
 */
export async function evaluateAssessmentAttempt(attemptId: string): Promise<AssessmentResultSummary> {
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
                      testCases: true,
                      topic: true,
                    },
                  },
                  mcqQuestion: {
                    include: {
                      options: { orderBy: { orderIndex: 'asc' } },
                      quiz: { include: { subject: true } },
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

  if (!attempt) {
    throw new Error(`Assessment attempt ${attemptId} not found`);
  }

  // If already evaluated, return the compiled summary
  if (attempt.status === 'EVALUATED') {
    return compileResultSummary(attemptId);
  }

  // Atomically update status to EVALUATING to prevent duplicate evaluation
  await prisma.assessmentAttempt.update({
    where: { id: attemptId },
    data: { status: 'EVALUATING' },
  });

  let grandTotalScore = 0;
  let grandMaxScore = 0;
  const sectionScoresToPersist: {
    attemptId: string;
    sectionId: string;
    score: number;
    maxScore: number;
    scorePct: number;
    questionsAttempted: number;
    questionsCorrect: number;
    totalQuestions: number;
  }[] = [];

  const strengthTopicsSet = new Set<string>();
  const weakTopicsSet = new Set<string>();

  for (const section of attempt.assessment.sections) {
    let sectionScore = 0;
    let sectionMax = 0;
    let questionsAttempted = 0;
    let questionsCorrect = 0;

    for (const q of section.questions) {
      sectionMax += q.marks;
      const answer = attempt.answers.find((a) => a.questionId === q.id);

      if (q.type === 'MCQ' && q.mcqQuestion) {
        const correctOpt = q.mcqQuestion.options.find((o) => o.isCorrect);
        const selectedId = answer?.selectedOptionId;

        const topicName = q.mcqQuestion.quiz?.title || 'Core CS Foundations';

        if (selectedId) {
          questionsAttempted++;
          const isCorrect = selectedId === correctOpt?.id;

          if (isCorrect) {
            questionsCorrect++;
            const marksAwarded = q.marks;
            sectionScore += marksAwarded;
            strengthTopicsSet.add(topicName);

            await prisma.assessmentAnswer.update({
              where: { id: answer!.id },
              data: {
                isCorrect: true,
                marksAwarded,
                evaluatedAt: new Date(),
              },
            });
          } else {
            const marksAwarded = -Math.abs(q.negativeMarks);
            sectionScore += marksAwarded;
            weakTopicsSet.add(topicName);

            await prisma.assessmentAnswer.update({
              where: { id: answer!.id },
              data: {
                isCorrect: false,
                marksAwarded,
                evaluatedAt: new Date(),
              },
            });
          }
        } else {
          // Unanswered MCQ
          if (answer) {
            await prisma.assessmentAnswer.update({
              where: { id: answer.id },
              data: {
                isCorrect: false,
                marksAwarded: 0.0,
                evaluatedAt: new Date(),
              },
            });
          }
        }
      } else if (q.type === 'CODING' && q.problem) {
        const topicName = q.problem.topic?.title || 'Algorithmic Problem Solving';
        const problemSubmissions = attempt.submissions.filter((s) => s.questionId === q.id);

        if (problemSubmissions.length > 0) {
          questionsAttempted++;
          // Candidate's best submission for this question
          const bestSub = problemSubmissions.reduce((prev, curr) =>
            curr.marksEarned > prev.marksEarned ? curr : prev
          );

          sectionScore += bestSub.marksEarned;
          const isAccepted = bestSub.status === 'ACCEPTED';

          if (isAccepted) {
            questionsCorrect++;
            strengthTopicsSet.add(topicName);

            // Spaced Repetition Revision integration: schedule review for Day 7
            if (q.problemId) {
              const dueAt = new Date();
              dueAt.setDate(dueAt.getDate() + 7);
              await prisma.revision.upsert({
                where: { userId_problemId: { userId: attempt.userId, problemId: q.problemId } },
                update: { dueAt },
                create: { userId: attempt.userId, problemId: q.problemId, dueAt },
              }).catch(() => null);
            }
          } else {
            weakTopicsSet.add(topicName);
          }

          if (answer) {
            await prisma.assessmentAnswer.update({
              where: { id: answer.id },
              data: {
                isCorrect: isAccepted,
                marksAwarded: bestSub.marksEarned,
                evaluatedAt: new Date(),
              },
            });
          }
        } else {
          // Unattempted coding problem
          weakTopicsSet.add(topicName);
          if (answer) {
            await prisma.assessmentAnswer.update({
              where: { id: answer.id },
              data: {
                isCorrect: false,
                marksAwarded: 0.0,
                evaluatedAt: new Date(),
              },
            });
          }
        }
      }
    }

    // Floor section score at 0.0 to prevent negative section totals
    const finalSectionScore = Math.max(0, Math.round(sectionScore * 10) / 10);
    const sectionPct = sectionMax > 0 ? (finalSectionScore / sectionMax) * 100 : 0;

    sectionScoresToPersist.push({
      attemptId,
      sectionId: section.id,
      score: finalSectionScore,
      maxScore: sectionMax,
      scorePct: Math.round(sectionPct * 10) / 10,
      questionsAttempted,
      questionsCorrect,
      totalQuestions: section.questions.length,
    });

    grandTotalScore += finalSectionScore;
    grandMaxScore += sectionMax;
  }

  const finalScorePct = grandMaxScore > 0 ? Math.round((grandTotalScore / grandMaxScore) * 100) : 0;
  const isPassed = finalScorePct >= attempt.assessment.passingScorePct;
  const finishTime = attempt.submittedAt ?? new Date();
  const durationTakenSec = Math.max(0, Math.floor((finishTime.getTime() - attempt.startedAt.getTime()) / 1000));

  // Persist evaluation updates and section scores in a transaction
  await prisma.$transaction([
    prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'EVALUATED',
        evaluatedAt: new Date(),
        submittedAt: finishTime,
        totalScore: grandTotalScore,
        maxPossibleScore: grandMaxScore,
        scorePct: finalScorePct,
        passed: isPassed,
        durationTakenSec,
      },
    }),
    ...sectionScoresToPersist.map((ss) =>
      prisma.assessmentSectionScore.upsert({
        where: {
          attemptId_sectionId: {
            attemptId,
            sectionId: ss.sectionId,
          },
        },
        update: ss,
        create: ss,
      })
    ),
  ]);

  // Record Streak and Progress Events
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  await prisma.streakEvent.upsert({
    where: {
      userId_date_activityType: {
        userId: attempt.userId,
        date: today,
        activityType: 'OA',
      },
    },
    update: { count: { increment: 1 } },
    create: { userId: attempt.userId, date: today, activityType: 'OA', count: 1 },
  }).catch(() => null);

  await prisma.progressEvent.create({
    data: {
      userId: attempt.userId,
      eventType: 'ASSESSMENT_COMPLETED',
      metadata: JSON.stringify({
        attemptId,
        assessmentSlug: attempt.assessment.slug,
        scorePct: finalScorePct,
        passed: isPassed,
        totalScore: grandTotalScore,
      }),
    },
  }).catch(() => null);

  // Auto-complete any active Daily Mission matching ASSESSMENT or OA
  await prisma.dailyMission.updateMany({
    where: {
      userId: attempt.userId,
      date: today,
      type: { in: ['ASSESSMENT', 'OA'] },
      isCompleted: false,
    },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  }).catch(() => null);

  // Centrally recalculate PRS for the candidate
  await calculatePRS(attempt.userId).catch((err) => {
    console.error('Failed to recalculate PRS after assessment evaluation:', err);
  });

  return compileResultSummary(attemptId);
}

/**
 * Compiles a rich diagnostic result summary for the results page.
 */
export async function compileResultSummary(attemptId: string): Promise<AssessmentResultSummary> {
  const attempt = await prisma.assessmentAttempt.findUniqueOrThrow({
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
                      testCases: { select: { id: true, isSecret: true } },
                      topic: true,
                    },
                  },
                  mcqQuestion: {
                    include: {
                      options: { orderBy: { orderIndex: 'asc' } },
                      quiz: { include: { subject: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      answers: {
        include: {
          selectedOption: true,
        },
      },
      submissions: {
        orderBy: { createdAt: 'desc' },
      },
      sectionScores: {
        include: {
          section: true,
        },
      },
    },
  });

  const sectionSummaries: SectionResultSummary[] = attempt.sectionScores.map((ss) => ({
    sectionId: ss.sectionId,
    title: ss.section.title,
    type: ss.section.type,
    score: ss.score,
    maxScore: ss.maxScore,
    scorePct: ss.scorePct,
    questionsAttempted: ss.questionsAttempted,
    questionsCorrect: ss.questionsCorrect,
    totalQuestions: ss.totalQuestions,
  }));

  const questionReviews: QuestionReviewItem[] = [];
  const strengthsSet = new Set<string>();
  const weakAreasSet = new Set<string>();

  for (const section of attempt.assessment.sections) {
    for (const q of section.questions) {
      const answer = attempt.answers.find((a) => a.questionId === q.id);

      if (q.type === 'MCQ' && q.mcqQuestion) {
        const correctOpt = q.mcqQuestion.options.find((o) => o.isCorrect);
        const isAttempted = Boolean(answer?.selectedOptionId);
        const isCorrect = isAttempted && answer?.selectedOptionId === correctOpt?.id;

        const topicName = q.mcqQuestion.quiz?.title || 'Core CS Foundations';
        if (isCorrect) strengthsSet.add(topicName);
        else if (isAttempted) weakAreasSet.add(topicName);

        questionReviews.push({
          questionId: q.id,
          sectionId: section.id,
          type: 'MCQ',
          orderIndex: q.orderIndex,
          title: q.mcqQuestion.questionText,
          marks: q.marks,
          marksAwarded: answer?.marksAwarded ?? 0,
          isCorrect,
          isAttempted,
          selectedOptionId: answer?.selectedOptionId,
          selectedOptionText: answer?.selectedOption?.optionText ?? null,
          correctOptionId: correctOpt?.id,
          correctOptionText: correctOpt?.optionText,
          explanation: q.mcqQuestion.explanation,
          topicTitle: topicName,
        });
      } else if (q.type === 'CODING' && q.problem) {
        const questionSubs = attempt.submissions.filter((s) => s.questionId === q.id);
        const bestSub = questionSubs.length > 0
          ? questionSubs.reduce((prev, curr) => (curr.marksEarned > prev.marksEarned ? curr : prev))
          : null;

        const isAttempted = Boolean(bestSub || (answer?.codeDraft && answer.codeDraft.trim().length > 0));
        const isCorrect = bestSub?.status === 'ACCEPTED';

        const topicName = q.problem.topic?.title || 'Algorithmic Problem Solving';
        if (isCorrect) strengthsSet.add(topicName);
        else weakAreasSet.add(topicName);

        questionReviews.push({
          questionId: q.id,
          sectionId: section.id,
          type: 'CODING',
          orderIndex: q.orderIndex,
          title: q.problem.title,
          marks: q.marks,
          marksAwarded: bestSub?.marksEarned ?? 0,
          isCorrect,
          isAttempted,
          problemSlug: q.problem.slug,
          passedTests: bestSub?.passedTests ?? 0,
          totalTests: bestSub?.totalTests ?? q.problem.testCases.length,
          codeSnippet: bestSub?.code ?? answer?.codeDraft ?? '',
          codeLanguage: bestSub?.language ?? (answer?.codeLanguage as any) ?? 'CPP',
          statusVerdict: bestSub?.status ?? (isAttempted ? 'NOT_SUBMITTED' : 'UNATTEMPTED'),
          topicTitle: topicName,
        });
      }
    }
  }

  // Deduplicate weak areas from strengths
  const finalWeakAreas = Array.from(weakAreasSet).filter((w) => !strengthsSet.has(w) || weakAreasSet.size <= 2);

  return {
    attemptId: attempt.id,
    assessmentId: attempt.assessment.id,
    assessmentSlug: attempt.assessment.slug,
    assessmentTitle: attempt.assessment.title,
    companyName: attempt.assessment.company.name,
    companySlug: attempt.assessment.company.slug,
    status: attempt.status,
    totalScore: attempt.totalScore,
    maxPossibleScore: attempt.maxPossibleScore,
    scorePct: attempt.scorePct,
    passed: attempt.passed,
    passingScorePct: attempt.assessment.passingScorePct,
    durationTakenSec: attempt.durationTakenSec,
    durationMin: attempt.assessment.durationMin,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    sections: sectionSummaries,
    questions: questionReviews,
    strengths: Array.from(strengthsSet).slice(0, 4),
    weakAreas: finalWeakAreas.slice(0, 4),
  };
}
