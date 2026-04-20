import {
  createKeyedMintAccount,
  createKeyedSystemAccount,
  createKeyedTokenAccount,
  QuasarSvm,
} from '@blueshift-gg/quasar-svm/kit'
import { getU64Codec } from '@solana/codecs'
import { AccountRole, type Address, address, generateKeyPairSigner } from '@solana/kit'
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

import { EscrowClient, findEscrowAddress, PROGRAM_ADDRESS } from '../client'

const client = new EscrowClient()
const depositAmount = 1_337n
const receiveAmount = 733n
const systemProgramAddress = address('11111111111111111111111111111111')
const tokenAmountCodec = getU64Codec()

function createEmptyAccount(accountAddress: Address) {
  return createKeyedSystemAccount(accountAddress, 0n)
}

async function createScenario() {
  const [
    maker,
    makerTaASeed,
    makerTaBSeed,
    mintASeed,
    mintBSeed,
    taker,
    takerTaASeed,
    takerTaBSeed,
    vaultTaASeed,
    wrongOwner,
  ] = await Promise.all([
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
  ])

  const escrowAddress = await findEscrowAddress(maker.address)
  const makerAccount = createKeyedSystemAccount(maker.address)
  const takerAccount = createKeyedSystemAccount(taker.address)
  const mintA = createKeyedMintAccount(mintASeed.address, { supply: 100_000n })
  const mintB = createKeyedMintAccount(mintBSeed.address, { supply: 100_000n })
  const makerTaA = createKeyedTokenAccount(makerTaASeed.address, {
    amount: 10_000n,
    mint: mintA.address,
    owner: maker.address,
  })
  const takerTaB = createKeyedTokenAccount(takerTaBSeed.address, {
    amount: 10_000n,
    mint: mintB.address,
    owner: taker.address,
  })

  return {
    escrowAddress,
    maker,
    makerAccount,
    makerTaA,
    makerTaBAddress: makerTaBSeed.address,
    mintA,
    mintB,
    taker,
    takerAccount,
    takerTaAAddress: takerTaASeed.address,
    takerTaB,
    vaultTaAAddress: vaultTaASeed.address,
    wrongOwner,
  }
}

async function createVm() {
  const vm = new QuasarSvm()
  vm.addProgram(PROGRAM_ADDRESS, await readFile(new URL('../target/deploy/escrow.so', import.meta.url)))
  return vm
}

function expectClosedAccount(
  result: { account: (accountAddress: Address) => { lamports: bigint; programAddress: Address } | null },
  accountAddress: Address,
) {
  const account = result.account(accountAddress)
  expect(account).not.toBeNull()
  expect(account!.programAddress).toBe(systemProgramAddress)
  expect(BigInt(account!.lamports)).toBe(0n)
}

function getEscrow(
  result: { account: (accountAddress: Address) => { data: Uint8Array } | null },
  escrowAddress: Address,
) {
  const escrow = result.account(escrowAddress)
  expect(escrow).not.toBeNull()
  return client.decodeEscrow(escrow!.data)
}

function getTokenAmount(
  result: { account: (accountAddress: Address) => { data: Uint8Array } | null },
  tokenAddress: Address,
) {
  const token = result.account(tokenAddress)
  expect(token).not.toBeNull()
  return tokenAmountCodec.decode(token!.data.subarray(64, 72))
}

function withSignerAccounts(
  instruction: { accounts?: Array<{ address: Address; role: AccountRole } | undefined> },
  signerIndices: number[],
) {
  expect(instruction.accounts).toBeDefined()
  return {
    ...instruction,
    accounts: instruction.accounts!.map((account, index) => {
      if (!account || !signerIndices.includes(index)) {
        return account
      }

      return { ...account, role: AccountRole.WRITABLE_SIGNER }
    }),
  }
}

