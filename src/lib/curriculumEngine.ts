import { Course, CurriculumModule, CurriculumLesson, StudentModuleProgress } from '../types';

/**
 * Detects circular dependencies in a module prerequisite graph.
 * Returns { hasCycle: true, cyclePath: [...] } if a circular dependency is detected.
 */
export function detectCycle(
  modules: { id: string; prerequisiteModuleIds: string[] }[]
): { hasCycle: boolean; cyclePath?: string[] } {
  const adj = new Map<string, string[]>();
  modules.forEach((m) => {
    adj.set(m.id, m.prerequisiteModuleIds || []);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(curr: string): boolean {
    visited.add(curr);
    recursionStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }

    path.pop();
    recursionStack.delete(curr);
    return false;
  }

  for (const m of modules) {
    if (!visited.has(m.id)) {
      if (dfs(m.id)) {
        return { hasCycle: true, cyclePath: [...path] };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Checks if candidatePrerequisiteId can be added as a prerequisite for targetModuleId
 * without introducing a cycle into the existing graph.
 */
export function wouldCreateCycle(
  targetModuleId: string,
  candidatePrerequisiteId: string,
  allModules: { id: string; prerequisiteModuleIds: string[] }[]
): boolean {
  if (targetModuleId === candidatePrerequisiteId) return true;

  const simulated = allModules.map((m) => {
    if (m.id === targetModuleId) {
      const existing = m.prerequisiteModuleIds || [];
      return {
        ...m,
        prerequisiteModuleIds: existing.includes(candidatePrerequisiteId)
          ? existing
          : [...existing, candidatePrerequisiteId],
      };
    }
    return m;
  });

  return detectCycle(simulated).hasCycle;
}

/**
 * Finds all modules that directly depend on a given moduleId.
 */
export function getDependentModules(
  moduleId: string,
  allModules: { id: string; title: string; prerequisiteModuleIds: string[] }[]
): { id: string; title: string }[] {
  return allModules
    .filter((m) => m.id !== moduleId && (m.prerequisiteModuleIds || []).includes(moduleId))
    .map((m) => ({ id: m.id, title: m.title }));
}

/**
 * Computes a student's status for a given module: 'locked' | 'unlocked' | 'in_progress' | 'completed'
 */
export function computeModuleStatus(
  module: CurriculumModule,
  allModules: CurriculumModule[],
  completedModuleIds: Set<string>,
  completedLessonIds: Set<string>
): {
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  isPrerequisiteSatisfied: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
} {
  const reqIds = module.prerequisiteModuleIds || [];
  const isPrerequisiteSatisfied = reqIds.length === 0 || reqIds.every((reqId) => completedModuleIds.has(reqId));

  const lessons = module.lessons || [];
  const requiredLessons = lessons.filter((l) => !l.isOptional);
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const isAllRequiredLessonsDone =
    requiredLessons.length > 0 && requiredLessons.every((l) => completedLessonIds.has(l.id));

  let status: 'locked' | 'unlocked' | 'in_progress' | 'completed' = 'locked';

  if (!isPrerequisiteSatisfied) {
    status = 'locked';
  } else if (completedModuleIds.has(module.id) || (isAllRequiredLessonsDone && lessons.length > 0)) {
    status = 'completed';
  } else if (completedCount > 0) {
    status = 'in_progress';
  } else {
    status = 'unlocked';
  }

  return {
    status,
    isPrerequisiteSatisfied,
    completedLessonsCount: completedCount,
    totalLessonsCount: lessons.length,
  };
}

/**
 * Initial Seed Data for CS201 (Data Structures) and CS204 (Algorithms)
 * Used as default database & local storage state so nothing disappears.
 */
export const initialCurriculumCourses: Course[] = [
  {
    id: 'course-cs201',
    code: 'CS201',
    title: 'Data Structures',
    term: 'Fall 2026',
    status: 'published',
    createdBy: 'fac-admin-1',
    orderIndex: 1,
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: 'node-arrays',
        courseId: 'course-cs201',
        orderIndex: 1,
        groupLabel: 'Module 1: Foundations',
        title: 'Linear Memory & Dynamic Arrays',
        description: 'Contiguous memory, cache lines, dynamic array amortized growth factor (geometric doubling), and two-pointer traversal patterns.',
        xpReward: 120,
        status: 'published',
        keyConcepts: ['Spatial Locality', 'Geometric Doubling', 'Amortized O(1)', 'Sliding Window'],
        prerequisiteModuleIds: [],
        lessons: [
          { id: 'l-arr-1', moduleId: 'node-arrays', orderIndex: 1, title: 'Contiguous Memory Allocation', summary: 'Pointer arithmetic and cache line hits in sequential blocks.', xpValue: 20, lessonType: 'reading', keyConcepts: ['Spatial Locality', 'Array Slicing'], linkedProblemIds: [] },
          { id: 'l-arr-2', moduleId: 'node-arrays', orderIndex: 2, title: 'Geometric Array Growth', summary: 'Amortized O(1) appending and buffer doubling strategies.', xpValue: 20, lessonType: 'reading', keyConcepts: ['Amortized Analysis', 'Capacities'], linkedProblemIds: [] },
          { id: 'l-arr-3', moduleId: 'node-arrays', orderIndex: 3, title: 'Sliding Windows & Two Pointers', summary: 'Eliminating nested loops using invariant pointers.', xpValue: 20, lessonType: 'coding', keyConcepts: ['Two Pointers', 'Fast-Slow Pointers'], linkedProblemIds: ['prob-two-sum'] },
        ],
      },
      {
        id: 'node-linked-lists',
        courseId: 'course-cs201',
        orderIndex: 2,
        groupLabel: 'Module 1: Foundations',
        title: 'Linked Lists & Pointer Dynamics',
        description: 'Singly and doubly linked lists, pointer mutation invariants, sentinel dummy nodes, and Floyd’s tortoise-and-hare cycle detection.',
        xpReward: 150,
        status: 'published',
        keyConcepts: ['Pointer References', 'Sentinel Dummies', 'Tortoise and Hare', 'In-Place Reversal'],
        prerequisiteModuleIds: ['node-arrays'],
        lessons: [
          { id: 'l-ll-1', moduleId: 'node-linked-lists', orderIndex: 1, title: 'Singly vs Doubly Linked Nodes', summary: 'Node structure and pointer traversal mechanics.', xpValue: 20, lessonType: 'reading', keyConcepts: ['Pointers', 'Head-Tail Invariants'], linkedProblemIds: [] },
          { id: 'l-ll-2', moduleId: 'node-linked-lists', orderIndex: 2, title: 'Floyd Cycle Detection Algorithm', summary: 'Tortoise and Hare two-pointer cycle proof.', xpValue: 20, lessonType: 'coding', keyConcepts: ['Fast-Slow Cycle Finding'], linkedProblemIds: [] },
        ],
      },
      {
        id: 'node-stacks-queues',
        courseId: 'course-cs201',
        orderIndex: 3,
        groupLabel: 'Module 2: Abstract Types',
        title: 'Stacks, Queues & Monotonic Buffers',
        description: 'LIFO and FIFO mechanics, ring buffers, expression parsing via Dijkstra’s shunting-yard algorithm, and monotonic stacks.',
        xpReward: 180,
        status: 'published',
        keyConcepts: ['LIFO / FIFO', 'Circular Buffers', 'Shunting-Yard', 'Next Greater Element'],
        prerequisiteModuleIds: ['node-linked-lists'],
        lessons: [
          { id: 'l-sq-1', moduleId: 'node-stacks-queues', orderIndex: 1, title: 'LIFO & FIFO Mechanics', summary: 'Call stacks and circular queue ring buffers.', xpValue: 20, lessonType: 'reading', keyConcepts: ['LIFO', 'Circular Buffer'], linkedProblemIds: [] },
          { id: 'l-sq-2', moduleId: 'node-stacks-queues', orderIndex: 2, title: 'Monotonic Stack Algorithms', summary: 'Next greater element patterns in O(N).', xpValue: 20, lessonType: 'coding', keyConcepts: ['Monotonic Stack'], linkedProblemIds: [] },
        ],
      },
      {
        id: 'node-hash-tables',
        courseId: 'course-cs201',
        orderIndex: 4,
        groupLabel: 'Module 2: Abstract Types',
        title: 'Hash Functions & Collision Resolution',
        description: 'Hash functions, uniform distribution, load factor alpha, separate chaining, linear/quadratic probing, and robin hood hashing.',
        xpReward: 200,
        status: 'published',
        keyConcepts: ['Load Factor α', 'MurmurHash3', 'Open Addressing', 'Separate Chaining'],
        prerequisiteModuleIds: ['node-stacks-queues'],
        lessons: [
          { id: 'l-hash-1', moduleId: 'node-hash-tables', orderIndex: 1, title: 'Hash Functions & Distribution', summary: 'Uniform distribution and prime modulo hashing.', xpValue: 20, lessonType: 'reading', keyConcepts: ['Uniform Hashing', 'Load Factor'], linkedProblemIds: [] },
        ],
      },
      {
        id: 'node-trees',
        courseId: 'course-cs201',
        orderIndex: 5,
        groupLabel: 'Module 3: Non-Linear Structures',
        title: 'Binary Trees & BSTs',
        description: 'Recursive traversals (pre, in, post, level-order), BST invariant validation, AVL balanced height rotations.',
        xpReward: 220,
        status: 'published',
        keyConcepts: ['BST Invariants', 'Tree Traversal Recursion', 'Height Balancing', 'LCA Resolution'],
        prerequisiteModuleIds: ['node-hash-tables'],
        lessons: [],
      },
      {
        id: 'node-graphs',
        courseId: 'course-cs201',
        orderIndex: 6,
        groupLabel: 'Module 4: Advanced Traversal',
        title: 'Graphs & Network Algorithms',
        description: 'Adjacency lists vs matrices, BFS shortest paths, DFS topological sorting, Dijkstra & Bellman-Ford.',
        xpReward: 280,
        status: 'published',
        keyConcepts: ['Adjacency Lists', 'Topological Sort', 'Dijkstra Shortest Path', 'Disjoint Set Union'],
        prerequisiteModuleIds: ['node-trees'],
        lessons: [],
      },
    ],
  },
  {
    id: 'course-cs204',
    code: 'CS204',
    title: 'Algorithms',
    term: 'Fall 2026',
    status: 'published',
    createdBy: 'fac-admin-1',
    orderIndex: 2,
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: 'algo-divide-conquer',
        courseId: 'course-cs204',
        orderIndex: 1,
        groupLabel: 'Module 1: Recurrences',
        title: 'Divide & Conquer Recurrences',
        description: 'Master Theorem cases, recursion tree proofs, merge sort cache optimization, and Strassen matrix multiplication.',
        xpReward: 140,
        status: 'published',
        keyConcepts: ['Master Theorem', 'Asymptotic Bounding', 'Recursion Trees'],
        prerequisiteModuleIds: [],
        lessons: [
          { id: 'l-dc-1', moduleId: 'algo-divide-conquer', orderIndex: 1, title: 'Master Theorem Proofs', summary: 'Evaluating asymptotic bounds for divide and conquer algorithms.', xpValue: 20, lessonType: 'reading', keyConcepts: ['Master Theorem', 'Recurrence Trees'], linkedProblemIds: [] },
        ],
      },
      {
        id: 'algo-greedy',
        courseId: 'course-cs204',
        orderIndex: 2,
        groupLabel: 'Module 2: Greedy Strategies',
        title: 'Greedy Choice & Matroids',
        description: 'Greedy-choice property, exchange argument proofs, fractional knapsack, and Huffman optimal prefix coding.',
        xpReward: 160,
        status: 'published',
        keyConcepts: ['Greedy Exchange Proofs', 'Huffman Trees', 'Interval Scheduling'],
        prerequisiteModuleIds: ['algo-divide-conquer'],
        lessons: [
          { id: 'l-gr-1', moduleId: 'algo-greedy', orderIndex: 1, title: 'Interval Scheduling Invariant', summary: 'Earliest finish time greedy exchange proofs.', xpValue: 20, lessonType: 'coding', keyConcepts: ['Exchange Arguments', 'Interval Scheduling'], linkedProblemIds: [] },
        ],
      },
      {
        id: 'algo-dp',
        courseId: 'course-cs204',
        orderIndex: 3,
        groupLabel: 'Module 3: Dynamic Programming',
        title: 'Dynamic Programming Foundations',
        description: 'Memoization vs bottom-up tabulation, state space formulation, Longest Common Subsequence, and 0/1 Knapsack.',
        xpReward: 240,
        status: 'published',
        keyConcepts: ['State Space DAG', 'Memoization Cache', 'Tabulation Matrix', 'Optimal Substructure'],
        prerequisiteModuleIds: ['algo-greedy'],
        lessons: [],
      },
    ],
  },
];
