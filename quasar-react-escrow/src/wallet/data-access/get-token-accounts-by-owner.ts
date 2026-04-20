import { address, type Address } from '@solana/kit'

import type { SolanaClient } from '@/solana/data-access/solana-client'

const TOKEN_2022_PROGRAM_ADDRESS = address('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const TOKEN_PROGRAM_ADDRESS = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export interface WalletTokenAccount {
  address: Address
  decimals: number
  mint: Address
  programId: Address
  programLabel: 'Token-2022' | 'Token'
  rawAmount: string
  state: 'frozen' | 'initialized' | 'uninitialized'
  uiAmountString: string
}

export async function getWalletTokenAccountsByOwner({
  ownerAddress,
  rpc,
}: {
  ownerAddress: Address
  rpc: SolanaClient['rpc']
}) {
  const [token2022Accounts, tokenAccounts] = await Promise.all([
    getTokenAccountsByOwner(rpc, {
      ownerAddress,
      programId: TOKEN_2022_PROGRAM_ADDRESS,
    }),
    getTokenAccountsByOwner(rpc, {
      ownerAddress,
      programId: TOKEN_PROGRAM_ADDRESS,
    }),
  ])

  return [
    ...mapWalletTokenAccounts(token2022Accounts, 'Token-2022'),
    ...mapWalletTokenAccounts(tokenAccounts, 'Token'),
  ].sort((left, right) => {
    const byMint = left.mint.localeCompare(right.mint)

    if (byMint !== 0) {
      return byMint
    }

    return left.address.localeCompare(right.address)
  })
}

async function getTokenAccountsByOwner(
  rpc: SolanaClient['rpc'],
  { ownerAddress, programId }: { ownerAddress: Address; programId: Address },
) {
  return await rpc
    .getTokenAccountsByOwner(ownerAddress, { programId }, { commitment: 'confirmed', encoding: 'jsonParsed' })
    .send()
    .then((response) => response.value ?? [])
}

function mapWalletTokenAccounts(
  tokenAccounts: Awaited<ReturnType<typeof getTokenAccountsByOwner>>,
  programLabel: WalletTokenAccount['programLabel'],
) {
  return tokenAccounts.map((tokenAccount) => ({
    address: tokenAccount.pubkey,
    decimals: tokenAccount.account.data.parsed.info.tokenAmount.decimals,
    mint: tokenAccount.account.data.parsed.info.mint,
    programId: tokenAccount.account.owner,
    programLabel,
    rawAmount: tokenAccount.account.data.parsed.info.tokenAmount.amount,
    state: tokenAccount.account.data.parsed.info.state,
    uiAmountString: tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString,
  }))
}

export { TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS }
