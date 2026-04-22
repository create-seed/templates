import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { useTheme } from '@/features/shell/data-access/use-theme'

export const unstable_settings = {
  initialRouteName: 'home',
}

export default function AppLayout() {
  const { backgroundColor } = useTheme()

  return (
    <NativeTabs backgroundColor={backgroundColor} disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon md="home" sf="house.fill" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dev">
        <NativeTabs.Trigger.Icon md="code" sf="wrench.and.screwdriver.fill" />
        <NativeTabs.Trigger.Label>Dev</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon md="settings" sf="gearshape.fill" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
