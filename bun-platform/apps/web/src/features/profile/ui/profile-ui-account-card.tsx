import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

interface ProfileUiAccountCardProps {
  email: string
  name: string
  role?: string | null
}

export function ProfileUiAccountCard({ email, name, role }: ProfileUiAccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account details for Bun Platform.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Name</p>
          <p className="font-medium">{name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Role</p>
          <p className="font-medium capitalize">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}
