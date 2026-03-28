export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">FlowForge</h1>
          <p className="text-sm text-muted-foreground">AI Workflow Builder</p>
        </div>
        {children}
      </div>
    </div>
  )
}
