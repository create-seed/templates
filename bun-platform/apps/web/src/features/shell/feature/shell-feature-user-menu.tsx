import { useNavigate } from '@tanstack/react-router'

import { authClient } from '@/features/auth/data-access/auth-client'

import { ShellUiUserMenu } from '../ui/shell-ui-user-menu'

export function ShellFeatureUserMenu() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  return (
    <ShellUiUserMenu
      isPending={isPending}
      onProfileClick={() => {
        void navigate({
          to: '/profile',
        })
      }}
      onSignOut={() => {
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              void navigate({
                to: '/',
              })
            },
          },
        })
      }}
      session={session}
    />
  )
}
