import { type Address, address, AccountRole, type Instruction, getAddressCodec } from "@solana/kit";
import { getStructCodec, getU64Codec, getU8Codec } from "@solana/codecs";

function matchDisc(data: Uint8Array, disc: Uint8Array): boolean {
  if (data.length < disc.length) return false;
  for (let i = 0; i < disc.length; i++) {
    if (data[i] !== disc[i]) return false;
  }
  return true;
}

/* Constants */
export const PROGRAM_ADDRESS = address("DRcH8tvGynzEKMAxkSwGqeLHAYqxgJriEMHjypkUhxQp");
export const ESCROW_DISCRIMINATOR = new Uint8Array([1]);
export const REFUND_EVENT_DISCRIMINATOR = new Uint8Array([2]);
export const TAKE_EVENT_DISCRIMINATOR = new Uint8Array([1]);
export const MAKE_EVENT_DISCRIMINATOR = new Uint8Array([0]);
export const REFUND_INSTRUCTION_DISCRIMINATOR = new Uint8Array([2]);
export const TAKE_INSTRUCTION_DISCRIMINATOR = new Uint8Array([1]);
export const MAKE_INSTRUCTION_DISCRIMINATOR = new Uint8Array([0]);

/* Interfaces */
export interface Escrow {
  maker: Address;
  mint_a: Address;
  mint_b: Address;
  maker_ta_b: Address;
  receive: bigint;
  bump: number;
}

export interface RefundEvent {
  escrow: Address;
}

export interface TakeEvent {
  escrow: Address;
}

export interface MakeEvent {
  escrow: Address;
  maker: Address;
  mint_a: Address;
  mint_b: Address;
  deposit: bigint;
  receive: bigint;
}

export interface MakeInstructionArgs {
  deposit: bigint;
  receive: bigint;
}

export interface RefundInstructionInput {
  maker: Address;
  escrow: Address;
  mintA: Address;
  makerTaA: Address;
  vaultTaA: Address;
  rent: Address;
  tokenProgram: Address;
  systemProgram: Address;
}

export interface TakeInstructionInput {
  taker: Address;
  escrow: Address;
  maker: Address;
  mintA: Address;
  mintB: Address;
  takerTaA: Address;
  takerTaB: Address;
  makerTaB: Address;
  vaultTaA: Address;
  rent: Address;
  tokenProgram: Address;
  systemProgram: Address;
}

export interface MakeInstructionInput {
  maker: Address;
  mintA: Address;
  mintB: Address;
  makerTaA: Address;
  makerTaB: Address;
  vaultTaA: Address;
  rent: Address;
  tokenProgram: Address;
  systemProgram: Address;
  deposit: bigint;
  receive: bigint;
}

/* Codecs */
export const EscrowCodec = getStructCodec([
  ["maker", getAddressCodec()],
  ["mint_a", getAddressCodec()],
  ["mint_b", getAddressCodec()],
  ["maker_ta_b", getAddressCodec()],
  ["receive", getU64Codec()],
  ["bump", getU8Codec()],
]);

export const RefundEventCodec = getStructCodec([
  ["escrow", getAddressCodec()],
]);

export const TakeEventCodec = getStructCodec([
  ["escrow", getAddressCodec()],
]);

export const MakeEventCodec = getStructCodec([
  ["escrow", getAddressCodec()],
  ["maker", getAddressCodec()],
  ["mint_a", getAddressCodec()],
  ["mint_b", getAddressCodec()],
  ["deposit", getU64Codec()],
  ["receive", getU64Codec()],
]);

/* Enums */
export const ProgramEvent = {
  RefundEvent: "RefundEvent",
  TakeEvent: "TakeEvent",
  MakeEvent: "MakeEvent",
} as const;

export type ProgramEvent =
  (typeof ProgramEvent)[keyof typeof ProgramEvent];

export type DecodedEvent =
  | { type: typeof ProgramEvent.RefundEvent; data: RefundEvent }
  | { type: typeof ProgramEvent.TakeEvent; data: TakeEvent }
  | { type: typeof ProgramEvent.MakeEvent; data: MakeEvent };

export const ProgramInstruction = {
  Refund: "Refund",
  Take: "Take",
  Make: "Make",
} as const;

export type ProgramInstruction =
  (typeof ProgramInstruction)[keyof typeof ProgramInstruction];

export type DecodedInstruction =
  | { type: typeof ProgramInstruction.Refund }
  | { type: typeof ProgramInstruction.Take }
  | { type: typeof ProgramInstruction.Make; args: MakeInstructionArgs };

/* Client */
export class EscrowClient {

  decodeEscrow(data: Uint8Array): Escrow {
    if (!matchDisc(data, ESCROW_DISCRIMINATOR)) throw new Error("Invalid Escrow discriminator");
    return EscrowCodec.decode(data.slice(ESCROW_DISCRIMINATOR.length));
  }

