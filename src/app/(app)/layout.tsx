import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogOut, Settings, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen flex-col">
      <nav className="flex h-12 items-center gap-4 border-b bg-background px-4">
        <Link href="/workflows" className="flex items-center gap-2 font-semibold">
          <GitBranch className="h-4 w-4" />
          FlowForge
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <Link
          href="/workflows"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Workflows
        </Link>
        <Link
          href="/executions"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          History
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
            {session.user.email}
          </span>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/api/auth/signout">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
