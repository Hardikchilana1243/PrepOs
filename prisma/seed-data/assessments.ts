// ============================================================================
// PREPOS SEED DATA: COMPANY-FOCUSED PRACTICE ASSESSMENTS
// Deterministic, Idempotent Online Assessment (OA) Simulations
// ============================================================================

export interface SeedAssessmentQuestion {
  type: 'CODING' | 'MCQ';
  orderIndex: number;
  marks: number;
  negativeMarks: number;
  problemSlug?: string;
  quizSlug?: string;
  quizQuestionOrderIndex?: number;
}

export interface SeedAssessmentSection {
  title: string;
  description: string;
  type: 'CODING' | 'CORE_CS';
  orderIndex: number;
  totalMarks: number;
  timeLimitMin?: number;
  questions: SeedAssessmentQuestion[];
}

export interface SeedAssessment {
  slug: string;
  companySlug: string;
  title: string;
  description: string;
  instructions: string;
  durationMin: number;
  totalMarks: number;
  passingScorePct: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sections: SeedAssessmentSection[];
}

export const ASSESSMENTS_DATA: SeedAssessment[] = [
  // --------------------------------------------------------------------------
  // 1. Amazon Company-Focused Practice Assessment
  // --------------------------------------------------------------------------
  {
    slug: 'amazon-sde1-practice-oa-1',
    companySlug: 'amazon',
    title: 'Amazon — Company-Focused Practice Assessment 1',
    description:
      'Simulated placement online assessment focusing on high-frequency algorithmic patterns (Hash Maps, Trees) and core CS system fundamentals (ACID properties, Paging).',
    instructions:
      'This is a timed practice assessment designed to simulate recruitment online test environments.\n\n• Section 1 consists of 2 Coding Problems evaluated using automated test suites.\n• Section 2 contains 10 timed Core CS Multiple Choice Questions with negative marking (-0.5 for wrong answers).\n• You may switch between sections at any time before final submission.\n• Code is autosaved continuously during the attempt.\n• The server timer is authoritative. Submitting after expiry will result in automatic evaluation of your saved drafts.',
    durationMin: 60,
    totalMarks: 60,
    passingScorePct: 60,
    difficulty: 'MEDIUM',
    sections: [
      {
        title: 'Section 1: Algorithmic Problem Solving',
        description: 'Implement robust, optimal algorithmic solutions in C++, Java, or Python.',
        type: 'CODING',
        orderIndex: 0,
        totalMarks: 40,
        questions: [
          {
            type: 'CODING',
            orderIndex: 0,
            marks: 20,
            negativeMarks: 0,
            problemSlug: 'array-element-frequency-counter',
          },
          {
            type: 'CODING',
            orderIndex: 1,
            marks: 20,
            negativeMarks: 0,
            problemSlug: 'tree-diameter-calculator',
          },
        ],
      },
      {
        title: 'Section 2: Core CS Foundations',
        description: 'High-yield placement MCQs on DBMS Transaction Isolation, Indexing, and OS Concurrency.',
        type: 'CORE_CS',
        orderIndex: 1,
        totalMarks: 20,
        questions: [
          // DBMS MCQs 1 to 5 (2 marks each, -0.5 negative)
          { type: 'MCQ', orderIndex: 0, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 1 },
          { type: 'MCQ', orderIndex: 1, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 2 },
          { type: 'MCQ', orderIndex: 2, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 3 },
          { type: 'MCQ', orderIndex: 3, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 4 },
          { type: 'MCQ', orderIndex: 4, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 5 },
          // OS MCQs 1 to 5 (2 marks each, -0.5 negative)
          { type: 'MCQ', orderIndex: 5, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 1 },
          { type: 'MCQ', orderIndex: 6, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 2 },
          { type: 'MCQ', orderIndex: 7, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 3 },
          { type: 'MCQ', orderIndex: 8, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 4 },
          { type: 'MCQ', orderIndex: 9, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 5 },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. Microsoft Company-Focused Practice Assessment
  // --------------------------------------------------------------------------
  {
    slug: 'microsoft-sde-practice-oa-1',
    companySlug: 'microsoft',
    title: 'Microsoft — Company-Focused Practice Assessment 1',
    description:
      'Simulated placement online assessment testing two-pointer search algorithms, linked chain manipulation, and database query optimization principles.',
    instructions:
      'This practice assessment replicates standard engineering entry evaluation formats.\n\n• Section 1: 2 Algorithmic coding tasks (30 marks total).\n• Section 2: 10 Core CS MCQs covering Concurrency, SQL Isolation, and Virtual Memory (-0.5 negative marking).\n• Use the question navigator to bookmark questions or jump between sections.\n• Make sure to submit your solution code for each problem before submitting the entire test.',
    durationMin: 45,
    totalMarks: 50,
    passingScorePct: 60,
    difficulty: 'MEDIUM',
    sections: [
      {
        title: 'Section 1: Algorithmic Problem Solving',
        description: 'Solve two pointer and linear data structure problems within expected time and space bounds.',
        type: 'CODING',
        orderIndex: 0,
        totalMarks: 30,
        questions: [
          {
            type: 'CODING',
            orderIndex: 0,
            marks: 15,
            negativeMarks: 0,
            problemSlug: 'two-sum-target-search',
          },
          {
            type: 'CODING',
            orderIndex: 1,
            marks: 15,
            negativeMarks: 0,
            problemSlug: 'reverse-singly-chain',
          },
        ],
      },
      {
        title: 'Section 2: Systems & Database Architecture',
        description: 'Architectural questions covering B+ Tree indexes, Deadlock conditions, and Paging.',
        type: 'CORE_CS',
        orderIndex: 1,
        totalMarks: 20,
        questions: [
          // DBMS MCQs 6 to 10
          { type: 'MCQ', orderIndex: 0, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 6 },
          { type: 'MCQ', orderIndex: 1, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 7 },
          { type: 'MCQ', orderIndex: 2, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 8 },
          { type: 'MCQ', orderIndex: 3, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 9 },
          { type: 'MCQ', orderIndex: 4, marks: 2, negativeMarks: 0.5, quizSlug: 'dbms-placement-quiz', quizQuestionOrderIndex: 10 },
          // OS MCQs 6 to 10
          { type: 'MCQ', orderIndex: 5, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 6 },
          { type: 'MCQ', orderIndex: 6, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 7 },
          { type: 'MCQ', orderIndex: 7, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 8 },
          { type: 'MCQ', orderIndex: 8, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 9 },
          { type: 'MCQ', orderIndex: 9, marks: 2, negativeMarks: 0.5, quizSlug: 'os-placement-quiz', quizQuestionOrderIndex: 10 },
        ],
      },
    ],
  },
];
