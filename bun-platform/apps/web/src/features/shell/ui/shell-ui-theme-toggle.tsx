import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@bun-platform/ui/components/button'
import { Skeleton } from '@bun-platform/ui/components/skeleton'

export function ShellUiThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Skeleton className="size-7 rounded-none" />
  }

  const isDark = resolvedTheme !== 'light'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <Button
      aria-label={label}
      aria-pressed={isDark}
      onClick={() => setTheme(nextTheme)}
      size="icon-sm"
      title={label}
      type="button"
      variant="ghost"
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
