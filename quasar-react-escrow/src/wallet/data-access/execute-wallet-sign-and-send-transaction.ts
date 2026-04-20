import { getAddMemoInstruction } from '@solana-program/memo'
import {
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  compileTransactionMessage,
  createTransactionMessage,
  getBase58Decoder,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from '@solana/kit'
import { type useWalletUiSigner } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

export async function executeWalletSignAndSendTransaction({
  client,
  text,
  transactionSigner,
}: {
  client: SolanaClient
  text: string
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (transactionMessage) => setTransactionMessageFeePayerSigner(transactionSigner, transactionMessage),
    (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
    (transactionMessage) =>
      appendTransactionMessageInstruction(getAddMemoInstruction({ memo: text }), transactionMessage),
  )

  assertIsTransactionMessageWithSingleSendingSigner(message)

  const encodedMessage = getCompiledTransactionMessageEncoder().encode(compileTransactionMessage(message))
  const [{ value: balance }, { value: fee }] = await Promise.all([
    client.rpc.getBalance(transactionSigner.address, { commitment: 'confirmed' }).send(),
    client.rpc
      .getFeeForMessage(getBase64Decoder().decode(encodedMessage) as TransactionMessageBytesBase64, {
        commitment: 'confirmed',
      })
      .send(),
  ])

  if (fee === null) {
    throw new Error('Unable to estimate the transaction fee. Try again with a fresh blockhash.')
  }
  if (balance < fee) {
    throw new Error('Not enough SOL to pay transaction fees on this cluster.')
  }

  const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
  const signature = getBase58Decoder().decode(signatureBytes)

  if (!signature) {
    throw new Error('Transaction submitted but no signature was returned by the wallet adapter.')
  }

  return signature
}
