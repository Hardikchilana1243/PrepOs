// ============================================================================
// PREPOS SEED DATA: 10 PLACEMENT COMPANIES & RELEVANT PATTERNS
// ============================================================================

export interface CompanyDefinition {
  slug: string;
  name: string;
  logoUrl?: string;
  description: string;
  websiteUrl?: string;
  patterns: {
    patternName: string;
    frequencyPct: number;
    veracity: 'OFFICIAL' | 'VERIFIED' | 'COMMUNITY_REPORTED' | 'ESTIMATED';
  }[];
  associatedProblemSlugs: string[];
}

export const COMPANIES_DATA: CompanyDefinition[] = [
  {
    slug: 'amazon',
    name: 'Amazon',
    logoUrl: '/logos/amazon.svg',
    description: 'Amazon SDE-1 campus placement tracks emphasizing scalable data structures, tree/graph navigation, and object-oriented leadership principles.',
    websiteUrl: 'https://amazon.jobs',
    patterns: [
      { patternName: 'Arrays & Two Pointers', frequencyPct: 32, veracity: 'VERIFIED' },
      { patternName: 'Trees & BST Invariants', frequencyPct: 28, veracity: 'VERIFIED' },
      { patternName: 'Dynamic Programming & Optimization', frequencyPct: 22, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Object-Oriented Design & Scalability', frequencyPct: 18, veracity: 'VERIFIED' },
    ],
    associatedProblemSlugs: [
      'array-element-frequency-counter',
      'tree-diameter-calculator',
      'validate-bst-order',
      'island-region-counter',
      'climbing-stairs-minimum-cost',
    ],
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    logoUrl: '/logos/microsoft.svg',
    description: 'Microsoft campus evaluation prioritizing clean modular code, string manipulations, linked chains, and algorithmic correctness.',
    websiteUrl: 'https://careers.microsoft.com',
    patterns: [
      { patternName: 'Arrays & Strings Manipulation', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Linked Lists & Pointers', frequencyPct: 24, veracity: 'VERIFIED' },
      { patternName: 'Binary Trees & DFS', frequencyPct: 26, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Graph Traversals & BFS', frequencyPct: 20, veracity: 'ESTIMATED' },
    ],
    associatedProblemSlugs: [
      'two-sum-target-search',
      'reverse-singly-chain',
      'first-unique-character-stream',
      'cycle-detection-in-graph',
    ],
  },
  {
    slug: 'google',
    name: 'Google',
    logoUrl: '/logos/google.svg',
    description: 'Google university hiring assessments testing mathematical problem formulation, graph traversal, and dynamic programming.',
    websiteUrl: 'https://careers.google.com',
    patterns: [
      { patternName: 'Graph Algorithms & Shortest Path', frequencyPct: 35, veracity: 'VERIFIED' },
      { patternName: 'Dynamic Programming & Combinatorics', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Priority Queues & Heaps', frequencyPct: 20, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Binary Search On Answer', frequencyPct: 15, veracity: 'COMMUNITY_REPORTED' },
    ],
    associatedProblemSlugs: [
      'task-scheduling-dependency',
      'kth-largest-stream-element',
      'grid-unique-paths-collector',
      'search-in-rotated-range',
    ],
  },
  {
    slug: 'tcs',
    name: 'TCS',
    logoUrl: '/logos/tcs.svg',
    description: 'Tata Consultancy Services National Qualifier Test (NQT) focusing on foundational programming, numeric manipulation, and database queries.',
    websiteUrl: 'https://www.tcs.com/careers',
    patterns: [
      { patternName: 'Programming Fundamentals & Loops', frequencyPct: 35, veracity: 'OFFICIAL' },
      { patternName: 'Array Filtering & Strings', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Relational Database Queries & SQL', frequencyPct: 20, veracity: 'VERIFIED' },
      { patternName: 'Searching & Basic Sorting', frequencyPct: 15, veracity: 'OFFICIAL' },
    ],
    associatedProblemSlugs: [
      'array-element-frequency-counter',
      'merge-sorted-subarrays',
      'max-subarray-sum-range',
    ],
  },
  {
    slug: 'infosys',
    name: 'Infosys',
    logoUrl: '/logos/infosys.svg',
    description: 'Infosys Specialist Programmer (SP) and Digital Specialist Engineer (DSE) rounds targeting medium DSA and system fundamentals.',
    websiteUrl: 'https://www.infosys.com/careers',
    patterns: [
      { patternName: 'Greedy & Two Pointers', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Searching & Sorting Applications', frequencyPct: 25, veracity: 'VERIFIED' },
      { patternName: '1D Dynamic Programming', frequencyPct: 25, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Object-Oriented Programming (OOP)', frequencyPct: 20, veracity: 'VERIFIED' },
    ],
    associatedProblemSlugs: [
      'two-sum-target-search',
      'activity-selection-maximizer',
      'climbing-stairs-minimum-cost',
    ],
  },
  {
    slug: 'wipro',
    name: 'Wipro',
    logoUrl: '/logos/wipro.svg',
    description: 'Wipro Elite National Talent Hunt (NLTH) assessing analytical problem solving, array logic, and Core CS fundamentals.',
    websiteUrl: 'https://careers.wipro.com',
    patterns: [
      { patternName: 'Basic Array Traversals', frequencyPct: 35, veracity: 'OFFICIAL' },
      { patternName: 'String Search & Parsing', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'DBMS & OS Conceptual MCQs', frequencyPct: 20, veracity: 'VERIFIED' },
      { patternName: 'Sorting Mechanics', frequencyPct: 15, veracity: 'OFFICIAL' },
    ],
    associatedProblemSlugs: [
      'first-unique-character-stream',
      'merge-sorted-subarrays',
    ],
  },
  {
    slug: 'accenture',
    name: 'Accenture',
    logoUrl: '/logos/accenture.svg',
    description: 'Accenture Advanced ASE coding evaluations centered on clean pseudo-code interpretation, bit manipulation, and sequential arrays.',
    websiteUrl: 'https://www.accenture.com/careers',
    patterns: [
      { patternName: 'Array Sums & In-Place Operations', frequencyPct: 35, veracity: 'VERIFIED' },
      { patternName: 'Sliding Windows & Bit Manipulation', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Fundamentals of Computing & Networks', frequencyPct: 20, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Stack Fundamentals', frequencyPct: 15, veracity: 'COMMUNITY_REPORTED' },
    ],
    associatedProblemSlugs: [
      'max-subarray-sum-range',
      'max-consecutive-ones-window',
      'min-stack-evaluator',
    ],
  },
  {
    slug: 'deloitte',
    name: 'Deloitte',
    logoUrl: '/logos/deloitte.svg',
    description: 'Deloitte USI Analyst placement assessments covering structured problem-solving, SQL analysis, and algorithmic reasoning.',
    websiteUrl: 'https://www2.deloitte.com/careers',
    patterns: [
      { patternName: 'Data Filtering & Hashing', frequencyPct: 35, veracity: 'VERIFIED' },
      { patternName: 'Relational Database Queries', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Binary Search Formulations', frequencyPct: 20, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Linear Data Structures', frequencyPct: 15, veracity: 'COMMUNITY_REPORTED' },
    ],
    associatedProblemSlugs: [
      'array-element-frequency-counter',
      'search-in-rotated-range',
    ],
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    logoUrl: '/logos/flipkart.svg',
    description: 'Flipkart SDE-1 placement drives featuring competitive graph traversal, multi-dimensional dynamic programming, and system modeling.',
    websiteUrl: 'https://www.flipkartcareers.com',
    patterns: [
      { patternName: 'Graph BFS & Grid Mazes', frequencyPct: 32, veracity: 'VERIFIED' },
      { patternName: 'Dynamic Programming & State Transitions', frequencyPct: 28, veracity: 'VERIFIED' },
      { patternName: 'Heaps & Priority Streaming', frequencyPct: 22, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Stack & Monotonic Sequences', frequencyPct: 18, veracity: 'COMMUNITY_REPORTED' },
    ],
    associatedProblemSlugs: [
      'island-region-counter',
      'grid-unique-paths-collector',
      'kth-largest-stream-element',
      'min-stack-evaluator',
    ],
  },
  {
    slug: 'walmart',
    name: 'Walmart',
    logoUrl: '/logos/walmart.svg',
    description: 'Walmart Global Tech university drives focusing on robust algorithmic scalability, tree search, sliding windows, and greedy scheduling.',
    websiteUrl: 'https://careers.walmart.com',
    patterns: [
      { patternName: 'Sliding Window & Two Pointers', frequencyPct: 30, veracity: 'VERIFIED' },
      { patternName: 'Binary Search Trees & DFS', frequencyPct: 28, veracity: 'VERIFIED' },
      { patternName: 'Greedy Interval Optimization', frequencyPct: 24, veracity: 'COMMUNITY_REPORTED' },
      { patternName: 'Topological Ordering & Dependencies', frequencyPct: 18, veracity: 'COMMUNITY_REPORTED' },
    ],
    associatedProblemSlugs: [
      'max-consecutive-ones-window',
      'validate-bst-order',
      'activity-selection-maximizer',
      'task-scheduling-dependency',
    ],
  },
];
