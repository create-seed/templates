import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminFeatureShell } from '@/features/admin/feature/admin-feature-shell'
import { getUser } from '@/features/auth/data-access/get-user'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getUser()

    if (!session || session.user.role !== 'admin') {
      throw redirect({
        to: session ? '/dashboard' : '/login',
      })
    }

    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AdminFeatureShell>
      <Outlet />
    </AdminFeatureShell>
  )
}
