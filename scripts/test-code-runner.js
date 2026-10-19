// Automated test verification for codeRunner comparison logic
import assert from 'node:assert';

function normalizeOutput(raw) {
  if (raw === undefined || raw === null) return '';
  const str = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed);
  } catch {
    return str;
  }
}

function compareOutputs(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);
  if (normActual === normExpected) return true;
  if (normActual.toLowerCase() === normExpected.toLowerCase()) {
    if (['true', 'false', 'null', 'none'].includes(normExpected.toLowerCase())) {
      return true;
    }
  }
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
  } catch {}
  return false;
}

function parseInputArguments(inputStr) {
  const clean = inputStr.trim();
  if (!clean) return [];
  const args = [];
  const parts = clean.split(/,\s*(?=[a-zA-Z_][a-zA-Z0-9_]*\s*=)/);
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    const valStr = eqIdx !== -1 ? part.substring(eqIdx + 1).trim() : part.trim();
    try {
      args.push(JSON.parse(valStr));
    } catch {
      if (valStr.startsWith('"') && valStr.endsWith('"')) {
        args.push(valStr.slice(1, -1));
      } else if (valStr.startsWith("'") && valStr.endsWith("'")) {
        args.push(valStr.slice(1, -1));
      } else {
        args.push(valStr);
      }
    }
  }
  return args;
}

console.log('--- RUNNING CODING ARENA TEST RUNNER VERIFICATION ---');

// Test 1: CRLF and whitespace
assert.strictEqual(normalizeOutput(' [0, 1] \r\n\r\n'), '[0,1]');
console.log('✓ Test 1: CRLF and trailing whitespace normalization passed.');

// Test 2: JSON array canonicalization
assert.strictEqual(compareOutputs('[0, 1]', '[0,1]'), true);
assert.strictEqual(compareOutputs('[1, 2]', '[2, 3]'), false);
console.log('✓ Test 2: JSON array canonicalization passed.');

// Test 3: Boolean normalization
assert.strictEqual(compareOutputs('true', 'True'), true);
assert.strictEqual(compareOutputs('False', 'false'), true);
console.log('✓ Test 3: Boolean cross-language comparison passed.');

// Test 4: Input arguments parser
const parsed = parseInputArguments('nums = [2, 7, 11, 15], target = 9');
assert.deepStrictEqual(parsed, [[2, 7, 11, 15], 9]);
console.log('✓ Test 4: Test case argument parsing passed.');

console.log('ALL CODING ENGINE AUTOMATED TESTS PASSED SUCCESSFULLY!');
