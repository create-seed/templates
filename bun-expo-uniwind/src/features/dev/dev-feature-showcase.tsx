import { useToast } from 'heroui-native'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

import { DevUiComponentsCard } from '@/features/dev/ui/dev-ui-components-card'
import { DevUiFormCard } from '@/features/dev/ui/dev-ui-form-card'
import { DevUiHero } from '@/features/dev/ui/dev-ui-hero'
import { DevUiLiveStateCard } from '@/features/dev/ui/dev-ui-live-state-card'
import { DevUiStatusChips } from '@/features/dev/ui/dev-ui-status-chips'
import { DevUiToastCard } from '@/features/dev/ui/dev-ui-toast-card'

export function DevFeatureShowcase() {
  const { toast } = useToast()
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [displayName, setDisplayName] = useState('Bun Expo Uniwind')

  return (
    <ScrollView className="flex-1 bg-background" contentInsetAdjustmentBehavior="automatic">
      <View className="gap-6 px-6 py-8">
        <DevUiHero />
        <DevUiToastCard
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
        <DevUiLiveStateCard alertsEnabled={alertsEnabled} displayName={displayName} />
        <DevUiStatusChips alertsEnabled={alertsEnabled} />
        <DevUiFormCard
          alertsEnabled={alertsEnabled}
          displayName={displayName}
          setAlertsEnabled={setAlertsEnabled}
          setDisplayName={setDisplayName}
        />
        <DevUiComponentsCard
          resetDisplayName={() => setDisplayName('Bun Expo Uniwind')}
          toggleAlerts={() => setAlertsEnabled((value) => !value)}
        />
      </View>
    </ScrollView>
  )
}
