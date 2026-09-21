// ============================================================================
// PREPOS SEED DATA: CORE CS SUBJECTS & TIMED MCQS (DBMS & OS)
// ============================================================================

export interface OptionDefinition {
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuestionDefinition {
  questionText: string;
  explanation: string;
  orderIndex: number;
  options: OptionDefinition[];
}

export interface QuizDefinition {
  subjectSlug: string;
  subjectTitle: string;
  subjectDescription: string;
  quizSlug: string;
  quizTitle: string;
  quizDescription: string;
  durationMin: number;
  questions: QuestionDefinition[];
}

export const CORE_CS_QUIZZES: QuizDefinition[] = [
  // --------------------------------------------------------------------------
  // 1. DBMS Subject & Placement Quiz
  // --------------------------------------------------------------------------
  {
    subjectSlug: 'dbms',
    subjectTitle: 'Database Management Systems (DBMS)',
    subjectDescription: 'Relational Database Design, SQL Query Engine, Normalization, ACID Transactions, and Indexing Internals.',
    quizSlug: 'dbms-placement-quiz',
    quizTitle: 'DBMS Top Placement MCQs',
    quizDescription: 'Essential Database Management Systems questions frequently asked in Tier-1 and Tier-2 SDE campus interviews.',
    durationMin: 15,
    questions: [
      {
        orderIndex: 1,
        questionText: 'Which ACID transaction property guarantees that all operations within a transaction either execute completely or leave the database unmodified in case of failure?',
        explanation: 'Atomicity ensures the "all-or-nothing" rule. If any statement in a transaction fails before completion, the entire transaction is rolled back.',
        options: [
          { orderIndex: 1, optionText: 'Atomicity', isCorrect: true },
          { orderIndex: 2, optionText: 'Consistency', isCorrect: false },
          { orderIndex: 3, optionText: 'Isolation', isCorrect: false },
          { orderIndex: 4, optionText: 'Durability', isCorrect: false },
        ],
      },
      {
        orderIndex: 2,
        questionText: 'Which Normal Form specifically requires the elimination of transitive functional dependencies on candidate keys?',
        explanation: '3NF requires 2NF compliance and additionally mandates that no non-prime attribute is transitively dependent on any candidate key (X -> A requires X to be a superkey or A to be prime).',
        options: [
          { orderIndex: 1, optionText: 'First Normal Form (1NF)', isCorrect: false },
          { orderIndex: 2, optionText: 'Second Normal Form (2NF)', isCorrect: false },
          { orderIndex: 3, optionText: 'Third Normal Form (3NF)', isCorrect: true },
          { orderIndex: 4, optionText: 'Boyce-Codd Normal Form (BCNF)', isCorrect: false },
        ],
      },
      {
        orderIndex: 3,
        questionText: 'What is the principal architectural distinction of a Clustered Index compared to a Non-Clustered Index?',
        explanation: 'A Clustered Index dictates the physical sequential ordering of data records on storage disk blocks. Consequently, a table can possess only one clustered index.',
        options: [
          { orderIndex: 1, optionText: 'It alters and dictates the physical storage order of the actual table rows on disk', isCorrect: true },
          { orderIndex: 2, optionText: 'It stores pointers to physical memory addresses in a separate secondary B+ Tree', isCorrect: false },
          { orderIndex: 3, optionText: 'Multiple clustered indexes can be created on a single database table', isCorrect: false },
          { orderIndex: 4, optionText: 'It operates strictly on temporary in-memory hash tables', isCorrect: false },
        ],
      },
      {
        orderIndex: 4,
        questionText: 'In SQL execution order, why can the HAVING clause filter aggregated functions (e.g., COUNT(*)) while the WHERE clause cannot?',
        explanation: 'The WHERE clause evaluates individual rows before GROUP BY aggregation occurs. The HAVING clause evaluates after group creation and aggregate function calculation.',
        options: [
          { orderIndex: 1, optionText: 'WHERE is processed before aggregation; HAVING is evaluated after GROUP BY aggregation', isCorrect: true },
          { orderIndex: 2, optionText: 'WHERE clause operates only on string text columns', isCorrect: false },
          { orderIndex: 3, optionText: 'HAVING can only be invoked in subqueries', isCorrect: false },
          { orderIndex: 4, optionText: 'HAVING converts relational tables into NoSQL document streams', isCorrect: false },
        ],
      },
      {
        orderIndex: 5,
        questionText: 'Which Transaction Isolation Level permits "Non-Repeatable Reads" while preventing "Dirty Reads"?',
        explanation: 'Read Committed ensures that a transaction only reads committed data (preventing dirty reads), but another concurrent transaction can commit changes to that same row before re-reading (permitting non-repeatable reads).',
        options: [
          { orderIndex: 1, optionText: 'Read Uncommitted', isCorrect: false },
          { orderIndex: 2, optionText: 'Read Committed', isCorrect: true },
          { orderIndex: 3, optionText: 'Repeatable Read', isCorrect: false },
          { orderIndex: 4, optionText: 'Serializable', isCorrect: false },
        ],
      },
      {
        orderIndex: 6,
        questionText: 'What database constraint enforces referential integrity between two relational tables?',
        explanation: 'A Foreign Key constraint matches a column in a child table to a candidate/primary key in a parent table, ensuring referenced records cannot be orphaned or deleted arbitrarily.',
        options: [
          { orderIndex: 1, optionText: 'Unique Key Constraint', isCorrect: false },
          { orderIndex: 2, optionText: 'Foreign Key Constraint', isCorrect: true },
          { orderIndex: 3, optionText: 'Check Constraint', isCorrect: false },
          { orderIndex: 4, optionText: 'Primary Index Constraint', isCorrect: false },
        ],
      },
      {
        orderIndex: 7,
        questionText: 'Which SQL JOIN returns all tuples from the left table alongside matching tuples from the right table, populating NULLs when no match exists?',
        explanation: 'A LEFT (OUTER) JOIN preserves all records from the left-side table regardless of whether the ON condition matches any record in the right-side table.',
        options: [
          { orderIndex: 1, optionText: 'LEFT OUTER JOIN', isCorrect: true },
          { orderIndex: 2, optionText: 'INNER JOIN', isCorrect: false },
          { orderIndex: 3, optionText: 'RIGHT OUTER JOIN', isCorrect: false },
          { orderIndex: 4, optionText: 'CROSS JOIN', isCorrect: false },
        ],
      },
      {
        orderIndex: 8,
        questionText: 'Why do relational database storage engines (such as InnoDB) utilize B+ Trees instead of standard Binary Search Trees for disk-based indexing?',
        explanation: 'B+ Trees have high fan-out (reducing tree height and disk I/O operations), store actual record pointers only in leaf nodes, and link all leaves in a linked list for rapid sequential range scanning.',
        options: [
          { orderIndex: 1, optionText: 'High fan-out minimizes disk I/O, and linked leaf nodes allow efficient sequential range queries', isCorrect: true },
          { orderIndex: 2, optionText: 'B+ Trees provide constant O(1) time complexity for arbitrary point lookups', isCorrect: false },
          { orderIndex: 3, optionText: 'Binary Search Trees require less memory than B+ Trees on persistent disk drives', isCorrect: false },
          { orderIndex: 4, optionText: 'B+ Trees eliminate the need for transaction locking mechanisms', isCorrect: false },
        ],
      },
      {
        orderIndex: 9,
        questionText: 'What is the role of the Write-Ahead Logging (WAL) protocol in maintaining database durability?',
        explanation: 'WAL mandates that any change is recorded in non-volatile log files before the modified data page is flushed to the actual table disk blocks, enabling crash recovery via REDO/UNDO logs.',
        options: [
          { orderIndex: 1, optionText: 'Ensures log records are flushed to persistent disk prior to writing database pages to disk', isCorrect: true },
          { orderIndex: 2, optionText: 'Caches query execution plans in RAM to accelerate repetitive SELECT calls', isCorrect: false },
          { orderIndex: 3, optionText: 'Validates SQL syntax prior to query compilation', isCorrect: false },
          { orderIndex: 4, optionText: 'Compresses secondary non-clustered index nodes into binary bloat files', isCorrect: false },
        ],
      },
      {
        orderIndex: 10,
        questionText: 'Under what condition does a Database Deadlock occur during concurrent transaction execution?',
        explanation: 'Deadlock occurs when two or more transactions form a circular dependency, where each transaction waits for a lock currently held by another transaction in the cycle.',
        options: [
          { orderIndex: 1, optionText: 'When two or more transactions have circular lock dependencies and wait indefinitely for each other', isCorrect: true },
          { orderIndex: 2, optionText: 'When disk storage space reaches 100% full capacity during a query execution', isCorrect: false },
          { orderIndex: 3, optionText: 'When a transaction attempts to insert a duplicate value into a primary key column', isCorrect: false },
          { orderIndex: 4, optionText: 'When client connections exceed the maximum thread pool limit of the server', isCorrect: false },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. Operating Systems Subject & Placement Quiz
  // --------------------------------------------------------------------------
  {
    subjectSlug: 'os',
    subjectTitle: 'Operating Systems (OS)',
    subjectDescription: 'Processes, Threads, CPU Scheduling, Synchronization Primitives, Deadlock Prevention, and Virtual Memory Management.',
    quizSlug: 'os-placement-quiz',
    quizTitle: 'Operating Systems Top Placement MCQs',
    quizDescription: 'Core OS concepts, memory management, and process concurrency tested in campus technical screening rounds.',
    durationMin: 15,
    questions: [
      {
        orderIndex: 1,
        questionText: 'What is the primary memory and resource distinction between a Process and a Thread in modern operating systems?',
        explanation: 'Processes have independent, isolated virtual address spaces. Threads within the same process share the process\'s heap, code, and global data, but maintain their own registers and call stacks.',
        options: [
          { orderIndex: 1, optionText: 'Threads in the same process share heap memory and address space; processes have isolated address spaces', isCorrect: true },
          { orderIndex: 2, optionText: 'Processes share the same call stack and CPU register states', isCorrect: false },
          { orderIndex: 3, optionText: 'Threads cannot execute concurrently across multiple CPU cores', isCorrect: false },
          { orderIndex: 4, optionText: 'Processes run entirely in user mode while threads run exclusively in kernel mode', isCorrect: false },
        ],
      },
      {
        orderIndex: 2,
        questionText: 'Which of the following is NOT one of the four necessary Coffman conditions required for a deadlock to occur?',
        explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. "Preemption Allowed" would prevent deadlock, not cause it.',
        options: [
          { orderIndex: 1, optionText: 'Mutual Exclusion', isCorrect: false },
          { orderIndex: 2, optionText: 'Hold and Wait', isCorrect: false },
          { orderIndex: 3, optionText: 'Circular Wait', isCorrect: false },
          { orderIndex: 4, optionText: 'Preemption Allowed', isCorrect: true },
        ],
      },
      {
        orderIndex: 3,
        questionText: 'What happens during a CPU Context Switch between two running processes?',
        explanation: 'The OS saves the CPU execution context (program counter, registers, stack pointer) of the active process into its Process Control Block (PCB) and loads the state of the next scheduled process.',
        options: [
          { orderIndex: 1, optionText: 'Saving the current process state into its PCB and loading the saved state of the newly scheduled process', isCorrect: true },
          { orderIndex: 2, optionText: 'Flushing the physical RAM memory contents directly to persistent disk', isCorrect: false },
          { orderIndex: 3, optionText: 'Terminating zombie child processes to reclaim memory blocks', isCorrect: false },
          { orderIndex: 4, optionText: 'Switching dynamic IP addresses assigned to network interfaces', isCorrect: false },
        ],
      },
      {
        orderIndex: 4,
        questionText: 'Which algorithm is traditionally utilized by operating systems to implement Deadlock Avoidance?',
        explanation: 'Dijkstra\'s Banker\'s Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources before granting any real resource request.',
        options: [
          { orderIndex: 1, optionText: "Banker's Algorithm", isCorrect: true },
          { orderIndex: 2, optionText: 'Round Robin Scheduling Algorithm', isCorrect: false },
          { orderIndex: 3, optionText: "Kruskal's Minimum Spanning Tree Algorithm", isCorrect: false },
          { orderIndex: 4, optionText: 'Elevator Disk Scheduling Algorithm', isCorrect: false },
        ],
      },
      {
        orderIndex: 5,
        questionText: 'What causes "Thrashing" in a Virtual Memory system?',
        explanation: 'Thrashing occurs when physical RAM is overcommitted. The system spends vastly more time moving pages back and forth between RAM and the swap file (page fault handling) than executing actual program instructions.',
        options: [
          { orderIndex: 1, optionText: 'Continuous page faults causing the system to spend more time swapping pages than executing instructions', isCorrect: true },
          { orderIndex: 2, optionText: 'High CPU temperature triggering hardware clock throttling', isCorrect: false },
          { orderIndex: 3, optionText: 'Sudden disconnection of peripheral input devices', isCorrect: false },
          { orderIndex: 4, optionText: 'A process entering an infinite while loop without sleeping', isCorrect: false },
        ],
      },
      {
        orderIndex: 6,
        questionText: 'What is a Counting Semaphore in process synchronization?',
        explanation: 'A semaphore is an integer variable accessed solely via atomic wait() (P) and signal() (V) operations, utilized to regulate access to a finite pool of shared resources.',
        options: [
          { orderIndex: 1, optionText: 'An atomic synchronization integer variable accessed via wait() and signal() operations', isCorrect: true },
          { orderIndex: 2, optionText: 'A hardware register tracking clock cycle frequencies', isCorrect: false },
          { orderIndex: 3, optionText: 'A file compression algorithm used by the kernel', isCorrect: false },
          { orderIndex: 4, optionText: 'A software queue used strictly for printer spooling', isCorrect: false },
        ],
      },
      {
        orderIndex: 7,
        questionText: 'What is a Page Fault in virtual memory architecture?',
        explanation: 'A Page Fault is a hardware trap/interrupt raised by the Memory Management Unit (MMU) when an active thread references a valid virtual memory page that is not currently loaded into physical RAM frames.',
        options: [
          { orderIndex: 1, optionText: 'An interrupt triggered when an application attempts to access a virtual page not loaded in RAM', isCorrect: true },
          { orderIndex: 2, optionText: 'A fatal hardware failure in a physical RAM stick', isCorrect: false },
          { orderIndex: 3, optionText: 'An error caused by attempting to divide an integer by zero', isCorrect: false },
          { orderIndex: 4, optionText: 'A syntax error caught by a source code compiler', isCorrect: false },
        ],
      },
      {
        orderIndex: 8,
        questionText: 'Which CPU scheduling algorithm is strictly Non-Preemptive?',
        explanation: 'First-Come First-Served (FCFS) executes the arriving process continuously until it voluntarily yields the CPU, finishes execution, or blocks for an I/O operation.',
        options: [
          { orderIndex: 1, optionText: 'First-Come, First-Served (FCFS)', isCorrect: true },
          { orderIndex: 2, optionText: 'Round Robin (RR)', isCorrect: false },
          { orderIndex: 3, optionText: 'Shortest Remaining Time First (SRTF)', isCorrect: false },
          { orderIndex: 4, optionText: 'Preemptive Priority Scheduling', isCorrect: false },
        ],
      },
      {
        orderIndex: 9,
        questionText: 'What is the architectural purpose of the Translation Lookaside Buffer (TLB)?',
        explanation: 'The TLB is a high-speed associative hardware cache in the MMU that stores recent virtual-to-physical page table translations, avoiding multiple memory bus lookups per memory access.',
        options: [
          { orderIndex: 1, optionText: 'An associative hardware cache inside the MMU that speeds up virtual-to-physical address translation', isCorrect: true },
          { orderIndex: 2, optionText: 'A disk buffer dedicated to buffering video streaming frames', isCorrect: false },
          { orderIndex: 3, optionText: 'A network packet queue buffer on the network card', isCorrect: false },
          { orderIndex: 4, optionText: 'A registry cache for installed device drivers', isCorrect: false },
        ],
      },
      {
        orderIndex: 10,
        questionText: 'How does a Mutex differ fundamentally from a Binary Semaphore?',
        explanation: 'A Mutex possesses an ownership concept: only the specific thread that locked the mutex is authorized to unlock it. A semaphore can be signaled/unlocked by any thread or interrupt handler.',
        options: [
          { orderIndex: 1, optionText: 'A Mutex enforces strict ownership: only the thread that acquired the lock may release it', isCorrect: true },
          { orderIndex: 2, optionText: 'A Mutex can be acquired concurrently by up to 10 distinct threads', isCorrect: false },
          { orderIndex: 3, optionText: 'Semaphores can only be instantiated in user mode applications', isCorrect: false },
          { orderIndex: 4, optionText: 'Mutexes do not provide mutual exclusion guarantees', isCorrect: false },
        ],
      },
    ],
  },
];
