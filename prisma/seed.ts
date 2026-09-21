// ============================================================================
// PREPOS MASTER PRODUCTION PRISMA SEED
// Safe, Idempotent, High-Yield Placement Content Seeder
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { ROADMAP_DATA, MODULES_DATA, TOPICS_DATA, LESSONS_DATA } from './seed-data/roadmap.js';
import { ORIGINAL_PROBLEMS } from './seed-data/problems.js';
import { COMPANIES_DATA } from './seed-data/companies.js';
import { CORE_CS_QUIZZES } from './seed-data/quizzes.js';

const prisma = new PrismaClient();

// Dynamically detect whether the active Prisma Client expects String[] (Postgres) or String (SQLite)
function formatHints(hints: string[]): any {
  try {
    const dmmf = (prisma as any)._dmmf;
    const problemModel = dmmf?.datamodel?.models?.find((m: any) => m.name === 'Problem');
    const hintsField = problemModel?.fields?.find((f: any) => f.name === 'hints');
    if (hintsField?.isList) {
      return hints;
    }
  } catch {
    // ignore
  }
  return JSON.stringify(hints);
}

// ----------------------------------------------------------------------------
// 1. SEED ROADMAP & MODULES
// ----------------------------------------------------------------------------

async function seedRoadmap() {
  console.log('📌 Seeding DSA Placement Roadmap...');
  return prisma.roadmap.upsert({
    where: { slug: ROADMAP_DATA.slug },
    update: {
      title: ROADMAP_DATA.title,
      description: ROADMAP_DATA.description,
      durationDays: ROADMAP_DATA.durationDays,
      status: 'PUBLISHED',
      orderIndex: ROADMAP_DATA.orderIndex,
    },
    create: {
      slug: ROADMAP_DATA.slug,
      title: ROADMAP_DATA.title,
      description: ROADMAP_DATA.description,
      durationDays: ROADMAP_DATA.durationDays,
      status: 'PUBLISHED',
      orderIndex: ROADMAP_DATA.orderIndex,
    },
  });
}

async function seedModules(roadmapId: string): Promise<Map<string, string>> {
  console.log(`📌 Seeding ${MODULES_DATA.length} Roadmap Modules...`);
  const modulesMap = new Map<string, string>();

  for (const mod of MODULES_DATA) {
    const record = await prisma.module.upsert({
      where: {
        roadmapId_slug: {
          roadmapId,
          slug: mod.slug,
        },
      },
      update: {
        title: mod.title,
        description: mod.description,
        orderIndex: mod.orderIndex,
      },
      create: {
        roadmapId,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        orderIndex: mod.orderIndex,
      },
    });
    modulesMap.set(mod.slug, record.id);
  }

  return modulesMap;
}

// ----------------------------------------------------------------------------
// 2. SEED TOPICS & LESSONS
// ----------------------------------------------------------------------------

async function seedTopics(modulesMap: Map<string, string>): Promise<Map<string, string>> {
  console.log(`📌 Seeding ${TOPICS_DATA.length} Granular Topics...`);
  const topicsMap = new Map<string, string>();

  for (const top of TOPICS_DATA) {
    const moduleId = modulesMap.get(top.moduleSlug);
    if (!moduleId) {
      console.warn(`⚠️ Warning: Module "${top.moduleSlug}" not found for topic "${top.slug}".`);
      continue;
    }

    const record = await prisma.topic.upsert({
      where: {
        moduleId_slug: {
          moduleId,
          slug: top.slug,
        },
      },
      update: {
        title: top.title,
        description: top.description,
        orderIndex: top.orderIndex,
      },
      create: {
        moduleId,
        slug: top.slug,
        title: top.title,
        description: top.description,
        orderIndex: top.orderIndex,
      },
    });
    topicsMap.set(top.slug, record.id);
  }

  return topicsMap;
}

async function seedLessons(topicsMap: Map<string, string>) {
  console.log(`📌 Seeding ${LESSONS_DATA.length} High-Yield Lesson Guides...`);

  for (const lesson of LESSONS_DATA) {
    const topicId = topicsMap.get(lesson.topicSlug);
    if (!topicId) {
      console.warn(`⚠️ Warning: Topic "${lesson.topicSlug}" not found for lesson "${lesson.slug}".`);
      continue;
    }

    await prisma.lesson.upsert({
      where: {
        topicId_slug: {
          topicId,
          slug: lesson.slug,
        },
      },
      update: {
        title: lesson.title,
        content: lesson.content,
        durationMin: lesson.durationMin,
        orderIndex: lesson.orderIndex,
        status: 'PUBLISHED',
      },
      create: {
        topicId,
        slug: lesson.slug,
        title: lesson.title,
        content: lesson.content,
        durationMin: lesson.durationMin,
        orderIndex: lesson.orderIndex,
        status: 'PUBLISHED',
      },
    });
  }
}

