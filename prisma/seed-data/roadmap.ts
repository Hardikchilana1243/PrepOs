// ============================================================================
// PREPOS SEED DATA: ROADMAP, MODULES, TOPICS & LESSONS
// ============================================================================

export interface RoadmapDefinition {
  slug: string;
  title: string;
  description: string;
  durationDays: number;
  orderIndex: number;
}

export interface ModuleDefinition {
  slug: string;
  title: string;
  orderIndex: number;
  description?: string;
}

export interface TopicDefinition {
  moduleSlug: string;
  slug: string;
  title: string;
  orderIndex: number;
  description?: string;
}

export interface LessonDefinition {
  topicSlug: string;
  slug: string;
  title: string;
  content: string;
  durationMin: number;
  orderIndex: number;
}

export const ROADMAP_DATA: RoadmapDefinition = {
  slug: 'dsa-placement-roadmap',
  title: 'DSA Placement Roadmap',
  description: 'A structured roadmap covering the most important data structures and algorithms for software engineering placement preparation.',
  durationDays: 90,
  orderIndex: 1,
};

export const MODULES_DATA: ModuleDefinition[] = [
  { slug: 'programming-foundations', title: '1. Programming Foundations', orderIndex: 1, description: 'Asymptotic notation, recursion, memory layout, and problem decomposition.' },
  { slug: 'arrays-strings', title: '2. Arrays & Strings', orderIndex: 2, description: 'Contiguous data structures, boundary checks, and memory contiguous iteration.' },
  { slug: 'searching-sorting', title: '3. Searching & Sorting', orderIndex: 3, description: 'Binary search boundaries and comparison-based sorting algorithms.' },
  { slug: 'hashing', title: '4. Hashing', orderIndex: 4, description: 'Hash maps, frequency tables, sets, and collision handling.' },
  { slug: 'two-pointers-sliding-window', title: '5. Two Pointers & Sliding Window', orderIndex: 5, description: 'Window contraction, monotonic conditions, and converging index pointers.' },
  { slug: 'linked-lists', title: '6. Linked Lists', orderIndex: 6, description: 'Node references, pointer reversal, and cycle detection.' },
  { slug: 'stack-queue', title: '7. Stack & Queue', orderIndex: 7, description: 'LIFO & FIFO mechanics, monotonic stacks, and circular buffers.' },
  { slug: 'trees-bst', title: '8. Trees & BST', orderIndex: 8, description: 'Hierarchical structures, tree traversals, and binary search tree properties.' },
  { slug: 'heaps', title: '9. Heaps', orderIndex: 9, description: 'Priority queues, min/max heap invariants, and top-K element patterns.' },
  { slug: 'graphs', title: '10. Graphs', orderIndex: 10, description: 'Graph representations, breadth-first, depth-first search, and DAG scheduling.' },
  { slug: 'greedy-algorithms', title: '11. Greedy Algorithms', orderIndex: 11, description: 'Local optimal choices, interval scheduling, and exchange arguments.' },
  { slug: 'backtracking', title: '12. Backtracking', orderIndex: 12, description: 'State space search, pruning, permutation, and subset generation.' },
  { slug: 'dynamic-programming', title: '13. Dynamic Programming', orderIndex: 13, description: 'Overlapping subproblems, optimal substructure, memoization, and tabulation.' },
  { slug: 'bit-manipulation', title: '14. Bit Manipulation', orderIndex: 14, description: 'Bitwise operations, bit masks, and power-of-two arithmetic.' },
];

