import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@bun-platform/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import { useOrganizationActiveCookie } from '@/features/organization/data-access/use-organization-active-cookie'
import { useOrganizationListMine } from '@/features/organization/data-access/use-organization-list-mine'
import { useOrganizationSetActive } from '@/features/organization/data-access/use-organization-set-active'
import { OrganizationFeatureSelectActive } from '@/features/organization/feature/organization-feature-select-active'

import { OnboardUiNoOrganizations } from '../ui/onboard-ui-no-organizations'

export function OnboardFeatureIndex() {
  const navigate = useNavigate({
    from: '/onboard',
  })
  const organizations = useOrganizationListMine()
  const { clearOrganizationActiveCookie, getOrganizationActiveCookie } = useOrganizationActiveCookie()
  const setActiveOrganization = useOrganizationSetActive({
    onSuccess: () => {
      void navigate({
        to: '/dashboard',
      })
    },
  })
  const attemptedAutoOrganizationIdRef = useRef<string | null>(null)

  const organizationList = organizations.data?.organizations ?? []
  const activeOrganizationId = organizations.data?.activeOrganizationId ?? null
  const cookieOrganizationId = getOrganizationActiveCookie()
  const cookieOrganization = organizationList.find((organization) => organization.id === cookieOrganizationId) ?? null
  const autoOrganizationId = activeOrganizationId ? null : (cookieOrganization?.id ?? organizationList[0]?.id ?? null)
  const shouldAutoSelectOrganization =
    !activeOrganizationId && Boolean(cookieOrganization ?? (organizationList.length === 1 ? organizationList[0] : null))

  useEffect(() => {
    if (!activeOrganizationId) {
      return
    }

    void navigate({
      to: '/dashboard',
    })
  }, [activeOrganizationId, navigate])

  useEffect(() => {
    if (organizations.isPending || organizations.isError || !cookieOrganizationId) {
      return
    }

    const hasMatchingCookieOrganization = organizationList.some((organization) => {
      return organization.id === cookieOrganizationId
    })

    if (!hasMatchingCookieOrganization) {
      clearOrganizationActiveCookie()
    }
  }, [
    clearOrganizationActiveCookie,
    cookieOrganizationId,
    organizationList,
    organizations.isError,
    organizations.isPending,
  ])

  useEffect(() => {
    if (
      organizations.isPending ||
      organizations.isError ||
      !shouldAutoSelectOrganization ||
      !autoOrganizationId ||
      setActiveOrganization.isPending ||
      attemptedAutoOrganizationIdRef.current === autoOrganizationId
    ) {
      return
    }

    attemptedAutoOrganizationIdRef.current = autoOrganizationId
    setActiveOrganization.mutate({
      organizationId: autoOrganizationId,
    })
  }, [
    autoOrganizationId,
    organizations.isError,
    organizations.isPending,
    setActiveOrganization,
    setActiveOrganization.isPending,
    shouldAutoSelectOrganization,
  ])

  if (organizations.isPending || activeOrganizationId) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checking organization access</CardTitle>
            <CardDescription>We&apos;re getting your account ready.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading organizations
          </CardContent>
        </Card>
      </div>
    )
  }

  if (organizations.isError) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>We couldn&apos;t load your organizations</CardTitle>
            <CardDescription>Try again to continue onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">There was a problem checking your organization access.</p>
            <Button onClick={() => void organizations.refetch()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (organizationList.length === 0) {
    return <OnboardUiNoOrganizations />
  }

  if (shouldAutoSelectOrganization && autoOrganizationId) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setting your active organization</CardTitle>
            <CardDescription>We&apos;ll send you into the app in a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setActiveOrganization.isError ? (
              <>
                <p className="text-muted-foreground text-sm">
                  We couldn&apos;t finish setting your active organization.
                </p>
                <Button
                  onClick={() => {
                    setActiveOrganization.mutate({
                      organizationId: autoOrganizationId,
                    })
                  }}
                  variant="outline"
                >
                  Try Again
                </Button>
              </>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Updating active organization
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select an organization</CardTitle>
          <CardDescription>Choose the organization you want to work in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrganizationFeatureSelectActive
            onSuccess={() => {
              void navigate({
                to: '/dashboard',
              })
            }}
          />
          <p className="text-muted-foreground text-sm">
            You can change the active organization later from the dashboard or header.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