// ----------------------------------------------------------------------------
// 3. SEED 20 ORIGINAL DSA PROBLEMS, TEST CASES & SOLUTIONS
// ----------------------------------------------------------------------------

async function seedProblems(topicsMap: Map<string, string>) {
  console.log(`📌 Seeding ${ORIGINAL_PROBLEMS.length} Original DSA Problems with Full Solutions...`);

  for (const prob of ORIGINAL_PROBLEMS) {
    const topicId = topicsMap.get(prob.topicSlug);
    if (!topicId) {
      console.warn(`⚠️ Warning: Topic "${prob.topicSlug}" not found for problem "${prob.slug}".`);
      continue;
    }

    const hintsPayload = formatHints(prob.hints);

    const problemRecord = await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: {
        topicId,
        title: prob.title,
        statement: prob.statement,
        difficulty: prob.difficulty,
        constraints: prob.constraints,
        hints: hintsPayload,
        expectedTimeComplexity: prob.expectedTimeComplexity,
        expectedSpaceComplexity: prob.expectedSpaceComplexity,
        status: 'PUBLISHED',
        veracity: 'VERIFIED',
      },
      create: {
        topicId,
        slug: prob.slug,
        title: prob.title,
        statement: prob.statement,
        difficulty: prob.difficulty,
        constraints: prob.constraints,
        hints: hintsPayload,
        expectedTimeComplexity: prob.expectedTimeComplexity,
        expectedSpaceComplexity: prob.expectedSpaceComplexity,
        status: 'PUBLISHED',
        veracity: 'VERIFIED',
      },
    });

    // Seed Test Cases Idempotently
    for (const tc of prob.testCases) {
      const existingTc = await prisma.testCase.findFirst({
        where: {
          problemId: problemRecord.id,
          orderIndex: tc.orderIndex,
        },
      });

      if (existingTc) {
        await prisma.testCase.update({
          where: { id: existingTc.id },
          data: {
            input: tc.input,
            expected: tc.expected,
            isSecret: tc.isSecret,
            explanation: tc.explanation,
          },
        });
      } else {
        await prisma.testCase.create({
          data: {
            problemId: problemRecord.id,
            input: tc.input,
            expected: tc.expected,
            isSecret: tc.isSecret,
            explanation: tc.explanation,
            orderIndex: tc.orderIndex,
          },
        });
      }
    }

    // Seed Solutions in C++, Java, and Python
    for (const sol of prob.solutions) {
      await prisma.solution.upsert({
        where: {
          problemId_language: {
            problemId: problemRecord.id,
            language: sol.language as any,
          },
        },
        update: {
          code: sol.code,
          editorial: sol.editorial,
          timeComplexity: sol.timeComplexity,
          spaceComplexity: sol.spaceComplexity,
        },
        create: {
          problemId: problemRecord.id,
          language: sol.language as any,
          code: sol.code,
          editorial: sol.editorial,
          timeComplexity: sol.timeComplexity,
          spaceComplexity: sol.spaceComplexity,
        },
      });
    }
  }
}

// ----------------------------------------------------------------------------
// 4. SEED PLACEMENT COMPANIES, PATTERNS & PROBLEM LINKS
// ----------------------------------------------------------------------------

