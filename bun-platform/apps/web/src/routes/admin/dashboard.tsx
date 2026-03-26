import { createFileRoute } from '@tanstack/react-router'

import { AdminFeatureDashboard } from '@/features/admin/feature/admin-feature-dashboard'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminFeatureDashboard />
}
