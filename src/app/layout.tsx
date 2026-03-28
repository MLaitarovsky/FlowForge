import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://flowforge.dev'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'FlowForge — Visual AI Workflow Builder',
    template: '%s | FlowForge',
  },
  description:
    'Drag-and-drop AI pipeline builder. Connect LLMs, RAG, document processing, and structured extraction nodes — then run with real-time visual feedback. BYOK, no vendor lock-in.',
  keywords: ['AI workflow', 'LLM pipeline', 'RAG', 'no-code AI', 'Claude', 'OpenAI', 'visual builder'],
  authors: [{ name: 'FlowForge' }],
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'FlowForge',
    title: 'FlowForge — Visual AI Workflow Builder',
    description:
      'Build multi-step AI pipelines visually. Connect LLM, RAG, document, and extraction nodes. Real-time execution. Bring your own API keys.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowForge — Visual AI Workflow Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowForge — Visual AI Workflow Builder',
    description:
      'Build multi-step AI pipelines visually. Connect LLM, RAG, document, and extraction nodes. Real-time execution. BYOK.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
