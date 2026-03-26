import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

export function OnboardUiNoOrganizations() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization access required</CardTitle>
          <CardDescription>You need to be invited to an organization before you can use Bun Platform.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Ask an administrator to add you to an organization, then reload this page.
        </CardContent>
      </Card>
    </div>
  )
}
