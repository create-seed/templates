import type { ReactNode } from 'react'

import { ShellUiFrame } from '../ui/shell-ui-frame'

import { ShellFeatureHeader, type ShellFeatureHeaderProps } from './shell-feature-header'

interface ShellFeatureFrameProps extends ShellFeatureHeaderProps {
  children: ReactNode
}

export function ShellFeatureFrame({ children, initialOrganizations, session }: ShellFeatureFrameProps) {
  return (
    <ShellUiFrame header={<ShellFeatureHeader initialOrganizations={initialOrganizations} session={session} />}>
      {children}
    </ShellUiFrame>
  )
}
