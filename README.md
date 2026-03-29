# FlowForge

> Visual AI pipeline builder — drag, connect, and run multi-step AI workflows in your browser.

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-FF6B6B?style=flat-square&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)

---

## What is FlowForge?

FlowForge is a BYOK (Bring Your Own Key) AI workflow platform. You connect nodes on a visual canvas to build pipelines that process documents, call LLMs, extract structured data, and branch on conditions — then run them with real-time visual feedback.

No vendor lock-in. Your API keys stay encrypted on your server. You own your workflows.

---

## Features

### Visual Canvas
Drag nodes from the palette, connect them, configure each step in the side panel, and hit Run. Watch each node animate through idle → running → success in real time.

### 10 Node Types

| Category | Node | What it does |
|---|---|---|
| Input | Text Input | Provide a text value to the pipeline |
| Input | Document Upload | Upload PDF, DOCX, TXT, or CSV |
| Processing | Chunker | Split text into fixed / paragraph / recursive chunks |
| Processing | Retriever | RAG vector search via ChromaDB |
| AI | LLM Prompt | Single prompt call to Claude or GPT |
| AI | LLM Chain | Multi-step chained prompts |
| AI | Structured Extractor | Extract typed JSON from LLM output |
| Control | Conditional Branch | Route the pipeline by a condition |
| Output | Text Output | Display plain text results |
| Output | JSON Output | Display results in a collapsible tree |

### Variable Injection
Reference upstream node outputs anywhere in your prompts using `{{nodeId.output}}` syntax.

### Real-time Execution
SSE streams node status updates from the worker back to the canvas. No polling. Each node shows a live status ring.

### Execution History
Every run is stored. Inspect per-node duration, token usage, and cost. Expandable row shows node-level logs.

### 4 Built-in Templates

Preview with zero setup using pre-computed demo playback — no API key required.

| Template | Showcases |
|---|---|
| Legal Document Analyzer | LLM Chain → Structured Extractor → JSON output |
| Sales Intelligence Brief | Multi-step analysis → typed extraction |
| Sentiment Analyzer | Conditional Branch routing |
| Data Extractor | Structured JSON schema extraction |

### BYOK — Bring Your Own Key
API keys are encrypted at rest with AES-256-GCM. The worker decrypts them per-execution in memory. Keys are never logged.

### Export / Import
Export any workflow as a `.flowforge.json` file. Import on any FlowForge instance.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│                                                                  │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  React Flow  │  │  Zustand Store  │  │  React Query     │   │
│  │  Canvas      │  │  workflow state │  │  server state    │   │
│  └──────┬───────┘  └────────┬────────┘  └────────┬─────────┘   │
│         └──────────────────┼─────────────────────┘             │
│                             │ HTTP / SSE                         │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│  Next.js 14 App Router       │                                   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  API Routes                                               │   │
│  │  /api/workflows  /api/executions  /api/keys  /api/sse    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  Prisma ORM  ──────────────────────────►  PostgreSQL      │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │ BullMQ enqueue                    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │           Redis                 │
              │  BullMQ queues + Pub/Sub events │
              └───────────┬──────┬─────────────┘
                          │      │ SSE events
              ┌───────────▼──┐   └──────────────────► Next.js SSE
              │  BullMQ      │                         /api/sse/[id]
              │  Worker      │
              │              │
              │  DAG executor│
              │  (topo sort) │
              │              │
              │  ┌──────────────────────────────────┐
              │  │  Node Executors (plugin registry) │
              │  │  text-input  llm-prompt  chunker  │
              │  │  retriever   structured-extractor │
              │  │  llm-chain   conditional-branch   │
              │  │  document-upload  json-output     │
              │  └────────────────┬─────────────────┘
              │                   │
              └───────────────────┼──────────────────┘
                                  │
              ┌───────────────────▼────────────┐
              │         ChromaDB               │
              │  Vector store for RAG retrieval │
              └────────────────────────────────┘
