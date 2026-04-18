import { type Address, address, AccountRole, type Instruction, getProgramDerivedAddress, getAddressCodec } from "@solana/kit";
import { getStructCodec, getU64Codec, getU8Codec } from "@solana/codecs";

function matchDisc(data: Uint8Array, disc: Uint8Array): boolean {
  if (data.length < disc.length) return false;
  for (let i = 0; i < disc.length; i++) {
    if (data[i] !== disc[i]) return false;
  }
  return true;
}

/* Constants */
export const PROGRAM_ADDRESS = address("GATuS4JvmdJ2ungXgAfmR4ZHFrPt1uZyUBfxicm7M2F1");
export const COUNTER_ACCOUNT_DISCRIMINATOR = new Uint8Array([1]);
export const INITIALIZE_INSTRUCTION_DISCRIMINATOR = new Uint8Array([0]);
export const INCREMENT_INSTRUCTION_DISCRIMINATOR = new Uint8Array([1]);
export const DECREMENT_INSTRUCTION_DISCRIMINATOR = new Uint8Array([2]);
export const SET_INSTRUCTION_DISCRIMINATOR = new Uint8Array([3]);
export const DELETE_INSTRUCTION_DISCRIMINATOR = new Uint8Array([4]);

/* Interfaces */
export interface CounterAccount {
  authority: Address;
  value: bigint;
  bump: number;
}

export interface SetInstructionArgs {
  value: bigint;
}

export interface InitializeInstructionInput {
  owner: Address;
}

export interface IncrementInstructionInput {
  owner: Address;
}

export interface DecrementInstructionInput {
  owner: Address;
}

export interface SetInstructionInput {
  owner: Address;
  value: bigint;
}

export interface DeleteInstructionInput {
  owner: Address;
}

/* Codecs */
export const CounterAccountCodec = getStructCodec([
  ["authority", getAddressCodec()],
  ["value", getU64Codec()],
  ["bump", getU8Codec()],
]);

/* Enums */
export enum ProgramInstruction {
  Initialize = "Initialize",
  Increment = "Increment",
  Decrement = "Decrement",
  Set = "Set",
  Delete = "Delete",
}

export type DecodedInstruction =
  | { type: ProgramInstruction.Initialize }
  | { type: ProgramInstruction.Increment }
  | { type: ProgramInstruction.Decrement }
  | { type: ProgramInstruction.Set; args: SetInstructionArgs }
  | { type: ProgramInstruction.Delete };

/* Client */
export class CounterClient {

  decodeCounterAccount(data: Uint8Array): CounterAccount {
    if (!matchDisc(data, COUNTER_ACCOUNT_DISCRIMINATOR)) throw new Error("Invalid CounterAccount discriminator");
    return CounterAccountCodec.decode(data.slice(COUNTER_ACCOUNT_DISCRIMINATOR.length));
  }

  decodeInstruction(data: Uint8Array): DecodedInstruction | null {
    if (matchDisc(data, INITIALIZE_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Initialize };
    if (matchDisc(data, INCREMENT_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Increment };
    if (matchDisc(data, DECREMENT_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Decrement };
    if (matchDisc(data, SET_INSTRUCTION_DISCRIMINATOR)) {
      const argsCodec = getStructCodec([
        ["value", getU64Codec()],
      ]);
      return { type: ProgramInstruction.Set, args: argsCodec.decode(data.slice(SET_INSTRUCTION_DISCRIMINATOR.length)) };
    }
    if (matchDisc(data, DELETE_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Delete };
    return null;
  }

  async createInitializeInstruction(input: InitializeInstructionInput): Promise<Instruction> {
    const accountsMap: Record<string, Address> = {};
    accountsMap["systemProgram"] = address("11111111111111111111111111111111");
    accountsMap["counter"] = await findCounterAddress(input.owner);
    const data = Uint8Array.from([0]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.WRITABLE_SIGNER },
        { address: accountsMap["counter"], role: AccountRole.WRITABLE },
        { address: accountsMap["systemProgram"], role: AccountRole.READONLY },
      ],
      data,
    };
  }

  async createIncrementInstruction(input: IncrementInstructionInput): Promise<Instruction> {
    const accountsMap: Record<string, Address> = {};
    accountsMap["counter"] = await findCounterAddress(input.owner);
    const data = Uint8Array.from([1]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.READONLY_SIGNER },
        { address: accountsMap["counter"], role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  async createDecrementInstruction(input: DecrementInstructionInput): Promise<Instruction> {
    const accountsMap: Record<string, Address> = {};
    accountsMap["counter"] = await findCounterAddress(input.owner);
    const data = Uint8Array.from([2]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.READONLY_SIGNER },
        { address: accountsMap["counter"], role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  async createSetInstruction(input: SetInstructionInput): Promise<Instruction> {
    const accountsMap: Record<string, Address> = {};
    accountsMap["counter"] = await findCounterAddress(input.owner);
    const argsCodec = getStructCodec([
      ["value", getU64Codec()],
    ]);
    const data = Uint8Array.from([3, ...argsCodec.encode({ value: input.value })]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.READONLY_SIGNER },
        { address: accountsMap["counter"], role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  async createDeleteInstruction(input: DeleteInstructionInput): Promise<Instruction> {
    const accountsMap: Record<string, Address> = {};
    accountsMap["counter"] = await findCounterAddress(input.owner);
    const data = Uint8Array.from([4]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.WRITABLE_SIGNER },
        { address: accountsMap["counter"], role: AccountRole.WRITABLE },
      ],
      data,
    };
  }
}

/* PDA Helpers */
export async function findCounterAddress(owner: Address): Promise<Address> {
  return (await getProgramDerivedAddress({
    programAddress: PROGRAM_ADDRESS,
    seeds: [
        new Uint8Array([99, 111, 117, 110, 116, 101, 114]),
      getAddressCodec().encode(owner),
    ],
  }))[0];
}

/* Errors */
export const PROGRAM_ERRORS: Record<number, { name: string; msg?: string }> = {
  0: { name: "Unauthorized" },
  1: { name: "Underflow" },
  2: { name: "Overflow" },
};

