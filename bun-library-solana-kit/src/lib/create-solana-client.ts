import { createClient } from '@solana/kit'
import { rpc } from '@solana/kit-plugin-rpc'
import { getWsUrl } from './get-ws-url.ts'

export function createSolanaClient({ url, urlWs }: { url: string; urlWs?: string }) {
  urlWs = urlWs ?? getWsUrl(url)
  return createClient().use(rpc(url, urlWs ? { url: urlWs } : undefined))
}

export type SolanaClient = ReturnType<typeof createSolanaClient>
