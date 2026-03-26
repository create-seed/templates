import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@bun-platform/ui/components/sonner'

import type { orpc } from '@/lib/orpc'
import { getUser } from '@/features/auth/data-access/get-user'
import { getOrganizationListMine } from '@/features/organization/data-access/get-organization-list-mine'
import { ShellFeatureFrame } from '@/features/shell/feature/shell-feature-frame'
import { AppProviders } from '@/lib/app-providers'
import appCss from '../index.css?url'

export interface RouterAppContext {
  orpc: typeof orpc
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async () => {
    const session = await getUser()
    const organizations = session ? await getOrganizationListMine() : null

    return { organizations, session }
  },
  component: RootDocument,

  head: () => ({
    links: [
      {
        href: appCss,
        rel: 'stylesheet',
      },
    ],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: 'Platform Tweaks',
      },
    ],
  }),
})

function RootDocument() {
  const { organizations, session } = Route.useRouteContext()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppProviders>
          <ShellFeatureFrame initialOrganizations={organizations} session={session}>
            <Outlet />
          </ShellFeatureFrame>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
          <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
        </AppProviders>
        <Scripts />
      </body>
    </html>
  )
}
