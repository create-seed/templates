import { Card, Chip } from 'heroui-native'
import { View } from 'react-native'

export function DevUiCardLiveState({ alertsEnabled, displayName }: { alertsEnabled: boolean; displayName: string }) {
  return (
    <Card>
      <Card.Body className="gap-3">
        <Card.Title>Live state</Card.Title>
        <Card.Description>{displayName}</Card.Description>
        <View className="flex-row flex-wrap gap-2">
          <Chip color="accent" variant="primary">
            {displayName}
          </Chip>
          <Chip color={alertsEnabled ? 'success' : 'warning'} variant="secondary">
            {alertsEnabled ? 'Alerts on' : 'Alerts off'}
          </Chip>
        </View>
      </Card.Body>
    </Card>
  )
}
