# FlowForge — AI Agent Orchestration Platform

## Project Overview

Visual platform for designing, executing, and monitoring multi-step AI pipelines.
Users drag-and-drop AI operation nodes (LLM, RAG, document processing, analysis)
and connect them into executable workflows. BYOK (Bring Your Own Key) architecture.

## Tech Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- React Flow + Zustand (visual canvas)
- BullMQ + Redis (execution engine)
- PostgreSQL + Prisma (persistence)
- NextAuth.js (auth + BYOK key management)
- Claude API + OpenAI (AI providers, user's own keys)
- SSE (real-time execution status)
- ChromaDB (vector store for RAG)
- Docker Compose (local dev)

## Architecture

- Frontend: React Flow canvas with 10 custom node components
- API: Next.js API routes for workflow CRUD, execution triggers, BYOK key management
- Worker: Separate BullMQ worker process for pipeline execution
- Each node type has a corresponding NodeExecutor class in src/worker/nodes/
- BYOK: User API keys encrypted at rest (AES-256), decrypted in worker per-execution
- Demo Mode: Pre-computed results in public/demo-results/ for template playback

## 10 Node Types

Input: Document Upload, Text Input
Processing: Chunker, Retriever (RAG)
AI: LLM Prompt, Structured Extractor, LLM Chain
Control: Conditional Branch
Output: Text Output, JSON Output

## Code Standards

- TypeScript strict mode — no `any` types unless absolutely necessary
- All components are functional with hooks, wrapped in memo() for React Flow
- Zustand for client state, React Query for server state
- Prisma for all database access — no raw SQL
- All API routes return consistent response shapes: { data } or { error }
- Conventional commits: feat:, fix:, refactor:, docs:, test:, chore:

## Testing

- Unit tests for node executors (they're pure logic)
- Integration tests for API routes
- Test before committing. Run: npm test

## File Delivery

- Provide complete files, not diffs
- When multiple files change, list all changed files clearly

## Common Gotchas

- React Flow nodes MUST be wrapped in memo() to prevent re-renders
- BullMQ workers run in a separate process — they don't share memory with the API
- Prisma client should be a singleton (use src/lib/db/index.ts)
- Docker Compose services: postgres, redis, app, worker
- API keys must NEVER be logged or included in execution logs

## Current Phase

Phase 2: Execution Engine — complete
- BullMQ worker (src/worker/index.ts, `npm run worker`)
- 10 node executors in src/worker/nodes/
- SSE streaming via Redis Pub/Sub (src/lib/events/execution-bus.ts)
- ChromaDB RAG (src/lib/chromadb/, src/lib/embeddings/)
- All 10 node canvas components with status rings
- All 10 config panels in src/components/canvas/panels/
- Run button in WorkflowToolbar, OutputPanel for live output
- useExecutionStore (src/store/execution.ts)
