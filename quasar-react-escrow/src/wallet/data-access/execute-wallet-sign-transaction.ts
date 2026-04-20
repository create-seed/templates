import type { UiWalletAccount } from '@wallet-ui/react'

import { getAddMemoInstruction } from '@solana-program/memo'
import {
  address,
  appendTransactionMessageInstruction,
  assertIsFullySignedTransaction,
  assertIsTransactionWithBlockhashLifetime,
  assertIsTransactionWithinSizeLimit,
  compileTransaction,
  compileTransactionMessage,
  createTransactionMessage,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  getSignatureFromTransaction,
  getTransactionCodec,
  pipe,
  type sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type TransactionMessageBytesBase64,
} from '@solana/kit'
import { type useSignTransaction } from '@solana/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

export async function executeWalletSignTransaction({
  account,
  client,
  sendAndConfirmTransaction,
  signTransactionWithWallet,
  text,
}: {
  account: UiWalletAccount
  client: SolanaClient
  sendAndConfirmTransaction: ReturnType<typeof sendAndConfirmTransactionFactory>
  signTransactionWithWallet: ReturnType<typeof useSignTransaction>
  text: string
}) {
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
  const feePayer = address(account.address)
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (transactionMessage) => setTransactionMessageFeePayer(feePayer, transactionMessage),
    (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
    (transactionMessage) =>
      appendTransactionMessageInstruction(getAddMemoInstruction({ memo: text }), transactionMessage),
  )
  const encodedMessage = getCompiledTransactionMessageEncoder().encode(compileTransactionMessage(message))
  const [{ value: balance }, { value: fee }] = await Promise.all([
    client.rpc.getBalance(feePayer, { commitment: 'confirmed' }).send(),
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

  const transaction = compileTransaction(message)
  const transactionCodec = getTransactionCodec()
  const { signedTransaction: signedTransactionBytes } = await signTransactionWithWallet({
    transaction: new Uint8Array(transactionCodec.encode(transaction)),
  })
  const signedTransaction = Object.freeze({
    ...transactionCodec.decode(signedTransactionBytes),
    lifetimeConstraint: transaction.lifetimeConstraint,
  })

  assertIsFullySignedTransaction(signedTransaction)
  assertIsTransactionWithinSizeLimit(signedTransaction)
  assertIsTransactionWithBlockhashLifetime(signedTransaction)

  const signature = getSignatureFromTransaction(signedTransaction)
  if (!signature) {
    throw new Error('Transaction signed but no signature was returned by the wallet adapter.')
  }

  await sendAndConfirmTransaction(signedTransaction, { commitment: 'confirmed' })

  return signature
}
