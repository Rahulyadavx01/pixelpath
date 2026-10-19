import { ExecutionSummary, SupportedLanguage, TestCase } from '../src/lib/codeRunner';

export function executeCode(params: {
  language: SupportedLanguage;
  code: string;
  problemId?: string;
  mode?: 'sample' | 'submit';
  customTestCases?: TestCase[] | null;
}): Promise<ExecutionSummary>;

export function formatStdinFromInput(inputStr: string): string;
export function normalizeOutput(raw: unknown): string;
export function compareOutputs(actual: unknown, expected: unknown, problemId?: string): boolean;
