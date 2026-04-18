import {
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  compileTransactionMessage,
  createTransactionMessage,
  getBase58Decoder,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  type Instruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from '@solana/kit'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type SolanaClusterId, type UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useState } from 'react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import {
  COUNTER_ACCOUNT_DISCRIMINATOR,
  CounterAccountCodec,
  CounterClient,
  PROGRAM_ADDRESS,
  PROGRAM_ERRORS,
} from '../../../program/client'
import { getCounterAccountQueryKey } from './use-counter-account-query'

const counterClient = new CounterClient()
const COUNTER_ACCOUNT_SPACE = BigInt(COUNTER_ACCOUNT_DISCRIMINATOR.length + CounterAccountCodec.fixedSize)

type CounterProgramMutation =
  | { type: 'decrement' }
  | { type: 'delete' }
  | { type: 'increment' }
  | { type: 'initialize' }
  | { type: 'set'; value: bigint }

export function useCounterProgramMutation({
  account,
  client,
  cluster,
}: {
  account: UiWalletAccount
  client: SolanaClient
  cluster: SolanaClusterId
}) {
  const queryClient = useQueryClient()
  const transactionSigner = useWalletUiSigner({ account })
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [lastAction, setLastAction] = useState<CounterProgramMutation['type'] | null>(null)
  const [signature, setSignature] = useState<null | string>(null)
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (action: CounterProgramMutation) => {
      await assertProgramIsAvailable(client)

      return executeCounterProgramMutation({
        action,
        client,
        transactionSigner,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getCounterAccountQueryKey(account.address, cluster),
      })
    },
  })

  async function run(action: CounterProgramMutation) {
    setErrorMessage(null)
    setLastAction(action.type)
    setSignature(null)

    try {
      const nextSignature = await mutateAsync(action)

      setSignature(nextSignature)

      return nextSignature
    } catch (error) {
      setErrorMessage(formatCounterProgramError(error))

      return null
    }
  }

  return {
    decrement() {
      return run({ type: 'decrement' })
    },
    deleteCounter() {
      return run({ type: 'delete' })
    },
    errorMessage,
    increment() {
      return run({ type: 'increment' })
    },
    initialize() {
      return run({ type: 'initialize' })
    },
    isLoading: isPending,
    lastAction,
    setValue(value: bigint) {
      return run({ type: 'set', value })
    },
    signature,
  }
}

async function assertProgramIsAvailable(client: SolanaClient) {
  const { value: programAccount } = await client.rpc
    .getAccountInfo(PROGRAM_ADDRESS, { commitment: 'confirmed', encoding: 'base64' })
    .send()

  if (!programAccount) {
    throw new Error(`Program ${PROGRAM_ADDRESS} is not deployed on this cluster.`)
  }

  if (!programAccount.executable) {
    throw new Error(`Program ${PROGRAM_ADDRESS} exists on this cluster but is not executable.`)
  }
}

async function createInstruction(
  action: CounterProgramMutation,
  owner: ReturnType<typeof useWalletUiSigner>['address'],
) {
  switch (action.type) {
    case 'decrement':
      return counterClient.createDecrementInstruction({ owner })
    case 'delete':
      return counterClient.createDeleteInstruction({ owner })
    case 'increment':
      return counterClient.createIncrementInstruction({ owner })
    case 'initialize':
      return counterClient.createInitializeInstruction({ owner })
    case 'set':
      return counterClient.createSetInstruction({ owner, value: action.value })
  }
}

async function executeCounterProgramMutation({
  action,
  client,
  transactionSigner,
}: {
  action: CounterProgramMutation
  client: SolanaClient
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  const instruction = await createInstruction(action, transactionSigner.address)

  return executeInstruction({
    action,
    client,
    instruction,
    transactionSigner,
  })
}

async function executeInstruction({
  action,
  client,
  instruction,
  transactionSigner,
}: {
  action: CounterProgramMutation
  client: SolanaClient
  instruction: Instruction
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (transactionMessage) => setTransactionMessageFeePayerSigner(transactionSigner, transactionMessage),
    (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
    (transactionMessage) => appendTransactionMessageInstruction(instruction, transactionMessage),
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

  const counterAccountRent =
    action.type === 'initialize'
      ? await client.rpc.getMinimumBalanceForRentExemption(COUNTER_ACCOUNT_SPACE, { commitment: 'confirmed' }).send()
      : 0n
  const requiredBalance = fee + counterAccountRent

  if (balance < requiredBalance) {
    throw new Error(
      action.type === 'initialize'
        ? 'Not enough SOL to pay transaction fees and fund the counter account on this cluster.'
        : 'Not enough SOL to pay transaction fees on this cluster.',
    )
  }

  const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
  const signature = getBase58Decoder().decode(signatureBytes)

  if (!signature) {
    throw new Error('Transaction submitted but no signature was returned by the wallet adapter.')
  }

  return signature
}

function formatCounterProgramError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred'
  const match = message.match(/custom program error: 0x([0-9a-f]+)/i)

  if (!match) {
    return message
  }

  const code = Number.parseInt(match[1], 16)
  const programError = PROGRAM_ERRORS[code]

  return programError?.msg ? `${programError.name}: ${programError.msg}` : (programError?.name ?? message)
}
