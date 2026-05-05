import {
  AccountRole,
  type Address,
  address,
  getAddressCodec,
  getProgramDerivedAddress,
  type Instruction,
} from '@solana/kit'

import { INITIALIZE_INSTRUCTION_DISCRIMINATOR, PROGRAM_ADDRESS } from './typescript/counter/kit'

export * from './typescript/counter/kit'

const counterSeed = new TextEncoder().encode('counter')

export const SYSTEM_PROGRAM_ADDRESS = address('11111111111111111111111111111111')

export interface InitializeCounterInstructionInput {
  counter: Address
  owner: Address
  systemProgram: Address
}

export function createInitializeCounterInstruction(input: InitializeCounterInstructionInput): Instruction {
  return {
    accounts: [
      { address: input.owner, role: AccountRole.WRITABLE_SIGNER },
      { address: input.counter, role: AccountRole.WRITABLE },
      { address: input.systemProgram, role: AccountRole.READONLY },
    ],
    data: Uint8Array.from(INITIALIZE_INSTRUCTION_DISCRIMINATOR),
    programAddress: PROGRAM_ADDRESS,
  }
}

export async function findCounterAddress(owner: Address): Promise<Address> {
  return (
    await getProgramDerivedAddress({
      programAddress: PROGRAM_ADDRESS,
      seeds: [counterSeed, getAddressCodec().encode(owner)],
    })
  )[0]
}
