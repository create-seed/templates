import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import { getUser } from '@/features/auth/data-access/get-user'
import { requireActiveOrganization } from '@/features/organization/feature/organization-feature-active-access'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getUser()
    requireActiveOrganization(session)
    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-3xl">Welcome back, {session?.user.name}</CardTitle>
          <CardDescription>You&apos;re ready to continue working in Platform Tweaks.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          Choose a section from the navigation to jump back into your work.
        </CardContent>
      </Card>
    </div>
  )
}
