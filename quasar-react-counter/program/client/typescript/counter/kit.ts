import { type Address, address, AccountRole, type Instruction, getProgramDerivedAddress, getAddressCodec, type ClientWithRpc, type GetAccountInfoApi, type GetMultipleAccountsApi, type ClientWithPayer, type ClientWithTransactionPlanning, type ClientWithTransactionSending } from "@solana/kit";
import { addSelfFetchFunctions, addSelfPlanAndSendFunctions } from "@solana/kit/program-client-core";
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
export const DELETE_INSTRUCTION_DISCRIMINATOR = new Uint8Array([4]);
export const SET_INSTRUCTION_DISCRIMINATOR = new Uint8Array([3]);
export const DECREMENT_INSTRUCTION_DISCRIMINATOR = new Uint8Array([2]);
export const INCREMENT_INSTRUCTION_DISCRIMINATOR = new Uint8Array([1]);
export const INITIALIZE_INSTRUCTION_DISCRIMINATOR = new Uint8Array([0]);

/* Interfaces */
export interface CounterAccount {
  authority: Address;
  value: bigint;
  bump: number;
}

export interface SetInstructionArgs {
  value: bigint;
}

export interface DeleteInstructionInput {
  owner: Address;
  counter: Address;
}

export interface SetInstructionInput {
  owner: Address;
  counter: Address;
  value: bigint;
}

export interface DecrementInstructionInput {
  owner: Address;
  counter: Address;
}

export interface IncrementInstructionInput {
  owner: Address;
  counter: Address;
}

export interface InitializeInstructionInput {
  owner: Address;
  systemProgram: Address;
}

/* Codecs */
export const CounterAccountCodec = getStructCodec([
  ["authority", getAddressCodec()],
  ["value", getU64Codec()],
  ["bump", getU8Codec()],
]);

/* Enums */
export const ProgramInstruction = {
  Delete: "Delete",
  Set: "Set",
  Decrement: "Decrement",
  Increment: "Increment",
  Initialize: "Initialize",
} as const;

export type ProgramInstruction =
  (typeof ProgramInstruction)[keyof typeof ProgramInstruction];

export type DecodedInstruction =
  | { type: typeof ProgramInstruction.Delete }
  | { type: typeof ProgramInstruction.Set; args: SetInstructionArgs }
  | { type: typeof ProgramInstruction.Decrement }
  | { type: typeof ProgramInstruction.Increment }
  | { type: typeof ProgramInstruction.Initialize };

/* Client */
export class CounterClient {

  decodeCounterAccount(data: Uint8Array): CounterAccount {
    if (!matchDisc(data, COUNTER_ACCOUNT_DISCRIMINATOR)) throw new Error("Invalid CounterAccount discriminator");
    return CounterAccountCodec.decode(data.slice(COUNTER_ACCOUNT_DISCRIMINATOR.length));
  }

