import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  normalizeOutput,
  compareOutputs,
  parseCompilerError,
  parseInputArguments,
  runTestCases,
  DEFAULT_STARTER_CODE,
} from './codeRunner';

describe('codeRunner output comparison and normalization', () => {
  it('normalizes CRLF line endings and trailing whitespace', () => {
    const raw = '  [0, 1] \r\n\r\n';
    expect(normalizeOutput(raw)).toBe('[0,1]');
  });

  it('canonicalizes JSON arrays regardless of inner spacing', () => {
    const a = '[0, 1]';
    const b = '[0,1]';
    expect(normalizeOutput(a)).toBe(normalizeOutput(b));
    expect(compareOutputs(a, b)).toBe(true);
  });

  it('correctly compares equivalent array outputs with different formatting', () => {
    expect(compareOutputs(' [0, 1] \n', '[0,1]')).toBe(true);
    expect(compareOutputs('[1, 2]', '[1, 2]')).toBe(true);
    expect(compareOutputs('[1, 2]', '[2, 3]')).toBe(false);
  });

  it('compares case-insensitive booleans across languages', () => {
    expect(compareOutputs('true', 'True')).toBe(true);
    expect(compareOutputs('False', 'false')).toBe(true);
  });

  it('parses input arguments from problem specification strings', () => {
    const inputStr = 'nums = [2, 7, 11, 15], target = 9';
    const args = parseInputArguments(inputStr);
    expect(args).toEqual([[2, 7, 11, 15], 9]);
  });
});

describe('codeRunner C++ compiler error parsing', () => {
  it('extracts line number and provides friendly error message for missing semicolon in C++', () => {
    const stderr = `main.cpp:18:5: error: expected ';' before 'return'
   18 |     return 0;
      |     ^~~~~~`;
    const parsed = parseCompilerError(stderr);
    expect(parsed).not.toBeNull();
    expect(parsed?.line).toBe(18);
    expect(parsed?.message).toContain("Missing semicolon ';'");
  });

  it('extracts undeclared identifier error with variable name', () => {
    const stderr = `main.cpp:24:12: error: 'ans' was not declared in this scope; did you mean 'res'?
   24 |     return ans;
      |            ^~~`;
    const parsed = parseCompilerError(stderr);
    expect(parsed).not.toBeNull();
    expect(parsed?.line).toBe(24);
    expect(parsed?.message).toContain("Undeclared Identifier: 'ans'");
  });
});

describe('C++ compiler integration test', () => {
  it('provides valid C++17 default starter code template', () => {
    const cppCode = DEFAULT_STARTER_CODE.cpp;
    expect(cppCode).toContain('#include <iostream>');
    expect(cppCode).toContain('class Solution');
    expect(cppCode).toContain('vector<int> twoSum');
  });

  it('compiles and executes a native C++17 program using real compiler', () => {
    // Write sample C++ program to a temporary directory and compile with -std=c++17 -O2
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'questify-cpp-test-'));
    const srcFile = path.join(tmpDir, 'test.cpp');
    const binFile = path.join(tmpDir, 'test_bin');

    const cppProgram = `
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    std::cout << "[" << 0 << ", " << 1 << "]" << std::endl;
    return 0;
}
`;

    try {
      fs.writeFileSync(srcFile, cppProgram, 'utf-8');
      
      // Real sandboxed compilation check with -std=c++17 -O2
      execSync(`clang++ -std=c++17 -O2 "${srcFile}" -o "${binFile}"`, {
        timeout: 5000,
        stdio: 'pipe',
      });

      // Run executable and verify standard output
      const runOutput = execSync(`"${binFile}"`, {
        timeout: 2000,
        stdio: 'pipe',
      }).toString();

      expect(normalizeOutput(runOutput)).toBe('[0,1]');
      expect(compareOutputs(runOutput, '[0, 1]')).toBe(true);
    } finally {
      // Cleanup
      try {
        if (fs.existsSync(srcFile)) fs.unlinkSync(srcFile);
        if (fs.existsSync(binFile)) fs.unlinkSync(binFile);
        if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
      } catch {
        // ignore cleanup error
      }
    }
  });

  it('evaluates test cases in runner with C++ template', async () => {
    const testCases = [
      { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]', isHidden: false },
      { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]', isHidden: true },
    ];

    const result = await runTestCases(DEFAULT_STARTER_CODE.cpp, 'cpp', testCases, 'run');
    expect(result.totalCases).toBe(1); // only visible in run mode
    expect(result.status).toBe('ACCEPTED');
  });
});
