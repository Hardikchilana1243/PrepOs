// ============================================================================
// PREPOS CORE CS CURRICULUM & PLACEMENT TOPICS TAXONOMY
// High-Yield Placement Concepts, Topic Categorization & Syllabus Mapping
// ============================================================================

export interface CoreCSTopic {
  id: string;
  slug: string;
  subjectSlug: 'dbms' | 'os';
  title: string;
  shortDescription: string;
  placementRelevance: string;
  keyConcepts: string[];
  interviewTips: string[];
  questionIndices: number[]; // 1-based orderIndex matching seed questions
}

export const DBMS_TOPICS: CoreCSTopic[] = [
  {
    id: 'dbms-acid-transactions',
    slug: 'acid-transactions',
    subjectSlug: 'dbms',
    title: 'ACID Properties & Transaction Isolation',
    shortDescription: 'Atomicity, Consistency, Isolation levels (Read Committed, Repeatable Read), and Durability.',
    placementRelevance: 'Tested in >85% of campus interviews at Amazon, Microsoft, and fintech firms.',
    keyConcepts: [
      'Atomicity: All-or-nothing execution with automatic rollback on error.',
      'Consistency: Ensuring data preserves database schemas, constraints, and cascades.',
      'Isolation Levels: Read Uncommitted (Dirty Read), Read Committed (Non-repeatable Read), Repeatable Read (Phantom Read), Serializable.',
      'Durability: Committed transactions persist across power outages via non-volatile write-ahead logging (WAL).',
    ],
    interviewTips: [
      'Be prepared to explain why Postgres uses Read Committed by default while MySQL InnoDB uses Repeatable Read.',
      'Remember that Read Committed allows Non-Repeatable Reads but prevents Dirty Reads.',
    ],
    questionIndices: [1, 5, 9],
  },
  {
    id: 'dbms-normalization',
    slug: 'normalization',
    subjectSlug: 'dbms',
    title: 'Relational Schema & Normalization (1NF to BCNF)',
    shortDescription: 'Functional dependencies, eliminating anomaly traps, candidate keys, and foreign key integrity.',
    placementRelevance: 'Standard Round 1 technical screening topic for database design & schema design.',
    keyConcepts: [
      '1NF: Atomic column values; no repeating groups or arrays.',
      '2NF: In 1NF + no partial dependency of non-prime attributes on composite candidate keys.',
      '3NF: In 2NF + no transitive dependency (for X -> A, either X is superkey or A is prime attribute).',
      'BCNF: Strict 3NF where every determinant X in functional dependency X -> A must be a superkey.',
      'Foreign Key: Referential integrity constraint linking child rows to parent primary keys.',
    ],
    interviewTips: [
      'Remember the shortcut definition: "Each attribute must depend on the key, the whole key, and nothing but the key, so help me Codd."',
      'Foreign keys prevent orphan records and enforce referential integrity.',
    ],
    questionIndices: [2, 6],
  },
  {
    id: 'dbms-indexing',
    slug: 'indexing-b-trees',
    subjectSlug: 'dbms',
    title: 'Indexing Internals & Storage Engine Architecture',
    shortDescription: 'Clustered vs Non-Clustered Indexes, B+ Tree high fan-out, and disk I/O optimization.',
    placementRelevance: 'Top tier interview favorite for backend engineering and query tuning questions.',
    keyConcepts: [
      'Clustered Index: Governs the physical sequential order of data rows on disk; exactly ONE per table.',
      'Non-Clustered Index: Secondary B+ tree structure storing indexed column values with pointers to clustered primary keys.',
      'B+ Tree Advantage: High fan-out reduces tree height (fewer disk seeks); leaf nodes form a doubly-linked list for fast range queries.',
      'Point Lookups vs Range Scans: B+ tree range scans iterate linearly through leaf pages without traversing root nodes again.',
    ],
    interviewTips: [
      'Interviewers often ask why B+ Trees are preferred over Hash Indexes: Hash tables do O(1) point lookups but fail at range scans (e.g., WHERE age BETWEEN 20 AND 30).',
    ],
    questionIndices: [3, 8],
  },
  {
    id: 'dbms-sql-query',
    slug: 'sql-execution-order',
    subjectSlug: 'dbms',
    title: 'SQL Query Engine & Execution Order',
    shortDescription: 'Clause evaluation order, WHERE vs HAVING, JOIN types, and aggregate functions.',
    placementRelevance: 'Essential for live coding and SQL interview tests across all tech companies.',
    keyConcepts: [
      'Execution Pipeline: FROM -> ON -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.',
      'WHERE vs HAVING: WHERE filters individual rows BEFORE aggregation; HAVING filters groups AFTER GROUP BY.',
      'LEFT OUTER JOIN: Preserves all records from left table, filling right table columns with NULL if no match exists.',
      'INNER JOIN vs CROSS JOIN: INNER returns intersection; CROSS returns Cartesian product.',
    ],
    interviewTips: [
      'You cannot reference a column alias defined in SELECT within the WHERE clause because WHERE executes before SELECT!',
    ],
    questionIndices: [4, 7],
  },
  {
    id: 'dbms-concurrency-recovery',
    slug: 'concurrency-recovery',
    subjectSlug: 'dbms',
    title: 'Concurrency Control, WAL & Deadlocks',
    shortDescription: 'Write-Ahead Logging (WAL), Two-Phase Locking (2PL), and deadlock resolution.',
    placementRelevance: 'Critical for distributed systems, transaction safety, and high-concurrency systems.',
    keyConcepts: [
      'Write-Ahead Logging (WAL): Modifying log buffer on persistent disk before flushing data page to table disk blocks.',
      'Two-Phase Locking (2PL): Growing phase (acquire locks, release none) and Shrinking phase (release locks, acquire none).',
      'Database Deadlock: Circular wait condition where transactions block on resources held by each other.',
      'Recovery Protocols: REDO log (roll-forward committed operations) and UNDO log (roll-back uncommitted transactions).',
    ],
    interviewTips: [
      'Deadlocks are resolved automatically by database deadlock detectors via cycle detection in the Wait-For Graph (WFG) and victim aborts.',
    ],
    questionIndices: [9, 10],
  },
];

