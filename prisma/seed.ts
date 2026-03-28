import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

interface NodeSeed {
  id: string
  type: string
  label: string
  positionX: number
  positionY: number
  config: Prisma.InputJsonValue
}

interface EdgeSeed {
  sourceId: string
  targetId: string
  sourcePort?: string
  targetPort?: string
}

interface TemplateSeed {
  id: string
  name: string
  description: string
  templateSlug: string
  nodes: NodeSeed[]
  edges: EdgeSeed[]
}

async function upsertTemplate(userId: string, t: TemplateSeed) {
  await prisma.workflowEdge.deleteMany({ where: { workflowId: t.id } })
  await prisma.workflowNode.deleteMany({ where: { workflowId: t.id } })

  await prisma.workflow.upsert({
    where: { id: t.id },
    update: { name: t.name, description: t.description },
    create: {
      id: t.id,
      name: t.name,
      description: t.description,
      userId,
      isTemplate: true,
      templateSlug: t.templateSlug,
    },
  })

  for (const node of t.nodes) {
    await prisma.workflowNode.create({
      data: {
        id: node.id,
        workflowId: t.id,
        type: node.type,
        label: node.label,
        positionX: node.positionX,
        positionY: node.positionY,
        config: node.config,
      },
    })
  }

  for (const edge of t.edges) {
    await prisma.workflowEdge.create({
      data: {
        workflowId: t.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        sourcePort: edge.sourcePort,
        targetPort: edge.targetPort,
      },
    })
  }

  console.log(`  ✓ ${t.name} (${t.templateSlug})`)
}

