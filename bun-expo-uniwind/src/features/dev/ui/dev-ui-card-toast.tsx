import { Button, Card } from 'heroui-native'
import { View } from 'react-native'

export function DevUiCardToast({
  showErrorToast,
  showSuccessToast,
  showWarningToast,
}: {
  showErrorToast: () => void
  showSuccessToast: () => void
  showWarningToast: () => void
}) {
  return (
    <Card>
      <Card.Body className="gap-3">
        <Card.Title>Toasts</Card.Title>
        <Card.Description>Use these buttons to preview transient notifications.</Card.Description>
        <View className="flex-row flex-wrap gap-2">
          <Button onPress={showSuccessToast}>Success</Button>
          <Button onPress={showWarningToast} variant="secondary">
            Warning
          </Button>
          <Button onPress={showErrorToast} variant="danger">
            Error
          </Button>
        </View>
      </Card.Body>
    </Card>
  )
}
