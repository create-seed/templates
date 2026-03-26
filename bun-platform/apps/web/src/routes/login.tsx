import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { getUser } from '@/features/auth/data-access/get-user'
import { AuthFeatureSignIn } from '@/features/auth/feature/auth-feature-sign-in'
import { AuthFeatureSignUp } from '@/features/auth/feature/auth-feature-sign-up'
import { hasActiveOrganization } from '@/features/organization/feature/organization-feature-active-access'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await getUser()

    if (!session) {
      return { session: null }
    }

    throw redirect({
      to: hasActiveOrganization(session) ? '/dashboard' : '/onboard',
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(true)

  return showSignIn ? (
    <AuthFeatureSignIn onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <AuthFeatureSignUp onSwitchToSignIn={() => setShowSignIn(true)} />
  )
}
