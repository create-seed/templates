import type { ReactNode } from 'react'

interface ShellUiFrameProps {
  children: ReactNode
  header: ReactNode
}

export function ShellUiFrame({ children, header }: ShellUiFrameProps) {
  return (
    <div className="grid h-svh min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
      {header}
      <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto">{children}</div>
    </div>
  )
}
