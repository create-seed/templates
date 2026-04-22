import { SettingsFeatureAccount } from '@/features/settings/settings-feature-account'
import { SettingsUiCardAppearance } from '@/features/settings/ui/settings-ui-card-appearance'
import { ShellUiPageHeader } from '@/features/shell/ui/shell-ui-page-header'
import { ShellUiPage } from '@/features/shell/ui/shell-ui-page'

export function SettingsFeatureEntry() {
  return (
    <ShellUiPage>
      <ShellUiPageHeader
        description="This generic settings is ready to add product-specific settings later."
        title="Settings"
      />
      <SettingsUiCardAppearance />
      <SettingsFeatureAccount />
    </ShellUiPage>
  )
}
