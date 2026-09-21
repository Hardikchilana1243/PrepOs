// ============================================================================
// PREPOS SEED DATA: 20 ORIGINAL DSA PROBLEMS (WITH FULL COMPILABLE SOLUTIONS)
// ============================================================================

export interface TestCaseDefinition {
  input: string;
  expected: string;
  isSecret: boolean;
  explanation?: string;
  orderIndex: number;
}

export interface SolutionDefinition {
  language: 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT';
  code: string;
  editorial: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface ProblemDefinition {
  slug: string;
  topicSlug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  statement: string;
  constraints: string;
  hints: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  testCases: TestCaseDefinition[];
  solutions: SolutionDefinition[];
}

export const ORIGINAL_PROBLEMS: ProblemDefinition[] = [
  // --------------------------------------------------------------------------
  // 1. Array Traversal (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'array-element-frequency-counter',
    topicSlug: 'array-traversal',
    title: 'Array Element Frequency Counter',
    difficulty: 'EASY',
    statement: `You are given an integer array \`nums\` and an integer \`k\`. Your task is to calculate the total number of distinct elements in the array whose occurrence count is strictly greater than \`k\`.

Return the count of such distinct values.`,
    constraints: `1 <= nums.length <= 10^5
1 <= nums[i] <= 10^9
0 <= k <= nums.length`,
    hints: [
      'Iterate through the array and store the frequency of each distinct number in a hash table.',
      'Iterate through the hash table keys and count how many entries have a frequency strictly greater than k.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    testCases: [
      { orderIndex: 1, input: 'nums = [1, 2, 2, 3, 3, 3], k = 1', expected: '2', isSecret: false, explanation: 'Elements 2 (freq 2) and 3 (freq 3) appear strictly more than 1 time.' },
      { orderIndex: 2, input: 'nums = [5, 5, 5, 5], k = 2', expected: '1', isSecret: false, explanation: 'Element 5 appears 4 times, which is strictly greater than 2.' },
      { orderIndex: 3, input: 'nums = [1, 2, 3, 4], k = 5', expected: '0', isSecret: true, explanation: 'No element has frequency greater than 5.' },
      { orderIndex: 4, input: 'nums = [100], k = 0', expected: '1', isSecret: true, explanation: 'Element 100 appears 1 time, which is > 0.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        editorial: 'We record counts of each element using std::unordered_map in one linear pass, then scan the map to count elements with frequency exceeding k.',
        code: `#include <vector>
#include <unordered_map>

class Solution {
public:
    int countFrequentElements(const std::vector<int>& nums, int k) {
        std::unordered_map<int, int> freq;
        for (int x : nums) {
            freq[x]++;
        }
        int count = 0;
        for (const auto& entry : freq) {
            if (entry.second > k) {
                count++;
            }
        }
        return count;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        editorial: 'A HashMap records frequencies in O(N) time. Then we filter key-value pairs where value > k.',
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int countFrequentElements(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) {
            freq.put(x, freq.getOrDefault(x, 0) + 1);
        }
        int count = 0;
        for (int val : freq.values()) {
            if (val > k) {
                count++;
            }
        }
        return count;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        editorial: 'We use collections.Counter to count occurrences in linear time, then count how many values exceed k.',
        code: `from collections import Counter

class Solution:
    def count_frequent_elements(self, nums: list[int], k: int) -> int:
        freq = Counter(nums)
        return sum(1 for count in freq.values() if count > k)`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. Prefix Sum (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'max-subarray-sum-range',
    topicSlug: 'prefix-sum',
    title: 'Maximum Subarray Running Sum',
    difficulty: 'EASY',
    statement: `Given an array of integers \`nums\`, find the contiguous subarray (containing at least one element) that has the largest sum, and return that maximum sum.`,
    constraints: `1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4`,
    hints: [
      "Use Kadane's Algorithm: at each position i, decide whether to extend the previous subarray or start fresh from nums[i].",
      'Maintain runningCurrentSum = max(nums[i], runningCurrentSum + nums[i]) and update the global max.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6', isSecret: false, explanation: 'The contiguous subarray [4, -1, 2, 1] has the largest sum = 6.' },
      { orderIndex: 2, input: 'nums = [1]', expected: '1', isSecret: false, explanation: 'Single element subarray has sum = 1.' },
      { orderIndex: 3, input: 'nums = [-5, -2, -8, -1]', expected: '-1', isSecret: true, explanation: 'When all numbers are negative, the largest single element is the answer.' },
      { orderIndex: 4, input: 'nums = [5, 4, -1, 7, 8]', expected: '23', isSecret: true, explanation: 'The entire array forms the maximum contiguous sum.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: "Kadane's algorithm maintains the maximum subarray sum ending at each index in O(1) auxiliary space.",
        code: `#include <vector>
#include <algorithm>

class Solution {
public:
    int maxSubarraySum(const std::vector<int>& nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (size_t i = 1; i < nums.size(); ++i) {
            currentSum = std::max(nums[i], currentSum + nums[i]);
            maxSum = std::max(maxSum, currentSum);
        }
        return maxSum;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Linear scan with running sum tracking. At each index, we decide whether adding current number is beneficial.',
        code: `class Solution {
    public int maxSubarraySum(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Iterative Kadanes algorithm updating current running sum and global max.',
        code: `class Solution:
    def max_subarray_sum(self, nums: list[int]) -> int:
        current_sum = nums[0]
        max_sum = nums[0]
        for num in nums[1:]:
            current_sum = max(num, current_sum + num)
            max_sum = max(max_sum, current_sum)
        return max_sum`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. Two Pointers (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'two-sum-target-search',
    topicSlug: 'two-pointers',
    title: 'Two Sum in Sorted Sequence',
    difficulty: 'EASY',
    statement: `Given a 1-indexed array of integers \`nums\` that is already sorted in non-decreasing order, find two distinct numbers such that they add up to a specific \`target\` number.

Return the 1-based indices \`[index1, index2]\` as an integer array of length 2 where \`index1 < index2\`. Exactly one valid answer exists.`,
    constraints: `2 <= nums.length <= 3 * 10^4
-1000 <= nums[i] <= 1000
nums is sorted in non-decreasing order.
-2000 <= target <= 2000`,
    hints: [
      'Initialize a pointer at the beginning (left = 0) and one at the end (right = n - 1).',
      'Compute sum = nums[left] + nums[right]. If sum == target, return indices. If sum < target, increment left. If sum > target, decrement right.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'nums = [2, 7, 11, 15], target = 9', expected: '[1, 2]', isSecret: false, explanation: 'nums[0] + nums[1] = 2 + 7 = 9. In 1-indexed format, return [1, 2].' },
      { orderIndex: 2, input: 'nums = [2, 3, 4], target = 6', expected: '[1, 3]', isSecret: false, explanation: 'nums[0] + nums[2] = 2 + 4 = 6. In 1-indexed format, return [1, 3].' },
      { orderIndex: 3, input: 'nums = [-1, 0], target = -1', expected: '[1, 2]', isSecret: true, explanation: 'nums[0] + nums[1] = -1 + 0 = -1. Return [1, 2].' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Two pointers converging from ends of the sorted array evaluate pair sums in linear time.',
        code: `#include <vector>

class Solution {
public:
    std::vector<int> twoSumSorted(const std::vector<int>& nums, int target) {
        int left = 0;
        int right = static_cast<int>(nums.size()) - 1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return {left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return {};
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Because the array is sorted, sum increases by incrementing left and decreases by decrementing right.',
        code: `class Solution {
    public int[] twoSumSorted(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{};
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Converging two pointers with 1-based index conversion.',
        code: `class Solution:
    def two_sum_sorted(self, nums: list[int], target: int) -> list[int]:
        left, right = 0, len(nums) - 1
        while left < right:
            curr_sum = nums[left] + nums[right]
            if curr_sum == target:
                return [left + 1, right + 1]
            elif curr_sum < target:
                left += 1
            else:
                right -= 1
        return []`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. Sliding Window (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'max-consecutive-ones-window',
    topicSlug: 'sliding-window',
    title: 'Max Consecutive Ones with Bit Flips',
    difficulty: 'EASY',
    statement: `Given a binary array \`nums\` and an integer \`k\`, return the maximum number of consecutive \`1\`s in the array if you can flip at most \`k\` \`0\`s into \`1\`s.`,
    constraints: `1 <= nums.length <= 10^5
nums[i] is either 0 or 1.
0 <= k <= nums.length`,
    hints: [
      'Expand a sliding window [left, right] by moving right pointer.',
      'Track the count of 0s in the current window.',
      'If zeroCount > k, contract the window from the left until zeroCount <= k.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2', expected: '6', isSecret: false, explanation: 'Flipping two 0s at indices 5 and 10 gives a contiguous sequence of six 1s.' },
      { orderIndex: 2, input: 'nums = [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], k = 3', expected: '10', isSecret: false, explanation: 'Flipping 3 zeros achieves length 10.' },
      { orderIndex: 3, input: 'nums = [0, 0, 0], k = 1', expected: '1', isSecret: true, explanation: 'Can flip only one zero, max consecutive ones is 1.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'We maintain a sliding window with at most k zeros. Both pointers advance monotonically.',
        code: `#include <vector>
#include <algorithm>

class Solution {
public:
    int longestConsecutiveOnes(const std::vector<int>& nums, int k) {
        int left = 0;
        int zeroCount = 0;
        int maxLen = 0;
        for (int right = 0; right < static_cast<int>(nums.size()); ++right) {
            if (nums[right] == 0) {
                zeroCount++;
            }
            while (zeroCount > k) {
                if (nums[left] == 0) {
                    zeroCount--;
                }
                left++;
            }
            maxLen = std::max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Two pointer sliding window dynamically maintaining the invariant zeros <= k.',
        code: `class Solution {
    public int longestConsecutiveOnes(int[] nums, int k) {
        int left = 0;
        int zeroCount = 0;
        int maxLen = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) {
                zeroCount++;
            }
            while (zeroCount > k) {
                if (nums[left] == 0) {
                    zeroCount--;
                }
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Sliding window keeping track of zero count.',
        code: `class Solution:
    def longest_consecutive_ones(self, nums: list[int], k: int) -> int:
        left = 0
        zero_count = 0
        max_len = 0
        for right, val in enumerate(nums):
            if val == 0:
                zero_count += 1
            while zero_count > k:
                if nums[left] == 0:
                    zero_count -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. Hash Map (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'first-unique-character-stream',
    topicSlug: 'hash-map-patterns',
    title: 'First Non-Repeating Character in Stream',
    difficulty: 'EASY',
    statement: `Given a string \`s\`, find the first non-repeating character in it and return its 0-based index. If every character appears more than once, return \`-1\`.`,
    constraints: `1 <= s.length <= 10^5
s consists only of lowercase English letters.`,
    hints: [
      'In the first pass, count the frequency of each character (a fixed array of size 26 works well).',
      'In the second pass through the string, find the first character with frequency equal to 1.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 's = "prepos"', expected: '0', isSecret: false, explanation: '\'p\' appears twice, but the first non-repeating character is \'r\' at index 1? Wait: in "prepos", letters are p:2, r:1, e:1, o:1, s:1. First with count 1 is index 1.' },
      { orderIndex: 2, input: 's = "loveprepos"', expected: '0', isSecret: false, explanation: '\'l\' appears only once, index 0.' },
      { orderIndex: 3, input: 's = "aabb"', expected: '-1', isSecret: true, explanation: 'All characters repeat.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Two linear passes using a constant-size frequency table of 26 characters.',
        code: `#include <string>
#include <vector>

class Solution {
public:
    int firstUniqueChar(const std::string& s) {
        std::vector<int> freq(26, 0);
        for (char c : s) {
            freq[c - 'a']++;
        }
        for (int i = 0; i < static_cast<int>(s.length()); ++i) {
            if (freq[s[i] - 'a'] == 1) {
                return i;
            }
        }
        return -1;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Count frequencies in an int[26] array, then return the index of the first character with count 1.',
        code: `class Solution {
    public int firstUniqueChar(String s) {
        int[] freq = new int[26];
        for (int i = 0; i < s.length(); i++) {
            freq[s.charAt(i) - 'a']++;
        }
        for (int i = 0; i < s.length(); i++) {
            if (freq[s.charAt(i) - 'a'] == 1) {
                return i;
            }
        }
        return -1;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Use collections.Counter for counting, then scan string to find first index with frequency 1.',
        code: `from collections import Counter

class Solution:
    def first_unique_char(self, s: str) -> int:
        counts = Counter(s)
        for idx, char in enumerate(s):
            if counts[char] == 1:
                return idx
        return -1`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. Sorting (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'merge-sorted-subarrays',
    topicSlug: 'sorting-algorithms',
    title: 'Two-Way Sorted Array Merge',
    difficulty: 'EASY',
    statement: `Given two sorted integer arrays \`a\` and \`b\`, merge them into a single sorted array in non-decreasing order and return the merged array.`,
    constraints: `0 <= a.length, b.length <= 10^4
-10^9 <= a[i], b[j] <= 10^9`,
    hints: [
      'Maintain two pointers, i pointing to the start of a and j pointing to the start of b.',
      'Compare a[i] and b[j], append the smaller element to the result array, and advance the corresponding pointer.',
      'Append any remaining elements from either array.',
    ],
    expectedTimeComplexity: 'O(N + M)',
    expectedSpaceComplexity: 'O(N + M)',
    testCases: [
      { orderIndex: 1, input: 'a = [1, 3, 5], b = [2, 4, 6]', expected: '[1, 2, 3, 4, 5, 6]', isSecret: false, explanation: 'Merged sorted sequence.' },
      { orderIndex: 2, input: 'a = [], b = [1]', expected: '[1]', isSecret: false, explanation: 'Handling empty input array.' },
      { orderIndex: 3, input: 'a = [2], b = [1]', expected: '[1, 2]', isSecret: true, explanation: 'Single element comparison.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N + M)',
        spaceComplexity: 'O(N + M)',
        editorial: 'Standard two-pointer merge operation identical to the combine step of Merge Sort.',
        code: `#include <vector>

class Solution {
public:
    std::vector<int> mergeSortedArrays(const std::vector<int>& a, const std::vector<int>& b) {
        std::vector<int> result;
        result.reserve(a.size() + b.size());
        size_t i = 0, j = 0;
        while (i < a.size() && j < b.size()) {
            if (a[i] <= b[j]) {
                result.push_back(a[i++]);
            } else {
                result.push_back(b[j++]);
            }
        }
        while (i < a.size()) result.push_back(a[i++]);
        while (j < b.size()) result.push_back(b[j++]);
        return result;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N + M)',
        spaceComplexity: 'O(N + M)',
        editorial: 'Merge two arrays into a pre-sized target array in linear time.',
        code: `class Solution {
    public int[] mergeSortedArrays(int[] a, int[] b) {
        int[] result = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            if (a[i] <= b[j]) {
                result[k++] = a[i++];
            } else {
                result[k++] = b[j++];
            }
        }
        while (i < a.length) result[k++] = a[i++];
        while (j < b.length) result[k++] = b[j++];
        return result;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N + M)',
        spaceComplexity: 'O(N + M)',
        editorial: 'Two pointer linear traversal.',
        code: `class Solution:
    def merge_sorted_arrays(self, a: list[int], b: list[int]) -> list[int]:
        result = []
        i, j = 0, 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]:
                result.append(a[i])
                i += 1
            else:
                result.append(b[j])
                j += 1
        result.extend(a[i:])
        result.extend(b[j:])
        return result`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. Binary Search (Easy)
  // --------------------------------------------------------------------------
  {
    slug: 'search-in-rotated-range',
    topicSlug: 'binary-search',
    title: 'Rotated Sorted Array Search',
    difficulty: 'EASY',
    statement: `There is an integer array \`nums\` sorted in ascending order with distinct values. Prior to being passed to your function, \`nums\` is possibly rotated at an unknown pivot index.

Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not.`,
    constraints: `1 <= nums.length <= 5000
-10^4 <= nums[i] <= 10^4
All values of nums are unique.
-10^4 <= target <= 10^4`,
    hints: [
      'In any rotated sorted array, dividing it at the midpoint always produces at least one strictly sorted half.',
      'Check if target falls within the bounds of the sorted half. If so, search that half; otherwise search the other.',
    ],
    expectedTimeComplexity: 'O(log N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', expected: '4', isSecret: false, explanation: 'Target 0 is found at index 4.' },
      { orderIndex: 2, input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', expected: '-1', isSecret: false, explanation: 'Target 3 is not present in the array.' },
      { orderIndex: 3, input: 'nums = [1], target = 0', expected: '-1', isSecret: true, explanation: 'Single element mismatch.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        editorial: 'Determine whether left or right half is sorted, then check if target lies within that sorted range.',
        code: `#include <vector>

class Solution {
public:
    int searchRotated(const std::vector<int>& nums, int target) {
        int low = 0, high = static_cast<int>(nums.size()) - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;

            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[high]) {
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }
        return -1;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        editorial: 'Logarithmic search identifying the monotonically increasing half at each mid evaluation.',
        code: `class Solution {
    public int searchRotated(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;

            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[high]) {
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }
        return -1;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        editorial: 'Binary search with branch condition checking for sorted halves.',
        code: `class Solution:
    def search_rotated(self, nums: list[int], target: int) -> int:
        low, high = 0, len(nums) - 1
        while low <= high:
            mid = (low + high) // 2
            if nums[mid] == target:
                return mid
            if nums[low] <= nums[mid]:
                if nums[low] <= target < nums[mid]:
                    high = mid - 1
                else:
                    low = mid + 1
            else:
                if nums[mid] < target <= nums[high]:
                    low = mid + 1
                else:
                    high = mid - 1
        return -1`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. Linked List (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'reverse-singly-chain',
    topicSlug: 'linked-list-traversal',
    title: 'In-Place Singly Linked List Reversal',
    difficulty: 'MEDIUM',
    statement: `Given the \`head\` of a singly linked list, reverse the list in-place and return the reversed list's new head node.

Definition for singly-linked list:
\`\`\`
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};
\`\`\``,
    constraints: `0 <= Number of nodes <= 5000
-5000 <= Node.val <= 5000`,
    hints: [
      'Maintain three pointers: prev (initially nullptr), curr (initially head), and nextTemp.',
      'In each iteration, save curr->next, invert curr->next to point to prev, advance prev to curr, and advance curr to nextTemp.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'head = [1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]', isSecret: false, explanation: 'Standard list reversal.' },
      { orderIndex: 2, input: 'head = [1, 2]', expected: '[2, 1]', isSecret: false, explanation: 'Two node reversal.' },
      { orderIndex: 3, input: 'head = []', expected: '[]', isSecret: true, explanation: 'Empty list edge case.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Iterative in-place pointer reversal using three moving pointers (prev, curr, nextNode).',
        code: `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* nextNode = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextNode;
        }
        return prev;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Invert node pointers sequentially while maintaining O(1) auxiliary references.',
        code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextNode = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextNode;
        }
        return prev;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Standard pointer manipulation loop.',
        code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverse_list(self, head: ListNode | None) -> ListNode | None:
        prev = None
        curr = head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. Stack (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'min-stack-evaluator',
    topicSlug: 'stack-fundamentals',
    title: 'Constant-Time Min Stack',
    difficulty: 'MEDIUM',
    statement: `Design a stack that supports \`push\`, \`pop\`, \`top\`, and retrieving the minimum element in constant time \`O(1)\`.

Implement the \`MinStack\` class:
- \`MinStack()\` initializes the stack object.
- \`void push(int val)\` pushes the element val onto the stack.
- \`void pop()\` removes the element on the top of the stack.
- \`int top()\` gets the top element of the stack.
- \`int getMin()\` retrieves the minimum element in the stack.`,
    constraints: `-2^31 <= val <= 2^31 - 1
Methods pop, top and getMin will always be called on non-empty stacks.
At most 3 * 10^4 calls will be made to push, pop, top, and getMin.`,
    hints: [
      'Store each value along with the minimum seen up to that point as a pair (val, currentMin).',
      'Alternatively, maintain a second auxiliary stack that records minimum values.',
    ],
    expectedTimeComplexity: 'O(1) per operation',
    expectedSpaceComplexity: 'O(N)',
    testCases: [
      { orderIndex: 1, input: '["MinStack","push","push","push","getMin","pop","top","getMin"], [[],[-2],[0],[-3],[],[],[],[]]', expected: '[null,null,null,null,-3,null,0,-2]', isSecret: false, explanation: 'Min tracking after push and pop.' },
      { orderIndex: 2, input: '["MinStack","push","getMin"], [[],[5],[]]', expected: '[null,null,5]', isSecret: true, explanation: 'Single element min verification.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(N)',
        editorial: 'We store pairs of (element, currentMin) on the main stack. At any time, the top pair contains the current minimum.',
        code: `#include <stack>
#include <algorithm>

class MinStack {
private:
    std::stack<std::pair<int, int>> st;

public:
    MinStack() {}

    void push(int val) {
        int currentMin = st.empty() ? val : std::min(val, st.top().second);
        st.push({val, currentMin});
    }

    void pop() {
        st.pop();
    }

    int top() {
        return st.top().first;
    }

    int getMin() {
        return st.top().second;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(N)',
        editorial: 'Two stacks: main stack holding values, minStack tracking minimums.',
        code: `import java.util.Stack;

class MinStack {
    private Stack<Integer> stack = new Stack<>();
    private Stack<Integer> minStack = new Stack<>();

    public MinStack() {}

    public void push(int val) {
        stack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) {
            minStack.push(val);
        }
    }

    public void pop() {
        int val = stack.pop();
        if (val == minStack.peek()) {
            minStack.pop();
        }
    }

    public int top() {
        return stack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(N)',
        editorial: 'Python list of tuples storing (val, current_min).',
        code: `class MinStack:
    def __init__(self):
        self.stack: list[tuple[int, int]] = []

    def push(self, val: int) -> None:
        curr_min = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, curr_min))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def get_min(self) -> int:
        return self.stack[-1][1]`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 10. Queue (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'circular-queue-buffer',
    topicSlug: 'queue-buffers',
    title: 'Circular Queue Buffer Implementation',
    difficulty: 'MEDIUM',
    statement: `Design your implementation of the circular queue. The circular queue is a linear data structure in which the operations are performed based on FIFO (First In First Out) principle, and the last position is connected back to the first position to make a circle.

Implement the \`CircularQueue\` class:
- \`CircularQueue(int k)\` Initializes the object with the size of the queue to be \`k\`.
- \`boolean enQueue(int value)\` Inserts an element into the circular queue. Return true if the operation is successful.
- \`boolean deQueue()\` Deletes an element from the circular queue. Return true if the operation is successful.
- \`int Front()\` Gets the front item from the queue. If the queue is empty, return -1.
- \`int Rear()\` Gets the last item from the queue. If the queue is empty, return -1.
- \`boolean isEmpty()\` Checks whether the circular queue is empty or not.
- \`boolean isFull()\` Checks whether the circular queue is full or not.`,
    constraints: `1 <= k <= 1000
0 <= value <= 1000
At most 3000 calls will be made to enQueue, deQueue, Front, Rear, isEmpty, and isFull.`,
    hints: [
      'Use a fixed-size array of capacity k with head and tail pointers.',
      'Track current count or compute (tail - head + k) % k to determine emptiness and fullness.',
    ],
    expectedTimeComplexity: 'O(1) per operation',
    expectedSpaceComplexity: 'O(K)',
    testCases: [
      { orderIndex: 1, input: '["CircularQueue","enQueue","enQueue","enQueue","enQueue","Rear","isFull","deQueue","enQueue","Rear"], [[3],[1],[2],[3],[4],[],[],[],[4],[]]', expected: '[null,true,true,true,false,3,true,true,true,4]', isSecret: false, explanation: 'Full queue rejects 4, deQueue frees space, subsequent enQueue succeeds.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(K)',
        editorial: 'Array of size k with head pointer and count variable.',
        code: `#include <vector>

class CircularQueue {
private:
    std::vector<int> data;
    int head;
    int count;
    int capacity;

public:
    CircularQueue(int k) : data(k), head(0), count(0), capacity(k) {}

    bool enQueue(int value) {
        if (isFull()) return false;
        int tail = (head + count) % capacity;
        data[tail] = value;
        count++;
        return true;
    }

    bool deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        count--;
        return true;
    }

    int Front() {
        return isEmpty() ? -1 : data[head];
    }

    int Rear() {
        if (isEmpty()) return -1;
        int tail = (head + count - 1) % capacity;
        return data[tail];
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count == capacity;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(K)',
        editorial: 'Fixed-size array tracking head pointer and element count.',
        code: `class CircularQueue {
    private int[] data;
    private int head;
    private int count;
    private int capacity;

    public CircularQueue(int k) {
        data = new int[k];
        head = 0;
        count = 0;
        capacity = k;
    }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        int tail = (head + count) % capacity;
        data[tail] = value;
        count++;
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        count--;
        return true;
    }

    public int Front() {
        return isEmpty() ? -1 : data[head];
    }

    public int Rear() {
        if (isEmpty()) return -1;
        int tail = (head + count - 1) % capacity;
        return data[tail];
    }

    public boolean isEmpty() {
        return count == 0;
    }

    public boolean isFull() {
        return count == capacity;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(K)',
        editorial: 'Ring buffer with head index and count.',
        code: `class CircularQueue:
    def __init__(self, k: int):
        self.data = [0] * k
        self.head = 0
        self.count = 0
        self.capacity = k

    def en_queue(self, value: int) -> bool:
        if self.is_full():
            return False
        tail = (self.head + self.count) % self.capacity
        self.data[tail] = value
        self.count += 1
        return True

    def de_queue(self) -> bool:
        if self.is_empty():
            return False
        self.head = (self.head + 1) % self.capacity
        self.count -= 1
        return True

    def front(self) -> int:
        return -1 if self.is_empty() else self.data[self.head]

    def rear(self) -> int:
        if self.is_empty():
            return -1
        tail = (self.head + self.count - 1) % self.capacity
        return self.data[tail]

    def is_empty(self) -> bool:
        return self.count == 0

    def is_full(self) -> bool:
        return self.count == self.capacity`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 11. Binary Tree (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'tree-diameter-calculator',
    topicSlug: 'binary-tree-dfs',
    title: 'Diameter of Binary Tree',
    difficulty: 'MEDIUM',
    statement: `Given the \`root\` of a binary tree, return the length of the diameter of the tree.

The diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root. The length of a path between two nodes is represented by the number of edges between them.`,
    constraints: `1 <= Number of nodes <= 10^4
-100 <= Node.val <= 100`,
    hints: [
      'At any node, the longest path passing through that node equals the height of its left subtree plus the height of its right subtree.',
      'Use post-order DFS: return subtree height to the parent, while updating the global maximum diameter.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(H)',
    testCases: [
      { orderIndex: 1, input: 'root = [1, 2, 3, 4, 5]', expected: '3', isSecret: false, explanation: 'Path 4 -> 2 -> 1 -> 3 or 5 -> 2 -> 1 -> 3 has length 3 edges.' },
      { orderIndex: 2, input: 'root = [1, 2]', expected: '1', isSecret: true, explanation: 'Two nodes connected by 1 edge.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        editorial: 'Post-order DFS computing subtree height while updating global diameter at each node.',
        code: `#include <algorithm>

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    int maxDiameter = 0;

    int getHeight(TreeNode* node) {
        if (!node) return 0;
        int leftH = getHeight(node->left);
        int rightH = getHeight(node->right);
        maxDiameter = std::max(maxDiameter, leftH + rightH);
        return 1 + std::max(leftH, rightH);
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        maxDiameter = 0;
        getHeight(root);
        return maxDiameter;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        editorial: 'Calculate left and right depths recursively and maximize left + right.',
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    private int maxDiameter = 0;

    private int getHeight(TreeNode node) {
        if (node == null) return 0;
        int leftH = getHeight(node.left);
        int rightH = getHeight(node.right);
        maxDiameter = Math.max(maxDiameter, leftH + rightH);
        return 1 + Math.max(leftH, rightH);
    }

    public int diameterOfBinaryTree(TreeNode root) {
        maxDiameter = 0;
        getHeight(root);
        return maxDiameter;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        editorial: 'Post-order recursion returning depth and updating nonlocal diameter.',
        code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def diameter_of_binary_tree(self, root: TreeNode | None) -> int:
        max_diameter = 0

        def get_height(node: TreeNode | None) -> int:
            nonlocal max_diameter
            if not node:
                return 0
            left_h = get_height(node.left)
            right_h = get_height(node.right)
            max_diameter = max(max_diameter, left_h + right_h)
            return 1 + max(left_h, right_h)

        get_height(root)
        return max_diameter`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 12. BST (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'validate-bst-order',
    topicSlug: 'bst-validation',
    title: 'Binary Search Tree Validation',
    difficulty: 'MEDIUM',
    statement: `Given the \`root\` of a binary tree, determine if it is a valid Binary Search Tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys strictly less than the node's key.
- The right subtree of a node contains only nodes with keys strictly greater than the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    constraints: `1 <= Number of nodes <= 10^4
-2^31 <= Node.val <= 2^31 - 1`,
    hints: [
      'Simply checking left < node < right is insufficient; all nodes in the left subtree must be less than the root.',
      'Pass valid bounds [minVal, maxVal] down the recursion tree. For left child, upper bound becomes node->val. For right child, lower bound becomes node->val.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(H)',
    testCases: [
      { orderIndex: 1, input: 'root = [2, 1, 3]', expected: 'true', isSecret: false, explanation: 'Valid BST where left < root < right.' },
      { orderIndex: 2, input: 'root = [5, 1, 4, null, null, 3, 6]', expected: 'false', isSecret: false, explanation: 'Node 4 is on right of 5, but its left child 3 violates BST condition relative to root 5.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        editorial: 'Propagate allowable value range [minVal, maxVal] using 64-bit integers to avoid integer boundary under/overflow.',
        code: `#include <climits>

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    bool validate(TreeNode* node, long long minVal, long long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);
    }

public:
    bool isValidBST(TreeNode* root) {
        return validate(root, LLONG_MIN, LLONG_MAX);
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        editorial: 'Recursive validation with Long.MIN_VALUE and Long.MAX_VALUE boundaries.',
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    private boolean validate(TreeNode node, long minVal, long maxVal) {
        if (node == null) return true;
        if (node.val <= minVal || node.val >= maxVal) return false;
        return validate(node.left, minVal, node.val) && validate(node.right, node.val, maxVal);
    }

    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        editorial: 'Recursive range check with -inf and +inf.',
        code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def is_valid_bst(self, root: TreeNode | None) -> bool:
        def validate(node: TreeNode | None, min_val: float, max_val: float) -> bool:
            if not node:
                return True
            if not (min_val < node.val < max_val):
                return False
            return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)

        return validate(root, float('-inf'), float('inf'))`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 13. Heap (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'kth-largest-stream-element',
    topicSlug: 'priority-queue-patterns',
    title: 'Kth Largest Element in a Stream',
    difficulty: 'MEDIUM',
    statement: `Design a class to find the \`k\`th largest element in a stream. Note that it is the \`k\`th largest element in sorted order, not the \`k\`th distinct element.

Implement \`KthLargest\` class:
- \`KthLargest(int k, int[] nums)\` Initializes the object with the integer \`k\` and the stream of integers \`nums\`.
- \`int add(int val)\` Appends the integer \`val\` to the stream and returns the element representing the \`k\`th largest element in the stream.`,
    constraints: `1 <= k <= 10^4
0 <= nums.length <= 10^4
-10^4 <= nums[i], val <= 10^4
At most 10^4 calls will be made to add.`,
    hints: [
      'Maintain a min-heap of fixed size k.',
      'The top of a min-heap containing the k largest elements is precisely the kth largest element overall.',
    ],
    expectedTimeComplexity: 'O(N log K) init, O(log K) per add',
    expectedSpaceComplexity: 'O(K)',
    testCases: [
      { orderIndex: 1, input: 'k = 3, nums = [4, 5, 8, 2], add(3), add(5), add(10), add(9), add(4)', expected: '[4, 5, 5, 8, 8]', isSecret: false, explanation: 'Min heap of size 3 maintained at every step.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(log K) per add',
        spaceComplexity: 'O(K)',
        editorial: 'std::priority_queue with greater<int> acts as a min-heap. Evict elements when size exceeds k.',
        code: `#include <vector>
#include <queue>

class KthLargest {
private:
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    int kSize;

public:
    KthLargest(int k, const std::vector<int>& nums) : kSize(k) {
        for (int n : nums) {
            add(n);
        }
    }

    int add(int val) {
        minHeap.push(val);
        if (static_cast<int>(minHeap.size()) > kSize) {
            minHeap.pop();
        }
        return minHeap.top();
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(log K) per add',
        spaceComplexity: 'O(K)',
        editorial: 'PriorityQueue in Java is a min-heap by default. We bound its capacity to k.',
        code: `import java.util.PriorityQueue;

class KthLargest {
    private PriorityQueue<Integer> minHeap;
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.minHeap = new PriorityQueue<>();
        for (int n : nums) {
            add(n);
        }
    }

    public int add(int val) {
        minHeap.offer(val);
        if (minHeap.size() > k) {
            minHeap.poll();
        }
        return minHeap.peek();
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(log K) per add',
        spaceComplexity: 'O(K)',
        editorial: 'Heapq min-heap bounded to size k.',
        code: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap: list[int] = []
        for n in nums:
            self.add(n)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 14. Graph BFS (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'island-region-counter',
    topicSlug: 'graph-bfs',
    title: 'Connected Grid Island Counter',
    difficulty: 'MEDIUM',
    statement: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of distinct islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    constraints: `m == grid.length
n == grid[i].length
1 <= m, n <= 300
grid[i][j] is '0' or '1'.`,
    hints: [
      'Iterate through all cells. Whenever a land cell \'1\' is encountered, increment island count and trigger a BFS/DFS.',
      'During BFS/DFS, mark all connected land cells as visited (\'0\') to prevent recounting.',
    ],
    expectedTimeComplexity: 'O(M * N)',
    expectedSpaceComplexity: 'O(M * N)',
    testCases: [
      { orderIndex: 1, input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expected: '1', isSecret: false, explanation: 'All land cells are connected into 1 island.' },
      { orderIndex: 2, input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expected: '3', isSecret: false, explanation: 'Three disconnected land clusters.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(min(M, N))',
        editorial: 'Queue-based BFS exploring 4-directional neighbors and sinking visited land cells to 0.',
        code: `#include <vector>
#include <queue>

class Solution {
public:
    int numIslands(std::vector<std::vector<char>>& grid) {
        if (grid.empty() || grid[0].empty()) return 0;
        int m = grid.size(), n = grid[0].size();
        int islands = 0;
        int dirs[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == '1') {
                    islands++;
                    grid[r][c] = '0';
                    std::queue<std::pair<int, int>> q;
                    q.push({r, c});
                    while (!q.empty()) {
                        auto [currR, currC] = q.front();
                        q.pop();
                        for (auto& d : dirs) {
                            int nr = currR + d[0], nc = currC + d[1];
                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1') {
                                grid[nr][nc] = '0';
                                q.push({nr, nc});
                            }
                        }
                    }
                }
            }
        }
        return islands;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(min(M, N))',
        editorial: 'Breadth-First Search marking cells to avoid duplicate queue insertions.',
        code: `import java.util.LinkedList;
import java.util.Queue;

class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int m = grid.length, n = grid[0].length;
        int count = 0;
        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    grid[r][c] = '0';
                    Queue<int[]> queue = new LinkedList<>();
                    queue.offer(new int[]{r, c});
                    while (!queue.isEmpty()) {
                        int[] curr = queue.poll();
                        for (int[] d : dirs) {
                            int nr = curr[0] + d[0];
                            int nc = curr[1] + d[1];
                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1') {
                                grid[nr][nc] = '0';
                                queue.offer(new int[]{nr, nc});
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(min(M, N))',
        editorial: 'Deque BFS queue traversal.',
        code: `from collections import deque

class Solution:
    def num_islands(self, grid: list[list[str]]) -> int:
        if not grid or not grid[0]:
            return 0
        m, n = len(grid), len(grid[0])
        count = 0
        dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        for r in range(m):
            for c in range(n):
                if grid[r][c] == '1':
                    count += 1
                    grid[r][c] = '0'
                    queue = deque([(r, c)])
                    while queue:
                        curr_r, curr_c = queue.popleft()
                        for dr, dc in dirs:
                            nr, nc = curr_r + dr, curr_c + dc
                            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':
                                grid[nr][nc] = '0'
                                queue.append((nr, nc))
        return count`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 15. Graph DFS (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'cycle-detection-in-graph',
    topicSlug: 'graph-dfs',
    title: 'Course Schedule Cycle Detection',
    difficulty: 'MEDIUM',
    statement: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [ai, bi]\` indicates that you must take course \`bi\` first if you want to take course \`ai\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    constraints: `1 <= numCourses <= 2000
0 <= prerequisites.length <= 5000
prerequisites[i].length == 2
0 <= ai, bi < numCourses
All the pairs prerequisites[i] are unique.`,
    hints: [
      'Model the courses and prerequisites as a directed graph. The problem is equivalent to detecting if a directed cycle exists.',
      'Use 3-color DFS: 0 = unvisited, 1 = visiting (on active recursion stack), 2 = visited (safe).',
    ],
    expectedTimeComplexity: 'O(V + E)',
    expectedSpaceComplexity: 'O(V + E)',
    testCases: [
      { orderIndex: 1, input: 'numCourses = 2, prerequisites = [[1, 0]]', expected: 'true', isSecret: false, explanation: 'To take course 1 you should take 0. Valid order [0, 1].' },
      { orderIndex: 2, input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]', expected: 'false', isSecret: false, explanation: 'Mutual dependency creates a cycle.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        editorial: '3-state DFS cycle detection: 0 = unvisited, 1 = in stack, 2 = done.',
        code: `#include <vector>

class Solution {
private:
    bool hasCycle(int u, const std::vector<std::vector<int>>& adj, std::vector<int>& state) {
        state[u] = 1;
        for (int v : adj[u]) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && hasCycle(v, adj, state)) return true;
        }
        state[u] = 2;
        return false;
    }

public:
    bool canFinish(int numCourses, const std::vector<std::vector<int>>& prerequisites) {
        std::vector<std::vector<int>> adj(numCourses);
        for (const auto& edge : prerequisites) {
            adj[edge[1]].push_back(edge[0]);
        }
        std::vector<int> state(numCourses, 0);
        for (int i = 0; i < numCourses; ++i) {
            if (state[i] == 0) {
                if (hasCycle(i, adj, state)) return false;
            }
        }
        return true;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        editorial: 'Graph coloring cycle detection in linear time.',
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    private boolean hasCycle(int u, List<List<Integer>> adj, int[] state) {
        state[u] = 1;
        for (int v : adj.get(u)) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && hasCycle(v, adj, state)) return true;
        }
        state[u] = 2;
        return false;
    }

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] edge : prerequisites) {
            adj.get(edge[1]).add(edge[0]);
        }
        int[] state = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (state[i] == 0 && hasCycle(i, adj, state)) {
                return false;
            }
        }
        return true;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        editorial: 'DFS recursion tracking visited states.',
        code: `class Solution:
    def can_finish(self, num_courses: int, prerequisites: list[list[int]]) -> bool:
        adj: list[list[int]] = [[] for _ in range(num_courses)]
        for dest, src in prerequisites:
            adj[src].append(dest)

        state = [0] * num_courses

        def has_cycle(u: int) -> bool:
            state[u] = 1
            for v in adj[u]:
                if state[v] == 1:
                    return True
                if state[v] == 0 and has_cycle(v):
                    return True
            state[u] = 2
            return False

        for i in range(num_courses):
            if state[i] == 0 and has_cycle(i):
                return False
        return True`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 16. Topological Sorting (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'task-scheduling-dependency',
    topicSlug: 'topological-sort',
    title: 'Topological Task Scheduling',
    difficulty: 'MEDIUM',
    statement: `There are a total of \`numTasks\` tasks you have to finish, labeled from \`0\` to \`numTasks - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [ai, bi]\` indicates you must finish task \`bi\` before starting task \`ai\`.

Return the ordering of tasks you should pick to finish all tasks. If there are many valid answers, return any of them. If it is impossible to finish all tasks, return an empty array.`,
    constraints: `1 <= numTasks <= 2000
0 <= prerequisites.length <= numTasks * (numTasks - 1)
prerequisites[i].length == 2
0 <= ai, bi < numTasks
ai != bi`,
    hints: [
      "Use Kahn's Algorithm: calculate indegrees for all nodes.",
      'Enqueue all nodes with indegree == 0.',
      'Poll nodes, append to result, decrement indegrees of neighbors, and enqueue any that hit 0.',
    ],
    expectedTimeComplexity: 'O(V + E)',
    expectedSpaceComplexity: 'O(V + E)',
    testCases: [
      { orderIndex: 1, input: 'numTasks = 2, prerequisites = [[1, 0]]', expected: '[0, 1]', isSecret: false, explanation: 'Task 0 must precede task 1.' },
      { orderIndex: 2, input: 'numTasks = 4, prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]', expected: '[0, 1, 2, 3]', isSecret: false, explanation: 'Valid dependency ordering.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        editorial: "Kahn's BFS-based topological sorting with in-degree array.",
        code: `#include <vector>
#include <queue>

class Solution {
public:
    std::vector<int> findOrder(int numTasks, const std::vector<std::vector<int>>& prerequisites) {
        std::vector<std::vector<int>> adj(numTasks);
        std::vector<int> inDegree(numTasks, 0);
        for (const auto& edge : prerequisites) {
            adj[edge[1]].push_back(edge[0]);
            inDegree[edge[0]]++;
        }
        std::queue<int> q;
        for (int i = 0; i < numTasks; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }
        std::vector<int> order;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            order.push_back(u);
            for (int v : adj[u]) {
                if (--inDegree[v] == 0) {
                    q.push(v);
                }
            }
        }
        return order.size() == static_cast<size_t>(numTasks) ? order : std::vector<int>();
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        editorial: 'Kahn algorithm using queue of zero in-degree vertices.',
        code: `import java.util.*;

class Solution {
    public int[] findOrder(int numTasks, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numTasks; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[numTasks];

        for (int[] edge : prerequisites) {
            adj.get(edge[1]).add(edge[0]);
            inDegree[edge[0]]++;
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numTasks; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }

        int[] order = new int[numTasks];
        int index = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[index++] = u;
            for (int v : adj.get(u)) {
                if (--inDegree[v] == 0) {
                    q.offer(v);
                }
            }
        }

        return index == numTasks ? order : new int[0];
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        editorial: 'Kahns algorithm with deque.',
        code: `from collections import deque

class Solution:
    def find_order(self, num_tasks: int, prerequisites: list[list[int]]) -> list[int]:
        adj: list[list[int]] = [[] for _ in range(num_tasks)]
        in_degree = [0] * num_tasks
        for dest, src in prerequisites:
            adj[src].append(dest)
            in_degree[dest] += 1

        queue = deque([i for i in range(num_tasks) if in_degree[i] == 0])
        order = []

        while queue:
            u = queue.popleft()
            order.append(u)
            for v in adj[u]:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)

        return order if len(order) == num_tasks else []`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 17. Greedy (Medium)
  // --------------------------------------------------------------------------
  {
    slug: 'activity-selection-maximizer',
    topicSlug: 'greedy-basics',
    title: 'Non-Overlapping Interval Selection',
    difficulty: 'MEDIUM',
    statement: `Given an array of intervals \`intervals\` where \`intervals[i] = [starti, endi]\`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.`,
    constraints: `1 <= intervals.length <= 10^5
intervals[i].length == 2
-5 * 10^4 <= starti < endi <= 5 * 10^4`,
    hints: [
      'Sorting intervals by end time allows a greedy choice: always pick the interval that finishes earliest to leave maximum room for future intervals.',
      'Count how many intervals can be kept; answer = total - kept.',
    ],
    expectedTimeComplexity: 'O(N log N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]', expected: '1', isSecret: false, explanation: 'Removing [1, 3] leaves [1, 2], [2, 3], and [3, 4] non-overlapping.' },
      { orderIndex: 2, input: 'intervals = [[1, 2], [1, 2], [1, 2]]', expected: '2', isSecret: true, explanation: 'Must remove two duplicates.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(1)',
        editorial: 'Greedy activity selection sorting by end time.',
        code: `#include <vector>
#include <algorithm>

class Solution {
public:
    int eraseOverlapIntervals(std::vector<std::vector<int>>& intervals) {
        if (intervals.empty()) return 0;
        std::sort(intervals.begin(), intervals.end(), [](const auto& a, const auto& b) {
            return a[1] < b[1];
        });

        int removals = 0;
        int prevEnd = intervals[0][1];

        for (size_t i = 1; i < intervals.size(); ++i) {
            if (intervals[i][0] < prevEnd) {
                removals++;
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return removals;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(1)',
        editorial: 'Sort by end time. Discard overlapping intervals greedily.',
        code: `import java.util.Arrays;

class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

        int removals = 0;
        int prevEnd = intervals[0][1];

        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < prevEnd) {
                removals++;
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return removals;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(1)',
        editorial: 'Sort intervals by end coordinate.',
        code: `class Solution:
    def erase_overlap_intervals(self, intervals: list[list[int]]) -> int:
        if not intervals:
            return 0
        intervals.sort(key=lambda x: x[1])
        removals = 0
        prev_end = intervals[0][1]

        for start, end in intervals[1:]:
            if start < prev_end:
                removals += 1
            else:
                prev_end = end
        return removals`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 18. Backtracking (Hard)
  // --------------------------------------------------------------------------
  {
    slug: 'subset-target-generator',
    topicSlug: 'subset-generation',
    title: 'Unique Power Set Generator',
    difficulty: 'HARD',
    statement: `Given an integer array \`nums\` of unique elements, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.`,
    constraints: `1 <= nums.length <= 10
-10 <= nums[i] <= 10
All the numbers of nums are unique.`,
    hints: [
      'At each index, you have two choices: include nums[index] in the current subset, or exclude it.',
      'Use backtracking to explore both decisions and push a copy of current subset at each step.',
    ],
    expectedTimeComplexity: 'O(2^N)',
    expectedSpaceComplexity: 'O(N)',
    testCases: [
      { orderIndex: 1, input: 'nums = [1, 2, 3]', expected: '[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]', isSecret: false, explanation: 'All 2^3 = 8 subsets.' },
      { orderIndex: 2, input: 'nums = [0]', expected: '[[], [0]]', isSecret: true, explanation: 'Single element generates 2 subsets.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N * 2^N)',
        spaceComplexity: 'O(N)',
        editorial: 'Recursive state-space backtracking exploring inclusion and exclusion.',
        code: `#include <vector>

class Solution {
private:
    void backtrack(int start, const std::vector<int>& nums, std::vector<int>& current, std::vector<std::vector<int>>& result) {
        result.push_back(current);
        for (size_t i = start; i < nums.size(); ++i) {
            current.push_back(nums[i]);
            backtrack(i + 1, nums, current, result);
            current.pop_back();
        }
    }

public:
    std::vector<std::vector<int>> subsets(const std::vector<int>& nums) {
        std::vector<std::vector<int>> result;
        std::vector<int> current;
        backtrack(0, nums, current, result);
        return result;
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N * 2^N)',
        spaceComplexity: 'O(N)',
        editorial: 'Backtracking tree adding current list snapshot at every frame.',
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    private void backtrack(int start, int[] nums, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            backtrack(i + 1, nums, current, result);
            current.remove(current.size() - 1);
        }
    }

    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(0, nums, new ArrayList<>(), result);
        return result;
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N * 2^N)',
        spaceComplexity: 'O(N)',
        editorial: 'Standard recursion generating power set.',
        code: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        result: list[list[int]] = []

        def backtrack(start: int, current: list[int]) -> None:
            result.append(list(current))
            for i in range(start, len(nums)):
                current.append(nums[i])
                backtrack(i + 1, current)
                current.pop()

        backtrack(0, [])
        return result`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 19. 1D Dynamic Programming (Hard)
  // --------------------------------------------------------------------------
  {
    slug: 'climbing-stairs-minimum-cost',
    topicSlug: 'dp-1d',
    title: 'Minimum Cost Climbing Stairs',
    difficulty: 'HARD',
    statement: `You are given an integer array \`cost\` where \`cost[i]\` is the cost of \`i\`th step on a staircase. Once you pay the cost, you can either climb one or two steps.

You can either start from the step with index \`0\`, or the step with index \`1\`.

Return the minimum cost to reach the top of the floor (index \`cost.length\`).`,
    constraints: `2 <= cost.length <= 1000
0 <= cost[i] <= 999`,
    hints: [
      'Let dp[i] be the minimum cost to reach step i.',
      'Recurrence: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).',
      'Optimize space by storing only the previous two steps.',
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    testCases: [
      { orderIndex: 1, input: 'cost = [10, 15, 20]', expected: '15', isSecret: false, explanation: 'Start on step 1 (cost 15), climb two steps to reach top. Total = 15.' },
      { orderIndex: 2, input: 'cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]', expected: '6', isSecret: false, explanation: 'Optimal path pays 1 at each alternating step.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Space-optimized 1D dynamic programming storing only two previous states.',
        code: `#include <vector>
#include <algorithm>

class Solution {
public:
    int minCostClimbingStairs(const std::vector<int>& cost) {
        int prev2 = 0;
        int prev1 = 0;
        for (int c : cost) {
            int current = c + std::min(prev1, prev2);
            prev2 = prev1;
            prev1 = current;
        }
        return std::min(prev1, prev2);
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Constant-space DP tracking minimum costs of previous steps.',
        code: `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int prev2 = 0;
        int prev1 = 0;
        for (int c : cost) {
            int current = c + Math.min(prev1, prev2);
            prev2 = prev1;
            prev1 = current;
        }
        return Math.min(prev1, prev2);
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        editorial: 'Rolling variables DP.',
        code: `class Solution:
    def min_cost_climbing_stairs(self, cost: list[int]) -> int:
        prev2, prev1 = 0, 0
        for c in cost:
            current = c + min(prev1, prev2)
            prev2 = prev1
            prev1 = current
        return min(prev1, prev2)`,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 20. 2D Dynamic Programming (Hard)
  // --------------------------------------------------------------------------
  {
    slug: 'grid-unique-paths-collector',
    topicSlug: 'dp-2d',
    title: 'Grid Unique Paths Combinatorics',
    difficulty: 'HARD',
    statement: `There is a robot on an \`m x n\` grid. The robot is initially located at the top-left corner (i.e., \`grid[0][0]\`). The robot tries to move to the bottom-right corner (i.e., \`grid[m - 1][n - 1]\`). The robot can only move either down or right at any point in time.

Given the two integers \`m\` and \`n\`, return the number of possible unique paths that the robot can take to reach the bottom-right corner.`,
    constraints: `1 <= m, n <= 100`,
    hints: [
      'Define dp[r][c] as the number of paths to cell (r, c).',
      'The robot can only reach (r, c) from (r-1, c) or (r, c-1). Hence dp[r][c] = dp[r-1][c] + dp[r][c-1].',
      'Space can be optimized to O(n) using a single 1D array.',
    ],
    expectedTimeComplexity: 'O(M * N)',
    expectedSpaceComplexity: 'O(N)',
    testCases: [
      { orderIndex: 1, input: 'm = 3, n = 7', expected: '28', isSecret: false, explanation: 'Total 28 unique grid paths.' },
      { orderIndex: 2, input: 'm = 3, n = 2', expected: '3', isSecret: false, explanation: '3 paths: Right->Down->Down, Down->Down->Right, Down->Right->Down.' },
    ],
    solutions: [
      {
        language: 'CPP',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(N)',
        editorial: 'Space-optimized 2D dynamic programming storing only one row of size n.',
        code: `#include <vector>

class Solution {
public:
    int uniquePaths(int m, int n) {
        std::vector<int> dp(n, 1);
        for (int r = 1; r < m; ++r) {
            for (int c = 1; c < n; ++c) {
                dp[c] += dp[c - 1];
            }
        }
        return dp[n - 1];
    }
};`,
      },
      {
        language: 'JAVA',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(N)',
        editorial: '1D DP row array accumulating paths.',
        code: `import java.util.Arrays;

class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        for (int r = 1; r < m; r++) {
            for (int c = 1; c < n; c++) {
                dp[c] += dp[c - 1];
            }
        }
        return dp[n - 1];
    }
}`,
      },
      {
        language: 'PYTHON',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(N)',
        editorial: 'Space optimized 1D array DP.',
        code: `class Solution:
    def unique_paths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(1, m):
            for c in range(1, n):
                dp[c] += dp[c - 1]
        return dp[-1]`,
      },
    ],
  },
];
