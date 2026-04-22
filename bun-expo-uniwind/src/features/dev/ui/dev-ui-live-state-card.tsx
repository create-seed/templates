import { Card, Chip } from 'heroui-native'
import { View } from 'react-native'

export function DevUiLiveStateCard({ alertsEnabled, displayName }: { alertsEnabled: boolean; displayName: string }) {
  return (
    <Card variant="tertiary">
      <Card.Body className="gap-3">
        <Card.Title>Live state</Card.Title>
        <Card.Description>{displayName}</Card.Description>
        <View className="flex-row flex-wrap gap-2">
          <Chip color="accent" variant="primary">
            {displayName}
          </Chip>
          <Chip color={alertsEnabled ? 'success' : 'warning'} variant="secondary">
            {alertsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
          </Chip>
        </View>
      </Card.Body>
    </Card>
  )
}
