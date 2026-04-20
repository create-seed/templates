import {
  AccountRole,
  type Address,
  address,
  addSignersToInstruction,
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  compileTransactionMessage,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase58Decoder,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  type Instruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
  type TransactionSigner,
} from '@solana/kit'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useState } from 'react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { TOKEN_PROGRAM_ADDRESS } from '@/wallet/data-access/get-token-accounts-by-owner'

import {
  ESCROW_DISCRIMINATOR,
  EscrowClient,
  EscrowCodec,
  findEscrowAddress,
  PROGRAM_ADDRESS,
} from '../../../program/client'

const escrowClient = new EscrowClient()
const ESCROW_ACCOUNT_SPACE = BigInt(ESCROW_DISCRIMINATOR.length + EscrowCodec.fixedSize)
const TOKEN_ACCOUNT_SPACE = 165n
const U64_MAX = 18446744073709551615n

export interface EscrowOfferPayload {
  deposit: string
  escrow: string
  maker: string
  makerTaB: string
  mintA: string
  mintB: string
  receive: string
  vaultTaA: string
}

interface EscrowGeneratedAccount {
  address: string
  label: string
}

interface EscrowMutationDetails {
  generatedAccounts: EscrowGeneratedAccount[]
  offerPayload: EscrowOfferPayload | null
}

interface EscrowMutationResult {
  details: EscrowMutationDetails
  signature: string
}

type EscrowProgramMutation =
  | {
      deposit: string
      makerTaA: string
      makerTaB: string
      mintA: string
      mintB: string
      receive: string
      type: 'make'
      vaultTaA: string
    }
  | {
      maker: string
      makerTaA: string
      mintA: string
      type: 'refund'
      vaultTaA: string
    }
  | {
      maker: string
      makerTaB: string
      mintA: string
      mintB: string
      takerTaA: string
      takerTaB: string
      type: 'take'
      vaultTaA: string
    }

type GeneratedSignerSpec = {
  index: number
  signer: TransactionSigner
}

export function useEscrowProgramMutation({ account, client }: { account: UiWalletAccount; client: SolanaClient }) {
  const queryClient = useQueryClient()
  const transactionSigner = useWalletUiSigner({ account })
  const [details, setDetails] = useState<EscrowMutationDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [lastAction, setLastAction] = useState<EscrowProgramMutation['type'] | null>(null)
  const [signature, setSignature] = useState<null | string>(null)
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (action: EscrowProgramMutation) => {
      await assertProgramIsAvailable(client)

      return executeEscrowProgramMutation({
        action,
        client,
        transactionSigner,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['escrow-account'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['wallet-token-accounts'],
      })
    },
  })

  async function run(action: EscrowProgramMutation) {
    setDetails(null)
    setErrorMessage(null)
    setLastAction(action.type)
    setSignature(null)

    try {
      const result = await mutateAsync(action)

      setDetails(result.details)
      setSignature(result.signature)

      return result
    } catch (error) {
      setErrorMessage(formatEscrowProgramError(error))

      return null
    }
  }

  return {
    details,
    errorMessage,
    isLoading: isPending,
    lastAction,
    makeOffer(input: Omit<Extract<EscrowProgramMutation, { type: 'make' }>, 'type'>) {
      return run({ type: 'make', ...input })
    },
    refundOffer(input: Omit<Extract<EscrowProgramMutation, { type: 'refund' }>, 'type'>) {
      return run({ type: 'refund', ...input })
    },
    signature,
    takeOffer(input: Omit<Extract<EscrowProgramMutation, { type: 'take' }>, 'type'>) {
      return run({ type: 'take', ...input })
    },
  }
}

function addGeneratedSignerAccounts(instruction: Instruction, signerSpecs: GeneratedSignerSpec[]) {
  if (!instruction.accounts || signerSpecs.length === 0) {
    return instruction
  }

  const signerByIndex = new Map(signerSpecs.map((signerSpec) => [signerSpec.index, signerSpec.signer]))

  return addSignersToInstruction(
    signerSpecs.map((signerSpec) => signerSpec.signer),
    {
      ...instruction,
      accounts: instruction.accounts.map((account, index) => {
        const signer = signerByIndex.get(index)

        if (!account || !signer) {
          return account
        }

        return {
          ...account,
          role: AccountRole.WRITABLE_SIGNER,
        }
      }),
    },
  )
}

async function assertClassicTokenProgramAccounts(
  client: SolanaClient,
  accounts: Array<{
    address: Address
    label: string
  }>,
) {
  const uniqueAccounts = [...new Map(accounts.map((account) => [account.address, account])).values()]
  const accountInfos = await Promise.all(
    uniqueAccounts.map(async (account) => ({
      account,
      info: await client.rpc.getAccountInfo(account.address, { commitment: 'confirmed', encoding: 'base64' }).send(),
    })),
  )

  for (const { account, info } of accountInfos) {
    if (!info.value) {
      throw new Error(`${account.label} was not found on this cluster.`)
    }

    if (info.value.owner !== TOKEN_PROGRAM_ADDRESS) {
      throw new Error(
        `${account.label} is owned by ${info.value.owner}. This escrow example supports only classic SPL Token (${TOKEN_PROGRAM_ADDRESS}), not Token-2022 or other token programs.`,
      )
    }
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

async function createGeneratedAccount({
  generatedAccounts,
  label,
  signerIndex,
  signerSpecs,
}: {
  generatedAccounts: EscrowGeneratedAccount[]
  label: string
  signerIndex: number
  signerSpecs: GeneratedSignerSpec[]
}) {
  const signer = await generateKeyPairSigner()

  generatedAccounts.push({
    address: signer.address,
    label,
  })
  signerSpecs.push({
    index: signerIndex,
    signer,
  })

  return signer.address
}

async function executeEscrowProgramMutation({
  action,
  client,
  transactionSigner,
}: {
  action: EscrowProgramMutation
  client: SolanaClient
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  switch (action.type) {
    case 'make':
      return executeMakeOffer({
        action,
        client,
        transactionSigner,
      })
    case 'refund':
      return executeRefundOffer({
        action,
        client,
        transactionSigner,
      })
    case 'take':
      return executeTakeOffer({
        action,
        client,
        transactionSigner,
      })
  }
}

async function executeInstruction({
  client,
  instruction,
  insufficientFundsMessage,
  rentExemptionSpaces,
  transactionSigner,
}: {
  client: SolanaClient
  instruction: Instruction
  insufficientFundsMessage: string
  rentExemptionSpaces: bigint[]
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
  const [{ value: balance }, { value: fee }, rentExemptionLamports] = await Promise.all([
    client.rpc.getBalance(transactionSigner.address, { commitment: 'confirmed' }).send(),
    client.rpc
      .getFeeForMessage(getBase64Decoder().decode(encodedMessage) as TransactionMessageBytesBase64, {
        commitment: 'confirmed',
      })
      .send(),
    getRentExemptionTotal(client, rentExemptionSpaces),
  ])

  if (fee === null) {
    throw new Error('Unable to estimate the transaction fee. Try again with a fresh blockhash.')
  }

  if (balance < fee + rentExemptionLamports) {
    throw new Error(
      rentExemptionLamports > 0n ? insufficientFundsMessage : 'Not enough SOL to pay transaction fees on this cluster.',
    )
  }

  const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
  const signature = getBase58Decoder().decode(signatureBytes)

  if (!signature) {
    throw new Error('Transaction submitted but no signature was returned by the wallet adapter.')
  }

  return signature
}

async function executeMakeOffer({
  action,
  client,
  transactionSigner,
}: {
  action: Extract<EscrowProgramMutation, { type: 'make' }>
  client: SolanaClient
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  const deposit = parseU64Field('Deposit amount', action.deposit)
  const maker = transactionSigner.address
  const makerTaA = parseAddressField('Deposit token account', action.makerTaA)
  const mintA = parseAddressField('Deposit mint', action.mintA)
  const mintB = parseAddressField('Requested mint', action.mintB)
  const receive = parseU64Field('Receive amount', action.receive)
  const generatedAccounts: EscrowGeneratedAccount[] = []
  const signerSpecs: GeneratedSignerSpec[] = []

  const makerTaB =
    parseOptionalAddressField(action.makerTaB) ??
    (await createGeneratedAccount({
      generatedAccounts,
      label: 'Maker receive token account',
      signerIndex: 5,
      signerSpecs,
    }))
  const vaultTaA =
    parseOptionalAddressField(action.vaultTaA) ??
    (await createGeneratedAccount({
      generatedAccounts,
      label: 'Escrow vault token account',
      signerIndex: 6,
      signerSpecs,
    }))

  await assertClassicTokenProgramAccounts(client, [
    {
      address: makerTaA,
      label: 'Deposit token account',
    },
    {
      address: mintA,
      label: 'Deposit mint',
    },
    {
      address: mintB,
      label: 'Requested mint',
    },
    ...(parseOptionalAddressField(action.makerTaB)
      ? [
          {
            address: makerTaB,
            label: 'Maker receive token account',
          },
        ]
      : []),
    ...(parseOptionalAddressField(action.vaultTaA)
      ? [
          {
            address: vaultTaA,
            label: 'Escrow vault token account',
          },
        ]
      : []),
  ])

  let instruction = await escrowClient.createMakeInstruction({
    deposit,
    maker,
    makerTaA,
    makerTaB,
    mintA,
    mintB,
    receive,
    vaultTaA,
  })
  instruction = addGeneratedSignerAccounts(instruction, signerSpecs)

  const signature = await executeInstruction({
    client,
    instruction,
    insufficientFundsMessage:
      'Not enough SOL to pay transaction fees and fund any newly created escrow accounts on this cluster.',
    rentExemptionSpaces: [ESCROW_ACCOUNT_SPACE, ...signerSpecs.map(() => TOKEN_ACCOUNT_SPACE)],
    transactionSigner,
  })
  const escrowAddress = await findEscrowAddress(maker)

  return {
    details: {
      generatedAccounts,
      offerPayload: {
        deposit: deposit.toString(),
        escrow: escrowAddress,
        maker,
        makerTaB,
        mintA,
        mintB,
        receive: receive.toString(),
        vaultTaA,
      },
    } satisfies EscrowMutationDetails,
    signature,
  } satisfies EscrowMutationResult
}

async function executeRefundOffer({
  action,
  client,
  transactionSigner,
}: {
  action: Extract<EscrowProgramMutation, { type: 'refund' }>
  client: SolanaClient
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  const maker = parseAddressField('Maker address', action.maker)

  if (maker !== transactionSigner.address) {
    throw new Error('Only the maker wallet can refund this escrow.')
  }

  const makerTaA = parseAddressField('Refund destination token account', action.makerTaA)
  const mintA = parseAddressField('Deposit mint', action.mintA)
  const vaultTaA = parseAddressField('Escrow vault token account', action.vaultTaA)

  await assertClassicTokenProgramAccounts(client, [
    {
      address: makerTaA,
      label: 'Refund destination token account',
    },
    {
      address: mintA,
      label: 'Deposit mint',
    },
    {
      address: vaultTaA,
      label: 'Escrow vault token account',
    },
  ])

  const instruction = await escrowClient.createRefundInstruction({
    maker,
    makerTaA,
    mintA,
    vaultTaA,
  })
  const signature = await executeInstruction({
    client,
    instruction,
    insufficientFundsMessage: 'Not enough SOL to pay transaction fees on this cluster.',
    rentExemptionSpaces: [],
    transactionSigner,
  })

  return {
    details: {
      generatedAccounts: [],
      offerPayload: null,
    } satisfies EscrowMutationDetails,
    signature,
  } satisfies EscrowMutationResult
}

async function executeTakeOffer({
  action,
  client,
  transactionSigner,
}: {
  action: Extract<EscrowProgramMutation, { type: 'take' }>
  client: SolanaClient
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}) {
  const maker = parseAddressField('Maker address', action.maker)
  const makerTaB = parseAddressField('Maker receive token account', action.makerTaB)
  const mintA = parseAddressField('Deposit mint', action.mintA)
  const mintB = parseAddressField('Requested mint', action.mintB)
  const taker = transactionSigner.address
  const takerTaB = parseAddressField('Taker payment token account', action.takerTaB)
  const vaultTaA = parseAddressField('Escrow vault token account', action.vaultTaA)
  const generatedAccounts: EscrowGeneratedAccount[] = []
  const signerSpecs: GeneratedSignerSpec[] = []

  const takerTaA =
    parseOptionalAddressField(action.takerTaA) ??
    (await createGeneratedAccount({
      generatedAccounts,
      label: 'Taker receive token account',
      signerIndex: 5,
      signerSpecs,
    }))

  await assertClassicTokenProgramAccounts(client, [
    {
      address: makerTaB,
      label: 'Maker receive token account',
    },
    {
      address: mintA,
      label: 'Deposit mint',
    },
    {
      address: mintB,
      label: 'Requested mint',
    },
    ...(parseOptionalAddressField(action.takerTaA)
      ? [
          {
            address: takerTaA,
            label: 'Taker receive token account',
          },
        ]
      : []),
    {
      address: takerTaB,
      label: 'Taker payment token account',
    },
    {
      address: vaultTaA,
      label: 'Escrow vault token account',
    },
  ])

  let instruction = await escrowClient.createTakeInstruction({
    maker,
    makerTaB,
    mintA,
    mintB,
    taker,
    takerTaA,
    takerTaB,
    vaultTaA,
  })
  instruction = addGeneratedSignerAccounts(instruction, signerSpecs)

  const signature = await executeInstruction({
    client,
    instruction,
    insufficientFundsMessage:
      'Not enough SOL to pay transaction fees and fund any newly created escrow accounts on this cluster.',
    rentExemptionSpaces: signerSpecs.map(() => TOKEN_ACCOUNT_SPACE),
    transactionSigner,
  })

  return {
    details: {
      generatedAccounts,
      offerPayload: null,
    } satisfies EscrowMutationDetails,
    signature,
  } satisfies EscrowMutationResult
}

function formatEscrowProgramError(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error occurred'
}

async function getRentExemptionTotal(client: SolanaClient, rentExemptionSpaces: bigint[]) {
  if (rentExemptionSpaces.length === 0) {
    return 0n
  }

  const values = await Promise.all(
    rentExemptionSpaces.map((space) =>
      client.rpc.getMinimumBalanceForRentExemption(space, { commitment: 'confirmed' }).send(),
    ),
  )

  return values.reduce((total, value) => total + value, 0n)
}

function parseAddressField(label: string, value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`${label} is required.`)
  }

  try {
    return address(trimmed)
  } catch {
    throw new Error(`${label} must be a valid Solana address.`)
  }
}

function parseOptionalAddressField(value: string): Address | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  try {
    return address(trimmed)
  } catch {
    throw new Error('Optional account inputs must be valid Solana addresses when provided.')
  }
}

function parseU64Field(label: string, value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`${label} is required.`)
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`${label} must be a whole-number u64 value.`)
  }

  const parsed = BigInt(trimmed)

  if (parsed > U64_MAX) {
    throw new Error(`${label} must be <= ${U64_MAX}.`)
  }

  return parsed
}
