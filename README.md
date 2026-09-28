# PrepOS — Placement Readiness Operating System

> An engineering-grade operating system designed to take computer science students from baseline preparation to placement-ready candidates for Tier-1 and Tier-2 Software Development Engineer (SDE) roles.

PrepOS combines structured Data Structures & Algorithms (DSA), timed Core Computer Science diagnostics, real-time code execution via Judge0, spaced repetition active recall, company-specific hiring patterns, and an objective **Placement Readiness Score (PRS)** into a unified platform.

---

## 🚀 Key Architectural Pillars

### 1. Placement Readiness Score (PRS v1)
PrepOS eliminates guesswork in interview readiness with an objective, server-calculated composite index ($0 - 100$):

$$\text{PRS} = (\text{DSA} \times 0.40) + (\text{Core CS} \times 0.30) + (\text{OA Readiness} \times 0.15) + (\text{Consistency} \times 0.15)$$

- **DSA Component (40%)**: Problem difficulty progression across Easy, Medium, and Hard modules.
- **Core CS Component (30%)**: Server-graded accuracy across timed DBMS and Operating Systems diagnostics.
- **OA Component (15%)**: Online assessment simulation benchmarks.
- **Consistency Component (15%)**: 14-day rolling activity streak.
- **Historical Tracking**: Server-persisted score snapshots to track candidate trajectory over time.

---

### 2. Core CS Learning Hub & Timed Diagnostics (Phase 4)
A placement-focused Core CS system built for screening tests and technical rounds:
- **Curated Subject Taxonomies**:
  - **Database Management Systems (DBMS)**: ACID & Isolation Levels, Normalization (1NF–BCNF), Indexing Internals (B+ Trees, Clustered vs. Non-Clustered), SQL Query Pipeline, Concurrency Control, and Write-Ahead Logging (WAL).
  - **Operating Systems (OS)**: Process vs. Thread Memory Spaces, Coffman Deadlock Conditions & Banker's Algorithm, CPU Scheduling (Preemptive vs. Non-preemptive), Virtual Memory Paging & Thrashing, Memory Management Unit (MMU) & TLB hardware caching.
- **Speed Drills**: Timed 10-question diagnostics with active countdown, question jump bar, and unanswered checks.
- **Anti-Cheat Grading**: Answer keys (`QuestionOption.isCorrect`) and conceptual explanations are strictly excluded from client data and evaluated exclusively on the server.
- **Mistake Review & Weak Areas**: Interactive post-quiz results categorize strong vs. weak topics, comparing candidate selections against official answers alongside conceptual explanations.
- **Cross-Pillar Revision**: Identified weak concepts automatically feed into the candidate's revision queue.

---

### 3. DSA Roadmap & Problem Workspace
- **14-Module Curriculum**: Structured path spanning Arrays, Two Pointers, Sliding Window, Trees, Graphs, and Dynamic Programming.
- **Real-Time Code Execution**: Powered by a **Judge0 CE** integration supporting C++ (GCC), Java (OpenJDK), Python 3, and JavaScript (Node.js).
- **Security & Integrity**: Hidden secret test cases and reference solutions remain strictly server-side.
- **Workspace Features**: Dual-pane editor, custom test case execution, runtime & memory complexity metrics, and submission history.

---

### 4. Spaced Repetition Revision System
- **SuperMemo-Inspired Retention Protocol**: Active recall queue dynamically schedules problem and concept reviews based on recall confidence (`HARD` $\rightarrow$ +2d, `GOOD` $\rightarrow$ +10d, `EASY` $\rightarrow$ +14d).
- **Unified Queue**: Integrates algorithmic DSA problems with Core CS conceptual mistakes.

---

### 5. Deterministic Daily Mission Engine
- Generates an idempotent 3-task preparation plan each day:
  1. Target DSA Problem from the student's roadmap queue.
  2. Balanced Core CS Speed Drill (DBMS or OS).
  3. Placement Pattern Spaced Repetition Review.
- Automatically marks missions as completed upon code submission or quiz grading.

---

