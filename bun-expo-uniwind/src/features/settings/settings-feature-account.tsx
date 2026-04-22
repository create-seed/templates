import { useAuthSignOutMutation } from '@/features/auth/data-access/use-auth-sign-out-mutation'
import { SettingsUiAccountCard } from '@/features/settings/ui/settings-ui-account-card'

export function SettingsFeatureAccount() {
  const { isPending, signOut } = useAuthSignOutMutation()

  return <SettingsUiAccountCard isSigningOut={isPending} signOut={() => void signOut()} />
}
