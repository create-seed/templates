import { AuthUiSignInForm } from '../ui/auth-ui-sign-in-form'

interface AuthFeatureSignInProps {
  onSwitchToSignUp: () => void
}

export function AuthFeatureSignIn({ onSwitchToSignUp }: AuthFeatureSignInProps) {
  return <AuthUiSignInForm onSwitchToSignUp={onSwitchToSignUp} />
}
