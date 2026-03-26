import { createFileRoute, Link } from '@tanstack/react-router'
import { Workflow } from 'lucide-react'
import { Button } from '@bun-platform/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <div className="flex items-center gap-3">
            <div className="bg-muted text-foreground flex size-12 items-center justify-center rounded-full">
              <Workflow />
            </div>
            <CardTitle className="text-3xl tracking-[0.2em] uppercase">Bun Platform</CardTitle>
          </div>
          <CardDescription>Welcome to Bun Platform</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button nativeButton={false} render={<Link to="/login" />} size="lg">
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
