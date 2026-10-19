import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeCode } from './executor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

// High-speed gzip compression & CORS
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// In-memory audit log storage for curriculum changes
const curriculumAuditLogs = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'questify-compiler-and-curriculum-engine',
    timestamp: new Date().toISOString(),
    supportedLanguages: ['cpp', 'python', 'javascript', 'java'],
  });
});

// Code execution endpoint
app.post('/api/run', async (req, res) => {
  const { language, code, problemId, mode, testCases } = req.body;

  if (!language || !code) {
    return res.status(400).json({
      error: 'Missing required parameters: language and code are required.',
    });
  }

  try {
    const summary = await executeCode({
      language,
      code,
      problemId: problemId || 'prob-two-sum',
      mode: mode === 'submit' ? 'submit' : 'sample',
      customTestCases: testCases,
    });

    return res.json(summary);
  } catch (err) {
    console.error('Execution error:', err);
    return res.status(500).json({
      error: err.message || 'Internal Execution Engine Error',
      status: 'RUNTIME_ERROR',
      allPassed: false,
      results: [],
    });
  }
});

// ====================================================================
// CURRICULUM GOVERNANCE & PREREQUISITE VALIDATION API
// ====================================================================

/**
 * Validates DAG acyclicity for course modules.
 * Prevents circular dependencies (e.g. A -> B -> A).
 */
app.post('/api/curriculum/validate-graph', (req, res) => {
  const { modules } = req.body;
  if (!Array.isArray(modules)) {
    return res.status(400).json({ valid: false, error: 'modules array is required' });
  }

  const adj = new Map();
  for (const mod of modules) {
    adj.set(mod.id, mod.prerequisiteModuleIds || []);
  }

  const visited = new Set();
  const recStack = new Set();
  let cycleNodes = [];

  const dfs = (nodeId, path) => {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path, neighbor])) return true;
      } else if (recStack.has(neighbor)) {
        cycleNodes = [...path, neighbor];
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  };

  for (const mod of modules) {
    if (!visited.has(mod.id)) {
      if (dfs(mod.id, [mod.id])) {
        return res.json({
          valid: false,
          error: `Circular dependency detected involving module: ${cycleNodes.join(' -> ')}`,
          cycle: cycleNodes,
        });
      }
    }
  }

  return res.json({ valid: true, message: 'Valid Directed Acyclic Graph (DAG)' });
});

/**
 * Validates module completion, verifies prerequisite satisfaction,
 * and guards against double XP awards.
 */
app.post('/api/curriculum/complete-module', (req, res) => {
  const {
    studentId,
    courseId,
    moduleId,
    completedModuleIds = [],
    prerequisiteModuleIds = [],
    xpReward = 50,
  } = req.body;

  if (!studentId || !courseId || !moduleId) {
    return res.status(400).json({
      success: false,
      error: 'studentId, courseId, and moduleId are required.',
    });
  }

  // 1. Verify all prerequisites are satisfied
  const completedSet = new Set(completedModuleIds);
  const missingPrereqs = (prerequisiteModuleIds || []).filter((reqId) => !completedSet.has(reqId));

  if (missingPrereqs.length > 0) {
    return res.status(403).json({
      success: false,
      error: `Prerequisite Locked: You have not completed required modules: ${missingPrereqs.join(', ')}`,
      missingPrerequisites: missingPrereqs,
    });
  }

  // 2. Prevent double XP awards if already completed
  if (completedSet.has(moduleId)) {
    return res.json({
      success: true,
      xpAwarded: 0,
      alreadyCompleted: true,
      message: 'Module is already marked as completed. No duplicate XP awarded.',
    });
  }

  // 3. Success response
  return res.json({
    success: true,
    xpAwarded: xpReward,
    completedAt: new Date().toISOString(),
    message: `Module ${moduleId} successfully completed. Awarded ${xpReward} XP.`,
  });
});

/**
 * Logs curriculum changes for auditability.
 */
app.post('/api/curriculum/audit', (req, res) => {
  const { action, actorId, actorName, courseId, moduleId, changeSummary } = req.body;

  const logEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action: action || 'UPDATE_CURRICULUM',
    actorId: actorId || 'anonymous',
    actorName: actorName || 'Faculty',
    courseId: courseId || null,
    moduleId: moduleId || null,
    changeSummary: changeSummary || 'Curriculum modified',
    timestamp: new Date().toISOString(),
  };

  curriculumAuditLogs.unshift(logEntry);
  if (curriculumAuditLogs.length > 500) {
    curriculumAuditLogs.pop();
  }

  return res.json({ success: true, log: logEntry });
});