  decodeInstruction(data: Uint8Array): DecodedInstruction | null {
    if (matchDisc(data, DELETE_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Delete };
    if (matchDisc(data, SET_INSTRUCTION_DISCRIMINATOR)) {
      const argsCodec = getStructCodec([
        ["value", getU64Codec()],
      ]);
      return { type: ProgramInstruction.Set, args: argsCodec.decode(data.slice(SET_INSTRUCTION_DISCRIMINATOR.length)) };
    }
    if (matchDisc(data, DECREMENT_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Decrement };
    if (matchDisc(data, INCREMENT_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Increment };
    if (matchDisc(data, INITIALIZE_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Initialize };
    return null;
  }

  createDeleteInstruction(input: DeleteInstructionInput): Instruction {
    const data = Uint8Array.from([4]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.WRITABLE_SIGNER },
        { address: input.counter, role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  createSetInstruction(input: SetInstructionInput): Instruction {
    const argsCodec = getStructCodec([
      ["value", getU64Codec()],
    ]);
    const data = Uint8Array.from([3, ...argsCodec.encode({ value: input.value })]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.READONLY_SIGNER },
        { address: input.counter, role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  createDecrementInstruction(input: DecrementInstructionInput): Instruction {
    const data = Uint8Array.from([2]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.READONLY_SIGNER },
        { address: input.counter, role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  createIncrementInstruction(input: IncrementInstructionInput): Instruction {
    const data = Uint8Array.from([1]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.READONLY_SIGNER },
        { address: input.counter, role: AccountRole.WRITABLE },
      ],
      data,
    };
  }

  async createInitializeInstruction(input: InitializeInstructionInput): Promise<Instruction> {
    const accountsMap: Record<string, Address> = {};
    accountsMap["counter"] = await findCounterAddress(input.owner);
    const data = Uint8Array.from([0]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.owner, role: AccountRole.WRITABLE_SIGNER },
        { address: accountsMap["counter"], role: AccountRole.WRITABLE },
        { address: input.systemProgram, role: AccountRole.READONLY },
      ],
      data,
    };
  }
}

/* Program Plugin */
export type CounterPluginRequirements = ClientWithRpc<GetAccountInfoApi & GetMultipleAccountsApi> &
  ClientWithPayer &
  ClientWithTransactionPlanning &
  ClientWithTransactionSending;

export function counterProgram() {
  const __client = new CounterClient();
  return <T extends CounterPluginRequirements>(client: T) => ({
    ...client,
    counter: {
      accounts: {
        counterAccount: addSelfFetchFunctions(client, CounterAccountCodec),
      },
      instructions: {
        delete: (input: DeleteInstructionInput) => addSelfPlanAndSendFunctions(client, __client.createDeleteInstruction(input)),
        set: (input: SetInstructionInput) => addSelfPlanAndSendFunctions(client, __client.createSetInstruction(input)),
        decrement: (input: DecrementInstructionInput) => addSelfPlanAndSendFunctions(client, __client.createDecrementInstruction(input)),
        increment: (input: IncrementInstructionInput) => addSelfPlanAndSendFunctions(client, __client.createIncrementInstruction(input)),
        initialize: (input: InitializeInstructionInput) => addSelfPlanAndSendFunctions(client, __client.createInitializeInstruction(input)),
      },
    },
  });
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
  3000: { name: "AccountNotInitialized", msg: "Account data is all zeros or has no discriminator." },
  3001: { name: "AccountAlreadyInitialized", msg: "Account discriminator is already set (double-init attempt)." },
  3002: { name: "InvalidPda", msg: "PDA derivation does not match the expected address." },
  3003: { name: "InvalidSeeds", msg: "Seeds provided for PDA verification are invalid." },
  3004: { name: "ConstraintViolation", msg: "A `#[account(constraint = ...)]` expression evaluated to false." },
  3005: { name: "HasOneMismatch", msg: "`#[account(has_one = ...)]` field does not match." },
  3006: { name: "InvalidDiscriminator", msg: "Account discriminator does not match the expected value." },
  3007: { name: "InsufficientSpace", msg: "Account data is too small for the declared layout." },
  3008: { name: "AccountNotRentExempt", msg: "Account balance is below the rent-exemption minimum." },
  3009: { name: "AccountOwnedByWrongProgram", msg: "Account owner does not match the expected program." },
  3010: { name: "AccountNotMutable", msg: "Account was not passed as writable." },
  3011: { name: "AccountNotSigner", msg: "Account was not passed as a signer." },
  3012: { name: "AddressMismatch", msg: "Account address does not match the expected value." },
  3013: { name: "DynamicFieldTooLong", msg: "A dynamic-length field exceeds its maximum byte length." },
  3014: { name: "CompactWriterFieldNotSet", msg: "A compact writer commit was attempted before setting every field." },
  3015: { name: "RemainingAccountsOverflow", msg: "More remaining accounts than can fit in the buffer." },
  3016: { name: "RemainingAccountDuplicate", msg: "A duplicate remaining-account entry could not be resolved." },
  3017: { name: "MissingReturnData", msg: "The callee completed successfully but did not set return data." },
  3018: { name: "ReturnDataFromWrongProgram", msg: "Return data was set by a different program than the one invoked." },
  3019: { name: "InvalidReturnData", msg: "Return data bytes do not match the expected fixed-size layout." },
  0: { name: "Unauthorized" },
  1: { name: "Underflow" },
  2: { name: "Overflow" },
};

