import { AuthUiSignUpForm } from '../ui/auth-ui-sign-up-form'

interface AuthFeatureSignUpProps {
  onSwitchToSignIn: () => void
}

export function AuthFeatureSignUp({ onSwitchToSignIn }: AuthFeatureSignUpProps) {
  return <AuthUiSignUpForm onSwitchToSignIn={onSwitchToSignIn} />
}
