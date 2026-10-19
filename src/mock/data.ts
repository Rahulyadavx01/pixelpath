import {
  UserProfile,
  RosterStudent,
  QuizQuestion,
  CourseNode,
  CodingProblem,
  LeaderboardStudent,
  Achievement,
  RewardItem,
  PeerHelpRequest,
  DiscussionThread,
  Announcement,
  Battle,
  FacultyStats,
  XpActivity,
  FacultyAllowlistEntry,
  CustomQuiz,
  CustomQuizQuestion,
  CustomQuizAttempt,
  QuizAnalytics,
  DailyQuest,
  DailyQuestAttempt,
  DailyQuestSolution,
  DailyQuestAnalytics,
  XpTransaction,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  TestResult,
  ClubSession,
  ClubAttendance,
  LeaderboardPeriod
} from '../types';

export const initialUser: UserProfile = {
  id: 'usr_alex_09',
  name: 'Alex Morgan',
  email: 'alex.morgan@msot.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  collegeId: 'Mains-24813',
  major: 'Computer Science & Engineering',
  semester: 'Semester 4',
  role: 'student',
  isOnboarded: true,
  level: 12,
  xp: 1840,
  xpToNextLevel: 660,
  totalXpNeededForLevel: 2500,
  streakDays: 7,
  streakHistory: [
    { day: 'Mon', date: 'Oct 2', completed: true },
    { day: 'Tue', date: 'Oct 3', completed: true },
    { day: 'Wed', date: 'Oct 4', completed: true },
    { day: 'Thu', date: 'Oct 5', completed: true },
    { day: 'Fri', date: 'Oct 6', completed: true },
    { day: 'Sat', date: 'Oct 7', completed: true },
    { day: 'Sun', date: 'Oct 8', completed: true, isToday: true },
  ],
  streakFreezeCount: 2,
  league: 'Gold',
  classRank: 27,
  totalInClass: 64,
  coursesCompleted: 4,
  codingProblemsSolved: 42,
  quizAccuracy: 88,
  batch: '2024-2028',
  reduceTransparency: false,
};

export const facultyUser: UserProfile = {
  id: 'usr_faculty_01',
  name: 'Prof. Alan Vance',
  email: 'alan.vance@msot.edu',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
  collegeId: 'MSOT-FAC-001',
  major: 'Computer Science Faculty',
  semester: 'Faculty Staff',
  role: 'faculty',
  isOnboarded: true,
  level: 50,
  xp: 12800,
  xpToNextLevel: 2200,
  totalXpNeededForLevel: 15000,
  streakDays: 45,
  streakHistory: [
    { day: 'Mon', date: 'Oct 2', completed: true },
    { day: 'Tue', date: 'Oct 3', completed: true },
    { day: 'Wed', date: 'Oct 4', completed: true },
    { day: 'Thu', date: 'Oct 5', completed: true },
    { day: 'Fri', date: 'Oct 6', completed: true },
    { day: 'Sat', date: 'Oct 7', completed: true },
    { day: 'Sun', date: 'Oct 8', completed: true, isToday: true },
  ],
  streakFreezeCount: 5,
  league: 'Master',
  classRank: 1,
  totalInClass: 64,
  coursesCompleted: 12,
  codingProblemsSolved: 120,
  quizAccuracy: 99,
};

export const mockRoster: RosterStudent[] = [
  {
    studentId: 'Mains-24813',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@msot.edu',
    department: 'Computer Science & Engineering',
    batch: '2024-2028',
    role: 'student',
    isActivated: true,
    activatedAt: '2026-09-01T10:00:00Z',
  },
  {
    studentId: 'Mains-24814',
    fullName: 'Kenji Sato',
    email: 'kenji.sato@msot.edu',
    department: 'Computer Science & Engineering',
    batch: '2024-2028',
    role: 'student',
    isActivated: false,
  },
  {
    studentId: 'Mains-24815',
    fullName: 'Aanya Sharma',
    email: 'aanya.sharma@msot.edu',
    department: 'Computer Science & Engineering',
    batch: '2024-2028',
    role: 'student',
    isActivated: false,
  },
  {
    studentId: 'Mains-24816',
    fullName: 'Rahul Varma',
    email: 'rahul.varma@msot.edu',
    department: 'Computer Science & Engineering',
    batch: '2024-2028',
    role: 'student',
    isActivated: false,
  },
  {
    studentId: 'Mains-24817',
    fullName: 'Maya Lin',
    email: 'maya.lin@msot.edu',
    department: 'Computer Science & Engineering',
    batch: '2024-2028',
    role: 'student',
    isActivated: false,
  },
  {
    studentId: 'MSOT-FAC-001',
    fullName: 'Prof. Alan Vance',
    email: 'alan.vance@msot.edu',
    department: 'Computer Science & Engineering',
    batch: 'Faculty Staff',
    role: 'faculty',
    isActivated: true,
    activatedAt: '2026-08-15T09:00:00Z',
  },
];

export const initialXpActivities: XpActivity[] = [
  {
    id: 'xp-1',
    timestamp: '10 mins ago',
    action: 'Daily Quiz: Computer Systems & Logic',
    category: 'quiz',
    amount: 35,
    verified: true,
    academicImpact: 'none',
  },
  {
    id: 'xp-2',
    timestamp: 'Yesterday at 4:15 PM',
    action: 'Solved Medium Coding Challenge: Two Sum',
    category: 'coding',
    amount: 50,
    verified: true,
    academicImpact: 'none',
  },
  {
    id: 'xp-3',
    timestamp: '2 days ago',
    action: 'Peer Help: Accepted Solution in Binary Trees',
    category: 'peer_help',
    amount: 25,
    verified: true,
    academicImpact: 'none',
  },
  {
    id: 'xp-4',
    timestamp: '3 days ago',
    action: '7-Day Consistent Streak Bonus Shield',
    category: 'streak_bonus',
    amount: 30,
    verified: true,
    academicImpact: 'none',
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the tightest worst-case time complexity of searching for an element in a balanced AVL tree with N nodes?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 1,
    explanation: 'Because AVL trees maintain strict height balance with a balance factor of {-1, 0, +1}, the height is guaranteed to be <= 1.44 log2(N). Search time is bounded strictly by tree height O(log N).',
    xpReward: 12,
    topic: 'Trees & Complexity',
  },
  {
    id: 'q2',
    question: 'In Dijkstra’s algorithm implemented with a Min-Heap/Priority Queue, what is the asymptotic runtime for graph G = (V, E)?',
    options: ['O(V + E)', 'O(V²)', 'O((V + E) log V)', 'O(V * E)'],
    correctIndex: 2,
    explanation: 'Extract-min runs in O(log V) across V vertices, and each edge relaxation updates heap priorities in O(log V), yielding O((V + E) log V) total complexity.',
    xpReward: 12,
    topic: 'Graph Theory',
  },
  {
    id: 'q3',
    question: 'Which algorithmic paradigm is strictly required to solve the 0/1 Knapsack problem optimally?',
    options: ['Greedy Approach', 'Dynamic Programming', 'Divide and Conquer', 'Two Pointer Linear Scan'],
    correctIndex: 1,
    explanation: 'Because items cannot be subdivided (0 or 1 choice) and greedy choice property fails, dynamic programming via overlapping subproblems and optimal substructure is required.',
    xpReward: 12,
    topic: 'Dynamic Programming',
  },
  {
    id: 'q4',
    question: 'What collision resolution technique in hash tables places all collided elements in an auxiliary linked list or red-black tree at the bucket index?',
    options: ['Linear Probing', 'Quadratic Probing', 'Double Hashing', 'Separate Chaining'],
    correctIndex: 3,
    explanation: 'Separate chaining uses bucket-linked containers, preventing primary clustering that degrades open addressing schemes.',
    xpReward: 12,
    topic: 'Hash Structures',
  },
  {
    id: 'q5',
    question: 'In Git, what data structure is internally used to store commits, trees, blobs, and history integrity?',
    options: ['B-Tree index', 'Directed Acyclic Graph (DAG) with SHA-1/256 Merkle hashes', 'Doubly Linked List', 'Radix Tree Trie'],
    correctIndex: 1,
    explanation: 'Git models repositories as a Merkle Directed Acyclic Graph (DAG) of immutable content-addressable objects.',
    xpReward: 12,
    topic: 'Systems & Tools',
  },
];

