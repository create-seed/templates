import { Card } from 'heroui-native'

export function HomeUiCardFeatures() {
  return (
    <Card>
      <Card.Body className="gap-3">
        <Card.Title>Template features</Card.Title>
        <Card.Description>
          The Home tab gives you a clean landing screen, Dev keeps a removable component sandbox nearby, and Settings
          holds preferences and account actions.
        </Card.Description>
      </Card.Body>
    </Card>
  )
}
