import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/features/auth/data-access/get-user'
import { ProfileFeatureIndex } from '@/features/profile/feature/profile-feature-index'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const session = await getUser()

    if (!session) {
      throw redirect({
        to: '/login',
      })
    }

    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()

  return <ProfileFeatureIndex session={session} />
}