export const dataStructureCourseNodes: CourseNode[] = [
  {
    id: 'node-arrays',
    courseId: 'data-structures',
    title: 'Linear Memory & Dynamic Arrays',
    module: 'Module 1: Foundations',
    orderIndex: 1,
    status: 'completed',
    xpValue: 120,
    lessons: [
      { id: 'l-arr-1', moduleId: 'node-arrays', title: 'Contiguous Memory Allocation', summary: 'Pointer arithmetic and cache line hits in sequential blocks.', xpValue: 20, orderIndex: 1, keyConcepts: ['Spatial Locality', 'Array Slicing'], prerequisiteLessonIds: [] },
      { id: 'l-arr-2', moduleId: 'node-arrays', title: 'Geometric Array Growth', summary: 'Amortized O(1) appending and buffer doubling strategies.', xpValue: 20, orderIndex: 2, keyConcepts: ['Amortized Analysis', 'Capacities'], prerequisiteLessonIds: ['l-arr-1'] },
      { id: 'l-arr-3', moduleId: 'node-arrays', title: 'Sliding Windows & Two Pointers', summary: 'Eliminating nested loops using invariant pointers.', xpValue: 20, orderIndex: 3, keyConcepts: ['Two Pointers', 'Fast-Slow Pointers'], prerequisiteLessonIds: ['l-arr-2'] },
    ],
    lessonsCount: 3,
    completedLessons: 3,
    summary: 'Contiguous memory, cache lines, dynamic array amortized growth factor (geometric doubling), and two-pointer traversal patterns.',
    keyConcepts: ['Spatial Locality', 'Geometric Doubling', 'Amortized O(1)', 'Sliding Window'],
    prerequisiteModuleIds: [],
  },
  {
    id: 'node-linked-lists',
    courseId: 'data-structures',
    title: 'Linked Lists & Pointer Dynamics',
    module: 'Module 1: Foundations',
    orderIndex: 2,
    status: 'completed',
    xpValue: 150,
    lessons: [
      { id: 'l-ll-1', moduleId: 'node-linked-lists', title: 'Singly vs Doubly Linked Nodes', summary: 'Node structure and pointer traversal mechanics.', xpValue: 20, orderIndex: 1, keyConcepts: ['Pointers', 'Head-Tail Invariants'], prerequisiteLessonIds: [] },
      { id: 'l-ll-2', moduleId: 'node-linked-lists', title: 'Floyd Cycle Detection Algorithm', summary: 'Tortoise and Hare two-pointer cycle proof.', xpValue: 20, orderIndex: 2, keyConcepts: ['Fast-Slow Cycle Finding', 'Memory Overhead'], prerequisiteLessonIds: ['l-ll-1'] },
    ],
    lessonsCount: 2,
    completedLessons: 2,
    summary: 'Singly and doubly linked lists, pointer mutation invariants, sentinel dummy nodes, and Floyd’s tortoise-and-hare cycle detection.',
    keyConcepts: ['Pointer References', 'Sentinel Dummies', 'Tortoise and Hare', 'In-Place Reversal'],
    prerequisiteModuleIds: ['node-arrays'],
  },
  {
    id: 'node-stacks-queues',
    courseId: 'data-structures',
    title: 'Stacks, Queues & Monotonic Buffers',
    module: 'Module 2: Abstract Types',
    orderIndex: 3,
    status: 'current',
    xpValue: 180,
    lessons: [
      { id: 'l-sq-1', moduleId: 'node-stacks-queues', title: 'LIFO & FIFO Mechanics', summary: 'Call stacks and circular queue ring buffers.', xpValue: 20, orderIndex: 1, keyConcepts: ['LIFO', 'Circular Buffer'], prerequisiteLessonIds: [] },
      { id: 'l-sq-2', moduleId: 'node-stacks-queues', title: 'Monotonic Stack Algorithms', summary: 'Next greater element patterns in O(N).', xpValue: 20, orderIndex: 2, keyConcepts: ['Monotonic Stack', 'Range Invariant'], prerequisiteLessonIds: ['l-sq-1'] },
    ],
    lessonsCount: 2,
    completedLessons: 1,
    summary: 'LIFO and FIFO mechanics, ring buffers, expression parsing via Dijkstra’s shunting-yard algorithm, and monotonic stacks.',
    keyConcepts: ['LIFO / FIFO', 'Circular Buffers', 'Shunting-Yard', 'Next Greater Element'],
    prerequisiteModuleIds: ['node-linked-lists'],
  },
  {
    id: 'node-hash-tables',
    courseId: 'data-structures',
    title: 'Hash Functions & Collision Resolution',
    module: 'Module 2: Abstract Types',
    orderIndex: 4,
    status: 'locked',
    xpValue: 200,
    lessons: [
      { id: 'l-hash-1', moduleId: 'node-hash-tables', title: 'Hash Functions & Distribution', summary: 'Uniform distribution and prime modulo hashing.', xpValue: 20, orderIndex: 1, keyConcepts: ['Uniform Hashing', 'Load Factor'], prerequisiteLessonIds: [] },
    ],
    lessonsCount: 2,
    completedLessons: 0,
    summary: 'Hash functions, uniform distribution, load factor alpha, separate chaining, linear/quadratic probing, and robin hood hashing.',
    keyConcepts: ['Load Factor α', 'MurmurHash3', 'Open Addressing', 'Separate Chaining'],
    prerequisiteModuleIds: ['node-stacks-queues'],
  },
  {
    id: 'node-trees',
    courseId: 'data-structures',
    title: 'Binary Trees & BSTs',
    module: 'Module 3: Non-Linear Structures',
    orderIndex: 5,
    status: 'locked',
    xpValue: 220,
    lessons: [],
    lessonsCount: 3,
    completedLessons: 0,
    summary: 'Recursive traversals (pre, in, post, level-order), BST invariant validation, AVL balanced height rotations.',
    keyConcepts: ['BST Invariants', 'Tree Traversal Recursion', 'Height Balancing', 'LCA Resolution'],
    prerequisiteModuleIds: ['node-hash-tables'],
  },
  {
    id: 'node-graphs',
    courseId: 'data-structures',
    title: 'Graphs & Network Algorithms',
    module: 'Module 4: Advanced Traversal',
    orderIndex: 6,
    status: 'locked',
    xpValue: 280,
    lessons: [],
    lessonsCount: 4,
    completedLessons: 0,
    summary: 'Adjacency lists vs matrices, BFS shortest paths, DFS topological sorting, Dijkstra & Bellman-Ford.',
    keyConcepts: ['Adjacency Lists', 'Topological Sort', "Dijkstra's Greedy Shortest Path", 'Disjoint Set Union'],
    prerequisiteModuleIds: ['node-trees'],
  },
];

export const algorithmsCourseNodes: CourseNode[] = [
  {
    id: 'algo-divide-conquer',
    courseId: 'algorithms',
    title: 'Divide & Conquer Recurrences',
    module: 'Module 1: Recurrences',
    orderIndex: 1,
    status: 'completed',
    xpValue: 140,
    lessons: [
      { id: 'l-dc-1', moduleId: 'algo-divide-conquer', title: 'Master Theorem Proofs', summary: 'Evaluating T(n) = aT(n/b) + f(n) asymptotic bounds.', xpValue: 20, orderIndex: 1, keyConcepts: ['Master Theorem', 'Recurrence Trees'], prerequisiteLessonIds: [] },
    ],
    lessonsCount: 3,
    completedLessons: 3,
    summary: 'Master Theorem cases, recursion tree proofs, merge sort cache optimization, and Strassen matrix multiplication.',
    keyConcepts: ['Master Theorem', 'Asymptotic Bounding', 'Recursion Trees'],
    prerequisiteModuleIds: [],
  },
  {
    id: 'algo-greedy',
    courseId: 'algorithms',
    title: 'Greedy Choice & Matroids',
    module: 'Module 2: Greedy Strategies',
    orderIndex: 2,
    status: 'current',
    xpValue: 160,
    lessons: [
      { id: 'l-gr-1', moduleId: 'algo-greedy', title: 'Interval Scheduling Invariant', summary: 'Earliest finish time greedy exchange proofs.', xpValue: 20, orderIndex: 1, keyConcepts: ['Exchange Arguments', 'Interval Scheduling'], prerequisiteLessonIds: [] },
    ],
    lessonsCount: 2,
    completedLessons: 0,
    summary: 'Greedy-choice property, exchange argument proofs, fractional knapsack, and Huffman optimal prefix coding.',
    keyConcepts: ['Greedy Exchange Proofs', 'Huffman Trees', 'Interval Scheduling'],
    prerequisiteModuleIds: ['algo-divide-conquer'],
  },
  {
    id: 'algo-dp',
    courseId: 'algorithms',
    title: 'Dynamic Programming Foundations',
    module: 'Module 3: Dynamic Programming',
    orderIndex: 3,
    status: 'locked',
    xpValue: 240,
    lessons: [],
    lessonsCount: 4,
    completedLessons: 0,
    summary: 'Memoization vs bottom-up tabulation, state space formulation, Longest Common Subsequence, and 0/1 Knapsack.',
    keyConcepts: ['State Space DAG', 'Memoization Cache', 'Tabulation Matrix', 'Optimal Substructure'],
    prerequisiteModuleIds: ['algo-greedy'],
  },
];

export const codingProblems: CodingProblem[] = [
  {
    id: 'prob-two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Medium',
    xpReward: 20,
    streakDays: 4,
    acceptanceRate: '49.8%',
    tags: ['Hash Map', 'Array', 'Time: O(n)'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

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
};`,
      python: `def twoSum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
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
}`,
      java: `class Solution {
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
}`,
    },
    testCases: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        expectedOutput: '[0, 1]',
        isHidden: false,
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        expectedOutput: '[1, 2]',
        isHidden: false,
      },
      {
        input: 'nums = [3, 3], target = 6',
        expectedOutput: '[0, 1]',
        isHidden: true,
      },
      {
        input: 'nums = [-1, -2, -3, -4, -5], target = -8',
        expectedOutput: '[2, 4]',
        isHidden: true,
      },
    ],
    solutionExplanation: 'Using an auxiliary hash map stores previous values in O(1) lookup time, cutting total runtime down from O(n²) to linear O(n).',
  },
  {
    id: 'prob-valid-anagram',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'Easy',
    xpReward: 10,
    streakDays: 4,
    acceptanceRate: '63.2%',
    tags: ['Strings', 'Hash Map', 'Counting'],
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: 'true',
      },
      {
        input: 's = "rat", t = "car"',
        output: 'false',
      },
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    starterCode: {
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> counts(26, 0);
        for (char c : s) counts[c - 'a']++;
        for (char c : t) {
            if (--counts[c - 'a'] < 0) return false;
        }
        return true;
    }
};`,
      python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    return sorted(s) == sorted(t)`,
      javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  return s.split('').sort().join('') === t.split('').sort().join('');
}`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        char[] sArr = s.toCharArray();
        char[] tArr = t.toCharArray();
        Arrays.sort(sArr);
        Arrays.sort(tArr);
        return Arrays.equals(sArr, tArr);
    }
}`,
    },
    testCases: [
      {
        input: 's = "anagram", t = "nagaram"',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: 's = "rat", t = "car"',
        expectedOutput: 'false',
        isHidden: false,
      },
      {
        input: 's = "ab", t = "a"',
        expectedOutput: 'false',
        isHidden: true,
      },
    ],
    solutionExplanation: 'Character frequency counting array of size 26 yields O(n) runtime and O(1) space.',
  },
  {
    id: 'prob-binary-search',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    xpReward: 10,
    streakDays: 4,
    acceptanceRate: '56.4%',
    tags: ['Binary Search', 'Array'],
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    examples: [
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        output: '4',
      },
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
        output: '-1',
      },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All integers in nums are unique.'],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = (int)nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`,
      python: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      javascript: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    },
    testCases: [
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        expectedOutput: '4',
        isHidden: false,
      },
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
        expectedOutput: '-1',
        isHidden: false,
      },
      {
        input: 'nums = [5], target = 5',
        expectedOutput: '0',
        isHidden: true,
      },
    ],
    solutionExplanation: 'Halving the search space each step produces logarithmic O(log n) time.',
  },
];

