// ============================================================================
// PREPOS CODE EXECUTION ARCHITECTURE & SUBMISSION PIPELINE
// Authoritative Server-Side Evaluation, Judge0 Integration & Progress Wiring
// ============================================================================

import prisma from '../db';
import { recordProblemSolved } from './progress';
import { checkRateLimit } from './rate-limit';

export type SupportedLanguage = 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT';

export type ExecutionVerdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'PROVIDER_NOT_CONFIGURED'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMITED';

export interface TestCaseInput {
  id: string;
  orderIndex: number;
  input: string;
  expected: string;
  isSecret: boolean;
}

export interface SingleTestResult {
  testCaseId: string;
  testCaseNumber: number;
  isSecret: boolean;
  status: ExecutionVerdict;
  executionTimeMs?: number;
  memoryKb?: number;
  // Provided only if isSecret === false
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  errorMessage?: string;
}

export interface ProviderExecutionOutcome {
  verdict: ExecutionVerdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number;
  memoryKb?: number;
  errorLog?: string;
  testResults: {
    testCaseId: string;
    orderIndex: number;
    isSecret: boolean;
    status: ExecutionVerdict;
    actualOutput?: string;
    executionTimeMs?: number;
    memoryKb?: number;
    errorMessage?: string;
  }[];
}

export interface ExecutionProvider {
  name: string;
  isConfigured(): boolean;
  execute(
    code: string,
    language: SupportedLanguage,
    testCases: TestCaseInput[]
  ): Promise<ProviderExecutionOutcome>;
}

// ----------------------------------------------------------------------------
// JUDGE0 REMOTE EXECUTION PROVIDER
// ----------------------------------------------------------------------------

export class Judge0ExecutionProvider implements ExecutionProvider {
  name = 'Judge0 Code Execution Engine';

  private get apiUrl(): string | undefined {
    return process.env.JUDGE0_API_URL?.trim();
  }

  private get apiKey(): string | undefined {
    return process.env.JUDGE0_API_KEY?.trim();
  }

  private get apiHost(): string | undefined {
    return process.env.JUDGE0_API_HOST?.trim();
  }

  isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiUrl.length > 0);
  }

  private getLanguageId(lang: SupportedLanguage): number {
    switch (lang) {
      case 'CPP':
        return 105; // C++ (GCC 14.1.0)
      case 'JAVA':
        return 91; // Java (JDK 17.0.6)
      case 'PYTHON':
        return 100; // Python (3.12.5)
      case 'JAVASCRIPT':
        return 102; // JavaScript (Node.js 22.08.0)
      default:
        return 105;
    }
  }

  private mapJudge0Status(statusId: number): ExecutionVerdict {
    switch (statusId) {
      case 3:
        return 'ACCEPTED';
      case 4:
        return 'WRONG_ANSWER';
      case 5:
        return 'TIME_LIMIT_EXCEEDED';
      case 6:
        return 'COMPILATION_ERROR';
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return 'RUNTIME_ERROR';
      default:
        return 'PROVIDER_ERROR';
    }
  }

  /**
   * Adapts student's Solution class into an executable standalone program
   * with entrypoint, parameter binding, and formatted stdout.
   */
  public buildExecutableSource(
    code: string,
    language: SupportedLanguage,
    tc: TestCaseInput
  ): string {
    const inputStr = tc.input.trim();

    if (language === 'PYTHON') {
      if (code.includes("if __name__ == '__main__':")) return code;

      const assignments = inputStr
        .split(/,\s*(?=[a-zA-Z_]\w*\s*=)/)
        .map((line) => '    ' + line)
        .join('\n');

      return `from __future__ import annotations
${code}

# --- PrepOS Server Execution Harness ---
if __name__ == '__main__':
    import sys, json, inspect
${assignments}
    sol = Solution()
    methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
    if methods:
        method = getattr(sol, methods[0])
        sig = inspect.signature(method)
        args = [locals()[p] for p in sig.parameters.keys() if p in locals()]
        res = method(*args)
        if isinstance(res, bool):
            print("true" if res else "false")
        elif isinstance(res, (list, tuple)):
            print(json.dumps(res))
        else:
            print(res)
`;
    }

    if (language === 'CPP') {
      if (code.includes('int main')) return code;

      const parts = inputStr.split(/,\s*(?=[a-zA-Z_]\w*\s*=)/);
      const decls: string[] = [];
      const argNames: string[] = [];

      for (const part of parts) {
        const [nameRaw, valRaw] = part.split('=').map((s) => s.trim());
        argNames.push(nameRaw);
        if (valRaw.startsWith('[') && valRaw.endsWith(']')) {
          const cppVec = '{' + valRaw.slice(1, -1) + '}';
          decls.push(`std::vector<int> ${nameRaw} = ${cppVec};`);
        } else if (valRaw.startsWith('"') && valRaw.endsWith('"')) {
          decls.push(`std::string ${nameRaw} = ${valRaw};`);
        } else {
          decls.push(`int ${nameRaw} = ${valRaw};`);
        }
      }

      const methodMatch = code.match(/(?:int|void|bool|auto|string|vector<.*?>)\s+(\w+)\s*\(/);
      const methodName = methodMatch ? methodMatch[1] : 'countFrequentElements';

      return `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

${code}

int main() {
    Solution sol;
${decls.map((d) => '    ' + d).join('\n')}
    auto res = sol.${methodName}(${argNames.join(', ')});
    std::cout << res << std::endl;
    return 0;
}
`;
    }

    if (language === 'JAVA') {
      if (code.includes('public static void main')) return code;

      const parts = inputStr.split(/,\s*(?=[a-zA-Z_]\w*\s*=)/);
      const decls: string[] = [];
      const argNames: string[] = [];

      for (const part of parts) {
        const [nameRaw, valRaw] = part.split('=').map((s) => s.trim());
        argNames.push(nameRaw);
        if (valRaw.startsWith('[') && valRaw.endsWith(']')) {
          const arrVal = '{' + valRaw.slice(1, -1) + '}';
          decls.push(`int[] ${nameRaw} = new int[]${arrVal};`);
        } else if (valRaw.startsWith('"') && valRaw.endsWith('"')) {
          decls.push(`String ${nameRaw} = ${valRaw};`);
        } else {
          decls.push(`int ${nameRaw} = ${valRaw};`);
        }
      }

      const methodMatch = code.match(/public\s+(?:int|void|boolean|String|int\[\])\s+(\w+)\s*\(/);
      const methodName = methodMatch ? methodMatch[1] : 'countFrequentElements';

      return `import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
${decls.map((d) => '        ' + d).join('\n')}
        Object res = sol.${methodName}(${argNames.join(', ')});
        System.out.println(res);
    }
}
`;
    }

    return code;
  }

  async execute(
    code: string,
    language: SupportedLanguage,
    testCases: TestCaseInput[]
  ): Promise<ProviderExecutionOutcome> {
    if (!this.isConfigured()) {
      return {
        verdict: 'PROVIDER_NOT_CONFIGURED',
        passedTests: 0,
        totalTests: testCases.length,
        errorLog: 'Execution provider not configured. Please set JUDGE0_API_URL in your environment.',
        testResults: [],
      };
    }

    const testResults: ProviderExecutionOutcome['testResults'] = [];
    let passedCount = 0;
    let totalTime = 0;
    let maxMemory = 0;
    let firstFatalVerdict: ExecutionVerdict | null = null;
    let combinedErrorLog = '';

    const langId = this.getLanguageId(language);

    for (const tc of testCases) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          headers['X-RapidAPI-Key'] = this.apiKey;
        }
        if (this.apiHost) {
          headers['X-RapidAPI-Host'] = this.apiHost;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s per test case

        // Adapt class solution into runnable entrypoint program
        const executableSource = this.buildExecutableSource(code, language, tc);

        const endpoint = `${this.apiUrl}/submissions?base64_encoded=false&wait=true`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            source_code: executableSource,
            language_id: langId,
            stdin: '',
            expected_output: tc.expected,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Judge0 returned HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        const statusId = data.status?.id ?? 0;
        let testVerdict = this.mapJudge0Status(statusId);

        const stdout = typeof data.stdout === 'string' ? data.stdout.trim() : '';
        const stderr = typeof data.stderr === 'string' ? data.stderr.trim() : '';
        const compileOut = typeof data.compile_output === 'string' ? data.compile_output.trim() : '';
        const timeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : 0;
        const memKb = data.memory ? Math.round(data.memory) : 0;

        totalTime += timeMs;
        maxMemory = Math.max(maxMemory, memKb);

        if (compileOut) {
          combinedErrorLog = compileOut;
          testVerdict = 'COMPILATION_ERROR';
        } else if (stderr) {
          combinedErrorLog = stderr;
        }

        // Output comparison verification
        if (testVerdict === 'ACCEPTED' && stdout !== tc.expected.trim()) {
          testVerdict = 'WRONG_ANSWER';
        }

        if (testVerdict === 'ACCEPTED') {
          passedCount++;
        } else if (!firstFatalVerdict) {
          firstFatalVerdict = testVerdict;
        }

        testResults.push({
          testCaseId: tc.id,
          orderIndex: tc.orderIndex,
          isSecret: tc.isSecret,
          status: testVerdict,
          actualOutput: stdout,
          executionTimeMs: timeMs,
          memoryKb: memKb,
          errorMessage: stderr || compileOut || undefined,
        });

        // Fatal compilation error halts subsequent test runs for this submission
        if (testVerdict === 'COMPILATION_ERROR') {
          break;
        }
      } catch (err: any) {
        const isTimeout = err?.name === 'AbortError';
        const verdict = isTimeout ? 'TIME_LIMIT_EXCEEDED' : 'PROVIDER_ERROR';
        if (!firstFatalVerdict) firstFatalVerdict = verdict;

        testResults.push({
          testCaseId: tc.id,
          orderIndex: tc.orderIndex,
          isSecret: tc.isSecret,
          status: verdict,
          errorMessage: err?.message || 'Execution failed',
        });
      }
    }

    const overallVerdict: ExecutionVerdict =
      firstFatalVerdict || (passedCount === testCases.length ? 'ACCEPTED' : 'WRONG_ANSWER');

    return {
      verdict: overallVerdict,
      passedTests: passedCount,
      totalTests: testCases.length,
      executionTimeMs: totalTime,
      memoryKb: maxMemory,
      errorLog: combinedErrorLog || undefined,
      testResults,
    };
  }
}