async function seedCompanies() {
  console.log(`📌 Seeding ${COMPANIES_DATA.length} Placement Company Hubs & Patterns...`);

  for (const comp of COMPANIES_DATA) {
    const company = await prisma.company.upsert({
      where: { slug: comp.slug },
      update: {
        name: comp.name,
        logoUrl: comp.logoUrl,
        description: comp.description,
        websiteUrl: comp.websiteUrl,
      },
      create: {
        slug: comp.slug,
        name: comp.name,
        logoUrl: comp.logoUrl,
        description: comp.description,
        websiteUrl: comp.websiteUrl,
      },
    });

    // Seed Company Patterns
    for (const pat of comp.patterns) {
      const existingPat = await prisma.companyPattern.findFirst({
        where: {
          companyId: company.id,
          patternName: pat.patternName,
        },
      });

      if (existingPat) {
        await prisma.companyPattern.update({
          where: { id: existingPat.id },
          data: {
            frequencyPct: pat.frequencyPct,
            veracity: pat.veracity as any,
            lastVerifiedAt: new Date(),
          },
        });
      } else {
        await prisma.companyPattern.create({
          data: {
            companyId: company.id,
            patternName: pat.patternName,
            frequencyPct: pat.frequencyPct,
            veracity: pat.veracity as any,
            lastVerifiedAt: new Date(),
          },
        });
      }
    }

    // Link Company to Placement DSA Problems
    for (const problemSlug of comp.associatedProblemSlugs) {
      const problem = await prisma.problem.findUnique({
        where: { slug: problemSlug },
      });

      if (problem) {
        await prisma.companyProblem.upsert({
          where: {
            companyId_problemId: {
              companyId: company.id,
              problemId: problem.id,
            },
          },
          update: {
            frequency: 4,
            veracity: 'VERIFIED',
            notes: `High-yield interview pattern for ${comp.name} campus technical rounds.`,
          },
          create: {
            companyId: company.id,
            problemId: problem.id,
            frequency: 4,
            veracity: 'VERIFIED',
            notes: `High-yield interview pattern for ${comp.name} campus technical rounds.`,
          },
        });
      }
    }
  }
}

// ----------------------------------------------------------------------------
// 5. SEED CORE CS SUBJECTS & TIMED MCQS (DBMS & OS)
// ----------------------------------------------------------------------------

async function seedCoreCS() {
  console.log(`📌 Seeding ${CORE_CS_QUIZZES.length} Core CS Subjects & Quizzes...`);

  for (const quizData of CORE_CS_QUIZZES) {
    // Upsert Subject
    const subject = await prisma.coreCSSubject.upsert({
      where: { slug: quizData.subjectSlug },
      update: {
        title: quizData.subjectTitle,
        description: quizData.subjectDescription,
      },
      create: {
        slug: quizData.subjectSlug,
        title: quizData.subjectTitle,
        description: quizData.subjectDescription,
      },
    });

    // Upsert Quiz
    const quiz = await prisma.coreCSQuiz.upsert({
      where: {
        subjectId_slug: {
          subjectId: subject.id,
          slug: quizData.quizSlug,
        },
      },
      update: {
        title: quizData.quizTitle,
        description: quizData.quizDescription,
        durationMin: quizData.durationMin,
        totalQuestions: quizData.questions.length,
      },
      create: {
        subjectId: subject.id,
        slug: quizData.quizSlug,
        title: quizData.quizTitle,
        description: quizData.quizDescription,
        durationMin: quizData.durationMin,
        totalQuestions: quizData.questions.length,
      },
    });

    // Seed Questions and Options Idempotently
    for (const q of quizData.questions) {
      const existingQ = await prisma.mCQQuestion.findFirst({
        where: {
          quizId: quiz.id,
          orderIndex: q.orderIndex,
        },
      });

      let questionId = existingQ?.id;

      if (existingQ) {
        await prisma.mCQQuestion.update({
          where: { id: existingQ.id },
          data: {
            questionText: q.questionText,
            explanation: q.explanation,
          },
        });
      } else {
        const createdQ = await prisma.mCQQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: q.questionText,
            explanation: q.explanation,
            orderIndex: q.orderIndex,
          },
        });
        questionId = createdQ.id;
      }

      if (questionId) {
        for (const opt of q.options) {
          const existingOpt = await prisma.questionOption.findFirst({
            where: {
              questionId,
              orderIndex: opt.orderIndex,
            },
          });

          if (existingOpt) {
            await prisma.questionOption.update({
              where: { id: existingOpt.id },
              data: {
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
              },
            });
          } else {
            await prisma.questionOption.create({
              data: {
                questionId,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                orderIndex: opt.orderIndex,
              },
            });
          }
        }
      }
    }
  }
}

// ----------------------------------------------------------------------------
// 6. MAIN CONTROLLER
// ----------------------------------------------------------------------------

async function main() {
  console.log('============================================================');
  console.log('🚀 PrepOS Master Production Database Seeder');
  console.log('============================================================');

  const roadmap = await seedRoadmap();
  const modulesMap = await seedModules(roadmap.id);
  const topicsMap = await seedTopics(modulesMap);
  await seedLessons(topicsMap);
  await seedProblems(topicsMap);
  await seedCompanies();
  await seedCoreCS();

  console.log('============================================================');
  console.log('✅ Master Database Seed Completed Successfully!');
  console.log('============================================================');
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during PrepOS database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
