import { type PropsWithChildren, Suspense } from 'react'
import { Outlet } from 'react-router'

import { ShellUiFooter } from '../ui/shell-ui-footer'
import { type HeaderLink, ShellUiHeader } from '../ui/shell-ui-header'

export function ShellFeatureLayout({ children = <Outlet />, links }: PropsWithChildren<{ links: HeaderLink[] }>) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <ShellUiHeader links={links} />
      <main className="flex flex-1 flex-col items-center justify-center gap-2 bg-muted p-4 sm:p-6 lg:p-12 dark:bg-background">
        <Suspense>{children}</Suspense>
      </main>
      <ShellUiFooter />
    </div>
  )
}

export default ShellFeatureLayout
