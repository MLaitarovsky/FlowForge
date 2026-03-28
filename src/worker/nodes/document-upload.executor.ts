import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

export class DocumentUploadExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config } = context
    const fileContent = (config.fileContent as string) ?? ''
    const fileType = (config.fileType as string) ?? 'txt'

    if (!fileContent) {
      return { output: '' }
    }

    const buffer = Buffer.from(fileContent, 'base64')

    if (fileType === 'pdf') {
      // Dynamic import to avoid issues if pdf-parse is not installed
      const pdfParse = await import('pdf-parse').then((m) => m.default ?? m)
      const data = await pdfParse(buffer)
      return { output: data.text }
    }

    if (fileType === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return { output: result.value }
    }

    // txt / md — just decode as UTF-8
    return { output: buffer.toString('utf-8') }
  }
}