export const classLeaderboard: LeaderboardStudent[] = [
  {
    id: 'st-1',
    rank: 1,
    name: 'Kenji Sato',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
    xp: 2940,
    change: '↑2',
    changeType: 'up',
    league: 'Gold',
    streak: 14,
    isCurrentUser: false,
  },
  {
    id: 'st-2',
    rank: 2,
    name: 'Aanya Sharma',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
    xp: 2810,
    change: '→',
    changeType: 'same',
    league: 'Gold',
    streak: 12,
    isCurrentUser: false,
  },
  {
    id: 'st-3',
    rank: 3,
    name: 'Devin Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    xp: 2750,
    change: '↑1',
    changeType: 'up',
    league: 'Gold',
    streak: 9,
    isCurrentUser: false,
  },
  {
    id: 'st-4',
    rank: 4,
    name: 'Fatima Al-Sayed',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
    xp: 2620,
    change: '↓1',
    changeType: 'down',
    league: 'Gold',
    streak: 8,
    isCurrentUser: false,
  },
  {
    id: 'st-5',
    rank: 5,
    name: 'Marcus Wright',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    xp: 2490,
    change: '↑3',
    changeType: 'up',
    league: 'Gold',
    streak: 11,
    isCurrentUser: false,
  },
  {
    id: 'usr_alex_09',
    rank: 27,
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    xp: 1840,
    change: '↑4',
    changeType: 'up',
    league: 'Gold',
    streak: 7,
    isCurrentUser: true,
  },
];

