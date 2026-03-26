import { Link } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Button } from '@bun-platform/ui/components/button'
import { Skeleton } from '@bun-platform/ui/components/skeleton'

const ShellUiSignedInUserMenu = lazy(async () => ({
  default: (await import('./shell-ui-signed-in-user-menu')).ShellUiSignedInUserMenu,
}))

export interface ShellUiUserSession {
  user: {
    email: string
    name: string
  }
}

interface ShellUiUserMenuProps {
  isPending: boolean
  onProfileClick: () => void
  onSignOut: () => void
  session: ShellUiUserSession | null
}

export function ShellUiUserMenu({ isPending, onProfileClick, onSignOut, session }: ShellUiUserMenuProps) {
  if (isPending) {
    return <Skeleton className="h-8 w-24" />
  }

  if (!session) {
    return (
      <Button nativeButton={false} render={<Link to="/login" />} variant="outline">
        Login
      </Button>
    )
  }

  return (
    <Suspense
      fallback={
        <Button disabled variant="outline">
          {session.user.name}
        </Button>
      }
    >
      <ShellUiSignedInUserMenu onProfileClick={onProfileClick} onSignOut={onSignOut} session={session} />
    </Suspense>
  )
}