describe('Escrow Program', () => {
  it('runs the make and take flow with token transfers and account closure', async () => {
    const scenario = await createScenario()
    const vm = await createVm()

    const makeInstruction = withSignerAccounts(
      await client.createMakeInstruction({
        deposit: depositAmount,
        maker: scenario.maker.address,
        makerTaA: scenario.makerTaA.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        receive: receiveAmount,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [5, 6],
    )
    const makeResult = vm.processInstruction(makeInstruction, [
      scenario.makerAccount,
      scenario.takerAccount,
      scenario.mintA,
      scenario.mintB,
      scenario.makerTaA,
      createEmptyAccount(scenario.escrowAddress),
      createEmptyAccount(scenario.makerTaBAddress),
      createEmptyAccount(scenario.takerTaAAddress),
      scenario.takerTaB,
      createEmptyAccount(scenario.vaultTaAAddress),
    ])
    makeResult.assertSuccess()

    const escrow = getEscrow(makeResult, scenario.escrowAddress)
    expect(escrow.bump).toBeGreaterThan(0)
    expect(escrow.maker).toBe(scenario.maker.address)
    expect(escrow.makerTaB).toBe(scenario.makerTaBAddress)
    expect(escrow.mintA).toBe(scenario.mintA.address)
    expect(escrow.mintB).toBe(scenario.mintB.address)
    expect(escrow.receive).toBe(receiveAmount)
    expect(getTokenAmount(makeResult, scenario.makerTaA.address)).toBe(10_000n - depositAmount)
    expect(getTokenAmount(makeResult, scenario.makerTaBAddress)).toBe(0n)
    expect(getTokenAmount(makeResult, scenario.vaultTaAAddress)).toBe(depositAmount)

    const takeInstruction = withSignerAccounts(
      await client.createTakeInstruction({
        maker: scenario.maker.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        taker: scenario.taker.address,
        takerTaA: scenario.takerTaAAddress,
        takerTaB: scenario.takerTaB.address,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [5],
    )
    const takeResult = vm.processInstruction(takeInstruction, makeResult.accounts)
    takeResult.assertSuccess()

    expect(getTokenAmount(takeResult, scenario.makerTaBAddress)).toBe(receiveAmount)
    expect(getTokenAmount(takeResult, scenario.takerTaAAddress)).toBe(depositAmount)
    expect(getTokenAmount(takeResult, scenario.takerTaB.address)).toBe(10_000n - receiveAmount)
    expectClosedAccount(takeResult, scenario.escrowAddress)
    expectClosedAccount(takeResult, scenario.vaultTaAAddress)
  })

  it('refunds the maker and closes escrow-owned accounts', async () => {
    const scenario = await createScenario()
    const vm = await createVm()

    const makeInstruction = withSignerAccounts(
      await client.createMakeInstruction({
        deposit: depositAmount,
        maker: scenario.maker.address,
        makerTaA: scenario.makerTaA.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        receive: receiveAmount,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [5, 6],
    )
    const makeResult = vm.processInstruction(makeInstruction, [
      scenario.makerAccount,
      scenario.mintA,
      scenario.mintB,
      scenario.makerTaA,
      createEmptyAccount(scenario.escrowAddress),
      createEmptyAccount(scenario.makerTaBAddress),
      createEmptyAccount(scenario.vaultTaAAddress),
    ])
    makeResult.assertSuccess()

    const refundInstruction = await client.createRefundInstruction({
      maker: scenario.maker.address,
      makerTaA: scenario.makerTaA.address,
      mintA: scenario.mintA.address,
      vaultTaA: scenario.vaultTaAAddress,
    })
    const refundResult = vm.processInstruction(refundInstruction, makeResult.accounts)
    refundResult.assertSuccess()

    expect(getTokenAmount(refundResult, scenario.makerTaA.address)).toBe(10_000n)
    expectClosedAccount(refundResult, scenario.escrowAddress)
    expectClosedAccount(refundResult, scenario.vaultTaAAddress)
  })

  it('accepts pre-existing maker and vault token accounts during make', async () => {
    const scenario = await createScenario()
    const vm = await createVm()

    const makeInstruction = withSignerAccounts(
      await client.createMakeInstruction({
        deposit: depositAmount,
        maker: scenario.maker.address,
        makerTaA: scenario.makerTaA.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        receive: receiveAmount,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [6],
    )
    const makeResult = vm.processInstruction(makeInstruction, [
      scenario.makerAccount,
      scenario.mintA,
      scenario.mintB,
      scenario.makerTaA,
      createEmptyAccount(scenario.escrowAddress),
      createKeyedTokenAccount(scenario.makerTaBAddress, {
        amount: 0n,
        mint: scenario.mintB.address,
        owner: scenario.maker.address,
      }),
      createKeyedTokenAccount(scenario.vaultTaAAddress, {
        amount: 0n,
        mint: scenario.mintA.address,
        owner: scenario.escrowAddress,
      }),
    ])
    makeResult.assertSuccess()

    expect(getTokenAmount(makeResult, scenario.makerTaBAddress)).toBe(0n)
    expect(getTokenAmount(makeResult, scenario.vaultTaAAddress)).toBe(depositAmount)
  })

  it('accepts pre-existing taker and maker token accounts during take', async () => {
    const scenario = await createScenario()
    const vm = await createVm()

    const makeInstruction = withSignerAccounts(
      await client.createMakeInstruction({
        deposit: depositAmount,
        maker: scenario.maker.address,
        makerTaA: scenario.makerTaA.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        receive: receiveAmount,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [6],
    )
    const makeResult = vm.processInstruction(makeInstruction, [
      scenario.makerAccount,
      scenario.takerAccount,
      scenario.mintA,
      scenario.mintB,
      scenario.makerTaA,
      createEmptyAccount(scenario.escrowAddress),
      createKeyedTokenAccount(scenario.makerTaBAddress, {
        amount: 500n,
        mint: scenario.mintB.address,
        owner: scenario.maker.address,
      }),
      createKeyedTokenAccount(scenario.takerTaAAddress, {
        amount: 250n,
        mint: scenario.mintA.address,
        owner: scenario.taker.address,
      }),
      scenario.takerTaB,
      createEmptyAccount(scenario.vaultTaAAddress),
    ])
    makeResult.assertSuccess()

    const takeInstruction = await client.createTakeInstruction({
      maker: scenario.maker.address,
      makerTaB: scenario.makerTaBAddress,
      mintA: scenario.mintA.address,
      mintB: scenario.mintB.address,
      taker: scenario.taker.address,
      takerTaA: scenario.takerTaAAddress,
      takerTaB: scenario.takerTaB.address,
      vaultTaA: scenario.vaultTaAAddress,
    })
    const takeResult = vm.processInstruction(takeInstruction, makeResult.accounts)
    takeResult.assertSuccess()

    expect(getTokenAmount(takeResult, scenario.makerTaBAddress)).toBe(500n + receiveAmount)
    expect(getTokenAmount(takeResult, scenario.takerTaAAddress)).toBe(250n + depositAmount)
  })

  it('rejects an existing maker_ta_b account with the wrong mint', async () => {
    const scenario = await createScenario()
    const vm = await createVm()

    const makeInstruction = withSignerAccounts(
      await client.createMakeInstruction({
        deposit: depositAmount,
        maker: scenario.maker.address,
        makerTaA: scenario.makerTaA.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        receive: receiveAmount,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [6],
    )
    const makeResult = vm.processInstruction(makeInstruction, [
      scenario.makerAccount,
      scenario.mintA,
      scenario.mintB,
      scenario.makerTaA,
      createEmptyAccount(scenario.escrowAddress),
      createKeyedTokenAccount(scenario.makerTaBAddress, {
        amount: 0n,
        mint: scenario.mintA.address,
        owner: scenario.maker.address,
      }),
      createEmptyAccount(scenario.vaultTaAAddress),
    ])

    expect(makeResult.status.ok, makeResult.logs.join('\n')).toBe(false)
  })

  it('rejects an existing maker_ta_b account with the wrong owner', async () => {
    const scenario = await createScenario()
    const vm = await createVm()

    const makeInstruction = withSignerAccounts(
      await client.createMakeInstruction({
        deposit: depositAmount,
        maker: scenario.maker.address,
        makerTaA: scenario.makerTaA.address,
        makerTaB: scenario.makerTaBAddress,
        mintA: scenario.mintA.address,
        mintB: scenario.mintB.address,
        receive: receiveAmount,
        vaultTaA: scenario.vaultTaAAddress,
      }),
      [6],
    )
    const makeResult = vm.processInstruction(makeInstruction, [
      scenario.makerAccount,
      scenario.mintA,
      scenario.mintB,
      scenario.makerTaA,
      createEmptyAccount(scenario.escrowAddress),
      createKeyedTokenAccount(scenario.makerTaBAddress, {
        amount: 0n,
        mint: scenario.mintB.address,
        owner: scenario.wrongOwner.address,
      }),
      createEmptyAccount(scenario.vaultTaAAddress),
    ])

    expect(makeResult.status.ok, makeResult.logs.join('\n')).toBe(false)
  })
})
