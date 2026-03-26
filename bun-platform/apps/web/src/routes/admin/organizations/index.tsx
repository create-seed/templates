import { createFileRoute } from '@tanstack/react-router'

import { AdminOrganizationFeatureDirectory } from '@/features/admin-organization/feature/admin-organization-feature-directory'
import { Route as AdminRoute } from '@/routes/admin'

export const Route = createFileRoute('/admin/organizations/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = AdminRoute.useRouteContext()

  return <AdminOrganizationFeatureDirectory session={session} />
}
