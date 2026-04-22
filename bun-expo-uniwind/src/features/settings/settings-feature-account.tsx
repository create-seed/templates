import { useAuthSignOutMutation } from '@/features/auth/data-access/use-auth-sign-out-mutation'
import { SettingsUiCardAccount } from '@/features/settings/ui/settings-ui-card-account'

export function SettingsFeatureAccount() {
  const { isPending, signOut } = useAuthSignOutMutation()

  return <SettingsUiCardAccount isSigningOut={isPending} signOut={() => void signOut()} />
}
