import { describe, expect, test } from 'bun:test'

import { isLocalDatabaseUrl } from '../src/lib/local-database-url'

describe('isLocalDatabaseUrl', () => {
  test('accepts file database URLs', () => {
    expect(isLocalDatabaseUrl('file:///tmp/bun-platform.sqlite')).toBe(true)
  })

  test('accepts local network database URLs across supported protocols', () => {
    expect(isLocalDatabaseUrl('http://localhost:8080')).toBe(true)
    expect(isLocalDatabaseUrl('https://127.0.0.1:8080')).toBe(true)
    expect(isLocalDatabaseUrl('libsql://[::1]:8080')).toBe(true)
    expect(isLocalDatabaseUrl('ws://localhost:8080')).toBe(true)
    expect(isLocalDatabaseUrl('wss://127.0.0.1:8080')).toBe(true)
  })

  test('rejects remote hosts, unsupported protocols, and malformed URLs', () => {
    expect(isLocalDatabaseUrl('https://db.bun-platform.dev')).toBe(false)
    expect(isLocalDatabaseUrl('ftp://localhost/data.sqlite')).toBe(false)
    expect(isLocalDatabaseUrl('not-a-url')).toBe(false)
  })
})
