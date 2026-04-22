import { useToast } from 'heroui-native'
import { useState } from 'react'

import { DevUiCardComponents } from '@/features/dev/ui/dev-ui-card-components'
import { DevUiCardForm } from '@/features/dev/ui/dev-ui-card-form'
import { DevUiCardLiveState } from '@/features/dev/ui/dev-ui-card-live-state'
import { DevUiCardToast } from '@/features/dev/ui/dev-ui-card-toast'
import { ShellUiPageHeader } from '@/features/shell/ui/shell-ui-page-header'
import { ShellUiPage } from '@/features/shell/ui/shell-ui-page'

export function DevFeatureShowcase() {
  const { toast } = useToast()
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [displayName, setDisplayName] = useState('Bun Expo Uniwind')

  return (
    <ShellUiPage>
      <ShellUiPageHeader
        description="Quick-start integration using HeroUI with representative components wired into this starter tab."
        title="HeroUI Native"
      />
      <DevUiCardToast
        showErrorToast={() =>
          toast.show({
            description: 'Something went wrong. Try again.',
            label: 'Error toast',
            variant: 'danger',
          })
        }
        showSuccessToast={() =>
          toast.show({
            description: 'The action completed successfully.',
            label: 'Success toast',
            variant: 'success',
          })
        }
        showWarningToast={() =>
          toast.show({
            description: 'The action triggered with a warning.',
            label: 'Warning toast',
            variant: 'warning',
          })
        }
      />
      <DevUiCardLiveState alertsEnabled={alertsEnabled} displayName={displayName} />
      <DevUiCardForm
        alertsEnabled={alertsEnabled}
        displayName={displayName}
        setAlertsEnabled={setAlertsEnabled}
        setDisplayName={setDisplayName}
      />
      <DevUiCardComponents
        resetDisplayName={() => setDisplayName('Bun Expo Uniwind')}
        toggleAlerts={() => setAlertsEnabled((value) => !value)}
      />
    </ShellUiPage>
  )
}
