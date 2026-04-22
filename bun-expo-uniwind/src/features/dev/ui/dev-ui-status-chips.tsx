import { Chip } from 'heroui-native'
import { View } from 'react-native'

export function DevUiStatusChips({ alertsEnabled }: { alertsEnabled: boolean }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Chip color="accent" variant="primary">
        Bun install
      </Chip>
      <Chip color={alertsEnabled ? 'success' : 'warning'} variant="secondary">
        {alertsEnabled ? 'Alerts on' : 'Alerts off'}
      </Chip>
    </View>
  )
}
