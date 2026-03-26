import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/features/auth/data-access/get-user'
import { OnboardFeatureIndex } from '@/features/onboard/feature/onboard-feature-index'
import { hasActiveOrganization } from '@/features/organization/feature/organization-feature-active-access'

export const Route = createFileRoute('/onboard')({
  beforeLoad: async () => {
    const session = await getUser()

    if (!session) {
      throw redirect({
        to: '/login',
      })
    }

    if (hasActiveOrganization(session)) {
      throw redirect({
        to: '/dashboard',
      })
    }

    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <OnboardFeatureIndex />
}
