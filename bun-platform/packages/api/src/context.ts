import type { Context as HonoContext } from 'hono'
import { auth } from '@bun-platform/auth'

export type CreateContextOptions = {
  context: HonoContext
}

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  return {
    requestHeaders: context.req.raw.headers,
    responseHeaders: new Headers(),
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
