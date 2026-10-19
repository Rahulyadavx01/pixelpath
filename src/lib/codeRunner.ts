/**
 * QUESTIFY CODING RUNNER ENGINE
 * 
 * Production-grade Sandboxed Compiler & Test Case Runner:
 * - C++ (g++ with -std=c++17, -O2) as first-class default language
 * - Python, JavaScript, and Java support
 * - Sandboxed execution with CPU (2s), memory (128MB), and output size limits
 * - Structured compiler error parsing with exact line numbers
 * - Output normalization (whitespace, CRLF, JSON canonicalization)
 * - Separation of Run (visible tests) and Submit (all tests including hidden)
 * - Safe hidden test case privacy
 */

import { supabase } from './supabase';

export type SupportedLanguage = 'cpp' | 'python' | 'javascript' | 'java';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export type ExecutionStatus = 
  | 'ACCEPTED' 
  | 'WRONG_ANSWER' 
  | 'COMPILE_ERROR' 
  | 'TIME_LIMIT_EXCEEDED' 
  | 'MEMORY_LIMIT_EXCEEDED' 
  | 'RUNTIME_ERROR';

export interface TestCaseResult {
  index: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtimeMs: number;
  errorMessage?: string;
  isHidden: boolean;
  status: ExecutionStatus;
}

export interface CompileErrorInfo {
  message: string;
  line?: number;
  column?: number;
  raw: string;
}

export interface ExecutionSummary {
  mode: 'run' | 'submit';
  status: ExecutionStatus;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  allPassed: boolean;
  results: TestCaseResult[];
  totalRuntimeMs: number;
  memoryUsageMb: number;
  compileError?: CompileErrorInfo | null;
  compilerOutput?: string;
  error?: string;
}

export const DEFAULT_STARTER_CODE: Record<SupportedLanguage, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
`,
  javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
`,
  java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
};

/**
 * Normalizes output strings to eliminate superficial differences:
 * - CRLF -> LF
 * - Trims trailing/leading whitespace and empty trailing lines
 * - Canonicalizes JSON objects/arrays (e.g., [0, 1] vs [0,1])
 */
export function normalizeOutput(raw: unknown): string {
  if (raw === undefined || raw === null) {
    return '';
  }

  const str = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed);
  } catch {
    return str;
  }
}

/**
 * Deeply compares actual and expected outputs
 */
export function compareOutputs(actual: unknown, expected: unknown): boolean {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (normActual === normExpected) {
    return true;
  }

  // Handle case-insensitive booleans across languages (Python True vs JS true)
  if (normActual.toLowerCase() === normExpected.toLowerCase()) {
    if (['true', 'false', 'null', 'none'].includes(normExpected.toLowerCase())) {
      return true;
    }
  }

  // Handle array/set representation where order might be sorted
  try {
    const parsedActual = JSON.parse(normActual);
    const parsedExpected = JSON.parse(normExpected);

    if (Array.isArray(parsedActual) && Array.isArray(parsedExpected)) {
      if (parsedActual.length !== parsedExpected.length) return false;
      
      const exactMatch = parsedActual.every((val, i) => JSON.stringify(val) === JSON.stringify(parsedExpected[i]));
      if (exactMatch) return true;

      const sortedActual = [...parsedActual].sort();
      const sortedExpected = [...parsedExpected].sort();
      return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
    }
  } catch {
    // Non-JSON comparison completed
  }

  return false;
}

/**
 * Parses compiler errors to extract line numbers and clean messages
 */
export function parseCompilerError(rawStderr: string): CompileErrorInfo | null {
  if (!rawStderr || !rawStderr.trim()) return null;

  // Pattern for gcc/clang/g++ (e.g. main.cpp:14:5: error: expected ';' before '}')
  const cppMatch = rawStderr.match(/(?:main\.cpp|solution\.cpp|prog\.cpp|Main\.java|main\.py):(\d+):(?:(\d+):)?\s*(?:fatal error|error):\s*([^\n\r]+)/i);
  if (cppMatch) {
    const line = parseInt(cppMatch[1], 10);
    const column = cppMatch[2] ? parseInt(cppMatch[2], 10) : undefined;
    const message = cppMatch[3].trim();
    return {
      message: formatFriendlyCompilerMessage(message),
      line,
      column,
      raw: rawStderr,
    };
  }

  // Generic fallback pattern (e.g. line 12: syntax error)
  const genericLine = rawStderr.match(/(?:line\s*|:)(\d+)(?::(\d+))?[:\s]+(?:error|syntax error)[:\s]+([^\n\r]+)/i);
  if (genericLine) {
    return {
      message: formatFriendlyCompilerMessage(genericLine[3].trim()),
      line: parseInt(genericLine[1], 10),
      column: genericLine[2] ? parseInt(genericLine[2], 10) : undefined,
      raw: rawStderr,
    };
  }

  return {
    message: formatFriendlyCompilerMessage(rawStderr.split('\n')[0].slice(0, 140)),
    raw: rawStderr,
  };
}

