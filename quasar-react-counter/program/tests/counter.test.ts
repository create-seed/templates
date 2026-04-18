import { createKeyedSystemAccount, QuasarSvm } from '@blueshift-gg/quasar-svm/kit'
import { type Address, address, generateKeyPairSigner } from '@solana/kit'
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

import { CounterClient, findCounterAddress, PROGRAM_ADDRESS, PROGRAM_ERRORS } from '../client'

const SYSTEM_PROGRAM_ADDRESS = address('11111111111111111111111111111111')
const client = new CounterClient()

async function createVm() {
  const vm = new QuasarSvm()
  vm.addProgram(PROGRAM_ADDRESS, await readFile(new URL('../target/deploy/counter.so', import.meta.url)))
  return vm
}

function getCounterValue(
  result: { account: (address: Address) => { data: Uint8Array } | null },
  counterAddress: Address,
) {
  const counter = result.account(counterAddress)

  expect(counter).not.toBeNull()

  return client.decodeCounterAccount(counter!.data).value
}

describe('Counter Program', () => {
  it('runs the full CRUD flow for one wallet-owned PDA', async () => {
    const vm = await createVm()
    const owner = await generateKeyPairSigner()
    const counterAddress = await findCounterAddress(owner.address)

    const initializeInstruction = await client.createInitializeInstruction({ owner: owner.address })
    const initializeResult = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(owner.address),
      createKeyedSystemAccount(counterAddress, 0n),
    ])
    initializeResult.assertSuccess()

    expect(getCounterValue(initializeResult, counterAddress)).toBe(0n)

    const incrementInstruction = await client.createIncrementInstruction({ owner: owner.address })
    const incrementResult = vm.processInstruction(incrementInstruction, initializeResult.accounts)
    incrementResult.assertSuccess()

    expect(getCounterValue(incrementResult, counterAddress)).toBe(1n)

    const setInstruction = await client.createSetInstruction({ owner: owner.address, value: 42n })
    const setResult = vm.processInstruction(setInstruction, incrementResult.accounts)
    setResult.assertSuccess()

    expect(getCounterValue(setResult, counterAddress)).toBe(42n)

    const decrementInstruction = await client.createDecrementInstruction({ owner: owner.address })
    const decrementResult = vm.processInstruction(decrementInstruction, setResult.accounts)
    decrementResult.assertSuccess()

    expect(getCounterValue(decrementResult, counterAddress)).toBe(41n)

    const counterBeforeDelete = decrementResult.account(counterAddress)
    const ownerBeforeDelete = decrementResult.account(owner.address)
    expect(counterBeforeDelete).not.toBeNull()
    expect(ownerBeforeDelete).not.toBeNull()

    const deleteInstruction = await client.createDeleteInstruction({ owner: owner.address })
    const deleteResult = vm.processInstruction(deleteInstruction, decrementResult.accounts)
    deleteResult.assertSuccess()

    const closedCounter = deleteResult.account(counterAddress)
    const ownerAfterDelete = deleteResult.account(owner.address)
    expect(closedCounter).not.toBeNull()
    expect(ownerAfterDelete).not.toBeNull()
    expect(closedCounter!.programAddress).toBe(SYSTEM_PROGRAM_ADDRESS)
    expect(BigInt(closedCounter!.lamports)).toBe(0n)
    expect(BigInt(ownerAfterDelete!.lamports)).toBe(
      BigInt(ownerBeforeDelete!.lamports) + BigInt(counterBeforeDelete!.lamports),
    )
    expect(() => client.decodeCounterAccount(closedCounter!.data)).toThrow()
  })

  it('rejects duplicate initialization for the same wallet PDA', async () => {
    const vm = await createVm()
    const owner = await generateKeyPairSigner()
    const counterAddress = await findCounterAddress(owner.address)
    const initializeInstruction = await client.createInitializeInstruction({ owner: owner.address })
    const accounts = [createKeyedSystemAccount(owner.address), createKeyedSystemAccount(counterAddress, 0n)]

    const firstResult = vm.processInstruction(initializeInstruction, accounts)
    firstResult.assertSuccess()

    const secondResult = vm.processInstruction(initializeInstruction, firstResult.accounts)
    expect(secondResult.status.ok, secondResult.logs.join('\n')).toBe(false)
  })

  it('rejects decrement at zero with Underflow', async () => {
    const vm = await createVm()
    const owner = await generateKeyPairSigner()
    const counterAddress = await findCounterAddress(owner.address)

    const initializeInstruction = await client.createInitializeInstruction({ owner: owner.address })
    const initializeResult = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(owner.address),
      createKeyedSystemAccount(counterAddress, 0n),
    ])
    initializeResult.assertSuccess()

    const decrementInstruction = await client.createDecrementInstruction({ owner: owner.address })
    const decrementResult = vm.processInstruction(decrementInstruction, initializeResult.accounts)
    decrementResult.assertCustomError(1)
  })

  it('rejects increment past u64::MAX with Overflow', async () => {
    const vm = await createVm()
    const owner = await generateKeyPairSigner()
    const counterAddress = await findCounterAddress(owner.address)

    const initializeInstruction = await client.createInitializeInstruction({ owner: owner.address })
    const initializeResult = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(owner.address),
      createKeyedSystemAccount(counterAddress, 0n),
    ])
    initializeResult.assertSuccess()

    const setInstruction = await client.createSetInstruction({
      owner: owner.address,
      value: 18_446_744_073_709_551_615n,
    })
    const setResult = vm.processInstruction(setInstruction, initializeResult.accounts)
    setResult.assertSuccess()

    const incrementInstruction = await client.createIncrementInstruction({ owner: owner.address })
    const incrementResult = vm.processInstruction(incrementInstruction, setResult.accounts)
    incrementResult.assertCustomError(2)
  })

  it('rejects mutations from a non-owner even if they target the real counter PDA', async () => {
    const vm = await createVm()
    const owner = await generateKeyPairSigner()
    const attacker = await generateKeyPairSigner()
    const counterAddress = await findCounterAddress(owner.address)

    const initializeInstruction = await client.createInitializeInstruction({ owner: owner.address })
    const initializeResult = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(owner.address),
      createKeyedSystemAccount(attacker.address),
      createKeyedSystemAccount(counterAddress, 0n),
    ])
    initializeResult.assertSuccess()

    const setInstruction = await client.createSetInstruction({ owner: attacker.address, value: 7n })
    expect(setInstruction.accounts).toBeDefined()
    const unauthorizedSetInstruction = {
      ...setInstruction,
      accounts: setInstruction.accounts!.map((account, index) =>
        index === 1 ? { ...account, address: counterAddress } : account,
      ),
    }
    const unauthorizedSetResult = vm.processInstruction(unauthorizedSetInstruction, initializeResult.accounts)
    expect(unauthorizedSetResult.logs.at(-1)).toContain('custom program error: 0x0')
    expect(PROGRAM_ERRORS[0]?.name).toBe('Unauthorized')
    expect(getCounterValue(unauthorizedSetResult, counterAddress)).toBe(0n)

    const deleteInstruction = await client.createDeleteInstruction({ owner: attacker.address })
    expect(deleteInstruction.accounts).toBeDefined()
    const unauthorizedDeleteInstruction = {
      ...deleteInstruction,
      accounts: deleteInstruction.accounts!.map((account, index) =>
        index === 1 ? { ...account, address: counterAddress } : account,
      ),
    }
    const attackerBeforeUnauthorizedDelete = initializeResult.account(attacker.address)
    expect(attackerBeforeUnauthorizedDelete).not.toBeNull()
    const unauthorizedDeleteResult = vm.processInstruction(unauthorizedDeleteInstruction, initializeResult.accounts)
    expect(unauthorizedDeleteResult.logs.at(-1)).toContain('custom program error: 0x0')
    expect(getCounterValue(unauthorizedDeleteResult, counterAddress)).toBe(0n)

    const attackerAfterUnauthorizedDelete = unauthorizedDeleteResult.account(attacker.address)
    expect(attackerAfterUnauthorizedDelete).not.toBeNull()
    expect(BigInt(attackerAfterUnauthorizedDelete!.lamports)).toBe(BigInt(attackerBeforeUnauthorizedDelete!.lamports))
  })
})
