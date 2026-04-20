import { type Address, address } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { type SolanaClusterId } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { type Escrow, EscrowClient, findEscrowAddress, PROGRAM_ADDRESS } from '../../../program/client'

const escrowClient = new EscrowClient()

export type EscrowProgramStatus = 'deployed' | 'loading' | 'missing' | 'not-executable'

interface EscrowAccountQueryData {
  escrow: Escrow | null
  escrowAddress: Address
  makerAddress: Address
  programMessage: null | string
  programStatus: Exclude<EscrowProgramStatus, 'loading'>
}

export function getEscrowAccountQueryKey(makerAddress: null | string, cluster: SolanaClusterId) {
  return ['escrow-account', makerAddress ?? 'none', cluster] as const
}

export function useEscrowAccountQuery({
  client,
  cluster,
  enabled = true,
  makerAddress,
}: {
  client: SolanaClient
  cluster: SolanaClusterId
  enabled?: boolean
  makerAddress: null | string
}) {
  // client.rpc is derived from the selected cluster and should not participate in cache identity.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
    enabled: enabled && !!makerAddress,
    queryFn: async () => {
      if (!makerAddress) {
        throw new Error('Maker address is required.')
      }

      const maker = address(makerAddress)
      const escrowAddress = await findEscrowAddress(maker)
      const [{ value: escrowAccountInfo }, { value: programAccountInfo }] = await Promise.all([
        client.rpc.getAccountInfo(escrowAddress, { commitment: 'confirmed', encoding: 'base64' }).send(),
        client.rpc.getAccountInfo(PROGRAM_ADDRESS, { commitment: 'confirmed', encoding: 'base64' }).send(),
      ])

      if (!programAccountInfo) {
        return {
          escrow: null,
          escrowAddress,
          makerAddress: maker,
          programMessage: `Program ${PROGRAM_ADDRESS} is not deployed on this cluster.`,
          programStatus: 'missing',
        } satisfies EscrowAccountQueryData
      }

      if (!programAccountInfo.executable) {
        return {
          escrow: null,
          escrowAddress,
          makerAddress: maker,
          programMessage: `Program ${PROGRAM_ADDRESS} exists on this cluster but is not executable.`,
          programStatus: 'not-executable',
        } satisfies EscrowAccountQueryData
      }

      if (
        !escrowAccountInfo ||
        escrowAccountInfo.executable ||
        escrowAccountInfo.owner !== PROGRAM_ADDRESS ||
        escrowAccountInfo.space === 0n
      ) {
        return {
          escrow: null,
          escrowAddress,
          makerAddress: maker,
          programMessage: null,
          programStatus: 'deployed',
        } satisfies EscrowAccountQueryData
      }

      try {
        return {
          escrow: escrowClient.decodeEscrow(decodeBase64(escrowAccountInfo.data[0])),
          escrowAddress,
          makerAddress: maker,
          programMessage: null,
          programStatus: 'deployed',
        } satisfies EscrowAccountQueryData
      } catch {
        return {
          escrow: null,
          escrowAddress,
          makerAddress: maker,
          programMessage:
            'An escrow account exists at this PDA, but it could not be decoded. It may have been created by a different build or stale client.',
          programStatus: 'deployed',
        } satisfies EscrowAccountQueryData
      }
    },
    queryKey: getEscrowAccountQueryKey(makerAddress, cluster),
  })

  return {
    error,
    escrow: data?.escrow ?? null,
    escrowAddress: data?.escrowAddress ?? null,
    isError,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    makerAddress: data?.makerAddress ?? null,
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