app.get('/api/curriculum/audit', (req, res) => {
  return res.json({ success: true, logs: curriculumAuditLogs });
});

// ====================================================================
// STUDENT AUTHENTICATION VALIDATION & RATE LIMITING
// ====================================================================

const authLockoutMap = new Map(); // key -> { attempts, lockedUntil }

function getLockoutKey(ip, studentId) {
  return `${ip || 'local'}:${(studentId || '').trim().toLowerCase()}`;
}

app.post('/api/auth/validate-student-id', (req, res) => {
  const { studentId } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const raw = (studentId || '').trim();

  // Rate limiting check
  const key = getLockoutKey(ip, raw);
  const state = authLockoutMap.get(key);
  const now = Date.now();
  if (state && state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Account temporarily locked due to multiple failed attempts. Please wait ${remainingSeconds}s.`,
      remainingSeconds,
    });
  }

  if (!raw) {
    return res.status(400).json({
      success: false,
      error: 'Enter your student ID in this format: Mains-24813',
    });
  }

  // Detect faculty identifier
  const cleanLower = raw.toLowerCase();
  if (cleanLower.includes('@') || cleanLower.startsWith('msot-fac') || cleanLower.startsWith('fac-') || cleanLower.includes('faculty')) {
    return res.status(403).json({
      success: false,
      error: 'This page is for students. Use Faculty Login.',
    });
  }

  // Regex validation: ^mains-\d{5}$ (case-insensitive)
  const match = raw.match(/^mains-(\d{5})$/i);
  if (!match) {
    return res.status(400).json({
      success: false,
      error: 'Enter your student ID in this format: Mains-24813',
    });
  }

  const normalizedId = `Mains-${match[1]}`;
  return res.json({
    success: true,
    normalizedId,
    message: 'Valid student ID format',
  });
});

app.post('/api/auth/record-attempt', (req, res) => {
  const { studentId, success } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const key = getLockoutKey(ip, studentId);
  const now = Date.now();

  if (success) {
    authLockoutMap.delete(key);
    return res.json({ success: true, attempts: 0 });
  }

  const state = authLockoutMap.get(key) || { attempts: 0, lockedUntil: 0 };
  state.attempts += 1;

  if (state.attempts >= 5) {
    state.lockedUntil = now + 60 * 1000; // 60 seconds lockout
    authLockoutMap.set(key, state);
    return res.json({
      success: false,
      locked: true,
      remainingSeconds: 60,
      attempts: state.attempts,
    });
  }

  authLockoutMap.set(key, state);
  return res.json({
    success: false,
    locked: false,
    remainingSeconds: 0,
    attempts: state.attempts,
  });
});

/**
 * Validates student roster items for faculty creation and bulk CSV import
 * Enforces ^Mains-\d{5}$ and rejects duplicates case-insensitively.
 */
app.post('/api/roster/validate-students', (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ success: false, error: 'students array is required' });
  }

  const seenIds = new Set();
  const errors = [];
  const normalizedStudents = [];

  students.forEach((st, idx) => {
    const rowNum = idx + 1;
    const rawId = (st.studentId || st.student_id || '').trim();
    const match = rawId.match(/^mains-(\d{5})$/i);

    if (!match) {
      errors.push({
        row: rowNum,
        studentId: rawId,
        reason: 'Enter your student ID in this format: Mains-24813',
      });
      return;
    }

    const canonicalId = `Mains-${match[1]}`;
    const lowerKey = canonicalId.toLowerCase();

    if (seenIds.has(lowerKey)) {
      errors.push({
        row: rowNum,
        studentId: canonicalId,
        reason: `Duplicate student ID "${canonicalId}" in import list.`,
      });
      return;
    }

    seenIds.add(lowerKey);
    normalizedStudents.push({
      ...st,
      studentId: canonicalId,
      student_id: canonicalId,
    });
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
      validCount: normalizedStudents.length,
    });
  }

  return res.json({
    success: true,
    students: normalizedStudents,
    count: normalizedStudents.length,
  });
});

// Serve pre-built production assets with HTTP caching
app.use(express.static(distPath, {
  maxAge: '7d',
  etag: true,
}));

// SPA fallback for client-side React routes
app.use((req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Questify Backend Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`   Execution Endpoint: POST http://localhost:${PORT}/api/run`);
  console.log(`   Curriculum Verification: POST http://localhost:${PORT}/api/curriculum/complete-module`);
  console.log(`   Auth Validation: POST http://localhost:${PORT}/api/auth/validate-student-id`);
});
