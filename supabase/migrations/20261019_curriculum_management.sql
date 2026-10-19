-- ============================================================================
-- Migration: 20261019_curriculum_management.sql
-- Description: Fully data-driven Course Curriculum Map tables, prerequisites,
--              student progress tracking, audit logs, and faculty governance RLS.
-- ============================================================================

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,                     -- e.g. 'CS201', 'CS204'
  title TEXT NOT NULL,                    -- e.g. 'Data Structures', 'Algorithms'
  term TEXT NOT NULL DEFAULT 'Fall 2026',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by TEXT NOT NULL DEFAULT 'fac-admin-1',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Course Modules Table
CREATE TABLE IF NOT EXISTS public.course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  group_label TEXT NOT NULL DEFAULT 'Module 1: Foundations',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  key_concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Course Lessons Table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  content_or_link TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  lesson_type TEXT NOT NULL DEFAULT 'reading' CHECK (lesson_type IN ('reading', 'video', 'quiz', 'coding')),
  linked_problem_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  xp_value INTEGER NOT NULL DEFAULT 20 CHECK (xp_value >= 0),
  key_concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_optional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Course Module Prerequisites Table (Many-to-Many DAG)
CREATE TABLE IF NOT EXISTS public.course_module_prerequisites (
  module_id TEXT NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  requires_module_id TEXT NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  PRIMARY KEY (module_id, requires_module_id),
  CONSTRAINT no_self_prerequisite CHECK (module_id <> requires_module_id)
);

-- 5. Student Module Progress Table
CREATE TABLE IF NOT EXISTS public.student_module_progress (
  student_id TEXT NOT NULL,
  module_id TEXT NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  lessons_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  xp_awarded INTEGER NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, module_id)
);

-- 6. Curriculum Audit Log Table
CREATE TABLE IF NOT EXISTS public.curriculum_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('course', 'module', 'lesson', 'prerequisite')),
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.course_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_module_progress(student_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_module_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is faculty
CREATE OR REPLACE FUNCTION public.is_faculty_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'faculty'
  );
$$;

-- RLS Policies: Courses
DROP POLICY IF EXISTS "Anyone can view published courses or faculty all" ON public.courses;
CREATE POLICY "Anyone can view published courses or faculty all" ON public.courses
  FOR SELECT USING (status = 'published' OR public.is_faculty_user());

DROP POLICY IF EXISTS "Faculty can insert courses" ON public.courses;
CREATE POLICY "Faculty can insert courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_faculty_user());

DROP POLICY IF EXISTS "Faculty can update courses" ON public.courses;
CREATE POLICY "Faculty can update courses" ON public.courses
  FOR UPDATE USING (public.is_faculty_user());

DROP POLICY IF EXISTS "Faculty can delete courses" ON public.courses;
CREATE POLICY "Faculty can delete courses" ON public.courses
  FOR DELETE USING (public.is_faculty_user());

-- RLS Policies: Modules
DROP POLICY IF EXISTS "Anyone can view published modules or faculty all" ON public.course_modules;
CREATE POLICY "Anyone can view published modules or faculty all" ON public.course_modules
  FOR SELECT USING (status = 'published' OR public.is_faculty_user());

DROP POLICY IF EXISTS "Faculty can manage modules" ON public.course_modules;
CREATE POLICY "Faculty can manage modules" ON public.course_modules
  FOR ALL USING (public.is_faculty_user());

-- RLS Policies: Lessons
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.course_lessons;
CREATE POLICY "Anyone can view lessons" ON public.course_lessons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty can manage lessons" ON public.course_lessons;
CREATE POLICY "Faculty can manage lessons" ON public.course_lessons
  FOR ALL USING (public.is_faculty_user());

-- RLS Policies: Prerequisites
DROP POLICY IF EXISTS "Anyone can view prerequisites" ON public.course_module_prerequisites;
CREATE POLICY "Anyone can view prerequisites" ON public.course_module_prerequisites
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty can manage prerequisites" ON public.course_module_prerequisites;
CREATE POLICY "Faculty can manage prerequisites" ON public.course_module_prerequisites
  FOR ALL USING (public.is_faculty_user());

-- RLS Policies: Student Progress
DROP POLICY IF EXISTS "Students can view and manage their own progress" ON public.student_module_progress;
CREATE POLICY "Students can view and manage their own progress" ON public.student_module_progress
  FOR ALL USING (student_id = auth.uid()::text OR public.is_faculty_user());

