import { Button, Card } from 'heroui-native'

export function SettingsUiCardAccount({ isSigningOut, signOut }: { isSigningOut: boolean; signOut: () => void }) {
  return (
    <Card>
      <Card.Body className="gap-3">
        <Card.Title>Account</Card.Title>
        <Card.Description>Account details can be added here.</Card.Description>
        <Button className="w-full" onPress={signOut} variant="secondary">
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </Card.Body>
    </Card>
  )
}
