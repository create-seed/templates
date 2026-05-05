import { getStructCodec, getU64Codec } from '@solana/codecs'
import {
  AccountRole,
  type Address,
  address,
  getAddressCodec,
  getProgramDerivedAddress,
  type Instruction,
} from '@solana/kit'

import { MAKE_INSTRUCTION_DISCRIMINATOR, PROGRAM_ADDRESS } from './typescript/escrow/kit'

export * from './typescript/escrow/kit'

const escrowSeed = new TextEncoder().encode('escrow')

export const RENT_SYSVAR_ADDRESS = address('SysvarRent111111111111111111111111111111111')
export const SYSTEM_PROGRAM_ADDRESS = address('11111111111111111111111111111111')
export const TOKEN_PROGRAM_ADDRESS = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export interface MakeEscrowInstructionInput {
  deposit: bigint
  escrow: Address
  maker: Address
  makerTaA: Address
  makerTaB: Address
  mintA: Address
  mintB: Address
  receive: bigint
  rent: Address
  systemProgram: Address
  tokenProgram: Address
  vaultTaA: Address
}

const makeInstructionArgsCodec = getStructCodec([
  ['deposit', getU64Codec()],
  ['receive', getU64Codec()],
])

export function createMakeEscrowInstruction(input: MakeEscrowInstructionInput): Instruction {
  return {
    accounts: [
      { address: input.maker, role: AccountRole.WRITABLE_SIGNER },
      { address: input.escrow, role: AccountRole.WRITABLE },
      { address: input.mintA, role: AccountRole.READONLY },
      { address: input.mintB, role: AccountRole.READONLY },
      { address: input.makerTaA, role: AccountRole.WRITABLE },
      { address: input.makerTaB, role: AccountRole.WRITABLE },
      { address: input.vaultTaA, role: AccountRole.WRITABLE },
      { address: input.rent, role: AccountRole.READONLY },
      { address: input.tokenProgram, role: AccountRole.READONLY },
      { address: input.systemProgram, role: AccountRole.READONLY },
    ],
    data: Uint8Array.from([
      ...MAKE_INSTRUCTION_DISCRIMINATOR,
      ...makeInstructionArgsCodec.encode({ deposit: input.deposit, receive: input.receive }),
    ]),
    programAddress: PROGRAM_ADDRESS,
  }
}

export async function findEscrowAddress(maker: Address): Promise<Address> {
  return (
    await getProgramDerivedAddress({
      programAddress: PROGRAM_ADDRESS,
      seeds: [escrowSeed, getAddressCodec().encode(maker)],
    })
  )[0]
}
