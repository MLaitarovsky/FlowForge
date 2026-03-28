import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

interface Chunk {
  index: number
  text: string
  charStart: number
  charEnd: number
}

function chunkFixed(text: string, chunkSize: number, overlap: number): Chunk[] {
  const chunks: Chunk[] = []
  let i = 0
  let index = 0
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length)
    chunks.push({ index, text: text.slice(i, end), charStart: i, charEnd: end })
    index++
    i += chunkSize - overlap
    if (i >= text.length) break
  }
  return chunks
}

function chunkBySentence(text: string, chunkSize: number, overlap: number): Chunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) ?? [text]
  const chunks: Chunk[] = []
  let current = ''
  let currentStart = 0
  let index = 0
  let pos = 0

  for (const sentence of sentences) {
    if (current.length + sentence.length > chunkSize && current.length > 0) {
      chunks.push({
        index,
        text: current.trim(),
        charStart: currentStart,
        charEnd: currentStart + current.length,
      })
      index++
      // Keep overlap
      const overlapText = current.slice(Math.max(0, current.length - overlap))
      currentStart = pos - overlapText.length
      current = overlapText
    }
    current += sentence
    pos += sentence.length
  }

  if (current.trim()) {
    chunks.push({
      index,
      text: current.trim(),
      charStart: currentStart,
      charEnd: currentStart + current.length,
    })
  }

  return chunks
}

function chunkByParagraph(text: string, chunkSize: number, overlap: number): Chunk[] {
  const paragraphs = text.split(/\n\n+/)
  const chunks: Chunk[] = []
  let current = ''
  let index = 0
  let charStart = 0

  for (const para of paragraphs) {
    if (current.length + para.length > chunkSize && current.length > 0) {
      chunks.push({
        index,
        text: current.trim(),
        charStart,
        charEnd: charStart + current.length,
      })
      index++
      const overlapText = current.slice(Math.max(0, current.length - overlap))
      charStart = charStart + current.length - overlapText.length
      current = overlapText + '\n\n'
    }
    current += para + '\n\n'
  }

  if (current.trim()) {
    chunks.push({
      index,
      text: current.trim(),
      charStart,
      charEnd: charStart + current.length,
    })
  }

  return chunks
}

export class ChunkerExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs } = context
    const text = String(inputs['input'] ?? inputs['output'] ?? '')
    const chunkSize = (config.chunkSize as number) ?? 500
    const overlap = (config.overlap as number) ?? 50
    const strategy = (config.strategy as string) ?? 'fixed'

    let chunks: Chunk[]
    if (strategy === 'sentence') {
      chunks = chunkBySentence(text, chunkSize, overlap)
    } else if (strategy === 'paragraph') {
      chunks = chunkByParagraph(text, chunkSize, overlap)
    } else {
      chunks = chunkFixed(text, chunkSize, overlap)
    }

    return { output: chunks }
  }
}