```

**Key flows:**

1. **Save** — canvas state serialized to Zustand → POST `/api/workflows/[id]` → Prisma → PostgreSQL
2. **Run** — POST `/api/workflows/[id]/execute` → creates `Execution` row → enqueues BullMQ job
3. **Worker** — dequeues job → loads workflow from DB → topological sort → runs each executor in order → publishes node events to Redis Pub/Sub
4. **Real-time** — browser subscribes to `/api/sse/[executionId]` → Next.js API route subscribes to Redis → forwards events as SSE → Zustand updates canvas colors
5. **Demo** — template execution reads pre-computed JSON from `public/demo-results/[slug].json` → streams events with artificial delays

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Canvas | React Flow |
| Client state | Zustand |
| Server state | TanStack Query v5 |
| Auth | NextAuth.js (email + GitHub OAuth) |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Queue | BullMQ |
| Cache / Pub-Sub | Redis 7 |
| Vector store | ChromaDB |
| AI providers | Anthropic Claude, OpenAI GPT |
| Encryption | AES-256-GCM (BYOK keys) |
| Infrastructure | Docker Compose |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker + Docker Compose
- An Anthropic or OpenAI API key

### 1. Clone and install

```bash
git clone https://github.com/MLaitarovsky/FlowForge.git
cd FlowForge
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://flowforge:flowforge@localhost:5434/flowforge"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate: openssl rand -hex 32>"
ENCRYPTION_SECRET="<generate: openssl rand -hex 32>"
REDIS_URL="redis://localhost:6381"

# Optional — GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

> **Note:** Docker Compose maps Postgres to port `5434` and Redis to `6381` to avoid conflicts with local installs.

### 3. Start infrastructure

```bash
docker compose up -d
```

### 4. Initialize database

```bash
npm run db:push     # apply schema
npm run db:seed     # load the 4 built-in templates
```

### 5. Start the app

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — BullMQ worker
npm run worker
```

Visit `http://localhost:3000`. Register an account, add your API keys under Settings, then create a workflow.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── workflows/            # Workflow list + canvas editor
│   │   ├── executions/           # Global execution history
│   │   ├── settings/             # BYOK API key management
│   │   ├── templates/            # Template gallery
│   │   └── layout.tsx            # App shell (navbar)
│   ├── (auth)/                   # Login / register pages
│   └── api/                      # API routes
│       ├── workflows/             # CRUD + execute + import
│       ├── executions/            # History + detail
│       ├── keys/                  # BYOK key management
│       ├── templates/             # Template clone
│       └── sse/                   # Server-sent events stream
├── components/
│   ├── canvas/                   # Canvas, toolbar, panels, palette
│   │   └── panels/               # Per-node config panels (10 total)
│   ├── nodes/                    # React Flow node components (10 total)
│   ├── workflows/                # Workflow/template cards, dialogs
│   ├── settings/                 # API key cards
│   └── ui/                       # shadcn/ui primitives
├── store/
│   ├── workflow.ts               # Canvas state (Zustand)
│   └── execution.ts              # Execution status (Zustand)
├── worker/
│   ├── index.ts                  # BullMQ worker entry point
│   ├── dag-executor.ts           # Topological sort + orchestration
│   └── nodes/                    # Node executors (one per node type)
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── db/                       # Prisma singleton
│   ├── encryption.ts             # AES-256-GCM helpers
│   ├── events/                   # Redis Pub/Sub execution bus
│   ├── chromadb/                 # ChromaDB client
│   └── embeddings/               # Embedding helpers
├── hooks/                        # useWorkflow, useApiKeys, etc.
├── types/                        # Node data types
└── prisma/
    ├── schema.prisma
    └── seed.ts                   # Template seeder
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run worker` | Start BullMQ worker (tsx watch) |
| `npm run build` | Production build |
| `npm run db:push` | Apply Prisma schema without migrations |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed the 4 built-in templates |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run test suite |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App base URL |
| `NEXTAUTH_SECRET` | Yes | NextAuth signing secret (min 32 chars) |
| `ENCRYPTION_SECRET` | Yes | AES-256 key for BYOK storage (32-byte hex) |
| `REDIS_URL` | Yes | Redis connection string |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth app client secret |

---

## License

MIT
