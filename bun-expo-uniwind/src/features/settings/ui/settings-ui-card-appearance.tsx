import { Card } from 'heroui-native'

import { ShellUiThemeSwitcher } from '@/features/shell/ui/shell-ui-theme-switcher'

export function SettingsUiCardAppearance() {
  return (
    <Card>
      <Card.Body className="gap-3">
        <Card.Title>Appearance</Card.Title>
        <Card.Description>Pick the theme for your app.</Card.Description>
        <ShellUiThemeSwitcher />
      </Card.Body>
    </Card>
  )
}