// ----------------------------------------------------------------------------
// PROVIDER REGISTRY & INJECTION (FOR REAL JUDGE0 & ISOLATED TESTING)
// ----------------------------------------------------------------------------

let activeExecutionProvider: ExecutionProvider = new Judge0ExecutionProvider();

/**
 * Returns the currently active execution provider.
 */
export function getExecutionProvider(): ExecutionProvider {
  return activeExecutionProvider;
}

/**
 * Sets a custom execution provider (useful for testing simulated verdicts).
 */
export function setExecutionProvider(provider: ExecutionProvider | null) {
  activeExecutionProvider = provider ?? new Judge0ExecutionProvider();
}

// ----------------------------------------------------------------------------
// RUN CODE PIPELINE (SAMPLE / PUBLIC TESTS ONLY)
// ----------------------------------------------------------------------------

export interface RunCodeResponse {
  success: boolean;
  status: ExecutionVerdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number;
  memoryKb?: number;
  errorLog?: string;
  results: SingleTestResult[];
  isConfigured: boolean;
  message?: string;
}

/**
 * Executes user code against ONLY public/sample test cases.
 * CRITICAL RULE: Run Code NEVER marks a problem solved, never records a submission,
 * never modifies UserProgress, TopicProgress, Revision, or PRS.
 */
