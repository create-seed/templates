import { useAuthSignInMutation } from '@/features/auth/data-access/use-auth-sign-in-mutation'
import { AuthUiSignIn } from '@/features/auth/ui/auth-ui-sign-in'

export function AuthFeatureSignIn() {
  const { isPending, signIn } = useAuthSignInMutation()

  return <AuthUiSignIn isSigningIn={isPending} onSignIn={() => void signIn()} />
}
