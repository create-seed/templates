import { useLoaderData } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { ShellUiNotFoundCard } from '@/shell/feature/shell-ui-not-found-card'

export function ShellNotFoundFeature() {
  const {
    description = 'The route you opened does not exist, or it may have moved while the app was being reshaped.',
    links = [],
    title = 'Page not found',
  } = useLoaderData<ShellNotFoundProps>()

  return <ShellUiNotFoundCard description={description} links={links} title={title} />
}

export { ShellNotFoundFeature as Component }
