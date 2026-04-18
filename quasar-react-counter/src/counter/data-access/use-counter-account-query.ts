import { type Address, address } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { type CounterAccount, CounterClient, findCounterAddress, PROGRAM_ADDRESS } from '../../../program/client'

const counterClient = new CounterClient()

export type CounterProgramStatus = 'deployed' | 'loading' | 'missing' | 'not-executable'

interface CounterAccountQueryData {
  counter: CounterAccount | null
  counterAddress: Address
  programMessage: null | string
  programStatus: Exclude<CounterProgramStatus, 'loading'>
}

export function getCounterAccountQueryKey(accountAddress: string, cluster: SolanaClusterId) {
  return ['counter-account', accountAddress, cluster] as const
}

export function useCounterAccountQuery({
  account,
  client,
  cluster,
}: {
  account: UiWalletAccount
  client: SolanaClient
  cluster: SolanaClusterId
}) {
  // client.rpc is derived from the selected cluster and should not participate in cache identity.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
    queryFn: async () => {
      const ownerAddress = address(account.address)
      const counterAddress = await findCounterAddress(ownerAddress)
      const [{ value: counterAccountInfo }, { value: programAccountInfo }] = await Promise.all([
        client.rpc.getAccountInfo(counterAddress, { commitment: 'confirmed', encoding: 'base64' }).send(),
        client.rpc.getAccountInfo(PROGRAM_ADDRESS, { commitment: 'confirmed', encoding: 'base64' }).send(),
      ])

      if (!programAccountInfo) {
        return {
          counter: null,
          counterAddress,
          programMessage: `Program ${PROGRAM_ADDRESS} is not deployed on this cluster.`,
          programStatus: 'missing',
        } satisfies CounterAccountQueryData
      }

      if (!programAccountInfo.executable) {
        return {
          counter: null,
          counterAddress,
          programMessage: `Program ${PROGRAM_ADDRESS} exists on this cluster but is not executable.`,
          programStatus: 'not-executable',
        } satisfies CounterAccountQueryData
      }

      if (
        !counterAccountInfo ||
        counterAccountInfo.executable ||
        counterAccountInfo.owner !== PROGRAM_ADDRESS ||
        counterAccountInfo.space === 0n
      ) {
        return {
          counter: null,
          counterAddress,
          programMessage: null,
          programStatus: 'deployed',
        } satisfies CounterAccountQueryData
      }

      return {
        counter: counterClient.decodeCounterAccount(decodeBase64(counterAccountInfo.data[0])),
        counterAddress,
        programMessage: null,
        programStatus: 'deployed',
      } satisfies CounterAccountQueryData
    },
    queryKey: getCounterAccountQueryKey(account.address, cluster),
  })

  return {
    counter: data?.counter ?? null,
    counterAddress: data?.counterAddress ?? null,
    error,
    isError,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    programAddress: PROGRAM_ADDRESS,
    programMessage: data?.programMessage ?? null,
    programStatus: data?.programStatus ?? 'loading',
    refresh() {
      void refetch()
    },
  }
}

function decodeBase64(value: string) {
  const raw = globalThis.atob(value)
  const bytes = new Uint8Array(raw.length)

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index)
  }

  return bytes
}
