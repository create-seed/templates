import { Button, Card, Chip, Description, Input, Label, Switch, TextField } from 'heroui-native'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

export function HomeUiDevShowcase() {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [displayName, setDisplayName] = useState('Bun Expo Uniwind')

  return (
    <ScrollView className="flex-1 bg-background" contentInsetAdjustmentBehavior="automatic">
      <View className="gap-6 px-6 py-8">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">HeroUI Native</Text>
          <Text className="text-base leading-6 text-muted">
            Quick-start integration using Bun with a few representative components wired into this Expo Router app.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Chip color="accent" variant="primary">
            Bun install
          </Chip>
          <Chip color={alertsEnabled ? 'success' : 'warning'} variant="secondary">
            {alertsEnabled ? 'Alerts on' : 'Alerts off'}
          </Chip>
          <Chip color="default" variant="soft">
            /dev route
          </Chip>
        </View>

        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Components in context</Card.Title>
            <Card.Description>
              Button, Card, Chip, Input, Label, Switch, and TextField are all live on this screen.
            </Card.Description>
          </Card.Body>
          <Card.Footer className="gap-3">
            <Button className="flex-1" onPress={() => setDisplayName('Bun Expo Uniwind')}>
              Reset label
            </Button>
            <Button className="flex-1" onPress={() => setAlertsEnabled((value) => !value)} variant="secondary">
              Toggle alerts
            </Button>
          </Card.Footer>
        </Card>

        <Card variant="secondary">
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
              <Description>Try editing the value, then use the action buttons above.</Description>
            </TextField>

            <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-neutral-900/70">
              <View className="flex-1 gap-1">
                <Text className="text-sm font-medium text-foreground">Push notifications</Text>
                <Text className="text-sm text-muted">Controlled HeroUI switch bound to local state.</Text>
              </View>
              <Switch isSelected={alertsEnabled} onSelectedChange={setAlertsEnabled} />
            </View>
          </Card.Body>
        </Card>

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
      </View>
    </ScrollView>
  )
}