async function main() {
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@flowforge.internal' },
    update: {},
    create: {
      email: 'system@flowforge.internal',
      name: 'FlowForge Templates',
    },
  })

  console.log('Seeding templates...')

  await upsertTemplate(systemUser.id, {
    id: 'tmpl-legal-doc-analyzer',
    name: 'Legal Document Analyzer',
    description: 'Analyze contracts and NDAs — extract parties, risks, and get an AI recommendation.',
    templateSlug: 'legal-document-analyzer',
    nodes: [
      {
        id: 'node-la-input',
        type: 'textInput',
        label: 'Contract Text',
        positionX: 80,
        positionY: 220,
        config: {
          label: 'Contract Text',
          defaultValue:
            'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into as of January 15, 2025 ("Effective Date") between TechCorp Inc., a Delaware corporation ("Company A"), and Innovate Solutions LLC, a California limited liability company ("Company B").\n\nTERM: This Agreement shall remain in effect for a period of two (2) years from the Effective Date.\n\nCONFIDENTIAL INFORMATION: Each party may disclose proprietary technical data, business plans, customer lists, and financial projections.\n\nOBLIGATIONS: Each party agrees to: (i) maintain confidentiality using the same degree of care as its own confidential information, (ii) not disclose to third parties without prior written consent, (iii) use information solely for evaluating the potential business relationship.\n\nEXCLUSIONS: Obligations do not apply to information that is publicly available, independently developed, or received from a third party without restriction.\n\nREMEDIES: Each party acknowledges that breach would cause irreparable harm and agrees that injunctive relief is an appropriate remedy.\n\nGOVERNING LAW: This Agreement shall be governed by the laws of the State of Delaware.',
        },
      },
      {
        id: 'node-la-chain',
        type: 'llmChain',
        label: 'Legal Analysis',
        positionX: 580,
        positionY: 220,
        config: {
          label: 'Legal Analysis',
          provider: 'anthropic',
          model: 'claude-haiku-4-5-20251001',
          steps: [
            {
              systemPrompt: 'You are a legal document analyst. Be concise and precise.',
              userPromptTemplate:
                'Identify the key parties, effective date, contract term, governing law, and main scope of obligations from this contract:\n\n{{input}}',
            },
            {
              systemPrompt: 'You are a legal risk assessment specialist.',
              userPromptTemplate:
                'Based on these contract details:\n{{previous}}\n\nIdentify the top 3 risks and any unusual or missing clauses the signing party should be aware of.',
            },
            {
              systemPrompt: 'You are a senior legal advisor providing executive summaries.',
              userPromptTemplate:
                'Given this contract analysis:\n{{previous}}\n\nWrite a 2-sentence executive summary and provide a final recommendation: APPROVE, REVIEW, or REJECT. Explain why in one sentence.',
            },
          ],
        },
      },
      {
        id: 'node-la-extractor',
        type: 'structuredExtractor',
        label: 'Extract Key Fields',
        positionX: 1120,
        positionY: 220,
        config: {
          label: 'Extract Key Fields',
          provider: 'anthropic',
          model: 'claude-haiku-4-5-20251001',
          jsonSchema: JSON.stringify({
            type: 'object',
            properties: {
              parties: { type: 'array', items: { type: 'string' }, description: 'Names of all contract parties' },
              effective_date: { type: 'string', description: 'Contract effective date' },
              term: { type: 'string', description: 'Duration of the contract' },
              governing_law: { type: 'string', description: 'Governing jurisdiction' },
              key_risks: {
                type: 'array',
                items: { type: 'string' },
                description: 'Top risks identified in the analysis',
              },
              recommendation: {
                type: 'string',
                enum: ['APPROVE', 'REVIEW', 'REJECT'],
                description: 'Final recommendation',
              },
            },
            required: ['parties', 'recommendation'],
          }),
          instructions: 'Extract the structured legal metadata from the analysis text provided.',
        },
      },
      {
        id: 'node-la-output',
        type: 'jsonOutput',
        label: 'Analysis Report',
        positionX: 1660,
        positionY: 220,
        config: { label: 'Analysis Report', query: '', prettyPrint: true },
      },
    ],
    edges: [
      { sourceId: 'node-la-input', targetId: 'node-la-chain', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-la-chain', targetId: 'node-la-extractor', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-la-extractor', targetId: 'node-la-output', sourcePort: 'output', targetPort: 'input' },
    ],
  })

  await upsertTemplate(systemUser.id, {
    id: 'tmpl-sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Classify text as positive or negative and route results through a conditional branch.',
    templateSlug: 'sentiment-analyzer',
    nodes: [
      {
        id: 'node-sa-input',
        type: 'textInput',
        label: 'Customer Review',
        positionX: 80,
        positionY: 300,
        config: {
          label: 'Customer Review',
          defaultValue: 'This product is absolutely fantastic! Best purchase I have made all year.',
        },
      },
      {
        id: 'node-sa-llm',
        type: 'llmPrompt',
        label: 'Detect Sentiment',
        positionX: 580,
        positionY: 300,
        config: {
          label: 'Detect Sentiment',
          model: 'claude-haiku-4-5-20251001',
          systemPrompt:
            'Analyze the sentiment of the text. Respond with only a single lowercase word: "positive" or "negative".',
          temperature: 0,
          maxTokens: 10,
          provider: 'anthropic',
        },
      },
      {
        id: 'node-sa-branch',
        type: 'conditionalBranch',
        label: 'Route Sentiment',
        positionX: 1080,
        positionY: 300,
        config: { label: 'Route Sentiment', condition: 'contains', value: 'positive', caseSensitive: false },
      },
      {
        id: 'node-sa-pos',
        type: 'textOutput',
        label: 'Positive Result',
        positionX: 1580,
        positionY: 100,
        config: { label: 'Positive Result', format: 'plain' },
      },
      {
        id: 'node-sa-neg',
        type: 'textOutput',
        label: 'Negative Result',
        positionX: 1580,
        positionY: 500,
        config: { label: 'Negative Result', format: 'plain' },
      },
    ],
    edges: [
      { sourceId: 'node-sa-input', targetId: 'node-sa-llm', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-sa-llm', targetId: 'node-sa-branch', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-sa-branch', targetId: 'node-sa-pos', sourcePort: 'true', targetPort: 'input' },
      { sourceId: 'node-sa-branch', targetId: 'node-sa-neg', sourcePort: 'false', targetPort: 'input' },
    ],
  })

  await upsertTemplate(systemUser.id, {
    id: 'tmpl-data-extractor',
    name: 'Data Extractor',
    description: 'Extract structured JSON data from unstructured text using AI.',
    templateSlug: 'data-extractor',
    nodes: [
      {
        id: 'node-de-input',
        type: 'textInput',
        label: 'Raw Text',
        positionX: 80,
        positionY: 200,
        config: {
          label: 'Raw Text',
          defaultValue:
            'John Smith, 42, john.smith@example.com, Senior Software Engineer at Acme Corporation. He joined in 2019 and is based in San Francisco, CA.',
        },
      },
      {
        id: 'node-de-extractor',
        type: 'structuredExtractor',
        label: 'Extract Fields',
        positionX: 580,
        positionY: 200,
        config: {
          label: 'Extract Fields',
          provider: 'anthropic',
          model: 'claude-haiku-4-5-20251001',
          jsonSchema: JSON.stringify({
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              email: { type: 'string' },
              job_title: { type: 'string' },
              company: { type: 'string' },
              location: { type: 'string' },
            },
            required: ['name', 'age', 'email'],
          }),
          instructions: 'Extract all person details from the provided text.',
        },
      },
      {
        id: 'node-de-output',
        type: 'jsonOutput',
        label: 'Extracted Data',
        positionX: 1080,
        positionY: 200,
        config: { label: 'Extracted Data', query: '', prettyPrint: true },
      },
    ],
    edges: [
      { sourceId: 'node-de-input', targetId: 'node-de-extractor', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-de-extractor', targetId: 'node-de-output', sourcePort: 'output', targetPort: 'input' },
    ],
  })

  await upsertTemplate(systemUser.id, {
    id: 'tmpl-sales-brief',
    name: 'Sales Intelligence Brief',
    description: 'Turn prospect notes into a structured sales brief with pain points, value props, and next steps.',
    templateSlug: 'sales-intelligence-brief',
    nodes: [
      {
        id: 'node-sb-input',
        type: 'textInput',
        label: 'Prospect Notes',
        positionX: 80,
        positionY: 220,
        config: {
          label: 'Prospect Notes',
          defaultValue:
            "Acme Manufacturing Co. — $50M revenue, 280 employees. Currently using legacy ERP (SAP R/2 from 2008). Operations manager mentioned pain points: manual production scheduling, 3-day delay in demand forecasting, frequent stockouts on top 20 SKUs. Budget cycle starts Q2. Tech decision made by VP Operations (Sarah Chen) and IT Director. Competitors using our platform: Apex Industrial, Global Parts Inc. Previous vendor: Oracle (churned 18 months ago due to implementation complexity).",
        },
      },
      {
        id: 'node-sb-chain',
        type: 'llmChain',
        label: 'Draft Brief',
        positionX: 580,
        positionY: 220,
        config: {
          label: 'Draft Brief',
          provider: 'anthropic',
          model: 'claude-haiku-4-5-20251001',
          steps: [
            {
              systemPrompt: 'You are a senior sales strategist. Analyze prospects concisely and identify the highest-leverage opportunities.',
              userPromptTemplate:
                'Analyze this prospect and identify their core pain points, buying signals, and competitive angles:\n\n{{input}}',
            },
            {
              systemPrompt: 'You are an expert sales writer creating compelling, actionable briefs.',
              userPromptTemplate:
                'Based on this prospect analysis:\n{{previous}}\n\nWrite a concise sales intelligence brief with: a 2-sentence opportunity overview, tailored value proposition, and specific recommended next steps. Use markdown.',
            },
          ],
        },
      },
      {
        id: 'node-sb-extractor',
        type: 'structuredExtractor',
        label: 'Extract Action Items',
        positionX: 1120,
        positionY: 220,
        config: {
          label: 'Extract Action Items',
          provider: 'anthropic',
          model: 'claude-haiku-4-5-20251001',
          jsonSchema: JSON.stringify({
            type: 'object',
            properties: {
              company_name: { type: 'string' },
              industry: { type: 'string' },
              pain_points: { type: 'array', items: { type: 'string' }, description: 'Key pain points identified' },
              value_props: { type: 'array', items: { type: 'string' }, description: 'Tailored value propositions' },
              next_steps: { type: 'array', items: { type: 'string' }, description: 'Prioritized next actions' },
              priority_score: { type: 'number', description: 'Opportunity priority score 0-100' },
            },
            required: ['company_name', 'pain_points', 'next_steps'],
          }),
          instructions: 'Extract the structured sales intelligence fields from the brief provided.',
        },
      },
      {
        id: 'node-sb-output',
        type: 'jsonOutput',
        label: 'Sales Brief',
        positionX: 1660,
        positionY: 220,
        config: { label: 'Sales Brief', query: '', prettyPrint: true },
      },
    ],
    edges: [
      { sourceId: 'node-sb-input', targetId: 'node-sb-chain', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-sb-chain', targetId: 'node-sb-extractor', sourcePort: 'output', targetPort: 'input' },
      { sourceId: 'node-sb-extractor', targetId: 'node-sb-output', sourcePort: 'output', targetPort: 'input' },
    ],
  })

  console.log('Seed complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
