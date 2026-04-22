import { Button, Card } from 'heroui-native'

export function DevUiCardComponents({
  resetDisplayName,
  toggleAlerts,
}: {
  resetDisplayName: () => void
  toggleAlerts: () => void
}) {
  return (
    <Card className="gap-3">
      <Card.Body className="gap-3">
        <Card.Title>Components in context</Card.Title>
        <Card.Description>
          Button, Card, Chip, Input, Label, Switch, and TextField are all live on this screen.
        </Card.Description>
      </Card.Body>
      <Card.Footer className="gap-3">
        <Button className="flex-1" onPress={resetDisplayName}>
          Reset label
        </Button>
        <Button className="flex-1" onPress={toggleAlerts} variant="secondary">
          Toggle alerts
        </Button>
      </Card.Footer>
    </Card>
  )
}
