import { describe, expect, test } from 'bun:test'

import { isAdminEmail } from '../src/lib/admin-email'

describe('isAdminEmail', () => {
  test('matches exact email patterns case-insensitively', () => {
    expect(isAdminEmail('Alice@Example.com', ['alice@example.com'])).toBe(true)
  })

  test('matches wildcard domain patterns case-insensitively', () => {
    expect(isAdminEmail('owner@Example.com', ['*@example.com'])).toBe(true)
  })

  test('rejects addresses outside the allowed exact emails and domains', () => {
    expect(isAdminEmail('owner@other.dev', ['alice@example.com', '*@example.com'])).toBe(false)
  })
})