export const OS_TOPICS: CoreCSTopic[] = [
  {
    id: 'os-processes-threads',
    slug: 'processes-threads',
    subjectSlug: 'os',
    title: 'Processes, Threads & Execution Context',
    shortDescription: 'Virtual address space isolation, multi-threading memory layouts, PCB, and context switches.',
    placementRelevance: 'Tested in technical rounds at Google, Microsoft, Qualcomm, and Cisco.',
    keyConcepts: [
      'Process: Independent unit of execution with its own isolated virtual address space (code, data, heap, stack).',
      'Thread: Lightweight execution unit within a process; threads share heap, code, and global data, but maintain independent stacks and registers.',
      'Context Switch: OS kernel saves CPU state (program counter, registers, SP) of running process to its PCB and loads the next process state.',
      'Overhead: Thread context switch is vastly cheaper than process switch because page table mappings (TLB) remain intact.',
    ],
    interviewTips: [
      'Remember: "Threads share address space; processes have isolated address spaces."',
      'Be clear about what is shared (heap, files, globals) vs private (stack, registers, PC).',
    ],
    questionIndices: [1, 3],
  },
  {
    id: 'os-deadlocks-concurrency',
    slug: 'deadlocks-concurrency',
    subjectSlug: 'os',
    title: 'Deadlocks, Synchronization & Mutexes',
    shortDescription: 'Coffman conditions, Banker algorithm, Mutex ownership, and Counting Semaphores.',
    placementRelevance: 'Core test item in systems engineering, C++, and multi-threaded backend assessments.',
    keyConcepts: [
      'Four Coffman Conditions: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
      'Banker Algorithm: Dijkstra algorithm to avoid deadlocks by testing safe state transitions before resource allocation.',
      'Counting Semaphore: Atomic integer accessed strictly via wait() (decrement) and signal() (increment).',
      'Mutex vs Binary Semaphore: Mutex has ownership (only the lock owner can release it); semaphore can be signaled by any thread.',
    ],
    interviewTips: [
      'If preemption is allowed, deadlock cannot occur! Preemption breaks Coffman Condition #3.',
      'A Mutex is a locking mechanism; a Semaphore is a signaling mechanism.',
    ],
    questionIndices: [2, 4, 6, 10],
  },
  {
    id: 'os-cpu-scheduling',
    slug: 'cpu-scheduling',
    subjectSlug: 'os',
    title: 'CPU Scheduling Algorithms',
    shortDescription: 'Non-preemptive vs preemptive dispatching, FCFS, Round Robin, and Shortest Remaining Time First.',
    placementRelevance: 'Universal topic for campus MCQ tests and theoretical problem solving.',
    keyConcepts: [
      'Non-Preemptive Scheduling: Process retains CPU until voluntary termination or I/O block (e.g., FCFS, standard SJF).',
      'Preemptive Scheduling: OS timer interrupt forces context switch when higher priority process arrives (e.g., Round Robin, SRTF).',
      'First-Come First-Served (FCFS): Suffers from Convoy Effect (short jobs stuck waiting behind long CPU-bound process).',
      'Round Robin (RR): Equal time quantum slice; prevents starvation but high context switch overhead if quantum is too small.',
    ],
    interviewTips: [
      'FCFS is strictly non-preemptive. If asked which scheduling policy has no preemption, FCFS is the classic answer.',
    ],
    questionIndices: [8],
  },
  {
    id: 'os-virtual-memory',
    slug: 'virtual-memory-paging',
    subjectSlug: 'os',
    title: 'Virtual Memory, Paging & Thrashing',
    shortDescription: 'Paging architecture, page tables, Page Fault traps, and memory thrashing resolution.',
    placementRelevance: 'High frequency in Tier-1 hardware & OS rounds (Qualcomm, Nvidia, Amazon, Microsoft).',
    keyConcepts: [
      'Paging: Divides physical memory into fixed-size frames and virtual address space into equal-sized pages.',
      'Page Fault: Hardware interrupt triggered by MMU when an accessed virtual page is not resident in physical RAM.',
      'Thrashing: State where physical RAM is overcommitted; system spends more CPU cycles swapping pages to disk than executing code.',
      'Working Set Model: Resolves thrashing by allocating sufficient frame sets to active processes or suspending low-priority tasks.',
    ],
    interviewTips: [
      'A Page Fault is not a software crash! It is a normal MMU hardware trap that causes the kernel to fetch the page from swap disk.',
    ],
    questionIndices: [5, 7],
  },
  {
    id: 'os-hardware-mmu',
    slug: 'mmu-tlb-hardware',
    subjectSlug: 'os',
    title: 'Memory Management Unit (MMU) & TLB Internals',
    shortDescription: 'Translation Lookaside Buffer cache, two-level page tables, and hardware memory translations.',
    placementRelevance: 'Essential for low-level systems architecture and operating systems engineering.',
    keyConcepts: [
      'Translation Lookaside Buffer (TLB): High-speed associative hardware cache in the MMU storing recent virtual-to-physical address translations.',
      'TLB Hit vs Miss: TLB hit resolves physical address in single clock cycle; TLB miss requires walking multi-level page tables in RAM.',
      'Context Switch TLB Invalidation: Switching between unrelated processes invalidates TLB entries unless Address Space Identifiers (ASID) are supported.',
    ],
    interviewTips: [
      'Associative cache lookup is parallel and near-instantaneous, avoiding costly main memory bus reads.',
    ],
    questionIndices: [3, 9],
  },
];

export function getTopicsForSubject(subjectSlug: string): CoreCSTopic[] {
  if (subjectSlug === 'dbms') return DBMS_TOPICS;
  if (subjectSlug === 'os') return OS_TOPICS;
  return [];
}

export function findTopicForQuestion(subjectSlug: string, orderIndex: number): CoreCSTopic | undefined {
  const topics = getTopicsForSubject(subjectSlug);
  return topics.find((t) => t.questionIndices.includes(orderIndex));
}