-- RLS Policies: Audit Logs
DROP POLICY IF EXISTS "Faculty can read audit logs" ON public.curriculum_audit_logs;
CREATE POLICY "Faculty can read audit logs" ON public.curriculum_audit_logs
  FOR SELECT USING (public.is_faculty_user());

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.curriculum_audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.curriculum_audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED INITIAL CURRICULUM: CS201 (Data Structures) & CS204 (Algorithms)
-- ============================================================================

INSERT INTO public.courses (id, code, title, term, status, created_by, order_index)
VALUES 
  ('course-cs201', 'CS201', 'Data Structures', 'Fall 2026', 'published', 'fac-admin-1', 1),
  ('course-cs204', 'CS204', 'Algorithms', 'Fall 2026', 'published', 'fac-admin-1', 2)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  status = EXCLUDED.status;

-- CS201 Modules
INSERT INTO public.course_modules (id, course_id, order_index, group_label, title, description, xp_reward, status, key_concepts)
VALUES
  ('node-arrays', 'course-cs201', 1, 'Module 1: Foundations', 'Linear Memory & Dynamic Arrays', 'Contiguous memory, cache lines, dynamic array amortized growth factor (geometric doubling), and two-pointer traversal patterns.', 120, 'published', ARRAY['Spatial Locality', 'Geometric Doubling', 'Amortized O(1)', 'Sliding Window']),
  ('node-linked-lists', 'course-cs201', 2, 'Module 1: Foundations', 'Linked Lists & Pointer Dynamics', 'Singly and doubly linked lists, pointer mutation invariants, sentinel dummy nodes, and Floyd’s tortoise-and-hare cycle detection.', 150, 'published', ARRAY['Pointer References', 'Sentinel Dummies', 'Tortoise and Hare', 'In-Place Reversal']),
  ('node-stacks-queues', 'course-cs201', 3, 'Module 2: Abstract Types', 'Stacks, Queues & Monotonic Buffers', 'LIFO and FIFO mechanics, ring buffers, expression parsing via Dijkstra’s shunting-yard algorithm, and monotonic stacks.', 180, 'published', ARRAY['LIFO / FIFO', 'Circular Buffers', 'Shunting-Yard', 'Next Greater Element']),
  ('node-hash-tables', 'course-cs201', 4, 'Module 2: Abstract Types', 'Hash Functions & Collision Resolution', 'Hash functions, uniform distribution, load factor alpha, separate chaining, linear/quadratic probing, and robin hood hashing.', 200, 'published', ARRAY['Load Factor α', 'MurmurHash3', 'Open Addressing', 'Separate Chaining']),
  ('node-trees', 'course-cs201', 5, 'Module 3: Non-Linear Structures', 'Binary Trees & BSTs', 'Recursive traversals (pre, in, post, level-order), BST invariant validation, AVL balanced height rotations.', 220, 'published', ARRAY['BST Invariants', 'Tree Traversal Recursion', 'Height Balancing', 'LCA Resolution']),
  ('node-graphs', 'course-cs201', 6, 'Module 4: Advanced Traversal', 'Graphs & Network Algorithms', 'Adjacency lists vs matrices, BFS shortest paths, DFS topological sorting, Dijkstra & Bellman-Ford.', 280, 'published', ARRAY['Adjacency Lists', 'Topological Sort', 'Dijkstra Shortest Path', 'Disjoint Set Union'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward,
  status = EXCLUDED.status;

-- CS204 Modules
INSERT INTO public.course_modules (id, course_id, order_index, group_label, title, description, xp_reward, status, key_concepts)
VALUES
  ('algo-divide-conquer', 'course-cs204', 1, 'Module 1: Recurrences', 'Divide & Conquer Recurrences', 'Master Theorem cases, recursion tree proofs, merge sort cache optimization, and Strassen matrix multiplication.', 140, 'published', ARRAY['Master Theorem', 'Asymptotic Bounding', 'Recursion Trees']),
  ('algo-greedy', 'course-cs204', 2, 'Module 2: Greedy Strategies', 'Greedy Choice & Matroids', 'Greedy-choice property, exchange argument proofs, fractional knapsack, and Huffman optimal prefix coding.', 160, 'published', ARRAY['Greedy Exchange Proofs', 'Huffman Trees', 'Interval Scheduling']),
  ('algo-dp', 'course-cs204', 3, 'Module 3: Dynamic Programming', 'Dynamic Programming Foundations', 'Memoization vs bottom-up tabulation, state space formulation, Longest Common Subsequence, and 0/1 Knapsack.', 240, 'published', ARRAY['State Space DAG', 'Memoization Cache', 'Tabulation Matrix', 'Optimal Substructure'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward,
  status = EXCLUDED.status;

-- CS201 Module Prerequisites
INSERT INTO public.course_module_prerequisites (module_id, requires_module_id)
VALUES
  ('node-linked-lists', 'node-arrays'),
  ('node-stacks-queues', 'node-linked-lists'),
  ('node-hash-tables', 'node-stacks-queues'),
  ('node-trees', 'node-hash-tables'),
  ('node-graphs', 'node-trees')
ON CONFLICT DO NOTHING;

-- CS204 Module Prerequisites
INSERT INTO public.course_module_prerequisites (module_id, requires_module_id)
VALUES
  ('algo-greedy', 'algo-divide-conquer'),
  ('algo-dp', 'algo-greedy')
ON CONFLICT DO NOTHING;

-- CS201 Lessons
INSERT INTO public.course_lessons (id, module_id, order_index, title, summary, xp_value, lesson_type, key_concepts, linked_problem_ids)
VALUES
  ('l-arr-1', 'node-arrays', 1, 'Contiguous Memory Allocation', 'Pointer arithmetic and cache line hits in sequential blocks.', 20, 'reading', ARRAY['Spatial Locality', 'Array Slicing'], ARRAY[]::TEXT[]),
  ('l-arr-2', 'node-arrays', 2, 'Geometric Array Growth', 'Amortized O(1) appending and buffer doubling strategies.', 20, 'reading', ARRAY['Amortized Analysis', 'Capacities'], ARRAY[]::TEXT[]),
  ('l-arr-3', 'node-arrays', 3, 'Sliding Windows & Two Pointers', 'Eliminating nested loops using invariant pointers.', 20, 'coding', ARRAY['Two Pointers', 'Fast-Slow Pointers'], ARRAY['prob-two-sum']),
  ('l-ll-1', 'node-linked-lists', 1, 'Singly vs Doubly Linked Nodes', 'Node structure and pointer traversal mechanics.', 20, 'reading', ARRAY['Pointers', 'Head-Tail Invariants'], ARRAY[]::TEXT[]),
  ('l-ll-2', 'node-linked-lists', 2, 'Floyd Cycle Detection Algorithm', 'Tortoise and Hare two-pointer cycle proof.', 20, 'coding', ARRAY['Fast-Slow Cycle Finding'], ARRAY[]::TEXT[]),
  ('l-sq-1', 'node-stacks-queues', 1, 'LIFO & FIFO Mechanics', 'Call stacks and circular queue ring buffers.', 20, 'reading', ARRAY['LIFO', 'Circular Buffer'], ARRAY[]::TEXT[]),
  ('l-sq-2', 'node-stacks-queues', 2, 'Monotonic Stack Algorithms', 'Next greater element patterns in O(N).', 20, 'coding', ARRAY['Monotonic Stack'], ARRAY[]::TEXT[]),
  ('l-hash-1', 'node-hash-tables', 1, 'Hash Functions & Distribution', 'Uniform distribution and prime modulo hashing.', 20, 'reading', ARRAY['Uniform Hashing', 'Load Factor'], ARRAY[]::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  xp_value = EXCLUDED.xp_value;

-- CS204 Lessons
INSERT INTO public.course_lessons (id, module_id, order_index, title, summary, xp_value, lesson_type, key_concepts)
VALUES
  ('l-dc-1', 'algo-divide-conquer', 1, 'Master Theorem Proofs', 'Evaluating asymptotic bounds for divide and conquer algorithms.', 20, 'reading', ARRAY['Master Theorem', 'Recurrence Trees']),
  ('l-gr-1', 'algo-greedy', 1, 'Interval Scheduling Invariant', 'Earliest finish time greedy exchange proofs.', 20, 'coding', ARRAY['Exchange Arguments', 'Interval Scheduling'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  xp_value = EXCLUDED.xp_value;
