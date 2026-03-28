import Link from 'next/link'
import {
  GitBranch,
  Sparkles,
  Zap,
  Shield,
  FileText,
  Braces,
  Link2,
  GitMerge,
  ArrowRight,
  Play,
  Type,
  FileUp,
  Scissors,
  Search,
  GitBranchIcon,
  Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Mock Canvas ──────────────────────────────────────────────────────────────

function MockNode({
  label,
  color,
  icon,
  status,
  x,
  y,
}: {
  label: string
  color: string
  icon: React.ReactNode
  status?: 'success' | 'running'
  x: number
  y: number
}) {
  return (
    <div
      className="absolute flex items-center gap-2 rounded-lg border bg-card/90 px-3 py-2 shadow-md text-xs font-medium backdrop-blur-sm"
      style={{ left: x, top: y, minWidth: 140 }}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white ${color}`}
      >
        {icon}
      </div>
      <span>{label}</span>
      {status === 'success' && (
        <span className="ml-auto h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
      )}
      {status === 'running' && (
        <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-blue-400" />
      )}
    </div>
  )
}

function MockCanvas() {
  return (
    <div className="relative mx-auto h-72 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117] shadow-2xl">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, #444 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* SVG edges */}
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
        {/* TextInput → LLMChain */}
        <path d="M 196 76 C 240 76 240 120 284 120" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.7" />
        {/* LLMChain → StructuredExtractor */}
        <path d="M 424 120 C 468 120 468 164 512 164" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.7" />
        {/* StructuredExtractor → JsonOutput */}
        <path d="M 196 196 C 240 196 240 212 284 212" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.7" />
      </svg>

      {/* Nodes */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <MockNode label="Contract Text" color="bg-emerald-600" icon={<Type className="h-3.5 w-3.5" />} status="success" x={32} y={56} />
        <MockNode label="LLM Chain" color="bg-violet-600" icon={<Link2 className="h-3.5 w-3.5" />} status="success" x={284} y={100} />
        <MockNode label="Extract Schema" color="bg-violet-600" icon={<Braces className="h-3.5 w-3.5" />} status="running" x={32} y={176} />
        <MockNode label="JSON Output" color="bg-amber-600" icon={<Code2 className="h-3.5 w-3.5" />} x={284} y={192} />
      </div>

      {/* Output panel peek */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#0f1117]/95 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Execution Output</span>
          <Badge className="text-[9px] h-3.5 bg-green-600 text-white">Completed</Badge>
        </div>
        <p className="mt-0.5 truncate font-mono text-[10px] text-green-400">
          {`{ "recommendation": "REVIEW", "key_risks": ["auto-renewal", "liability cap"] }`}
        </p>
      </div>
    </div>
  )
}

// ─── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5" />,
    color: 'text-violet-400',
    title: 'Real-time execution',
    body: 'Watch each node animate from idle → running → complete via Server-Sent Events. No polling, no page refresh.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-blue-400',
    title: '10 composable nodes',
    body: 'LLM Prompt, LLM Chain, Structured Extractor, RAG Retriever, Conditional Branch, Document Upload, and more.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    color: 'text-emerald-400',
    title: 'BYOK — your keys, your data',
    body: 'API keys are encrypted at rest with AES-256-GCM. The worker decrypts them per-execution in memory. Never logged.',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    color: 'text-amber-400',
    title: 'Document intelligence',
    body: 'Upload PDFs, DOCX, and CSV files. Chunk, embed, and retrieve relevant passages with ChromaDB vector search.',
  },
  {
    icon: <GitMerge className="h-5 w-5" />,
    color: 'text-rose-400',
    title: 'Variable injection',
    body: 'Reference any upstream output with {{nodeId.output}} in your prompts. Chain complex multi-step reasoning pipelines.',
  },
  {
    icon: <Braces className="h-5 w-5" />,
    color: 'text-cyan-400',
    title: 'Structured extraction',
    body: 'Define a JSON schema and FlowForge will validate and parse LLM output into typed objects every time.',
  },
]

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    slug: 'legal-document-analyzer',
    name: 'Legal Document Analyzer',
    description: 'Extract parties, risks, and a APPROVE/REVIEW/REJECT recommendation from any contract.',
    nodes: ['Text Input', 'LLM Chain', 'Structured Extractor', 'JSON Output'],
    color: 'border-violet-500/40 bg-violet-500/5',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  {
    slug: 'sales-intelligence-brief',
    name: 'Sales Intelligence Brief',
    description: 'Turn raw prospect notes into a structured brief with pain points, value props, and a priority score.',
    nodes: ['Text Input', 'LLM Chain', 'Structured Extractor', 'JSON Output'],
    color: 'border-blue-500/40 bg-blue-500/5',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  {
    slug: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Classify text sentiment and route to positive or negative branches for different follow-up actions.',
    nodes: ['Text Input', 'LLM Prompt', 'Conditional Branch', 'Text Output'],
    color: 'border-emerald-500/40 bg-emerald-500/5',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    slug: 'data-extractor',
    name: 'Data Extractor',
    description: 'Extract structured fields from unstructured text using a custom JSON schema.',
    nodes: ['Text Input', 'LLM Prompt', 'Structured Extractor', 'JSON Output'],
    color: 'border-amber-500/40 bg-amber-500/5',
    badge: 'bg-amber-500/20 text-amber-300',
  },
]

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Design your pipeline',
    body: 'Drag nodes from the palette onto the canvas. Connect outputs to inputs to define the execution order.',
  },
  {
    n: '02',
    title: 'Configure each step',
    body: 'Click a node to open its config panel. Write prompts, set schemas, choose models — all inline.',
  },
  {
    n: '03',
    title: 'Run and observe',
    body: 'Hit Run. Watch nodes animate in real time. Inspect outputs, token usage, and cost per node.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0c10]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GitBranch className="h-4 w-4 text-violet-400" />
            <span>FlowForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <Badge className="mb-6 inline-flex border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Visual AI pipeline builder
          </Badge>

          <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Build AI workflows{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              without writing glue code
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-white/60 leading-relaxed">
            Drag-and-drop 10 AI nodes onto a canvas. Connect them. Run. Watch your pipeline
            execute in real time with per-node status, outputs, and cost tracking.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Link href="/register">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/10 bg-white/5 text-white hover:bg-white/10 gap-2">
              <Link href="/workflows">
                <Play className="h-4 w-4 fill-current" />
                Try a demo template
              </Link>
            </Button>
          </div>

          {/* Mock canvas */}
          <div className="mt-16 px-4">
            <MockCanvas />
            <p className="mt-3 text-xs text-white/30">Legal Document Analyzer — live demo, no API key needed</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-4xl font-bold text-white/10">{s.n}</span>
                <div>
                  <h3 className="mb-2 font-semibold">{s.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-3 text-center text-3xl font-bold">Everything you need</h2>
          <p className="mb-12 text-center text-white/50">
            From document ingestion to structured output — in one canvas.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-6 transition-colors hover:border-white/10 hover:bg-white/[0.05]"
              >
                <div className={`mb-3 ${f.color}`}>{f.icon}</div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Node palette ── */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-3 text-center text-3xl font-bold">10 node types, one canvas</h2>
          <p className="mb-10 text-center text-white/50">
            Every node has a config panel, real-time status ring, and output preview.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Text Input', icon: <Type className="h-3 w-3" />, color: 'bg-emerald-600' },
              { label: 'Document Upload', icon: <FileUp className="h-3 w-3" />, color: 'bg-emerald-600' },
              { label: 'Chunker', icon: <Scissors className="h-3 w-3" />, color: 'bg-blue-600' },
              { label: 'Retriever', icon: <Search className="h-3 w-3" />, color: 'bg-blue-600' },
              { label: 'LLM Prompt', icon: <Sparkles className="h-3 w-3" />, color: 'bg-violet-600' },
              { label: 'LLM Chain', icon: <Link2 className="h-3 w-3" />, color: 'bg-violet-600' },
              { label: 'Structured Extractor', icon: <Braces className="h-3 w-3" />, color: 'bg-violet-600' },
              { label: 'Conditional Branch', icon: <GitBranchIcon className="h-3 w-3" />, color: 'bg-orange-600' },
              { label: 'Text Output', icon: <FileText className="h-3 w-3" />, color: 'bg-amber-600' },
              { label: 'JSON Output', icon: <Code2 className="h-3 w-3" />, color: 'bg-amber-600' },
            ].map((n) => (
              <div
                key={n.label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium"
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded text-white ${n.color}`}>
                  {n.icon}
                </span>
                {n.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-3 text-center text-3xl font-bold">Start from a template</h2>
          <p className="mb-10 text-center text-white/50">
            Preview with live demo — no API key required. Clone to customize.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                href="/workflows"
                className={`group block rounded-xl border p-5 transition-all hover:scale-[1.02] ${t.color}`}
              >
                <h3 className="mb-2 font-semibold text-sm">{t.name}</h3>
                <p className="mb-4 text-xs text-white/50 leading-relaxed">{t.description}</p>
                <div className="flex flex-wrap gap-1">
                  {t.nodes.map((node) => (
                    <span
                      key={node}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.badge}`}
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to build?
          </h2>
          <p className="mb-8 text-white/50">
            Free to use. Bring your own API keys. No usage limits.
          </p>
          <Button size="lg" asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Link href="/register">
              Create your first workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-white/30">
            <GitBranch className="h-3.5 w-3.5" />
            <span>FlowForge</span>
          </div>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-white/60 transition-colors">Register</Link>
            <a
              href="https://github.com/your-username/flowforge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
