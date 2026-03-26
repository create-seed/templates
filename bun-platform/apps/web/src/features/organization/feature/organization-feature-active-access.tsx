import { redirect } from '@tanstack/react-router'

interface OrganizationFeatureSession {
  session?: {
    activeOrganizationId?: string | null
  } | null
}

export function hasActiveOrganization(session: OrganizationFeatureSession | null | undefined) {
  return Boolean(session?.session?.activeOrganizationId)
}

export function requireActiveOrganization(session: OrganizationFeatureSession | null | undefined) {
  if (!session) {
    throw redirect({ to: '/login' })
  }

  if (!hasActiveOrganization(session)) {
    throw redirect({ to: '/onboard' })
  }

  return session
}
