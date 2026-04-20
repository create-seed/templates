import { type Address, getBase64Decoder } from '@solana/kit'
import { type ReadonlyUint8Array, type UiWalletAccount, type useWalletAccountMessageSigner } from '@wallet-ui/react'

export async function executeWalletSignMessage({
  account,
  messageSigner,
  text,
}: {
  account: UiWalletAccount
  messageSigner: ReturnType<typeof useWalletAccountMessageSigner>
  text: string
}) {
  const [result] = await messageSigner.modifyAndSignMessages([
    {
      content: new TextEncoder().encode(text),
      signatures: {},
    },
  ])
  const signature = result?.signatures[account.address as Address]

  if (!signature) {
    throw new Error('Message signed but no signature was returned for this account.')
  }

  return getBase64Decoder().decode(signature as ReadonlyUint8Array)
}