  decodeEvent(data: Uint8Array): DecodedEvent | null {
    if (matchDisc(data, REFUND_EVENT_DISCRIMINATOR))
      return { type: ProgramEvent.RefundEvent, data: RefundEventCodec.decode(data.slice(REFUND_EVENT_DISCRIMINATOR.length)) };
    if (matchDisc(data, TAKE_EVENT_DISCRIMINATOR))
      return { type: ProgramEvent.TakeEvent, data: TakeEventCodec.decode(data.slice(TAKE_EVENT_DISCRIMINATOR.length)) };
    if (matchDisc(data, MAKE_EVENT_DISCRIMINATOR))
      return { type: ProgramEvent.MakeEvent, data: MakeEventCodec.decode(data.slice(MAKE_EVENT_DISCRIMINATOR.length)) };
    return null;
  }

  decodeInstruction(data: Uint8Array): DecodedInstruction | null {
    if (matchDisc(data, REFUND_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Refund };
    if (matchDisc(data, TAKE_INSTRUCTION_DISCRIMINATOR))
      return { type: ProgramInstruction.Take };
    if (matchDisc(data, MAKE_INSTRUCTION_DISCRIMINATOR)) {
      const argsCodec = getStructCodec([
        ["deposit", getU64Codec()],
        ["receive", getU64Codec()],
      ]);
      return { type: ProgramInstruction.Make, args: argsCodec.decode(data.slice(MAKE_INSTRUCTION_DISCRIMINATOR.length)) };
    }
    return null;
  }

  createRefundInstruction(input: RefundInstructionInput): Instruction {
    const data = Uint8Array.from([2]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.maker, role: AccountRole.WRITABLE_SIGNER },
        { address: input.escrow, role: AccountRole.WRITABLE },
        { address: input.mintA, role: AccountRole.READONLY },
        { address: input.makerTaA, role: AccountRole.WRITABLE },
        { address: input.vaultTaA, role: AccountRole.WRITABLE },
        { address: input.rent, role: AccountRole.READONLY },
        { address: input.tokenProgram, role: AccountRole.READONLY },
        { address: input.systemProgram, role: AccountRole.READONLY },
      ],
      data,
    };
  }

  createTakeInstruction(input: TakeInstructionInput): Instruction {
    const data = Uint8Array.from([1]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.taker, role: AccountRole.WRITABLE_SIGNER },
        { address: input.escrow, role: AccountRole.WRITABLE },
        { address: input.maker, role: AccountRole.WRITABLE },
        { address: input.mintA, role: AccountRole.READONLY },
        { address: input.mintB, role: AccountRole.READONLY },
        { address: input.takerTaA, role: AccountRole.WRITABLE },
        { address: input.takerTaB, role: AccountRole.WRITABLE },
        { address: input.makerTaB, role: AccountRole.WRITABLE },
        { address: input.vaultTaA, role: AccountRole.WRITABLE },
        { address: input.rent, role: AccountRole.READONLY },
        { address: input.tokenProgram, role: AccountRole.READONLY },
        { address: input.systemProgram, role: AccountRole.READONLY },
      ],
      data,
    };
  }

  createMakeInstruction(input: MakeInstructionInput): Instruction {
    const accountsMap: Record<string, Address> = {};
    accountsMap["escrow"] = address("Escrow :: seeds(maker.address())");
    const argsCodec = getStructCodec([
      ["deposit", getU64Codec()],
      ["receive", getU64Codec()],
    ]);
    const data = Uint8Array.from([0, ...argsCodec.encode({ deposit: input.deposit, receive: input.receive })]);
    return {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        { address: input.maker, role: AccountRole.WRITABLE_SIGNER },
        { address: accountsMap["escrow"], role: AccountRole.WRITABLE },
        { address: input.mintA, role: AccountRole.READONLY },
        { address: input.mintB, role: AccountRole.READONLY },
        { address: input.makerTaA, role: AccountRole.WRITABLE },
        { address: input.makerTaB, role: AccountRole.WRITABLE },
        { address: input.vaultTaA, role: AccountRole.WRITABLE },
        { address: input.rent, role: AccountRole.READONLY },
        { address: input.tokenProgram, role: AccountRole.READONLY },
        { address: input.systemProgram, role: AccountRole.READONLY },
      ],
      data,
    };
  }
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
  3016: { name: "RemainingAccountDuplicate", msg: "A remaining account duplicated a declared or prior remaining account in strict mode." },
  3017: { name: "MissingReturnData", msg: "The callee completed successfully but did not set return data." },
  3018: { name: "ReturnDataFromWrongProgram", msg: "Return data was set by a different program than the one invoked." },
  3019: { name: "InvalidReturnData", msg: "Return data bytes do not match the expected fixed-size layout." },
  3020: { name: "AccountNotMigrated", msg: "Migration<From, To> field exited without .migrate() being called." },
};

