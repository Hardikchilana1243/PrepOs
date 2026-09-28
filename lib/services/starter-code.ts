// ============================================================================
// PREPOS STARTER CODE SERVICE
// Provides canonical starting code templates for C++, Java, and Python
// ============================================================================

export type SupportedLanguage = 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT';

export interface ProblemStarterTemplates {
  cpp: string;
  java: string;
  python: string;
}

const STARTER_TEMPLATES: Record<string, ProblemStarterTemplates> = {
  'array-element-frequency-counter': {
    cpp: `#include <vector>
#include <unordered_map>
#include <iostream>

class Solution {
public:
    int countFrequentElements(const std::vector<int>& nums, int k) {
        // Write your solution here
        
    }
};`,
    java: `import java.util.*;

class Solution {
    public int countFrequentElements(int[] nums, int k) {
        // Write your solution here
        return 0;
    }
}`,
    python: `from collections import Counter

class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int:
        # Write your solution here
        pass`,
  },

  'max-subarray-sum-range': {
    cpp: `#include <vector>
#include <algorithm>

class Solution {
public:
    int maxSubarraySum(const std::vector<int>& nums) {
        // Write your solution here
        
    }
};`,
    java: `class Solution {
    public int maxSubarraySum(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class Solution:
    def max_subarray_sum(self, nums: list[int]) -> int:
        # Write your solution here
        pass`,
  },

  'two-sum-target-search': {
    cpp: `#include <vector>

class Solution {
public:
    std::vector<int> twoSumSorted(const std::vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
    java: `class Solution {
    public int[] twoSumSorted(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
    python: `class Solution:
    def two_sum_sorted(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
  },

  'max-consecutive-ones-window': {
    cpp: `#include <vector>
#include <algorithm>

class Solution {
public:
    int longestOnes(const std::vector<int>& nums, int k) {
        // Write your solution here
        return 0;
    }
};`,
    java: `class Solution {
    public int longestOnes(int[] nums, int k) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class Solution:
    def longest_ones(self, nums: list[int], k: int) -> int:
        # Write your solution here
        pass`,
  },

  'first-unique-character-stream': {
    cpp: `#include <string>
#include <vector>

class Solution {
public:
    int firstUniqChar(const std::string& s) {
        // Write your solution here
        return -1;
    }
};`,
    java: `class Solution {
    public int firstUniqChar(String s) {
        // Write your solution here
        return -1;
    }
}`,
    python: `class Solution:
    def first_uniq_char(self, s: str) -> int:
        # Write your solution here
        pass`,
  },

  'merge-sorted-subarrays': {
    cpp: `#include <vector>

class Solution {
public:
    void merge(std::vector<int>& nums1, int m, const std::vector<int>& nums2, int n) {
        // Write your solution here
        
    }
};`,
    java: `class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        // Write your solution here
        
    }
}`,
    python: `class Solution:
    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> None:
        # Write your solution here
        pass`,
  },

  'search-in-rotated-range': {
    cpp: `#include <vector>

class Solution {
public:
    int search(const std::vector<int>& nums, int target) {
        // Write your solution here
        return -1;
    }
};`,
    java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your solution here
        return -1;
    }
}`,
    python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your solution here
        pass`,
  },

  'reverse-singly-chain': {
    cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        return nullptr;
    }
};`,
    java: `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        return null;
    }
}`,
    python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverse_list(self, head: ListNode | None) -> ListNode | None:
        # Write your solution here
        pass`,
  },

  'min-stack-evaluator': {
    cpp: `#include <stack>

class MinStack {
public:
    MinStack() {
        // Initialize data structure here
    }
    
    void push(int val) {
        // Write your solution here
    }
    
    void pop() {
        // Write your solution here
    }
    
    int top() {
        // Write your solution here
        return 0;
    }
    
    int getMin() {
        // Write your solution here
        return 0;
    }
};`,
    java: `import java.util.Stack;

class MinStack {
    public MinStack() {
        // Initialize data structure here
    }
    
    public void push(int val) {
        // Write your solution here
    }
    
    public void pop() {
        // Write your solution here
    }
    
    public int top() {
        // Write your solution here
        return 0;
    }
    
    public int getMin() {
        // Write your solution here
        return 0;
    }
}`,
    python: `class MinStack:
    def __init__(self):
        # Initialize data structure here
        pass

    def push(self, val: int) -> None:
        # Write your solution here
        pass

    def pop(self) -> None:
        # Write your solution here
        pass

    def top(self) -> int:
        # Write your solution here
        pass

    def get_min(self) -> int:
        # Write your solution here
        pass`,
  },

  'circular-queue-buffer': {
    cpp: `#include <vector>

class CircularQueue {
public:
    CircularQueue(int k) {
        // Initialize data structure here
    }
    
    bool enQueue(int value) {
        // Write your solution here
        return false;
    }
    
    bool deQueue() {
        // Write your solution here
        return false;
    }
    
    int Front() {
        // Write your solution here
        return -1;
    }
    
    int Rear() {
        // Write your solution here
        return -1;
    }
    
    bool isEmpty() {
        // Write your solution here
        return true;
    }
    
    bool isFull() {
        // Write your solution here
        return false;
    }
};`,
    java: `class CircularQueue {
    public CircularQueue(int k) {
        // Initialize data structure here
    }
    
    public boolean enQueue(int value) {
        // Write your solution here
        return false;
    }
    
    public boolean deQueue() {
        // Write your solution here
        return false;
    }
    
    public int Front() {
        // Write your solution here
        return -1;
    }
    
    public int Rear() {
        // Write your solution here
        return -1;
    }
    
    public boolean isEmpty() {
        // Write your solution here
        return true;
    }
    
    public boolean isFull() {
        // Write your solution here
        return false;
    }
}`,
    python: `class CircularQueue:
    def __init__(self, k: int):
        # Initialize data structure here
        pass

    def en_queue(self, value: int) -> bool:
        # Write your solution here
        return False

    def de_queue(self) -> bool:
        # Write your solution here
        return False

    def front(self) -> int:
        # Write your solution here
        return -1

    def rear(self) -> int:
        # Write your solution here
        return -1

    def is_empty(self) -> bool:
        # Write your solution here
        return True

    def is_full(self) -> bool:
        # Write your solution here
        return False`,
  },

  'tree-diameter-calculator': {
    cpp: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        // Write your solution here
        return 0;
    }
};`,
    java: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    public int diameterOfBinaryTree(TreeNode root) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def diameter_of_binary_tree(self, root: TreeNode | None) -> int:
        # Write your solution here
        pass`,
  },

  'validate-bst-order': {
    cpp: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    bool isValidBST(TreeNode* root) {
        // Write your solution here
        return false;
    }
};`,
    java: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    public boolean isValidBST(TreeNode root) {
        // Write your solution here
        return false;
    }
}`,
    python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def is_valid_bst(self, root: TreeNode | None) -> bool:
        # Write your solution here
        pass`,
  },

  'kth-largest-stream-element': {
    cpp: `#include <vector>
#include <queue>

class KthLargest {
public:
    KthLargest(int k, std::vector<int>& nums) {
        // Initialize data structure here
    }
    
    int add(int val) {
        // Write your solution here
        return 0;
    }
};`,
    java: `import java.util.PriorityQueue;

class KthLargest {
    public KthLargest(int k, int[] nums) {
        // Initialize data structure here
    }
    
    public int add(int val) {
        // Write your solution here
        return 0;
    }
}`,
    python: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        # Initialize data structure here
        pass

    def add(self, val: int) -> int:
        # Write your solution here
        pass`,
  },

  'island-region-counter': {
    cpp: `#include <vector>

class Solution {
public:
    int numIslands(std::vector<std::vector<char>>& grid) {
        // Write your solution here
        return 0;
    }
};`,
    java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class Solution:
    def num_islands(self, grid: list[list[str]]) -> int:
        # Write your solution here
        pass`,
  },

  'cycle-detection-in-graph': {
    cpp: `#include <vector>

class Solution {
public:
    bool canFinish(int numCourses, const std::vector<std::vector<int>>& prerequisites) {
        // Write your solution here
        return false;
    }
};`,
    java: `import java.util.*;

class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Write your solution here
        return false;
    }
}`,
    python: `class Solution:
    def can_finish(self, num_courses: int, prerequisites: list[list[int]]) -> bool:
        # Write your solution here
        pass`,
  },

  'task-scheduling-dependency': {
    cpp: `#include <vector>

class Solution {
public:
    std::vector<int> findOrder(int numTasks, const std::vector<std::vector<int>>& prerequisites) {
        // Write your solution here
        return {};
    }
};`,
    java: `import java.util.*;

class Solution {
    public int[] findOrder(int numTasks, int[][] prerequisites) {
        // Write your solution here
        return new int[]{};
    }
}`,
    python: `class Solution:
    def find_order(self, num_tasks: int, prerequisites: list[list[int]]) -> list[int]:
        # Write your solution here
        pass`,
  },

  'activity-selection-maximizer': {
    cpp: `#include <vector>
#include <algorithm>

class Solution {
public:
    int eraseOverlapIntervals(std::vector<std::vector<int>>& intervals) {
        // Write your solution here
        return 0;
    }
};`,
    java: `import java.util.*;

class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class Solution:
    def erase_overlap_intervals(self, intervals: list[list[int]]) -> int:
        # Write your solution here
        pass`,
  },

  'subset-target-generator': {
    cpp: `#include <vector>

class Solution {
public:
    std::vector<std::vector<int>> subsets(const std::vector<int>& nums) {
        // Write your solution here
        return {};
    }
};`,
    java: `import java.util.*;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        // Write your solution here
        return new ArrayList<>();
    }
}`,
    python: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        # Write your solution here
        pass`,
  },

  'climbing-stairs-minimum-cost': {
    cpp: `#include <vector>
#include <algorithm>

class Solution {
public:
    int minCostClimbingStairs(const std::vector<int>& cost) {
        // Write your solution here
        return 0;
    }
};`,
    java: `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class Solution:
    def min_cost_climbing_stairs(self, cost: list[int]) -> int:
        # Write your solution here
        pass`,
  },

  'grid-unique-paths-collector': {
    cpp: `#include <vector>

class Solution {
public:
    int uniquePaths(int m, int n) {
        // Write your solution here
        return 0;
    }
};`,
    java: `class Solution {
    public int uniquePaths(int m, int n) {
        // Write your solution here
        return 0;
    }
}`,
    python: `class Solution:
    def unique_paths(self, m: int, n: int) -> int:
        # Write your solution here
        pass`,
  },
};

const DEFAULT_STARTER: ProblemStarterTemplates = {
  cpp: `#include <iostream>
#include <vector>

class Solution {
public:
    // Write your solution here
};`,
  java: `import java.util.*;

class Solution {
    // Write your solution here
}`,
  python: `class Solution:
    # Write your solution here
    pass`,
};

/**
 * Returns starter code for a specific problem and programming language.
 */
export function getStarterCode(slug: string, lang: SupportedLanguage): string {
  const templates = STARTER_TEMPLATES[slug] ?? DEFAULT_STARTER;
  switch (lang) {
    case 'CPP':
      return templates.cpp;
    case 'JAVA':
      return templates.java;
    case 'PYTHON':
      return templates.python;
    case 'JAVASCRIPT':
      return `/**
 * @return {any}
 */
var solution = function() {
    // Write your solution here
};`;
    default:
      return templates.cpp;
  }
}
