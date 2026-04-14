import { Description, Label, Radio, RadioGroup } from 'heroui-native'
import { View } from 'react-native'
import { Uniwind } from 'uniwind'

import { Theme, useTheme } from '@/features/shell/data-access/use-theme'
import { ShellUiIcon } from '@/features/shell/ui/shell-ui-icon'
import { cn } from '@/features/shell/utils/cn'

export function ShellUiThemeSwitcher() {
  const { activeTheme, themes } = useTheme()

  return (
    <RadioGroup onValueChange={(value) => Uniwind.setTheme(value as Theme)} value={activeTheme}>
      {themes.map((t) => (
        <RadioGroup.Item
          className="w-full rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-neutral-900"
          key={t.name}
          value={t.name}
        >
          {({ isSelected }) => (
            <>
              <View className={cn('flex-1 flex-row items-center gap-3', isSelected ? 'opacity-100' : 'opacity-90')}>
                <ShellUiIcon icon={t.icon} />
                <View className="flex-1 gap-1">
                  <Label className={cn(isSelected ? 'text-blue-700 dark:text-blue-300' : undefined)}>{t.label}</Label>
                  <Description className="text-sm text-neutral-600 dark:text-neutral-300">
                    {t.name === 'system' ? 'Use the device setting' : `${t.label} appearance`}
                  </Description>
                </View>
              </View>
              <Radio />
            </>
          )}
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  )
}