export async function runProblemCode(
  userId: string,
  problemId: string,
  language: SupportedLanguage,
  code: string
): Promise<RunCodeResponse> {
  // 1. Rate limiting check
  const rateLimit = checkRateLimit(`${userId}:run_code`, 1500);
  if (!rateLimit.allowed) {
    return {
      success: false,
      status: 'RATE_LIMITED',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isConfigured: true,
      errorLog: `Execution rate limit reached. Please wait ${rateLimit.waitSeconds}s.`,
    };
  }

  // 2. Input validation
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      status: 'COMPILATION_ERROR',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isConfigured: true,
      errorLog: 'Source code cannot be empty.',
    };
  }

  if (code.length > 65536) {
    return {
      success: false,
      status: 'COMPILATION_ERROR',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isConfigured: true,
      errorLog: 'Source code exceeds maximum allowed size (64 KB).',
    };
  }

  // 3. Fetch problem & public test cases only
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true, slug: true, status: true },
  });

  if (!problem || problem.status !== 'PUBLISHED') {
    throw new Error('Problem not found or not published');
  }

  const publicTestCases = await prisma.testCase.findMany({
    where: { problemId, isSecret: false },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      orderIndex: true,
      input: true,
      expected: true,
      isSecret: true,
    },
  });

  if (publicTestCases.length === 0) {
    return {
      success: false,
      status: 'PROVIDER_ERROR',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isConfigured: true,
      errorLog: 'No sample test cases available for this problem.',
    };
  }

  // 4. Check Provider Configuration
  const provider = getExecutionProvider();
  if (!provider.isConfigured()) {
    return {
      success: false,
      status: 'PROVIDER_NOT_CONFIGURED',
      passedTests: 0,
      totalTests: publicTestCases.length,
      results: [],
      isConfigured: false,
      errorLog:
        'Remote execution provider is not configured. Please set JUDGE0_API_URL in your environment to run code against sample tests.',
    };
  }

  // 5. Execute against public test cases
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
    executionTimeMs: outcome.executionTimeMs,
    memoryKb: outcome.memoryKb,
    errorLog: outcome.errorLog,
    results: formattedResults,
    isConfigured: true,
  };
}

// ----------------------------------------------------------------------------
// SUBMIT CODE PIPELINE (COMPLETE TEST SUITE + PROGRESS PERSISTENCE)
// ----------------------------------------------------------------------------

export interface SubmitCodeResponse {
  success: boolean;
  status: ExecutionVerdict;
  submissionId?: string;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number;
  memoryKb?: number;
  errorLog?: string;
  results: SingleTestResult[];
  isSolved: boolean;
  isConfigured: boolean;
  updatedPRS?: any;
}

/**
 * Submits candidate code against the COMPLETE test suite (public + secret).
 * Persists Submission and Execution records.
 * Marks problem solved and recalculates PRS ONLY IF verdict is ACCEPTED.
 * CRITICAL SECURITY: Never returns secret testcase inputs or expected outputs to the client.
 */