### 6. Company Hiring Patterns
- Curated company profiles (Amazon, Google, Microsoft, Uber, etc.) mapping high-frequency problem patterns, veracity tiers, and assessment formats.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Streaming SSR) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/) |
| **Code Execution** | [Judge0 CE](https://judge0.com/) (Self-hosted or Cloud API) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with custom Slate/Blue design tokens |
| **Authentication** | JWT HTTP-Only Cookies with [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) password hashing |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📂 Project Structure

```
├── app/
│   ├── api/                    # Internal API routes (auth, code execution)
│   ├── auth/                   # Authentication routes (sign-in, sign-up)
│   ├── dashboard/              # Student dashboard routes
│   │   ├── companies/          # Company preparation patterns
│   │   ├── core-cs/            # Core CS learning hub & speed drills
│   │   ├── dsa/                # DSA roadmap & problem workspace
│   │   ├── profile/            # Student profile & target tiers
│   │   ├── revision/           # Spaced repetition queue
│   │   ├── actions.ts          # Server actions for mutations & grading
│   │   └── page.tsx            # Main dashboard with React Suspense streaming
│   ├── onboarding/             # Target tier & graduation onboarding
│   ├── globals.css             # Design tokens & base styling
│   └── layout.tsx              # Root shell layout
├── components/
│   ├── core-cs/                # Core CS Hub, Topic Explorer, Quiz Runner, Results
│   ├── dashboard/              # Metric cards & preparation pillar cards
│   ├── dsa/                    # Code editor, test runner, submission logs
│   ├── layout/                 # Command palette, app sidebar, navigation
│   ├── revision/               # Spaced repetition recall cards
│   └── ui/                     # Badges, progress bars, design system components
├── lib/
│   ├── services/               # Canonical domain services
│   │   ├── code-execution.ts   # Judge0 client & submission handler
│   │   ├── core-cs.ts          # Core CS hub aggregation & weak areas
│   │   ├── core-cs-curriculum.ts # DBMS & OS placement topic taxonomies
│   │   ├── daily-mission.ts    # Deterministic daily mission generator
│   │   ├── dashboard.ts        # Fast, parallelized dashboard queries
│   │   ├── dsa-roadmap.ts      # Roadmap cache & problem progress
│   │   ├── progress.ts         # Server-side grading & activity tracking
│   │   └── readiness-score.ts  # Placement Readiness Score (PRS v1) engine
│   ├── auth.ts                 # Session verification & password helpers
│   └── db.ts                   # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Relational schema (18 models)
│   └── seed-data/              # Seed definitions (quizzes, problems, companies)
└── scripts/
    ├── measure-baseline.ts     # Latency & query performance profiler
    ├── verify-phase4.ts        # Phase 4 Core CS verification suite
    └── verify-regressions.ts   # Full regression verification suite
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **PostgreSQL**: v14+ running locally or in the cloud
- **Judge0 CE**: (Optional for local testing; an active Judge0 endpoint is required for live code execution)

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prepos_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"

# Judge0 Code Execution
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key-if-using-rapidapi"
```

### 3. Installation & Database Setup

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma db push

# Seed curriculum, problems, and Core CS quizzes
npm run seed
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing

PrepOS includes comprehensive verification scripts to ensure regression-free deployments:

```bash
# 1. TypeScript Strict Type Check
npx tsc --noEmit

# 2. Phase 4 Core CS Learning System Verification (8/8 tests)
npx tsx scripts/verify-phase4.ts

# 3. Comprehensive Platform Regression Suite (14/14 tests)
npx tsx scripts/verify-regressions.ts

# 4. Production Build Validation
npm run build
```

---

## 🔒 Security Architecture

1. **Server-Side Quiz Grading**: Answer keys (`QuestionOption.isCorrect`) and conceptual explanations are never delivered to the client during active quizzes. Answers are validated on the server.
2. **Hidden Test Cases**: Secret edge-case inputs and expected outputs for DSA problems are evaluated inside Judge0 and never sent to the browser.
3. **Data Isolation**: All queries enforce strict user scoping (`userId: user.id`), preventing cross-tenant access to quiz results, code submissions, or revision queues.
4. **Credential Safety**: Passwords are encrypted with 10 salt rounds via `bcryptjs`. Session tokens are stored in secure, `HttpOnly`, `SameSite=Lax` cookies.

---

## 📄 License
This project is licensed under the MIT License.