export const TOPICS_DATA: TopicDefinition[] = [
  // Programming Foundations
  { moduleSlug: 'programming-foundations', slug: 'complexity-analysis', title: 'Time & Space Complexity', orderIndex: 1, description: 'Big-O, Big-Theta, Big-Omega, amortized complexity, and stack frames.' },
  { moduleSlug: 'programming-foundations', slug: 'recursion-basics', title: 'Recursion Fundamentals', orderIndex: 2, description: 'Base conditions, call stack memory, recurrence relations, and leap of faith.' },

  // Arrays & Strings
  { moduleSlug: 'arrays-strings', slug: 'array-traversal', title: 'Array Traversal & In-Place Ops', orderIndex: 1, description: 'Single-pass scanning, boundary guards, and in-place array mutation.' },
  { moduleSlug: 'arrays-strings', slug: 'prefix-sum', title: 'Prefix Sum & Subarrays', orderIndex: 2, description: 'O(1) range queries, running sum techniques, and subarray sums.' },
  { moduleSlug: 'arrays-strings', slug: 'kadanes-algorithm', title: "Kadane's Algorithm & Maximum Subarray", orderIndex: 3, description: 'Dynamic running max subarray logic in linear time.' },

  // Searching & Sorting
  { moduleSlug: 'searching-sorting', slug: 'sorting-algorithms', title: 'Sorting Fundamentals', orderIndex: 1, description: 'Merge Sort, Quick Sort, and stability guarantees.' },
  { moduleSlug: 'searching-sorting', slug: 'binary-search', title: 'Binary Search Mechanics', orderIndex: 2, description: 'Predicate matching, mid calculation overflow guards, and search bounds.' },
  { moduleSlug: 'searching-sorting', slug: 'binary-search-on-answer', title: 'Binary Search on Answer Space', orderIndex: 3, description: 'Monotonic feasibility checking across monotonic output ranges.' },

  // Hashing
  { moduleSlug: 'hashing', slug: 'hash-map-patterns', title: 'Hash Map & Frequency Tracking', orderIndex: 1, description: 'Constant time lookups, counting frequencies, and index memorization.' },

  // Two Pointers & Sliding Window
  { moduleSlug: 'two-pointers-sliding-window', slug: 'two-pointers', title: 'Two Pointers Technique', orderIndex: 1, description: 'Opposing and same-direction pointer navigation.' },
  { moduleSlug: 'two-pointers-sliding-window', slug: 'sliding-window', title: 'Sliding Window Technique', orderIndex: 2, description: 'Dynamic and fixed-size sliding window maintenance.' },

  // Linked Lists
  { moduleSlug: 'linked-lists', slug: 'linked-list-traversal', title: 'Singly Linked List Traversal & Mutation', orderIndex: 1, description: 'Pointer traversal, null checks, and node unlinking.' },
  { moduleSlug: 'linked-lists', slug: 'fast-slow-pointers', title: 'Fast & Slow Pointers (Floyd Cycle)', orderIndex: 2, description: 'Hare and tortoise pointer velocities for cycle and midpoint finding.' },

  // Stack & Queue
  { moduleSlug: 'stack-queue', slug: 'stack-fundamentals', title: 'Stack & Monotonic Stack', orderIndex: 1, description: 'Next greater element, valid parentheses, and monotonic structures.' },
  { moduleSlug: 'stack-queue', slug: 'queue-buffers', title: 'Queue & Circular Buffers', orderIndex: 2, description: 'Ring buffers, double-ended queues, and sliding max queries.' },

  // Trees & BST
  { moduleSlug: 'trees-bst', slug: 'binary-tree-dfs', title: 'Binary Tree DFS Traversals', orderIndex: 1, description: 'Pre-order, In-order, and Post-order recursive and iterative traversals.' },
  { moduleSlug: 'trees-bst', slug: 'binary-tree-bfs', title: 'Binary Tree BFS Level Order', orderIndex: 2, description: 'Queue-based level-by-level exploration and horizontal distance.' },
  { moduleSlug: 'trees-bst', slug: 'bst-validation', title: 'Binary Search Tree Validation', orderIndex: 3, description: 'BST invariant properties, range propagation, and in-order monotonicity.' },

  // Heaps
  { moduleSlug: 'heaps', slug: 'priority-queue-patterns', title: 'Priority Queue & Max Heap', orderIndex: 1, description: 'Heapify, top-K frequent elements, and median of stream.' },

  // Graphs
  { moduleSlug: 'graphs', slug: 'graph-bfs', title: 'Graph BFS & Shortest Paths', orderIndex: 1, description: 'Unweighted shortest path, connected components, and grid mazes.' },
  { moduleSlug: 'graphs', slug: 'graph-dfs', title: 'Graph DFS & Cycle Detection', orderIndex: 2, description: 'Connected components, 3-color cycle detection, and flood fill.' },
  { moduleSlug: 'graphs', slug: 'topological-sort', title: 'Topological Sort & DAGs', orderIndex: 3, description: "Kahn's in-degree algorithm and DFS post-order stack ordering." },

  // Greedy Algorithms
  { moduleSlug: 'greedy-algorithms', slug: 'greedy-basics', title: 'Greedy Interval Selection', orderIndex: 1, description: 'Activity selection, greedy interval scheduling, and sorting proofs.' },

  // Backtracking
  { moduleSlug: 'backtracking', slug: 'subset-generation', title: 'Backtracking & State Exploration', orderIndex: 1, description: 'Decision tree expansion, state restoration, and pruning.' },

  // Dynamic Programming
  { moduleSlug: 'dynamic-programming', slug: 'dp-foundations', title: 'Memoization vs Tabulation', orderIndex: 1, description: 'Top-down caching vs bottom-up iterative table filling.' },
  { moduleSlug: 'dynamic-programming', slug: 'dp-1d', title: '1D Dynamic Programming', orderIndex: 2, description: 'Linear recurrences, transition functions, and state reduction.' },
  { moduleSlug: 'dynamic-programming', slug: 'dp-2d', title: '2D Dynamic Programming & Grids', orderIndex: 3, description: 'Grid path counting, knapsack variants, and matrix transitions.' },

  // Bit Manipulation
  { moduleSlug: 'bit-manipulation', slug: 'bit-operations', title: 'Bitwise Fundamentals', orderIndex: 1, description: 'XOR tricks, two complement, bit masks, and power of two checks.' },
];