export async function submitProblemCode(
  userId: string,
  problemId: string,
  language: SupportedLanguage,
  code: string
): Promise<SubmitCodeResponse> {
  // 1. Rate limiting check
  const rateLimit = checkRateLimit(`${userId}:submit_code`, 2000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      status: 'RATE_LIMITED',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isSolved: false,
      isConfigured: true,
      errorLog: `Submission rate limit reached. Please wait ${rateLimit.waitSeconds}s.`,
    };
  }

  // 2. Input validation
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      status: 'COMPILATION_ERROR',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isSolved: false,
      isConfigured: true,
      errorLog: 'Source code cannot be empty.',
    };
  }

  if (code.length > 65536) {
    return {
      success: false,
      status: 'COMPILATION_ERROR',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isSolved: false,
      isConfigured: true,
      errorLog: 'Source code exceeds maximum allowed size (64 KB).',
    };
  }

  // 3. Fetch problem & all test cases (public + hidden)
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true, title: true, slug: true, status: true },
  });

  if (!problem || problem.status !== 'PUBLISHED') {
    throw new Error('Problem not found or not published');
  }

  const allTestCases = await prisma.testCase.findMany({
    where: { problemId },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      orderIndex: true,
      input: true,
      expected: true,
      isSecret: true,
    },
  });

  if (allTestCases.length === 0) {
    return {
      success: false,
      status: 'PROVIDER_ERROR',
      passedTests: 0,
      totalTests: 0,
      results: [],
      isSolved: false,
      isConfigured: true,
      errorLog: 'No test cases configured for this problem.',
    };
  }

  // 4. Check Provider Configuration
  const provider = getExecutionProvider();
  if (!provider.isConfigured()) {
    return {
      success: false,
      status: 'PROVIDER_NOT_CONFIGURED',
      passedTests: 0,
      totalTests: allTestCases.length,
      results: [],
      isSolved: false,
      isConfigured: false,
      errorLog:
        'Remote execution provider is not configured. Please set JUDGE0_API_URL in your environment to submit code.',
    };
  }

  // 5. Execute against full test suite
  const outcome = await provider.execute(code, language, allTestCases);

  // Map outcome verdict to Prisma SubmissionStatus enum
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

  // 6. Persist Submission Record
  const submission = await prisma.submission.create({
    data: {
      userId,
      problemId,
      language: language as any,
      code,
      status: prismaStatus,
      executionTime: outcome.executionTimeMs,
      memoryKb: outcome.memoryKb,
      passedTests: outcome.passedTests,
      totalTests: outcome.totalTests,
      errorLog: outcome.errorLog,
    },
  });

  // 7. Persist individual Execution Records
  for (const r of outcome.testResults) {
    let itemStatus: typeof prismaStatus = 'RUNTIME_ERROR';
    if (r.status === 'ACCEPTED') itemStatus = 'ACCEPTED';
    else if (r.status === 'WRONG_ANSWER') itemStatus = 'WRONG_ANSWER';
    else if (r.status === 'TIME_LIMIT_EXCEEDED') itemStatus = 'TIME_LIMIT_EXCEEDED';
    else if (r.status === 'MEMORY_LIMIT_EXCEEDED') itemStatus = 'MEMORY_LIMIT_EXCEEDED';
    else if (r.status === 'COMPILATION_ERROR') itemStatus = 'COMPILATION_ERROR';

    await prisma.execution.create({
      data: {
        submissionId: submission.id,
        testCaseId: r.testCaseId,
        status: itemStatus,
        actualOutput: r.actualOutput,
        executionTimeMs: r.executionTimeMs,
        memoryKb: r.memoryKb,
      },
    });
  }

  // Increment problem total submission counter
  await prisma.problem.update({
    where: { id: problemId },
    data: { submittedCount: { increment: 1 } },
  });

  // 8. If and ONLY IF accepted, update progress and schedule revision
  let updatedPRS: any = null;
  const isAccepted = prismaStatus === 'ACCEPTED';

  if (isAccepted) {
    // Increment problem accepted count
    await prisma.problem.update({
      where: { id: problemId },
      data: { acceptedCount: { increment: 1 } },
    });

    // Record canonical solve & trigger PRS recalculation
    updatedPRS = await recordProblemSolved(userId, problemId);
  }

  // 9. Sanitize results for client response:
  // ABSOLUTELY NEVER send secret test input, expected output, or actual output to client!
  const sanitizedResults: SingleTestResult[] = outcome.testResults.map((r, idx) => {
    if (r.isSecret) {
      return {
        testCaseId: r.testCaseId,
        testCaseNumber: idx + 1,
        isSecret: true,
        status: r.status,
        executionTimeMs: r.executionTimeMs,
        memoryKb: r.memoryKb,
        // Notice: input, expectedOutput, and actualOutput are completely omitted!
      };
    }

    const publicTc = allTestCases.find((tc) => tc.id === r.testCaseId);
    return {
      testCaseId: r.testCaseId,
      testCaseNumber: idx + 1,
      isSecret: false,
      status: r.status,
      input: publicTc?.input,
      expectedOutput: publicTc?.expected,
      actualOutput: r.actualOutput,
      executionTimeMs: r.executionTimeMs,
      memoryKb: r.memoryKb,
      errorMessage: r.errorMessage,
    };
  });

  return {
    success: isAccepted,
    status: outcome.verdict,
    submissionId: submission.id,
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
    executionTimeMs: outcome.executionTimeMs,
    memoryKb: outcome.memoryKb,
    errorLog: outcome.errorLog,
    results: sanitizedResults,
    isSolved: isAccepted,
    isConfigured: true,
    updatedPRS,
  };
}

// ----------------------------------------------------------------------------
// SUBMISSION HISTORY ACCESS
// ----------------------------------------------------------------------------

export async function getUserProblemSubmissions(userId: string, problemId: string) {
  return prisma.submission.findMany({
    where: {
      userId,
      problemId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      language: true,
      status: true,
      executionTime: true,
      memoryKb: true,
      passedTests: true,
      totalTests: true,
      errorLog: true,
      createdAt: true,
    },
    take: 20,
  });
}
