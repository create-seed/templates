import { LucideIcon } from 'lucide-react-native'
import { useResolveClassNames } from 'uniwind'

interface ShellUiIconProps {
  className?: string
  colorClassName?: string
  icon: LucideIcon
  size?: number
  strokeWidth?: number
}

export function ShellUiIcon({
  className,
  colorClassName = 'text-neutral-950 dark:text-neutral-50',
  icon: Icon,
  size = 24,
  strokeWidth = 2,
}: ShellUiIconProps) {
  const colorStyles = useResolveClassNames(colorClassName)
  const iconStyles = useResolveClassNames(className ?? '')

  return <Icon color={colorStyles.color} size={size} strokeWidth={strokeWidth} style={iconStyles} />
}
