import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import * as SystemUI from 'expo-system-ui'
import { LucideComputer, LucideIcon, LucideMoon, LucideSun } from 'lucide-react-native'
import { useEffect } from 'react'
import { ThemeName, useUniwind } from 'uniwind'

export type Theme = 'system' | ThemeName
export type ThemeOption = { icon: LucideIcon; label: string; name: Theme }

const themes: ThemeOption[] = [
  { icon: LucideMoon, label: 'Dark', name: 'dark' },
  { icon: LucideSun, label: 'Light', name: 'light' },
  { icon: LucideComputer, label: 'System', name: 'system' },
]

const BG_DARK = '#0A0A0A'
const BG_LIGHT = '#FFFFFF'
const FG_DARK = '#FAFAFA'
const FG_LIGHT = '#111827'

export interface UseThemeResult {
  activeTheme: Theme
  backgroundColor: string
  foregroundColor: string
  isDark: boolean
  isLight: boolean
  screenOptions: NativeStackNavigationOptions
  theme: ThemeName
  themes: ThemeOption[]
}

export function useTheme(): UseThemeResult {
  const { hasAdaptiveThemes, theme } = useUniwind()
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  const backgroundColor = isLight ? BG_LIGHT : BG_DARK
  const foregroundColor = isLight ? FG_LIGHT : FG_DARK
  const screenOptions: NativeStackNavigationOptions = {
    contentStyle: { backgroundColor },
    headerStyle: { backgroundColor },
    headerTintColor: foregroundColor,
    headerTitleStyle: { color: foregroundColor },
  }

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => undefined)
  }, [backgroundColor])

  return {
    activeTheme: hasAdaptiveThemes ? 'system' : theme,
    backgroundColor,
    foregroundColor,
    isDark,
    isLight,
    screenOptions,
    theme,
    themes,
  }
}
