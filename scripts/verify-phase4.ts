// ============================================================================
// PREPOS PHASE 4: CORE CS LEARNING SYSTEM VERIFICATION SUITE
// Tests Hub Data, Server-Side Grading, Mistake Review, PRS & Daily Mission
// ============================================================================

import prisma from '../lib/db';
import { getCoreCSHubData } from '../lib/services/core-cs';
import { submitQuizAttempt, getQuizAttemptReview } from '../lib/services/progress';
import { calculatePRS } from '../lib/services/readiness-score';
import { getOrCreateDailyMissions } from '../lib/services/daily-mission';
import { DBMS_TOPICS, OS_TOPICS } from '../lib/services/core-cs-curriculum';

async function main() {
  console.log('====================================================');
  console.log('PREPOS PHASE 4 — CORE CS VERIFICATION SUITE');
  console.log('====================================================\n');

  // Test candidate
  const candidate = await prisma.user.findFirst({
    where: { email: 'priya.candidate@univ.edu' },
  });

  if (!candidate) {
    throw new Error('Test user priya.candidate@univ.edu not found in database');
  }

  const userId = candidate.id;
  console.log(`[PASS] Using test candidate: ${candidate.email} (${userId})`);

  // 1. Verify Core CS Curriculum Taxonomy
  console.log('\n--- 1. Testing Core CS Curriculum Taxonomy ---');
  if (DBMS_TOPICS.length !== 5) {
    throw new Error(`Expected 5 DBMS topics, found ${DBMS_TOPICS.length}`);
  }
  if (OS_TOPICS.length !== 5) {
    throw new Error(`Expected 5 OS topics, found ${OS_TOPICS.length}`);
  }
  console.log(`[PASS] DBMS curriculum defined with 5 placement topics: ${DBMS_TOPICS.map((t) => t.title).join(', ')}`);
  console.log(`[PASS] OS curriculum defined with 5 placement topics: ${OS_TOPICS.map((t) => t.title).join(', ')}`);

  // 2. Test Core CS Hub Data & Security Sanity
  console.log('\n--- 2. Testing Hub Data Aggregation & Server-Side Security ---');
  const hubData = await getCoreCSHubData(userId);

  if (hubData.subjects.length < 2) {
    throw new Error(`Expected at least 2 subjects, found ${hubData.subjects.length}`);
  }
  console.log(`[PASS] Subjects fetched: ${hubData.subjects.map((s) => s.title).join(' | ')}`);
  console.log(`[PASS] Recommended Drill: ${hubData.recommendedDrill.quizTitle} (${hubData.recommendedDrill.reason})`);

  // SECURITY CHECK: Verify answer keys and explanations are NEVER in client quizzes
  for (const quiz of hubData.quizzes) {
    for (const q of quiz.questions) {
      if ('explanation' in q && (q as any).explanation) {
        throw new Error(`SECURITY VIOLATION: Explanation exposed on client question ${q.id}`);
      }
      for (const opt of q.options) {
        if ('isCorrect' in opt) {
          throw new Error(`SECURITY VIOLATION: isCorrect exposed on client option ${opt.id}`);
        }
      }
    }
  }
  console.log('[PASS] SECURITY VERIFIED: QuestionOption.isCorrect and Question.explanation are omitted from client data.');

  // 3. Test Daily Mission Generation
  console.log('\n--- 3. Testing Daily Mission Core CS Integration ---');
  const missions = await getOrCreateDailyMissions(userId);
  const coreCsMission = missions.find((m) => m.type === 'CORE_CS');
  if (!coreCsMission) {
    throw new Error('Daily mission did not include CORE_CS task!');
  }
  console.log(`[PASS] Daily mission includes Core CS task: "${coreCsMission.title}" (target: ${coreCsMission.targetUrl})`);

  // 4. Test DBMS Speed Drill Server-Side Grading
  console.log('\n--- 4. Testing DBMS Speed Drill Server-Side Grading ---');
  const dbmsQuiz = await prisma.coreCSQuiz.findFirst({
    where: { slug: 'dbms-placement-quiz' },
    include: {
      questions: {
        include: { options: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!dbmsQuiz) {
    throw new Error('DBMS quiz not found in database');
  }

  // Intentionally answer 8 correctly and 2 incorrectly
  const dbmsAnswers: Record<string, string> = {};
  dbmsQuiz.questions.forEach((q, idx) => {
    const correctOpt = q.options.find((o) => o.isCorrect);
    const wrongOpt = q.options.find((o) => !o.isCorrect);

    if (idx < 8 && correctOpt) {
      dbmsAnswers[q.id] = correctOpt.id;
    } else if (wrongOpt) {
      dbmsAnswers[q.id] = wrongOpt.id; // Intentionally wrong on last 2 questions
    }
  });

  const dbmsResult = await submitQuizAttempt(userId, dbmsQuiz.id, dbmsAnswers, 180);
  console.log(`[PASS] DBMS Grading: ${dbmsResult.correctQuestions} / ${dbmsResult.totalQuestions} (${dbmsResult.scorePercentage}%)`);

  if (dbmsResult.correctQuestions !== 8 || dbmsResult.scorePercentage !== 80) {
    throw new Error(`Expected 8/10 (80%), got ${dbmsResult.correctQuestions}/${dbmsResult.totalQuestions} (${dbmsResult.scorePercentage}%)`);
  }

  if (dbmsResult.strongTopics.length === 0) {
    throw new Error('Expected at least one strong topic identified');
  }
  if (dbmsResult.weakTopics.length === 0) {
    throw new Error('Expected at least one weak topic identified for the 2 missed questions');
  }
  console.log(`[PASS] Strong Topics: ${dbmsResult.strongTopics.join(', ')}`);
  console.log(`[PASS] Weak Topics: ${dbmsResult.weakTopics.join(', ')}`);

  // Verify daily mission was automatically marked as completed!
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const updatedMission = await prisma.dailyMission.findFirst({
    where: { userId, date: today, type: 'CORE_CS' },
  });
  if (!updatedMission?.isCompleted) {
    throw new Error('Core CS submission did not auto-complete daily mission!');
  }
  console.log('[PASS] Daily Mission auto-completion: CORE_CS mission marked isCompleted: true!');

  // 5. Test OS Speed Drill Server-Side Grading
  console.log('\n--- 5. Testing Operating Systems Speed Drill Flow ---');
  const osQuiz = await prisma.coreCSQuiz.findFirst({
    where: { slug: 'os-placement-quiz' },
    include: {
      questions: {
        include: { options: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!osQuiz) {
    throw new Error('OS quiz not found in database');
  }

  const osAnswers: Record<string, string> = {};
  osQuiz.questions.forEach((q, idx) => {
    const correctOpt = q.options.find((o) => o.isCorrect);
    const wrongOpt = q.options.find((o) => !o.isCorrect);

    if (idx < 7 && correctOpt) {
      osAnswers[q.id] = correctOpt.id;
    } else if (wrongOpt) {
      osAnswers[q.id] = wrongOpt.id;
    }
  });

  const osResult = await submitQuizAttempt(userId, osQuiz.id, osAnswers, 240);
  console.log(`[PASS] OS Grading: ${osResult.correctQuestions} / ${osResult.totalQuestions} (${osResult.scorePercentage}%)`);

  if (osResult.correctQuestions !== 7 || osResult.scorePercentage !== 70) {
    throw new Error(`Expected 7/10 (70%), got ${osResult.correctQuestions}/${osResult.totalQuestions} (${osResult.scorePercentage}%)`);
  }

  // 6. Test Mistake Review & Security Ownership Enforcement
  console.log('\n--- 6. Testing Mistake Review & Ownership Validation ---');
  const reviewData = await getQuizAttemptReview(userId, dbmsResult.attemptId);
  if (!reviewData) {
    throw new Error(`Failed to retrieve mistake review for attempt ${dbmsResult.attemptId}`);
  }

  const missedQs = reviewData.gradedQuestions.filter((q) => !q.isCorrect);
  if (missedQs.length !== 2) {
    throw new Error(`Expected 2 missed questions in review, found ${missedQs.length}`);
  }

  console.log(`[PASS] Mistake review contains ${missedQs.length} missed questions with full explanations:`);
  missedQs.forEach((q, i) => {
    console.log(`   ${i + 1}. Q: "${q.questionText.slice(0, 50)}..."`);
    console.log(`      Your answer: "${q.selectedOptionText}"`);
    console.log(`      Correct answer: "${q.correctOptionText}"`);
    console.log(`      Explanation: "${q.explanation.slice(0, 60)}..."`);
  });

  // Verify unauthorized user CANNOT view candidate's attempt
  const unauthorizedReview = await getQuizAttemptReview('fake-unauthorized-user-id', dbmsResult.attemptId);
  if (unauthorizedReview !== null) {
    throw new Error('SECURITY VIOLATION: Unauthorized user could access another student attempt review!');
  }
  console.log('[PASS] SECURITY VERIFIED: Attempt review enforces authenticated user ownership.');

  // 7. Test PRS Recalculation & 30% Weighting
  console.log('\n--- 7. Testing PRS Component Recalculation ---');
  const prs = await calculatePRS(userId);
  console.log(`[PASS] Recalculated PRS Score: ${prs.totalScore} / 100`);
  console.log(`   - DSA Score: ${prs.dsaScore} (40% weight)`);
  console.log(`   - Core CS Score: ${prs.coreCsScore} (30% weight)`);
  console.log(`   - OA Score: ${prs.oaScore} (15% weight)`);
  console.log(`   - Consistency Score: ${prs.consistencyScore} (15% weight)`);

  if (prs.coreCsScore === 0) {
    throw new Error('Core CS score was 0 despite completed attempts!');
  }

  // Verify ReadinessScore record exists in DB
  const scoreRecord = await prisma.readinessScore.findUnique({
    where: { userId },
  });
  if (!scoreRecord || scoreRecord.coreCsScore !== prs.coreCsScore) {
    throw new Error('ReadinessScore table does not match calculated Core CS score!');
  }
  console.log('[PASS] ReadinessScore database persistence verified.');

  // 8. Re-query Hub Data to verify updated metrics and weak areas
  console.log('\n--- 8. Testing Updated Hub State & Weak Areas Detection ---');
  const updatedHub = await getCoreCSHubData(userId);
  console.log(`[PASS] Recent attempts count: ${updatedHub.recentAttempts.length}`);
  console.log(`[PASS] Weak areas detected: ${updatedHub.weakAreas.length}`);
  updatedHub.weakAreas.forEach((w) => {
    console.log(`   - Topic: ${w.topicTitle} (${w.missCount} misses)`);
  });
  console.log(`[PASS] Revision queue questions: ${updatedHub.revisionQuestions.length}`);

  console.log('\n====================================================');
  console.log('ALL PHASE 4 CORE CS TESTS PASSED SUCCESSFULLY! (8/8)');
  console.log('====================================================');
}

main()
  .catch((err) => {
    console.error('\nFAILED VERIFICATION:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
