import { type SolanaClusterId, type SolanaSignInInput, type UiWalletAccount, type useSignIn } from '@wallet-ui/react'

export interface WalletSignInSession {
  issuedAt: Date
  nonce: string
  requestId: string
}

export const expiresAtSeconds = 60
export function createSignInPayload({
  account,
  cluster,
  session,
  statement,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
  session: WalletSignInSession
  statement: string
}) {
  const url = new URL(window.location.href)
  const domain = url.host
  const uri = url.origin
  const address = account.address
  const version = '1'
  const chainId: SolanaClusterId = cluster
  const issuedAt = session.issuedAt.toISOString()
  const expirationTime = new Date(session.issuedAt.getTime() + expiresAtSeconds * 1000).toISOString()
  const notBefore = issuedAt
  const resources: string[] = [`${uri}/bar`, `${uri}/baz`, `${uri}/foo`]

  const payload: SolanaSignInInput = {
    address,
    chainId,
    domain,
    expirationTime,
    issuedAt,
    nonce: session.nonce,
    notBefore,
    requestId: session.requestId,
    resources: resources.length ? resources : undefined,
    statement,
    uri,
    version,
  }

  return {
    payload,
  }
}

export function createSignInSession(): WalletSignInSession {
  return {
    issuedAt: new Date(),
    nonce: createNonce(),
    requestId: createRequestId(),
  }
}

export async function executeWalletSignIn({
  account,
  cluster,
  session,
  signInWithWallet,
  statement,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
  session: WalletSignInSession
  signInWithWallet: ReturnType<typeof useSignIn>
  statement: string
}) {
  const { account: signedInAccount } = await signInWithWallet(
    createSignInPayload({ account, cluster, session, statement }).payload,
  )

  if (signedInAccount.address !== account.address) {
    throw new Error('Signed-in account does not match the requested account.')
  }

  return signedInAccount
}

function createNonce(length = 16) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

function createRequestId() {
  return crypto.randomUUID()
}