export const leagueCohort: LeaderboardStudent[] = [
  { id: 'l1', rank: 1, name: 'Siddharth Rao', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', xp: 2310, change: '↑1', changeType: 'up', league: 'Gold', streak: 12, isCurrentUser: false },
  { id: 'l2', rank: 2, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80', xp: 2190, change: '→', changeType: 'same', league: 'Gold', streak: 10, isCurrentUser: false },
  { id: 'l3', rank: 3, name: 'Tariq Mansour', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&h=256&q=80', xp: 2080, change: '↑2', changeType: 'up', league: 'Gold', streak: 9, isCurrentUser: false },
  { id: 'l4', rank: 4, name: 'Chloe Dubois', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', xp: 1980, change: '↓1', changeType: 'down', league: 'Gold', streak: 8, isCurrentUser: false },
  { id: 'l5', rank: 5, name: 'Kenji Sato', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80', xp: 1910, change: '↑1', changeType: 'up', league: 'Gold', streak: 14, isCurrentUser: false },
  { id: 'l6', rank: 6, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80', xp: 1870, change: '→', changeType: 'same', league: 'Gold', streak: 6, isCurrentUser: false },
  { id: 'usr_alex_09', rank: 7, name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', xp: 1840, change: '↑3', changeType: 'up', league: 'Gold', streak: 7, isCurrentUser: true },
  { id: 'l8', rank: 8, name: 'Liam O’Connor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80', xp: 1790, change: '↓1', changeType: 'down', league: 'Gold', streak: 5, isCurrentUser: false },
  { id: 'l9', rank: 9, name: 'Nadia Volkova', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80', xp: 1720, change: '→', changeType: 'same', league: 'Gold', streak: 6, isCurrentUser: false },
  { id: 'l10', rank: 10, name: 'Mateo Morales', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80', xp: 1680, change: '↑2', changeType: 'up', league: 'Gold', streak: 4, isCurrentUser: false },
  { id: 'l11', rank: 11, name: 'Ananya Deshmukh', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80', xp: 1640, change: '→', changeType: 'same', league: 'Gold', streak: 7, isCurrentUser: false },
  { id: 'l12', rank: 12, name: 'Jonas Richter', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80', xp: 1590, change: '↓2', changeType: 'down', league: 'Gold', streak: 3, isCurrentUser: false },
  { id: 'l13', rank: 13, name: 'Zara Khan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', xp: 1530, change: '↑1', changeType: 'up', league: 'Gold', streak: 5, isCurrentUser: false },
  { id: 'l14', rank: 14, name: 'Lucas Silva', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', xp: 1490, change: '→', changeType: 'same', league: 'Gold', streak: 4, isCurrentUser: false },
  { id: 'l15', rank: 15, name: 'Hannah Schmidt', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80', xp: 1450, change: '↓1', changeType: 'down', league: 'Gold', streak: 2, isCurrentUser: false },
  { id: 'l16', rank: 16, name: 'Kwame Asante', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80', xp: 1380, change: '↓2', changeType: 'down', league: 'Gold', streak: 2, isCurrentUser: false },
  { id: 'l17', rank: 17, name: 'Yuki Takahashi', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80', xp: 1310, change: '→', changeType: 'same', league: 'Gold', streak: 3, isCurrentUser: false },
  { id: 'l18', rank: 18, name: 'Sophia Rossi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80', xp: 1240, change: '↓1', changeType: 'down', league: 'Gold', streak: 1, isCurrentUser: false },
  { id: 'l19', rank: 19, name: 'Dmitri Ivanov', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&h=256&q=80', xp: 1180, change: '↓2', changeType: 'down', league: 'Gold', streak: 0, isCurrentUser: false },
  { id: 'l20', rank: 20, name: 'Isabella Gomez', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80', xp: 1110, change: '→', changeType: 'same', league: 'Gold', streak: 0, isCurrentUser: false },
];

export const achievementsData: Achievement[] = [
  {
    id: 'ach-streak-7',
    title: 'Habit Machine',
    description: 'Maintained a 7-day continuous learning streak across lectures and coding practice.',
    icon: 'Flame',
    xpBonus: 50,
    unlocked: true,
    unlockedDate: 'Today',
    progress: 7,
    maxProgress: 7,
    rarity: 'Rare',
    category: 'streak',
  },
  {
    id: 'ach-quiz-master',
    title: 'Algorithmic Intuition',
    description: 'Score 100% on 3 consecutive daily algorithm quiz sprints.',
    icon: 'Brain',
    xpBonus: 75,
    unlocked: true,
    unlockedDate: '3 days ago',
    progress: 3,
    maxProgress: 3,
    rarity: 'Epic',
    category: 'quiz',
  },
  {
    id: 'ach-code-warrior',
    title: 'Clean Syntax Champion',
    description: 'Pass all hidden edge-case unit suites on 15 verified coding arena problems.',
    icon: 'Terminal',
    xpBonus: 100,
    unlocked: false,
    progress: 12,
    maxProgress: 15,
    rarity: 'Epic',
    category: 'coding',
  },
  {
    id: 'ach-peer-tutor',
    title: 'Department Mentor',
    description: 'Have 5 peer-help answers officially accepted by classmates who asked for assistance.',
    icon: 'HandHeart',
    xpBonus: 80,
    unlocked: true,
    unlockedDate: '1 week ago',
    progress: 5,
    maxProgress: 5,
    rarity: 'Rare',
    category: 'community',
  },
  {
    id: 'ach-league-climb',
    title: 'Gold Tier Velocity',
    description: 'Promote into the Gold League and sustain top-10 cohort standing.',
    icon: 'TrendingUp',
    xpBonus: 60,
    unlocked: true,
    unlockedDate: '2 weeks ago',
    progress: 1,
    maxProgress: 1,
    rarity: 'Common',
    category: 'league',
  },
  {
    id: 'ach-mastery',
    title: 'Grandmaster Learner',
    description: 'Accumulate 5,000 verified learning XP and reach Level 20.',
    icon: 'Trophy',
    xpBonus: 250,
    unlocked: false,
    progress: 1840,
    maxProgress: 5000,
    rarity: 'Legendary',
    category: 'mastery',
  },
];

export const rewardsCatalog: RewardItem[] = [
  {
    id: 'rew-lounge-pass',
    title: 'Department Honors Lounge Priority Pass',
    category: 'Passes',
    xpCost: 650,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&h=400&q=80',
    description: 'One-week reserved quiet desk pass in the CSE Department Honors Suite with dual-monitor docks and whiteboards.',
    stock: 8,
    claimed: false,
    msotApproved: true,
    sponsorOrPartner: 'MSOT Student Life & CSE Dept',
  },
  {
    id: 'rew-ieee-hoodie',
    title: 'Official MSOT Engineering Embroidered Hoodie',
    category: 'Merch',
    xpCost: 1400,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&h=400&q=80',
    description: 'Premium organic cotton zip hoodie with custom MSOT CSE Department crest and student handle embroidery.',
    stock: 4,
    claimed: false,
    msotApproved: true,
    sponsorOrPartner: 'IEEE Student Branch Endowment',
  },
  {
    id: 'rew-mentor-session',
    title: '1-on-1 Alumni Engineering Mentorship Session',
    category: 'Mentorship',
    xpCost: 1100,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&h=400&q=80',
    description: '45-minute virtual portfolio and code review with a senior distributed systems engineer at Google / Meta.',
    stock: 5,
    claimed: true,
    msotApproved: true,
    sponsorOrPartner: 'MSOT Alumni Mentorship Network',
  },
];

export const mockPeerHelpRequests: PeerHelpRequest[] = [
  {
    id: 'req-1',
    requesterId: 'usr_alex_09', // Alex Morgan asked for help! Alex has the authority to accept!
    requesterName: 'Alex Morgan',
    requesterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    subject: 'Algorithms (CS204)',
    title: 'Need help visualizing Master Theorem Case 2 vs Case 3 for T(n) = 2T(n/2) + n log n',
    description: 'Can someone clarify why f(n) = n log n does not satisfy Case 3 polynomially larger condition? I am preparing for tomorrow’s recitations.',
    status: 'open',
    createdAt: '2 hours ago',
    responses: [
      {
        id: 'rep-kenji-1',
        requestId: 'req-1',
        helperId: 'usr_kenji_02',
        helperName: 'Kenji Sato',
        helperAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
        helperRole: 'Classmate • Level 14',
        content: `Case 3 requires f(n) = Ω(n^(log_b(a) + ε)) for some strict ε > 0. Since log_2(2) = 1, f(n) = n log n is only asymptotically larger by a factor of log n, which is smaller than any n^ε! That is why standard Master Theorem does not apply and you use the Akra-Bazzi method or extended Case 2 (yielding Θ(n log² n)).`,
        isAccepted: false,
        createdAt: '1 hour ago',
      },
    ],
  },
  {
    id: 'req-2',
    requesterId: 'usr_aanya_03', // Aanya asked for help! Only Aanya can accept!
    requesterName: 'Aanya Sharma',
    requesterAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
    subject: 'Data Structures (CS201)',
    title: 'AVL Tree Right-Left Double Rotation pointer reassignment',
    description: 'My code fails when inserting into the left subtree of the right child. What is the correct order of pointer updates?',
    status: 'open',
    createdAt: '4 hours ago',
    responses: [
      {
        id: 'rep-alex-2',
        requestId: 'req-2',
        helperId: 'usr_alex_09',
        helperName: 'Alex Morgan',
        helperAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
        helperRole: 'You • Level 12',
        content: `For an RL rotation: First perform a Right Rotation on the node's right child (converting the tree to an RR shape), and then perform a standard Left Rotation on the root node itself. Remember to update the heights of child nodes before the parent!`,
        isAccepted: false,
        createdAt: '3 hours ago',
      },
    ],
  },
];

export const mockDiscussions: DiscussionThread[] = [
  {
    id: 'disc-1',
    authorId: 'usr_maya_05',
    authorName: 'Maya Lin',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
    authorRole: 'Student • Level 11',
    courseTag: 'CS204: Algorithms',
    title: 'How do you formulate the state transitions for 2D Dynamic Programming?',
    body: 'When solving grid traversal or longest common subsequence, what systematic mental framework do you use to define the base cases and subproblem memoization array?',
    isPinned: true,
    isHidden: false,
    createdAt: 'Yesterday',
    replies: [
      {
        id: 'drep-1',
        threadId: 'disc-1',
        authorId: 'usr_alex_09',
        authorName: 'Alex Morgan',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
        authorRole: 'You • Level 12',
        content: 'I always write the recursive mathematical recurrence first on paper before writing code. Identify what decision you make at step (i, j): usually either take character i or skip it.',
        isHidden: false,
        createdAt: '18 hours ago',
      },
    ],
  },
  {
    id: 'disc-2',
    authorId: 'usr_kenji_02',
    authorName: 'Kenji Sato',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
    authorRole: 'Student • Level 14',
    courseTag: 'General CSE',
    title: 'Recommended tools for profiling memory cache locality in C++ and Python',
    body: 'Has anyone experimented with `valgrind --tool=cachegrind` on campus Linux lab machines? It clearly demonstrates the performance difference between row-major vs column-major array traversal.',
    isPinned: false,
    isHidden: false,
    createdAt: '2 days ago',
    replies: [],
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    authorId: 'usr_faculty_01',
    authorName: 'Prof. Alan Vance (Faculty)',
    title: 'Weekend Synchronous Team Battle: Registration Now Open',
    content: 'The CS204 Cohort Clash Team Battle has been scheduled for this Saturday at 14:00 UTC. Form a team of up to 4 members before Friday 23:59 UTC. Roster locks automatically at battle start.',
    priority: 'urgent',
    courseTag: 'All CSE Cohorts',
    createdAt: 'Today at 08:30 AM',
    isRead: false,
  },
  {
    id: 'ann-2',
    authorId: 'usr_faculty_01',
    authorName: 'Prof. Alan Vance (Faculty)',
    title: 'Reminder: Questify Gamification & Academic Evaluation Policy',
    content: 'Questify XP, streaks, and league standings are designed for healthy habit formation and peer collaboration. Game XP is strictly non-academic and never replaces formal examination grading.',
    priority: 'normal',
    courseTag: 'Department Governance',
    createdAt: '3 days ago',
    isRead: true,
  },
];

export const mockBattles: Battle[] = [
  {
    id: 'bat-weekend-sprint',
    title: 'Weekend Algorithms Clash: Nova vs Phoenix',
    description: 'Synchronous cohort challenge. Solve dynamic programming and graph problems under battle conditions to earn squad honors.',
    topic: 'CS204: Algorithms & Complexity',
    status: 'live',
    registrationDeadline: new Date(Date.now() - 3600000 * 2).toISOString(),
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 3600000 * 3).toISOString(),
    maxTeamSize: 4,
    xpPool: 600,
    userTeamId: 'team-nova',
    teams: [
      {
        id: 'team-nova',
        battleId: 'bat-weekend-sprint',
        name: 'Team Nova',
        teamCode: 'NOVA24',
        totalScore: 2840,
        members: [
          { userId: 'usr_aanya_03', name: 'Aanya Sharma', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80', role: 'leader', joinedAt: '2 days ago' },
          { userId: 'usr_alex_09', name: 'Alex Morgan (You)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', role: 'member', joinedAt: '1 day ago' },
          { userId: 'usr_devin_06', name: 'Devin Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', role: 'member', joinedAt: '1 day ago' },
        ],
      },
      {
        id: 'team-phoenix',
        battleId: 'bat-weekend-sprint',
        name: 'Team Phoenix',
        teamCode: 'PHX24',
        totalScore: 2510,
        members: [
          { userId: 'usr_rahul_04', name: 'Rahul Varma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80', role: 'leader', joinedAt: '2 days ago' },
          { userId: 'usr_priya_07', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80', role: 'member', joinedAt: '1 day ago' },
        ],
      },
    ],
    challenges: [
      {
        id: 'ch-battle-quiz-1',
        battleId: 'bat-weekend-sprint',
        title: 'Algorithmic Invariants & Complexity Theory',
        description: 'Test your squad theory speed: 3 rapid conceptual questions on recursion trees, DAG topological sort, and hash invariants.',
        type: 'quiz',
        points: 40,
        problemRef: 'quiz-algo-theory',
        isCompleted: false,
        status: 'not_started',
        quizQuestions: [
          {
            id: 'bq-1',
            quizId: 'bat-weekend-sprint',
            questionType: 'single_mcq',
            questionText: 'What is the tightest upper bound of Dijkstra algorithm using a Fibonacci heap on a directed graph with V vertices and E edges?',
            options: ['O(V^2)', 'O(E + V log V)', 'O(E log V)', 'O(V * E)'],
            correctAnswers: [1],
            explanation: 'With a Fibonacci heap, decrease-key takes amortized O(1), giving overall O(E + V log V) runtime.',
            marks: 15,
            orderIndex: 0,
          },
          {
            id: 'bq-2',
            quizId: 'bat-weekend-sprint',
            questionType: 'multi_mcq',
            questionText: 'Which properties must hold for a problem to be solved via Dynamic Programming?',
            options: ['Optimal Substructure', 'Overlapping Subproblems', 'Greedy Choice Property', 'Disjoint Independent Partitions'],
            correctAnswers: [0, 1],
            explanation: 'Dynamic Programming requires both Optimal Substructure and Overlapping Subproblems.',
            marks: 15,
            orderIndex: 1,
          },
          {
            id: 'bq-3',
            quizId: 'bat-weekend-sprint',
            questionType: 'short_numeric',
            questionText: 'Given an array of length 32, how many key comparisons in the worst case does standard Binary Search perform?',
            options: [],
            correctAnswers: [],
            numericAnswer: 6,
            tolerance: 0,
            explanation: 'Worst case comparisons for binary search is floor(log2(N)) + 1 = 5 + 1 = 6.',
            marks: 10,
            orderIndex: 2,
          },
        ],
      },
      {
        id: 'ch-battle-code-1',
        battleId: 'bat-weekend-sprint',
        title: 'Two Sum AST Invariant Challenge',
        description: 'Implement linear-time hash-table lookup to locate target complement indices.',
        type: 'coding',
        points: 50,
        problemRef: 'prob-two-sum',
        isCompleted: true,
        status: 'scored',
        score: 50,
        codingProblem: codingProblems[0],
      },
      {
        id: 'ch-battle-code-2',
        battleId: 'bat-weekend-sprint',
        title: 'Valid Anagram Frequency Counting',
        description: 'Build O(n) runtime character frequency distribution array to verify anagram validity.',
        type: 'coding',
        points: 60,
        problemRef: 'prob-valid-anagram',
        isCompleted: false,
        status: 'not_started',
        codingProblem: codingProblems[1],
      },
    ],
  },
  {
    id: 'bat-data-relay',
    title: 'Data Structures Relay: Mid-Semester Sprint',
    description: 'Speed relay through pointers, binary trees, and heap structures. Open for team formation until Friday.',
    topic: 'CS201: Data Structures',
    status: 'registration',
    registrationDeadline: new Date(Date.now() + 3600000 * 36).toISOString(),
    startTime: new Date(Date.now() + 3600000 * 48).toISOString(),
    endTime: new Date(Date.now() + 3600000 * 52).toISOString(),
    maxTeamSize: 4,
    xpPool: 500,
    teams: [
      {
        id: 'team-binary',
        battleId: 'bat-data-relay',
        name: 'Binary Beasts',
        teamCode: 'BEAST8',
        totalScore: 0,
        members: [
          { userId: 'usr_kenji_02', name: 'Kenji Sato', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80', role: 'leader', joinedAt: 'Yesterday' },
        ],
      },
    ],
    challenges: [
      {
        id: 'ch-relay-1',
        battleId: 'bat-data-relay',
        title: 'Binary Search Edge Cases',
        description: 'Implement logarithmic division handling duplicate and boundary indices.',
        type: 'coding',
        points: 50,
        problemRef: 'prob-binary-search',
        codingProblem: codingProblems[2],
      },
      {
        id: 'ch-relay-quiz',
        battleId: 'bat-data-relay',
        title: 'Memory Pointer Theory',
        description: 'Theory checks on cache locality, contiguous memory layouts, and dereferencing overhead.',
        type: 'quiz',
        points: 40,
        problemRef: 'quiz-pointer-theory',
        quizQuestions: [
          {
            id: 'rq-1',
            quizId: 'bat-data-relay',
            questionType: 'single_mcq',
            questionText: 'What is the cache line size commonly used on modern 64-bit processors?',
            options: ['16 Bytes', '32 Bytes', '64 Bytes', '128 Bytes'],
            correctAnswers: [2],
            explanation: 'Modern x86 and ARM processors typically employ 64-byte L1 cache lines.',
            marks: 20,
            orderIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'bat-graph-cup',
    title: 'Graph Cup: Network Optimization Challenge',
    description: 'Upcoming inter-cohort competition covering topological sorting and shortest paths.',
    topic: 'CS204: Advanced Graphs',
    status: 'upcoming',
    registrationDeadline: new Date(Date.now() + 3600000 * 72).toISOString(),
    startTime: new Date(Date.now() + 3600000 * 96).toISOString(),
    endTime: new Date(Date.now() + 3600000 * 102).toISOString(),
    maxTeamSize: 4,
    xpPool: 750,
    teams: [],
    challenges: [
      {
        id: 'ch-graph-1',
        battleId: 'bat-graph-cup',
        title: 'Topological Sort Verification',
        description: 'Kahn algorithm vs DFS cycle detection in DAGs.',
        type: 'coding',
        points: 60,
        problemRef: 'prob-two-sum',
        codingProblem: codingProblems[0],
      },
    ],
  },
];

export const facultyMetrics: FacultyStats = {
  dailyActiveStudents: 824,
  quizCompletionRate: 78,
  avgStreakDays: 6.4,
  quietStudentsCount: 32,
  xpIntegrityScore: 98.7,
  flaggedCount: 2,
  struggleTopics: [
    {
      topic: 'Dynamic Programming (Memoization & Tabulation)',
      incorrectPercent: 72,
      course: 'CS204: Algorithms & Complexity',
      recommendedAction: 'Schedule supplementary visual breakdown & add 3 micro-practice exercises',
    },
    {
      topic: 'Binary Trees (Self-Balancing AVL Rotations)',
      incorrectPercent: 68,
      course: 'CS201: Data Structures',
      recommendedAction: 'Deploy interactive pointer rotation canvas simulator',
    },
    {
      topic: 'Recursion (Backtracking Call Trees)',
      incorrectPercent: 54,
      course: 'CS102: Advanced Programming',
      recommendedAction: 'Provide step-by-step visual call stack debugger',
    },
  ],
  integrityChecks: [
    {
      name: 'Quiz Rate Limits',
      status: 'pass',
      detail: 'Max 1 graded attempt per quiz with minimum 5-second per question threshold enforced',
    },
    {
      name: 'Duplicate Answer Detection',
      status: 'pass',
      detail: 'Syntactic fingerprinting shows 0.04% collision rate, well below the alert threshold',
    },
    {
      name: 'Suspicious XP Spikes',
      status: 'warning',
      detail: '2 students logged >450 XP in <15 minutes. Automatically flagged for faculty review.',
    },
    {
      name: 'Copy/Paste Detection',
      status: 'pass',
      detail: 'Code arena clipboard velocity monitor enabled. Zero external macro injections detected.',
    },
  ],
  flaggedIncidents: [
    {
      id: 'flag-881',
      userId: 'usr_marcus_05',
      studentName: 'Marcus Wright',
      studentId: 'Mains-24817',
      type: 'fast_quiz',
      severity: 'medium',
      details: 'Completed 5 complex algorithm questions in 8.2 seconds total (impossible reading velocity).',
      xpAssociated: 60,
      timestamp: 'Today at 09:12 AM',
      status: 'pending',
    },
    {
      id: 'flag-882',
      userId: 'usr_julian_06',
      studentName: 'Julian Vance',
      studentId: 'Mains-24818',
      type: 'plagiarism_ast',
      severity: 'high',
      details: 'AST token sequence matching public GitHub repository with 98% similarity.',
      xpAssociated: 75,
      timestamp: 'Yesterday at 11:45 PM',
      status: 'pending',
    },
  ],
  auditLogs: [
    {
      id: 'aud-1',
      action: 'flag_created',
      actorName: 'Automated Integrity Watchdog',
      targetStudentName: 'Marcus Wright',
      reason: 'Fast quiz rate violation (>4 questions in <10s)',
      timestamp: 'Today at 09:12 AM',
    },
  ],
};

export const mockFacultyAllowlist: FacultyAllowlistEntry[] = [
  { email: 'alan.vance@msot.edu', fullName: 'Prof. Alan Vance', department: 'Computer Science & Engineering', createdAt: '2026-08-01T00:00:00Z' },
  { email: 'sarah.connor@msot.edu', fullName: 'Dr. Sarah Connor', department: 'Artificial Intelligence & Data Science', createdAt: '2026-08-01T00:00:00Z' },
  { email: 'marcus.brody@msot.edu', fullName: 'Prof. Marcus Brody', department: 'Software Engineering', createdAt: '2026-08-01T00:00:00Z' },
  { email: 'faculty@questify.edu', fullName: 'Prof. Questify Faculty', department: 'Computer Science & Engineering', createdAt: '2026-08-01T00:00:00Z' },
  { email: 'faculty@pixelpath.edu', fullName: 'Prof. PixelPath Faculty', department: 'Computer Science & Engineering', createdAt: '2026-08-01T00:00:00Z' },
  { email: 'faculty.demo@msot.edu', fullName: 'Prof. Demo Faculty', department: 'Computer Science & Engineering', createdAt: '2026-08-01T00:00:00Z' },
];

export const mockCustomQuizzes: CustomQuiz[] = [
  {
    id: 'quiz-alg-daily-01',
    title: 'CS201: Daily Algorithm & Data Structure Sprint',
    description: 'High-yield problems testing balanced trees, graph traversal invariants, hashing collision protocols, and DAG architectures.',
    courseTag: 'CS-201',
    difficulty: 'Medium',
    targetBatches: ['2024-2028'],
    openAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    closeAt: new Date(Date.now() + 3600000 * 20).toISOString(),
    timezone: 'UTC',
    timeLimitMins: 15,
    perQuestionTimeLimitSecs: 90,
    questionsToServe: 5,
    shuffleQuestions: true,
    shuffleOptions: true,
    answerVisibility: 'immediately',
    questionXp: 15,
    completionBonusXp: 25,
    status: 'live',
    version: 1,
    createdBy: 'usr_alan_vance',
    createdByName: 'Prof. Alan Vance',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    attemptsCount: 4,
    questions: [
      {
        id: 'cq-1',
        quizId: 'quiz-alg-daily-01',
        questionType: 'single_mcq',
        questionText: 'What is the tightest worst-case time complexity of searching for an element in a balanced AVL tree with N nodes?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctAnswers: [1],
        explanation: 'AVL trees enforce a strict balance factor in {-1, 0, 1}. The height is strictly bounded by 1.44 log2(N), guaranteeing O(log N) lookup.',
        marks: 2,
        orderIndex: 0,
      },
      {
        id: 'cq-2',
        quizId: 'quiz-alg-daily-01',
        questionType: 'multi_mcq',
        questionText: 'Which of the following statements regarding Breadth-First Search (BFS) on an unweighted graph are TRUE? (Select all that apply)',
        options: [
          'It finds the shortest path in terms of edge count.',
          'It is typically implemented using a First-In, First-Out (FIFO) queue.',
          'It has a worst-case space complexity of O(1).',
          'It can be used to detect bipartite graphs via 2-coloring.'
        ],
        correctAnswers: [0, 1, 3],
        explanation: 'BFS explores layer by layer via a FIFO queue, finding shortest paths on unweighted graphs and detecting odd cycles for 2-coloring. Its queue can store O(V) nodes.',
        marks: 3,
        orderIndex: 1,
      },
      {
        id: 'cq-3',
        quizId: 'quiz-alg-daily-01',
        questionType: 'true_false',
        questionText: 'True or False: In a hash table using Separate Chaining, the worst-case search time degrades to O(N) if all keys hash to the same bucket.',
        options: ['True', 'False'],
        correctAnswers: [0],
        explanation: 'True. When all keys collide into the exact same bucket, the lookup becomes a linear traversal through a linked list of length N, resulting in O(N).',
        marks: 1,
        orderIndex: 2,
      },
      {
        id: 'cq-4',
        quizId: 'quiz-alg-daily-01',
        questionType: 'short_numeric',
        questionText: 'A connected acyclic graph (tree) contains exactly 16 vertices. How many edges does this tree possess?',
        options: [],
        correctAnswers: [],
        numericAnswer: 15,
        tolerance: 0,
        explanation: 'By fundamental graph theory, any connected tree with V vertices has exactly (V - 1) edges. 16 - 1 = 15.',
        marks: 2,
        orderIndex: 3,
      },
      {
        id: 'cq-5',
        quizId: 'quiz-alg-daily-01',
        questionType: 'single_mcq',
        questionText: 'In Git repository architecture, which data structure is internally used to model commits, directory trees, and cryptographic blobs?',
        options: ['B+ Tree Index', 'Merkle Directed Acyclic Graph (DAG)', 'Doubly Linked List', 'Skip List'],
        correctAnswers: [1],
        explanation: 'Git stores commits and filesystem snapshots as content-addressable objects organized in a Merkle Directed Acyclic Graph (DAG).',
        marks: 2,
        orderIndex: 4,
      },
    ],
  },
  {
    id: 'quiz-os-concurrency-02',
    title: 'CS302: Operating Systems — Mutexes & Deadlocks',
    description: 'Coffman conditions, semaphore primitives, reader-writer race condition resolution, and deadlock avoidance algorithms.',
    courseTag: 'CS-302',
    difficulty: 'Hard',
    targetBatches: ['2024-2028', '2023-2027'],
    openAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    closeAt: new Date(Date.now() + 3600000 * 48).toISOString(),
    timezone: 'UTC',
    timeLimitMins: 20,
    perQuestionTimeLimitSecs: 120,
    questionsToServe: 4,
    shuffleQuestions: true,
    shuffleOptions: true,
    answerVisibility: 'after_close',
    questionXp: 20,
    completionBonusXp: 30,
    status: 'scheduled',
    version: 1,
    createdBy: 'usr_alan_vance',
    createdByName: 'Prof. Alan Vance',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    attemptsCount: 0,
    questions: [
      {
        id: 'cq-os-1',
        quizId: 'quiz-os-concurrency-02',
        questionType: 'multi_mcq',
        questionText: 'Which of the following are the four necessary Coffman conditions for a deadlock to occur?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Starvation Priority'],
        correctAnswers: [0, 1, 2, 3],
        explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Starvation is a related concurrency issue but not a Coffman condition.',
        marks: 4,
        orderIndex: 0,
      },
      {
        id: 'cq-os-2',
        quizId: 'quiz-os-concurrency-02',
        questionType: 'true_false',
        questionText: 'True or False: Bankers Algorithm is used for Deadlock Detection rather than Deadlock Avoidance.',
        options: ['True', 'False'],
        correctAnswers: [1],
        explanation: 'False. Dijkstra’s Banker’s Algorithm is a Deadlock Avoidance algorithm that ensures the system stays in a safe state before granting resource allocations.',
        marks: 2,
        orderIndex: 1,
      },
    ],
  },
  {
    id: 'quiz-dp-graphs-live',
    title: 'CS204: Algorithms — Dynamic Programming & Graph Sprints',
    description: 'Master memoization tables, DAG topological ordering, and Dijkstra invariants in this live daily sprint.',
    courseTag: 'CS-204',
    difficulty: 'Medium',
    targetBatches: ['2024-2028', '2023-2027'],
    openAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    closeAt: new Date(Date.now() + 3600000 * 10).toISOString(),
    timezone: 'Asia/Kolkata',
    timeLimitMins: 15,
    perQuestionTimeLimitSecs: 90,
    questionsToServe: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    answerVisibility: 'immediately',
    questionXp: 15,
    completionBonusXp: 20,
    status: 'live',
    version: 1,
    createdBy: 'usr_alan_vance',
    createdByName: 'Prof. Alan Vance',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    attemptsCount: 12,
    questions: [
      {
        id: 'cq-live-1',
        quizId: 'quiz-dp-graphs-live',
        questionType: 'single_mcq',
        questionText: 'What is the runtime of finding the shortest path between all pairs of vertices using the Floyd-Warshall algorithm on a graph with V vertices?',
        options: ['O(V^2)', 'O(V^3)', 'O(V log V)', 'O(E + V log V)'],
        correctAnswers: [1],
        explanation: 'Floyd-Warshall uses three nested loops running V iterations each, yielding O(V^3) time complexity.',
        marks: 5,
        orderIndex: 0,
      },
      {
        id: 'cq-live-2',
        quizId: 'quiz-dp-graphs-live',
        questionType: 'multi_mcq',
        questionText: 'Which of the following problems can be solved in polynomial time? (Select all that apply)',
        options: [
          'Single-Source Shortest Path (Dijkstra)',
          'Minimum Spanning Tree (Kruskal)',
          'Traveling Salesperson Problem (Exact Optimal)',
          'Maximum Flow (Ford-Fulkerson with Edmonds-Karp)'
        ],
        correctAnswers: [0, 1, 3],
        explanation: 'Dijkstra, Kruskal, and Edmonds-Karp all execute in polynomial time. TSP is NP-Hard and has no known polynomial time solution.',
        marks: 5,
        orderIndex: 1,
      },
      {
        id: 'cq-live-3',
        quizId: 'quiz-dp-graphs-live',
        questionType: 'short_numeric',
        questionText: 'How many distinct simple directed trees (arborescences) can be formed with 3 labeled vertices rooted at vertex 1?',
        options: [],
        correctAnswers: [],
        numericAnswer: 3,
        tolerance: 0,
        explanation: 'For 3 labeled vertices with root 1, Cayleys formula gives 3^(3-2) = 3 directed trees.',
        marks: 5,
        orderIndex: 2,
      },
    ],
  },
  {
    id: 'quiz-db-indexing-03',
    title: 'CS204: Database Systems — B+ Trees & Query Plans',
    description: 'Storage engine internals, leaf node sibling pointers, clustering vs non-clustering indices, and EXPLAIN ANALYZE interpretation.',
    courseTag: 'CS-204',
    difficulty: 'Easy',
    targetBatches: ['2024-2028'],
    openAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    closeAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timezone: 'UTC',
    timeLimitMins: 10,
    shuffleQuestions: false,
    shuffleOptions: true,
    answerVisibility: 'immediately',
    questionXp: 10,
    completionBonusXp: 15,
    status: 'closed',
    version: 1,
    createdBy: 'usr_alan_vance',
    createdByName: 'Prof. Alan Vance',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    attemptsCount: 42,
    questions: [],
  },
];

export const mockCustomQuizAttempts: CustomQuizAttempt[] = [
  {
    id: 'att-01',
    quizId: 'quiz-alg-daily-01',
    userId: 'usr_alex_09',
    studentName: 'Alex Morgan',
    studentId: 'Mains-24813',
    score: 10,
    maxScore: 10,
    xpEarned: 100,
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3 + 12 * 60000).toISOString(),
    isEvaluated: true,
    attemptVersion: 1,
    answers: [
      { questionId: 'cq-1', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-2', selectedOptions: [0, 1, 3], isCorrect: true, marksAwarded: 3 },
      { questionId: 'cq-3', selectedOptions: [0], isCorrect: true, marksAwarded: 1 },
      { questionId: 'cq-4', numericAnswer: 15, isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-5', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
    ],
  },
  {
    id: 'att-02',
    quizId: 'quiz-alg-daily-01',
    userId: 'usr_kenji_02',
    studentName: 'Kenji Sato',
    studentId: 'Mains-24814',
    score: 8,
    maxScore: 10,
    xpEarned: 70,
    startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 4 + 11 * 60000).toISOString(),
    isEvaluated: true,
    attemptVersion: 1,
    answers: [
      { questionId: 'cq-1', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-2', selectedOptions: [0, 1], isCorrect: false, marksAwarded: 0 },
      { questionId: 'cq-3', selectedOptions: [0], isCorrect: true, marksAwarded: 1 },
      { questionId: 'cq-4', numericAnswer: 15, isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-5', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
    ],
  },
  {
    id: 'att-03',
    quizId: 'quiz-alg-daily-01',
    userId: 'usr_aanya_03',
    studentName: 'Aanya Sharma',
    studentId: 'Mains-24815',
    score: 10,
    maxScore: 10,
    xpEarned: 100,
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 5 + 10 * 60000).toISOString(),
    isEvaluated: true,
    attemptVersion: 1,
    answers: [
      { questionId: 'cq-1', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-2', selectedOptions: [0, 1, 3], isCorrect: true, marksAwarded: 3 },
      { questionId: 'cq-3', selectedOptions: [0], isCorrect: true, marksAwarded: 1 },
      { questionId: 'cq-4', numericAnswer: 15, isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-5', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
    ],
  },
  {
    id: 'att-04',
    quizId: 'quiz-alg-daily-01',
    userId: 'usr_marcus_05',
    studentName: 'Marcus Wright',
    studentId: 'Mains-24817',
    score: 7,
    maxScore: 10,
    xpEarned: 55,
    startedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 6 + 8 * 60000).toISOString(),
    isEvaluated: true,
    attemptVersion: 1,
    answers: [
      { questionId: 'cq-1', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
      { questionId: 'cq-2', selectedOptions: [0, 1, 3], isCorrect: true, marksAwarded: 3 },
      { questionId: 'cq-3', selectedOptions: [1], isCorrect: false, marksAwarded: 0 },
      { questionId: 'cq-4', numericAnswer: 16, isCorrect: false, marksAwarded: 0 },
      { questionId: 'cq-5', selectedOptions: [1], isCorrect: true, marksAwarded: 2 },
    ],
  },
  {
    id: 'att-05',
    quizId: 'quiz-db-indexing-03',
    userId: 'usr_alex_09',
    studentName: 'Alex Morgan',
    studentId: 'Mains-24813',
    score: 9,
    maxScore: 10,
    xpEarned: 85,
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 10 * 60000).toISOString(),
    isEvaluated: true,
    attemptVersion: 1,
    answers: [],
  },
];

export const mockQuizAnalytics: QuizAnalytics = {
  totalAttempts: 4,
  completionRate: 100,
  averageScore: 87.5,
  averageTimeSecs: 642,
  scoreDistribution: [
    { range: '0-20%', count: 0 },
    { range: '21-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 2 },
    { range: '81-100%', count: 2 },
  ],
  questionStats: [
    {
      questionId: 'cq-1',
      questionText: 'What is the tightest worst-case time complexity of searching for an element in a balanced AVL tree with N nodes?',
      accuracyPercent: 100,
      attemptCount: 4,
    },
    {
      questionId: 'cq-2',
      questionText: 'Which of the following statements regarding Breadth-First Search (BFS) on an unweighted graph are TRUE?',
      accuracyPercent: 75,
      attemptCount: 4,
      mostMissedChoice: 'Missed Bipartite 2-coloring detection option',
    },
    {
      questionId: 'cq-3',
      questionText: 'True or False: In a hash table using Separate Chaining, the worst-case search time degrades to O(N)...',
      accuracyPercent: 75,
      attemptCount: 4,
      mostMissedChoice: 'Selected "False"',
    },
    {
      questionId: 'cq-4',
      questionText: 'A connected acyclic graph (tree) contains exactly 16 vertices. How many edges does this tree possess?',
      accuracyPercent: 75,
      attemptCount: 4,
      mostMissedChoice: 'Answered 16 instead of 15 (forgot V - 1 rule)',
    },
    {
      questionId: 'cq-5',
      questionText: 'In Git repository architecture, which data structure is internally used to model commits...?',
      accuracyPercent: 100,
      attemptCount: 4,
    },
  ],
  studentAttempts: mockCustomQuizAttempts,
  integrityFlags: [
    {
      id: 'flag-881',
      userId: 'usr_marcus_05',
      studentName: 'Marcus Wright',
      studentId: 'Mains-24817',
      type: 'fast_quiz',
      severity: 'medium',
      details: 'Completed 5 complex algorithm questions in 8.2 seconds total (impossible reading velocity).',
      xpAssociated: 60,
      timestamp: 'Today at 09:12 AM',
      status: 'pending',
    },
  ],
};

export const initialDailyQuests: DailyQuest[] = [
  {
    id: 'dq-live-today',
    title: 'Optimal Path Monotonicity',
    statement: `In a directed acyclic graph (DAG) of university prerequisite dependencies, each milestone vertex has an assigned credit weight:
- V1: 3 credits, V2: 4 credits, V3: 2 credits, V4: 5 credits, V5: 4 credits, V6: 3 credits, V7: 2 credits, V8: 4 credits.

Forward prerequisites connect strictly in increasing index order:
(1->2), (1->3), (2->4), (3->4), (4->5), (4->6), (5->8), (6->8).

What is the total maximum credit load of any prerequisite path starting at V1 and terminating at V8?`,
    questType: 'answer_based',
    answerType: 'numeric',
    difficulty: 'Medium',
    topicTag: 'Dynamic Programming & Graphs',
    targetBatches: ['2024-2028'],
    liveDate: new Date().toISOString().split('T')[0],
    openAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    closeAt: new Date(Date.now() + 3600 * 1000 * 14).toISOString(),
    xpReward: 50,
    hints: [
      'Topological sorting allows linear relaxation from source to sink.',
      'Check the path (1 -> 2 -> 4 -> 5 -> 8) vs (1 -> 3 -> 4 -> 6 -> 8).'
    ],
    status: 'live',
    modelSolution: 'Optimal path is V1 (3) + V2 (4) + V4 (5) + V5 (4) + V8 (4) = 20 credits.',
    solutionExplanation: 'Using DAG longest-path dynamic programming: dp[v] = weight[v] + max(dp[u] for (u, v) in E). The maximal path evaluates to 3 + 4 + 5 + 4 + 4 = 20.',
    correctAnswer: '20',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    attemptsCount: 18,
  },
  {
    id: 'dq-coding-live',
    title: 'Subarray Maximum GCD',
    statement: `Given an integer array \`nums\`, return the maximum Greatest Common Divisor (GCD) of any contiguous subarray of length at least 2.

Write your solution in **C++17** using standard library headers. Your solution must run within 2.0 seconds and under 128 MB RAM.`,
    questType: 'coding',
    difficulty: 'Hard',
    topicTag: 'Number Theory & Arrays',
    targetBatches: ['2024-2028'],
    liveDate: new Date().toISOString().split('T')[0],
    openAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    closeAt: new Date(Date.now() + 3600 * 1000 * 18).toISOString(),
    xpReward: 75,
    hints: [
      'Any subarray of length 2 has GCD equal to std::gcd(nums[i], nums[i+1]).',
      'Expanding a subarray cannot increase its GCD because gcd(a, b, c) <= gcd(a, b).'
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxSubarrayGCD(vector<int>& nums) {
        int maxG = 1;
        for (size_t i = 0; i < nums.size(); ++i) {
            int cur = nums[i];
            for (size_t j = i + 1; j < nums.size(); ++j) {
                cur = std::gcd(cur, nums[j]);
                maxG = max(maxG, cur);
            }
        }
        return maxG;
    }
};

int main() {
    Solution sol;
    vector<int> nums = {12, 24, 6, 8};
    cout << sol.maxSubarrayGCD(nums) << endl;
    return 0;
}`,
      python: `import math

class Solution:
    def maxSubarrayGCD(self, nums: list[int]) -> int:
        max_g = 1
        for i in range(len(nums) - 1):
            max_g = max(max_g, math.gcd(nums[i], nums[i+1]))
        return max_g`,
    },
    testCases: [
      { id: 'dqt-1', input: 'nums = [12, 24, 6, 8]', expectedOutput: '12', isHidden: false, orderIndex: 1 },
      { id: 'dqt-2', input: 'nums = [10, 20, 30]', expectedOutput: '10', isHidden: false, orderIndex: 2 },
      { id: 'dqt-3', input: 'nums = [7, 14, 21, 28]', expectedOutput: '7', isHidden: true, orderIndex: 3 },
    ],
    status: 'live',
    modelSolution: 'Because adding elements to a range monotonically decreases or preserves the GCD, the maximum GCD of any subarray of length >= 2 must occur on an adjacent pair (nums[i], nums[i+1]). Hence O(N) adjacent scan suffices.',
    solutionExplanation: 'For any range [L, R] where R - L >= 1, gcd(nums[L..R]) divides gcd(nums[L], nums[L+1]). Therefore, max_{L < R} gcd(nums[L..R]) = max_{i} gcd(nums[i], nums[i+1]).',
    correctAnswer: '12',
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    attemptsCount: 9,
  },
  {
    id: 'dq-scheduled-tomorrow',
    title: 'Cache Alignment Invariant',
    statement: 'A CPU L1 data cache operates with 64-byte lines and 8-way set associativity across 32 KB capacity. How many sets does this cache contain?',
    questType: 'answer_based',
    answerType: 'numeric',
    difficulty: 'Easy',
    topicTag: 'Computer Architecture',
    targetBatches: ['2024-2028'],
    liveDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    openAt: new Date(Date.now() + 86400000).toISOString(),
    closeAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    xpReward: 35,
    hints: ['Total lines = Cache Size / Line Size', 'Number of Sets = Total Lines / Associativity'],
    status: 'scheduled',
    modelSolution: '32KB / 64B = 512 lines. 512 lines / 8 lines per set = 64 sets.',
    solutionExplanation: 'Sets = (32768) / (64 * 8) = 64 sets.',
    correctAnswer: '64',
    createdAt: new Date().toISOString(),
    attemptsCount: 0,
  },
  {
    id: 'dq-closed-yesterday',
    title: 'Bitwise Subsequence Parity',
    statement: 'Given an array of integers, count the number of non-empty subsequences where the bitwise XOR sum is an even number.',
    questType: 'answer_based',
    answerType: 'mcq',
    mcqOptions: [
      '2^(N-1) if at least one odd number exists; else 2^N - 1',
      'Always 2^(N-1) - 1',
      'N * (N + 1) / 2',
      '2^N / 2'
    ],
    difficulty: 'Medium',
    topicTag: 'Bit Manipulation & Combinatorics',
    targetBatches: ['2024-2028'],
    liveDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    openAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    closeAt: new Date(Date.now() - 86400000).toISOString(),
    xpReward: 40,
    hints: ['The parity of XOR sum is determined purely by the least significant bit (LSB).'],
    status: 'closed',
    modelSolution: 'Option 1: The LSB determines parity. If all numbers are even, all 2^N - 1 non-empty subsequences have even XOR. If at least one odd number exists, exactly half (2^(N-1)) have even XOR.',
    solutionExplanation: 'Standard linear algebra over GF(2): a single odd element acts as a free variable balancing odd and even parity equally.',
    correctAnswer: '2^(N-1) if at least one odd number exists; else 2^N - 1',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    attemptsCount: 42,
  },
];

export const initialDailyQuestAttempts: DailyQuestAttempt[] = [
  {
    id: 'dqa-alex-01',
    questId: 'dq-closed-yesterday',
    userId: 'usr_alex_09',
    studentName: 'Alex Morgan',
    studentId: 'Mains-24813',
    submissionText: '2^(N-1) if at least one odd number exists; else 2^N - 1',
    language: 'answer',
    isCorrect: true,
    score: 100,
    xpAwarded: 40,
    timeTakenSeconds: 38,
    revealedSolution: {
      questId: 'dq-closed-yesterday',
      modelSolution: 'Option 1: The LSB determines parity. If all numbers are even, all 2^N - 1 non-empty subsequences have even XOR.',
      explanation: 'Standard linear algebra over GF(2): a single odd element balances odd and even parity equally.',
      correctAnswer: '2^(N-1) if at least one odd number exists; else 2^N - 1',
    },
    submittedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
];

export const initialDailyQuestAnalytics: DailyQuestAnalytics = {
  questId: 'dq-live-today',
  totalAttempts: 18,
  solveRate: 77.8,
  averageTimeSeconds: 46,
  mostCommonWrongAnswers: [
    { answer: '18', count: 3 },
    { answer: '22', count: 1 },
  ],
  studentAttempts: [
    {
      id: 'dqa-s1',
      questId: 'dq-live-today',
      userId: 'usr_s1',
      studentName: 'Devon Lee',
      studentId: 'Mains-24814',
      submissionText: '20',
      isCorrect: true,
      score: 100,
      xpAwarded: 50,
      timeTakenSeconds: 41,
      submittedAt: 'Today at 10:14 AM',
    },
    {
      id: 'dqa-s2',
      questId: 'dq-live-today',
      userId: 'usr_s2',
      studentName: 'Priya Sharma',
      studentId: 'Mains-24815',
      submissionText: '20',
      isCorrect: true,
      score: 100,
      xpAwarded: 50,
      timeTakenSeconds: 52,
      submittedAt: 'Today at 11:05 AM',
    },
    {
      id: 'dqa-s3',
      questId: 'dq-live-today',
      userId: 'usr_s3',
      studentName: 'Marcus Wright',
      studentId: 'Mains-24817',
      submissionText: '18',
      isCorrect: false,
      score: 0,
      xpAwarded: 0,
      timeTakenSeconds: 12,
      submittedAt: 'Today at 11:22 AM',
    },
  ],
  similarityFlags: [],
};

// ====================================================================
// MOCK DATA: OFFICIAL MSOT POINTS ECONOMY & AUDIT LEDGER
// ====================================================================

export const mockXpTransactions: XpTransaction[] = [
  {
    id: 'tx-001',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'attendance',
    referenceId: 'sess-cs204-14',
    amount: 10,
    description: 'Class Attendance: CS204 Algorithms (Session #14)',
    source: 'faculty_import',
    metadata: { courseCode: 'CS204', sessionDate: '2026-10-12', faculty: 'Dr. Jane Chen' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'tx-002',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'daily_quiz',
    referenceId: 'quiz-db-indexing-03',
    amount: 35, // 15 base + 4 * 5 correct
    description: 'Daily Quiz Completed: B-Tree Indexing (4/5 Correct)',
    source: 'daily_quiz_server',
    metadata: { score: 4, total: 5, accuracy: 80 },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'tx-003',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'coding_medium',
    referenceId: 'prob-two-sum',
    amount: 20,
    description: 'Solved Medium Problem: Two Sum Invariant (All Hidden Tests Passed)',
    source: 'coding_sandbox',
    metadata: { runtimeMs: 38, memoryMb: 14.2, language: 'cpp' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
  {
    id: 'tx-004',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'peer_help',
    referenceId: 'peer-resp-binary-tree-01',
    amount: 15,
    description: 'Help a Peer: Asker Devon Lee accepted binary tree balancing solution',
    source: 'peer_acceptance',
    metadata: { requesterId: 'usr_devon_02', topic: 'AVL Tree Rotation' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: 'tx-005',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'biweekly_test',
    referenceId: 'test-dsa-midterm-01',
    amount: 42, // floor(84 / 2) = 42
    description: 'Bi-Weekly Test Marks: DSA Midterm Evaluation (84% score)',
    source: 'test_result',
    metadata: { testName: 'DSA Midterm Evaluation', scorePercent: 84, faculty: 'Prof. K. Verma' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    id: 'tx-006',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'assignment',
    referenceId: 'asg-lab-bst-04',
    amount: 20,
    description: 'On-Time Submission: Lab 4 Binary Search Tree Implementation',
    source: 'assignment_submission',
    metadata: { assignmentId: 'asg-lab-bst-04', submittedAt: '2026-10-10T14:22:00Z', dueAt: '2026-10-10T23:59:00Z' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 56).toISOString(),
  },
  {
    id: 'tx-007',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'club_activity',
    referenceId: 'club-acm-cp-day1',
    amount: 25,
    description: 'Club Activity: ACM Competitive Programming Workshop Attendance',
    source: 'club_attendance',
    metadata: { clubName: 'ACM Student Chapter', coordinator: 'Sarah Jenkins' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  },
  {
    id: 'tx-008',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'streak_7day',
    referenceId: 'streak-cycle-01',
    amount: 50,
    description: '7-Day Consistent Learning Streak Bonus Shield',
    source: 'streak_engine',
    metadata: { qualifyingDays: 7, streakStartDate: '2026-10-04' },
    isVoided: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
  },
  {
    id: 'tx-009',
    userId: 'usr_alex_09',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    actionType: 'attendance',
    referenceId: 'sess-cs201-09-dup',
    amount: 10,
    description: 'Class Attendance: CS201 Computer Architecture (Voided)',
    source: 'faculty_import',
    metadata: { courseCode: 'CS201' },
    isVoided: true,
    voidReason: 'Duplicate attendance marker from erroneous session entry.',
    voidedBy: 'Dr. Jane Chen',
    voidedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
  },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-rec-1',
    classSessionId: 'sess-cs204-14',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    courseCode: 'CS204',
    sessionDate: '2026-10-12',
    status: 'present',
    source: 'faculty_import',
    importedBy: 'Dr. Jane Chen',
    createdAt: '2026-10-12T09:05:00Z',
  },
  {
    id: 'att-rec-2',
    classSessionId: 'sess-cs204-14',
    studentId: 'Mains-24814',
    studentName: 'Devon Lee',
    courseCode: 'CS204',
    sessionDate: '2026-10-12',
    status: 'present',
    source: 'faculty_import',
    importedBy: 'Dr. Jane Chen',
    createdAt: '2026-10-12T09:05:00Z',
  },
  {
    id: 'att-rec-3',
    classSessionId: 'sess-cs204-14',
    studentId: 'Mains-24815',
    studentName: 'Priya Sharma',
    courseCode: 'CS204',
    sessionDate: '2026-10-12',
    status: 'present',
    source: 'faculty_import',
    importedBy: 'Dr. Jane Chen',
    createdAt: '2026-10-12T09:05:00Z',
  },
  {
    id: 'att-rec-4',
    classSessionId: 'sess-cs204-14',
    studentId: 'Mains-24816',
    studentName: 'Jordan Taylor',
    courseCode: 'CS204',
    sessionDate: '2026-10-12',
    status: 'absent',
    source: 'faculty_import',
    importedBy: 'Dr. Jane Chen',
    createdAt: '2026-10-12T09:05:00Z',
  },
  {
    id: 'att-rec-5',
    classSessionId: 'sess-cs201-11',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    courseCode: 'CS201',
    sessionDate: '2026-10-11',
    status: 'present',
    source: 'faculty_import',
    importedBy: 'Prof. K. Verma',
    createdAt: '2026-10-11T11:00:00Z',
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: 'asg-lab-bst-04',
    title: 'Lab 4: Binary Search Trees & Self-Balancing Invariants',
    courseCode: 'CS204',
    dueAt: '2026-10-15T23:59:00Z',
    targetBatches: ['2024-2028', '2023-2027'],
    createdBy: 'usr_faculty_01',
    createdAt: '2026-10-08T09:00:00Z',
  },
  {
    id: 'asg-hw-dp-03',
    title: 'Homework 3: Dynamic Programming Matrix Chain Multiplication',
    courseCode: 'CS204',
    dueAt: '2026-10-18T23:59:00Z',
    targetBatches: ['2024-2028'],
    createdBy: 'usr_faculty_01',
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'asg-lab-graph-05',
    title: 'Lab 5: Dijkstra & Bellman-Ford Shortest Path Benchmarks',
    courseCode: 'CS204',
    dueAt: '2026-10-22T23:59:00Z',
    targetBatches: ['2024-2028'],
    createdBy: 'usr_faculty_01',
    createdAt: '2026-10-12T08:00:00Z',
  },
];

export const mockAssignmentSubmissions: AssignmentSubmission[] = [
  {
    id: 'sub-01',
    assignmentId: 'asg-lab-bst-04',
    assignmentTitle: 'Lab 4: Binary Search Trees & Self-Balancing Invariants',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    submittedAt: '2026-10-10T14:22:00Z',
    isOnTime: true,
    verifiedBy: 'Dr. Jane Chen',
    status: 'verified',
    createdAt: '2026-10-10T14:22:00Z',
  },
  {
    id: 'sub-02',
    assignmentId: 'asg-lab-bst-04',
    assignmentTitle: 'Lab 4: Binary Search Trees & Self-Balancing Invariants',
    studentId: 'Mains-24814',
    studentName: 'Devon Lee',
    submittedAt: '2026-10-11T18:05:00Z',
    isOnTime: true,
    verifiedBy: 'Dr. Jane Chen',
    status: 'verified',
    createdAt: '2026-10-11T18:05:00Z',
  },
];

export const mockTestResults: TestResult[] = [
  {
    id: 'tr-01',
    testId: 'test-dsa-midterm-01',
    testName: 'Bi-Weekly DSA Midterm Evaluation #1',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    scorePercent: 84,
    xpAwarded: 42, // floor(84 / 2) = 42
    enteredBy: 'Prof. K. Verma',
    enteredAt: '2026-10-09T16:30:00Z',
    createdAt: '2026-10-09T16:30:00Z',
  },
  {
    id: 'tr-02',
    testId: 'test-dsa-midterm-01',
    testName: 'Bi-Weekly DSA Midterm Evaluation #1',
    studentId: 'Mains-24814',
    studentName: 'Devon Lee',
    scorePercent: 96,
    xpAwarded: 48, // floor(96 / 2) = 48
    enteredBy: 'Prof. K. Verma',
    enteredAt: '2026-10-09T16:30:00Z',
    createdAt: '2026-10-09T16:30:00Z',
  },
  {
    id: 'tr-03',
    testId: 'test-dsa-midterm-01',
    testName: 'Bi-Weekly DSA Midterm Evaluation #1',
    studentId: 'Mains-24815',
    studentName: 'Priya Sharma',
    scorePercent: 100,
    xpAwarded: 50, // max 50
    enteredBy: 'Prof. K. Verma',
    enteredAt: '2026-10-09T16:30:00Z',
    createdAt: '2026-10-09T16:30:00Z',
  },
];

export const mockClubSessions: ClubSession[] = [
  {
    id: 'club-acm-cp-day1',
    clubName: 'ACM Student Chapter',
    sessionTitle: 'Competitive Programming: Graph Masterclass',
    sessionDate: '2026-10-09',
    coordinatorId: 'usr_coord_01',
    coordinatorName: 'Sarah Jenkins',
    createdAt: '2026-10-08T12:00:00Z',
  },
  {
    id: 'club-ieee-ai-day2',
    clubName: 'IEEE Student Branch',
    sessionTitle: 'Computer Vision & Deep Learning Seminar',
    sessionDate: '2026-10-11',
    coordinatorId: 'usr_coord_02',
    coordinatorName: 'Rohan Mehta',
    createdAt: '2026-10-10T12:00:00Z',
  },
];

export const mockClubAttendance: ClubAttendance[] = [
  {
    id: 'ca-01',
    clubSessionId: 'club-acm-cp-day1',
    studentId: 'Mains-24813',
    studentName: 'Alex Morgan',
    verifiedBy: 'Sarah Jenkins (Coordinator)',
    createdAt: '2026-10-09T18:00:00Z',
  },
  {
    id: 'ca-02',
    clubSessionId: 'club-acm-cp-day1',
    studentId: 'Mains-24814',
    studentName: 'Devon Lee',
    verifiedBy: 'Sarah Jenkins (Coordinator)',
    createdAt: '2026-10-09T18:00:00Z',
  },
];

export const mockLeaderboardPeriods: LeaderboardPeriod[] = [
  {
    id: 'period-w41-2026',
    periodType: 'weekly',
    startDate: '2026-10-05T00:00:00Z',
    endDate: '2026-10-11T23:59:59Z',
    isActive: false,
    archivedAt: '2026-10-12T00:00:01Z',
  },
  {
    id: 'period-w42-2026',
    periodType: 'weekly',
    startDate: '2026-10-12T00:00:00Z',
    endDate: '2026-10-18T23:59:59Z',
    isActive: true,
  },
];


