import { Card, Description, Input, Label, Switch, TextField } from 'heroui-native'
import { Text, View } from 'react-native'

export function DevUiCardForm({
  alertsEnabled,
  displayName,
  setAlertsEnabled,
  setDisplayName,
}: {
  alertsEnabled: boolean
  displayName: string
  setAlertsEnabled: (value: boolean) => void
  setDisplayName: (value: string) => void
}) {
  return (
    <Card>
      <Card.Body className="gap-4">
        <Card.Title>Form controls</Card.Title>
        <Card.Description>
          These inputs are local state only and exist just to exercise the components.
        </Card.Description>

        <TextField>
          <Label>Display name</Label>
          <Input
            autoCapitalize="words"
            onChangeText={setDisplayName}
            placeholder="Name this mock"
            value={displayName}
          />
          <Description>Try editing the value, then use the action buttons below.</Description>
        </TextField>

        <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-neutral-900/70">
          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-foreground">Alerts toggle</Text>
            <Text className="text-sm text-muted">Controlled switch bound to local state.</Text>
          </View>
          <Switch isSelected={alertsEnabled} onSelectedChange={setAlertsEnabled} />
        </View>
      </Card.Body>
    </Card>
  )
}
