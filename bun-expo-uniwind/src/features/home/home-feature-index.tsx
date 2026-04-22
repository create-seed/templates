import { useAuthSignOutMutation } from '@/features/auth/data-access/use-auth-sign-out-mutation'
import { HomeUiIndex } from '@/features/home/ui/home-ui-index'

export function HomeFeatureIndex() {
  const { isPending, signOut } = useAuthSignOutMutation()

  return <HomeUiIndex isSigningOut={isPending} onSignOut={() => void signOut()} />
}