function formatFriendlyCompilerMessage(raw: string): string {
  if (raw.includes("expected ';'")) return "Syntax Error: Missing semicolon ';' at the end of statement.";
  if (raw.includes("was not declared in this scope")) {
    const varName = raw.match(/'([^']+)'/)?.[1];
    return `Undeclared Identifier: '${varName || 'variable'}' is not defined in this scope.`;
  }
  if (raw.includes("no matching function for call")) return "Function Call Mismatch: Arguments do not match parameter types.";
  if (raw.includes("cannot convert")) return "Type Error: Incompatible data types.";
  if (raw.includes("IndentationError")) return "Indentation Error: Inconsistent indentation levels.";
  if (raw.includes("SyntaxError")) return `Syntax Error: ${raw}`;
  return raw;
}

/**
 * Parses input string into arguments (e.g., "nums = [2, 7, 11, 15], target = 9")
 */
export function parseInputArguments(inputStr: string): unknown[] {
  if (!inputStr || !inputStr.trim()) return [];

  const parts = inputStr.split(/,\s*(?=[a-zA-Z_]\w*\s*=)/);
  const args: unknown[] = [];

  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    const valStr = eqIdx !== -1 ? part.slice(eqIdx + 1).trim() : part.trim();
    try {
      args.push(JSON.parse(valStr));
    } catch {
      if (!isNaN(Number(valStr))) {
        args.push(Number(valStr));
      } else if (valStr === 'true') {
        args.push(true);
      } else if (valStr === 'false') {
        args.push(false);
      } else {
        args.push(valStr.replace(/^["']|["']$/g, ''));
      }
    }
  }

  return args;
}

/**
 * Extracts entry function name from JavaScript / C++ / Python source
 */
export function extractFunctionName(code: string): string | null {
  const jsMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (jsMatch) return jsMatch[1];

  const cppMatch = code.match(/(?:vector<[^>]+>|int|string|bool|void)\s+([a-zA-Z0-9_]+)\s*\(/);
  if (cppMatch && cppMatch[1] !== 'main') return cppMatch[1];

  const pyMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  if (pyMatch) return pyMatch[1];

  return null;
}

/**
 * Sandboxed execution runner:
 * Dispatches to local Express executor (/api/run), with direct executor invocation in test environments
 */
export async function runTestCases(
  code: string,
  language: SupportedLanguage,
  testCases: TestCase[],
  mode: 'run' | 'submit',
  problemId?: string
): Promise<ExecutionSummary> {
  const casesToRun = mode === 'run' ? testCases.filter((c) => !c.isHidden) : testCases;
  const payload = {
    language,
    code,
    problemId: problemId || 'prob-two-sum',
    mode,
    testCases: casesToRun,
  };

  // 1. Send request to the sandboxed compiler backend endpoint
  try {
    const endpoints = ['/api/run', 'http://localhost:3001/api/run'];
    let response: Response | null = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          response = res;
          break;
        }
      } catch {
        // Try next fallback endpoint
      }
    }

    if (response) {
      const data = await response.json();
      return data as ExecutionSummary;
    }
  } catch {
    // Backend fetch failed, continue to environment checks
  }

  // 2. Direct Node.js runner invocation (for Vitest test suite or CLI)
  if (typeof window === 'undefined') {
    try {
      const executorModule = '../../server/executor.js';
      // @ts-ignore
      const { executeCode } = await import(/* @vite-ignore */ executorModule);
      const directSummary = await executeCode({
        language,
        code,
        problemId: problemId || 'prob-two-sum',
        mode: mode === 'submit' ? 'submit' : 'sample',
        customTestCases: casesToRun,
      });
      return directSummary as ExecutionSummary;
    } catch {
      // Continue to error return
    }
  }

  // 3. Clear, honest error reporting if backend is unreachable (no fake mocks)
  return {
    mode,
    status: 'RUNTIME_ERROR',
    totalCases: casesToRun.length,
    passedCases: 0,
    failedCases: casesToRun.length,
    allPassed: false,
    results: casesToRun.map((tc, idx) => ({
      index: idx + 1,
      input: tc.isHidden && mode === 'submit' ? '[HIDDEN]' : tc.input,
      expectedOutput: tc.isHidden && mode === 'submit' ? '[HIDDEN]' : tc.expectedOutput,
      actualOutput: 'Compiler Unavailable',
      passed: false,
      runtimeMs: 0,
      errorMessage: 'Backend execution server is unreachable on port 3001. Please run "npm run server".',
      isHidden: Boolean(tc.isHidden),
      status: 'RUNTIME_ERROR',
    })),
    totalRuntimeMs: 0,
    memoryUsageMb: 0,
    error: 'Compiler backend unreachable. Please ensure the backend server is running ("npm run server" on port 3001).',
  };
}
