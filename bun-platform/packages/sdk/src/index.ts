import type { RPCLinkOptions } from '@orpc/client/fetch'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { AppRouterClient } from '@bun-platform/api/router'

import { resolveRpcUrl } from './lib/rpc-url'

export type OrpcClientFetch = (input: Request | URL | string, init?: RequestInit) => Promise<Response>

export type CreateOrpcClientOptions = {
  baseUrl: string
  credentials?: 'include' | 'omit' | 'same-origin'
  fetch?: OrpcClientFetch
  headers?: RPCLinkOptions<Record<never, never>>['headers']
  rpcPath?: string
}

export type OrpcClient = AppRouterClient

export function createOrpcClient(options: CreateOrpcClientOptions): OrpcClient {
  const {
    baseUrl,
    credentials = 'include',
    fetch: fetchImplementation = fetch as OrpcClientFetch,
    headers,
    rpcPath = '/rpc',
  } = options
  const link = new RPCLink({
    fetch(request, init) {
      return fetchImplementation(request, {
        ...init,
        credentials,
      })
    },
    headers,
    url: resolveRpcUrl(baseUrl, rpcPath),
  })

  return createORPCClient(link) as OrpcClient
}
