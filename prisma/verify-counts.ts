import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const roadmaps = await prisma.roadmap.count();
  const modules = await prisma.module.count();
  const topics = await prisma.topic.count();
  const lessons = await prisma.lesson.count();
  const problems = await prisma.problem.count();
  const testCases = await prisma.testCase.count();
  const solutions = await prisma.solution.count();
  const companies = await prisma.company.count();
  const companyPatterns = await prisma.companyPattern.count();
  const companyProblems = await prisma.companyProblem.count();
  const subjects = await prisma.coreCSSubject.count();
  const quizzes = await prisma.coreCSQuiz.count();
  const questions = await prisma.mCQQuestion.count();
  const options = await prisma.questionOption.count();

  console.log('------------------------------------------------------------');
  console.log('📊 PREPOS MASTER DATABASE SEED VERIFICATION METRICS');
  console.log('------------------------------------------------------------');
  console.log(`• Roadmaps:              ${roadmaps}`);
  console.log(`• Modules:               ${modules}`);
  console.log(`• Topics:                ${topics}`);
  console.log(`• Lessons:               ${lessons}`);
  console.log(`• Problems:              ${problems}`);
  console.log(`• Test Cases:            ${testCases}`);
  console.log(`• Solutions:             ${solutions}`);
  console.log(`• Companies:             ${companies}`);
  console.log(`• Company Patterns:      ${companyPatterns}`);
  console.log(`• Company-Problem Links: ${companyProblems}`);
  console.log(`• Core CS Subjects:      ${subjects}`);
  console.log(`• Core CS Quizzes:       ${quizzes}`);
  console.log(`• MCQ Questions:         ${questions}`);
  console.log(`• Question Options:      ${options}`);
  console.log('------------------------------------------------------------');

  // Check language distribution of solutions
  const cppSolutions = await prisma.solution.count({ where: { language: 'CPP' } });
  const javaSolutions = await prisma.solution.count({ where: { language: 'JAVA' } });
  const pySolutions = await prisma.solution.count({ where: { language: 'PYTHON' } });
  console.log(`• Solutions Breakdown:   ${cppSolutions} C++ | ${javaSolutions} Java | ${pySolutions} Python`);

  // Check problem difficulties
  const easyProbs = await prisma.problem.count({ where: { difficulty: 'EASY' } });
  const medProbs = await prisma.problem.count({ where: { difficulty: 'MEDIUM' } });
  const hardProbs = await prisma.problem.count({ where: { difficulty: 'HARD' } });
  console.log(`• Problem Difficulties:  ${easyProbs} Easy | ${medProbs} Medium | ${hardProbs} Hard`);

  // Check testcase secret distribution
  const publicTc = await prisma.testCase.count({ where: { isSecret: false } });
  const secretTc = await prisma.testCase.count({ where: { isSecret: true } });
  console.log(`• Test Cases Breakdown:  ${publicTc} Public | ${secretTc} Hidden / Secret`);

  // Check quiz question distribution
  const dbmsQ = await prisma.mCQQuestion.count({ where: { quiz: { slug: 'dbms-placement-quiz' } } });
  const osQ = await prisma.mCQQuestion.count({ where: { quiz: { slug: 'os-placement-quiz' } } });
  console.log(`• Quizzes Breakdown:     ${dbmsQ} DBMS MCQs | ${osQ} OS MCQs`);
  console.log('------------------------------------------------------------');
}

verify()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