export const LESSONS_DATA: LessonDefinition[] = [
  // 1. Time Complexity
  {
    topicSlug: 'complexity-analysis',
    slug: 'time-complexity-guide',
    title: 'Time Complexity & Big-O Notation',
    durationMin: 20,
    orderIndex: 1,
    content: `# Time Complexity & Big-O Analysis

In technical placement interviews, correctness is only half the battle. Your solution must satisfy explicit time and space complexity boundaries.

## 1. Asymptotic Notations
- **Big-O (O):** Represents the worst-case upper bound. Tells interviewers how execution time scales as input size $N$ approaches infinity.
- **Big-Omega (\\Omega):** Represents the best-case lower bound.
- **Big-Theta (\\Theta):** Represents a tight bound where upper and lower bounds coincide.

## 2. Common Placement Complexity Classes
1. **$O(1)$ Constant Time:** Direct array indexing, hash map lookups on average.
2. **$O(\\log N)$ Logarithmic Time:** Binary search, tree height traversal in balanced BST.
3. **$O(N)$ Linear Time:** Single-pass array traversals, counting frequencies.
4. **$O(N \\log N)$ Linearithmic Time:** Optimal comparison sorting (Merge Sort, Quick Sort, Heap Sort).
5. **$O(N^2)$ Quadratic Time:** Nested loops over input array (Brute force pairs).
6. **$O(2^N)$ Exponential Time:** Generating all subsets, naive recursive Fibonacci.
7. **$O(N!)$ Factorial Time:** Generating all permutations of an array.

## 3. Placement Golden Rule: Input Bounds to Allowed Complexity
- $N \\le 10$: $O(N!)$ or $O(2^N \\cdot N)$ backtracking is acceptable.
- $N \\le 10^3$: $O(N^2)$ algorithms will pass within 1.0 second.
- $N \\le 10^5$: You **must** design an $O(N \\log N)$ or $O(N)$ solution.
- $N \\ge 10^9$: Only $O(\\log N)$ or $O(1)$ mathematical formulas can execute in time.
`,
  },

  // 2. Space Complexity
  {
    topicSlug: 'complexity-analysis',
    slug: 'space-complexity-guide',
    title: 'Space Complexity & Auxiliary Memory',
    durationMin: 15,
    orderIndex: 2,
    content: `# Space Complexity & Memory Layout

Space complexity measures total memory required by the algorithm with respect to input size $N$.

## 1. Auxiliary Space vs. Total Space
- **Total Space:** Includes memory allocated for input structures plus auxiliary storage.
- **Auxiliary Space:** Extra temporary memory allocated by the algorithm exclusively during execution.
- *Placement Standard:* When interviewers ask for space complexity, they refer to **Auxiliary Space** unless stated otherwise.

## 2. Recursion Call Stack
Every recursive function call creates an activation record (stack frame) containing return addresses and local variables.
- A recursive tree of depth $H$ consumes $O(H)$ auxiliary space on the call stack.
- Unbalanced recursion reaching depth $N$ causes a **StackOverflowError**.

## 3. In-Place Modifications
An algorithm is strictly **in-place** if it operates directly on the input structure using $O(1)$ auxiliary memory (e.g., Two-pointer reversal, Dutch National Flag partition).
`,
  },

  // 3. Recursion Basics
  {
    topicSlug: 'recursion-basics',
    slug: 'recursion-fundamentals-guide',
    title: 'Recursion Basics & The Call Stack',
    durationMin: 20,
    orderIndex: 1,
    content: `# Recursion Basics: The Architectural Mental Model

Recursion solves problems by breaking them into smaller identical sub-problems until a trivial terminating condition is reached.

## The Three Pillars of Recursion
1. **Base Case:** The explicit guard condition that stops recursion without making further recursive calls. Omitting this triggers infinite recursion.
2. **Recursive Step (Inductive Hypothesis):** Trusting that the function correctly solves the sub-problem of size $N - 1$.
3. **Combination / Work:** Combining results from sub-problems with current work to return the final answer.

## Recurrence Relations
- Divide and Conquer: $T(N) = 2T(N/2) + O(N) \\implies O(N \\log N)$ (Merge Sort).
- Linear Decrement: $T(N) = T(N-1) + O(1) \\implies O(N)$ (Factorial, Linear Traversal).
`,
  },

  // 4. Array Traversal
  {
    topicSlug: 'array-traversal',
    slug: 'array-traversal-principles',
    title: 'Mastering Array Traversal & In-Place Iteration',
    durationMin: 15,
    orderIndex: 1,
    content: `# Array Traversal: Cache Locality & Boundary Mechanics

Arrays store elements in contiguous physical memory blocks, providing $O(1)$ random access through index calculations:
$$\\text{Address}(A[i]) = \\text{BaseAddress} + (i \\times \\text{ElementSize})$$

## Cache Line Optimization
Because modern CPUs read data in 64-byte cache lines, sequential row-major array traversals maximize cache hits. Random memory jumps across linked structures exhibit higher CPU cache miss rates.

## Critical Patterns
- **Single-Pass Lookups:** Maintain running state (max, min, frequency, index markers) in a single $O(N)$ pass.
- **Index-as-Hash-Key:** In arrays constrained between $1 \\dots N$, the array indices themselves can encode presence by inverting signs or adding offsets.
`,
  },

  // 5. Prefix Sum
  {
    topicSlug: 'prefix-sum',
    slug: 'prefix-sum-mastery',
    title: 'Prefix Sum & Subarray Range Queries',
    durationMin: 20,
    orderIndex: 1,
    content: `# Prefix Sum: Precomputing for Constant-Time Range Queries

Prefix Sum transforms repeated range summation from an $O(N)$ operation per query into an $O(1)$ lookup.

## Core Formula
$$\\text{prefix}[i] = \\sum_{k=0}^{i} \\text{nums}[k]$$
$$\\text{Sum}(\\text{left}, \\text{right}) = \\text{prefix}[\\text{right}] - \\text{prefix}[\\text{left} - 1]$$

## Key Placement Application: Subarray Sum Equals K
By pairing Prefix Sum with a Hash Map storing $(\\text{prefixSum} \\to \\text{count})$, we find subarrays summing to $K$ in $O(N)$ time instead of $O(N^2)$ brute-force.
`,
  },

  // 6. Kadane's Algorithm
  {
    topicSlug: 'kadanes-algorithm',
    slug: 'kadanes-algorithm-explained',
    title: "Kadane's Algorithm: Maximum Subarray Sum",
    durationMin: 20,
    orderIndex: 1,
    content: `# Kadane's Algorithm: Optimal Dynamic Subarray Sum

Given an integer array with positive and negative numbers, Kadane's algorithm discovers the contiguous subarray yielding the maximum total sum in linear $O(N)$ time and $O(1)$ auxiliary space.

## Mathematical Invariant
At each index $i$, the maximum subarray ending at $i$ is:
$$\\text{currentMax} = \\max(\\text{nums}[i], \\text{currentMax} + \\text{nums}[i])$$
$$\\text{globalMax} = \\max(\\text{globalMax}, \\text{currentMax})$$

## Intuition
If the accumulated running sum drops below zero, adding it to future elements will only diminish their potential. Hence, reset the running sum to current element $\\text{nums}[i]$.
`,
  },

  // 7. Binary Search Fundamentals
  {
    topicSlug: 'binary-search',
    slug: 'binary-search-fundamentals-guide',
    title: 'Binary Search Fundamentals & Boundary Guards',
    durationMin: 20,
    orderIndex: 1,
    content: `# Binary Search: Invariants and Mid Overflow Avoidance

Binary Search operates on a monotonic search space to eliminate half the candidates in each iteration, achieving $O(\\log N)$ time.

## 1. Integer Overflow Protection
Always calculate the midpoint as:
\`\`\`cpp
int mid = low + (high - low) / 2;
\`\`\`
Never use \`(low + high) / 2\` because \`low + high\` can exceed $2^{31} - 1$ in Java/C++, causing integer overflow.

## 2. Invariant Loop Boundaries
- **Closed Interval:** \`while (low <= high)\` $\\implies$ \`high = mid - 1\`, \`low = mid + 1\`.
- **Half-Open Interval:** \`while (low < high)\` $\\implies$ used for finding first/last occurrences (Lower/Upper Bound).
`,
  },

  // 8. Binary Search on Answer
  {
    topicSlug: 'binary-search-on-answer',
    slug: 'binary-search-on-answer-technique',
    title: 'Binary Search on Answer: The Monotonic Feasibility Pattern',
    durationMin: 25,
    orderIndex: 1,
    content: `# Binary Search on Answer Space

When a problem asks for the "minimum possible maximum" or "maximum capacity such that condition holds", direct greedy search fails, but monotonic search space enables Binary Search on Answer.

## The Predicate Function
Define a feasibility function:
$$\\text{isValid}(x) \\to \\{\\text{true}, \\text{false}\\}$$

If $\\text{isValid}(x)$ is monotonic (e.g. $[\\text{false}, \\dots, \\text{false}, \\text{true}, \\dots, \\text{true}]$), binary search can identify the transition threshold in $O(F(N) \\cdot \\log(\\text{Range}))$.
`,
  },

  // 9. Linked List Traversal
  {
    topicSlug: 'linked-list-traversal',
    slug: 'linked-list-traversal-operations',
    title: 'Linked List Traversal, Mutation & Memory Safety',
    durationMin: 15,
    orderIndex: 1,
    content: `# Linked List: Pointer Gymnastics & Dummy Head Nodes

A linked list consists of nodes distributed across non-contiguous heap memory, each holding data and a pointer reference to the subsequent node.

## Dummy Head Pointer Technique
When inserting, deleting, or merging lists, operations on the head node often require special conditional checks.
By prepending an auxiliary **Dummy Node** (\`ListNode dummy(0);\`), all nodes—including the true head—can be treated uniformly, eliminating null-pointer edge cases.
`,
  },

  // 10. Fast and Slow Pointers
  {
    topicSlug: 'fast-slow-pointers',
    slug: 'fast-and-slow-pointers-floyd',
    title: "Fast and Slow Pointers: Floyd's Cycle Detection",
    durationMin: 20,
    orderIndex: 1,
    content: `# Fast and Slow Pointers (Tortoise & Hare)

The two-pointer technique with distinct step velocities solves fundamental cycle and midpoint problems in $O(N)$ time and $O(1)$ space.

## 1. Finding Middle Node
- Slow advances 1 step (\`slow = slow.next\`).
- Fast advances 2 steps (\`fast = fast.next.next\`).
- When \`fast\` hits the end, \`slow\` sits precisely at the middle node.

## 2. Cycle Detection (Floyd's Algorithm)
If a cycle exists, the distance between Fast and Slow decreases by 1 in every iteration, guaranteeing they collide within the cycle loop.
`,
  },

  // 11. Tree DFS Traversals
  {
    topicSlug: 'binary-tree-dfs',
    slug: 'binary-tree-dfs-traversals-guide',
    title: 'Tree DFS: Pre-Order, In-Order, and Post-Order',
    durationMin: 20,
    orderIndex: 1,
    content: `# Binary Tree Depth-First Search (DFS)

Tree traversal visits every node in a hierarchical structure exactly once.

## The 3 Classical Orders
1. **Pre-Order (Root -> Left -> Right):** Used for creating deep copies, serialization.
2. **In-Order (Left -> Root -> Right):** In a Binary Search Tree (BST), In-Order produces strictly sorted ascending values.
3. **Post-Order (Left -> Right -> Root):** Used for bottom-up property calculations (Tree diameter, subtree height, post-order memory deallocation).
`,
  },

  // 12. Tree BFS Traversal
  {
    topicSlug: 'binary-tree-bfs',
    slug: 'binary-tree-bfs-level-order-guide',
    title: 'Tree BFS: Level-Order Queue Traversal',
    durationMin: 15,
    orderIndex: 1,
    content: `# Breadth-First Search (Level Order Traversal)

BFS visits nodes level by level horizontally before descending deeper into the tree.

## Implementation Pattern
1. Initialize a FIFO Queue containing the root node.
2. Loop while queue is non-empty:
   - Record \`levelSize = queue.size()\`.
   - Iterate \`levelSize\` times to consume current level elements completely while enqueueing their left and right children.
3. Time: $O(N)$, Space: $O(W)$ where $W$ is the maximum width of the tree.
`,
  },

  // 13. Graph BFS & DFS
  {
    topicSlug: 'graph-bfs',
    slug: 'graph-traversal-foundations',
    title: 'Graph BFS & DFS: Traversal, Visited Sets & Shortest Paths',
    durationMin: 25,
    orderIndex: 1,
    content: `# Graph Algorithms: Foundations of BFS & DFS

Graphs generalize trees by permitting cycles and arbitrary edge connectivity between vertices.

## Adjacency List Representation
\`\`\`cpp
vector<vector<int>> adj(V);
adj[u].push_back(v);
\`\`\`

## BFS for Unweighted Shortest Path
Because BFS explores outwards by incrementing distance level-by-level, the first time target vertex $T$ is dequeued from queue, the path taken is mathematically guaranteed to be the shortest path.

## DFS for Cycle Detection
Maintain 3 visited states in directed graphs:
- \`0\` (Unvisited)
- \`1\` (Visiting - currently on recursion stack)
- \`2\` (Visited - fully explored)
Encountering a node in state \`1\` signifies a directed back-edge cycle.
`,
  },

  // 14. Dynamic Programming Foundations
  {
    topicSlug: 'dp-foundations',
    slug: 'dp-memoization-tabulation-guide',
    title: 'Dynamic Programming: Memoization vs. Tabulation',
    durationMin: 25,
    orderIndex: 1,
    content: `# Dynamic Programming: Overlapping Subproblems & Optimal Substructure

Dynamic Programming is an algorithmic paradigm that solves complex optimization problems by storing solutions to overlapping sub-problems.

## 1. Top-Down Memoization
- Start from the target goal state $N$.
- Recursively breakdown into smaller sub-problems.
- Cache computed return values in a table or hash map (\`memo[i]\`).
- Avoids recomputing identical subtrees, dropping complexity from $O(2^N)$ to $O(N)$.

## 2. Bottom-Up Tabulation
- Identify base cases directly ($DP[0], DP[1]$).
- Iteratively fill an array table according to state transitions ($DP[i] = DP[i-1] + DP[i-2]$).
- Eliminates recursive call stack overhead.
- Frequently enables **Space Optimization** by retaining only the previous $K$ states.
`,
  },
];
