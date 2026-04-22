import { Button, Card } from 'heroui-native'
import { View } from 'react-native'

export function DevUiToastCard({
  showErrorToast,
  showSuccessToast,
  showWarningToast,
}: {
  showErrorToast: () => void
  showSuccessToast: () => void
  showWarningToast: () => void
}) {
  return (
    <Card variant="secondary">
      <Card.Body className="gap-3">
        <Card.Title>Toasts</Card.Title>
        <Card.Description>Use these buttons to preview transient success and error notifications.</Card.Description>
        <View className="flex-row flex-wrap gap-2">
          <Button className="" onPress={showSuccessToast}>
            Success
          </Button>
          <Button className="" onPress={showWarningToast} variant="secondary">
            Warning
          </Button>
          <Button className="" onPress={showErrorToast} variant="danger">
            Error
          </Button>
        </View>
      </Card.Body>
    </Card>
  )
}
