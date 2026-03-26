import { describe, expect, test } from 'bun:test'

import { resolveRpcUrl } from '../src/lib/rpc-url'

describe('resolveRpcUrl', () => {
  test('joins a bare origin with the default rpc path', () => {
    expect(resolveRpcUrl('https://api.bun-platform.test', '/rpc')).toBe('https://api.bun-platform.test/rpc')
  })

  test('normalizes a trailing slash on the base URL and a missing slash on the rpc path', () => {
    expect(resolveRpcUrl('https://api.bun-platform.test/', 'rpc')).toBe('https://api.bun-platform.test/rpc')
  })

  test('preserves an existing pathname on the base URL', () => {
    expect(resolveRpcUrl('https://api.bun-platform.test/base/', '/rpc')).toBe('https://api.bun-platform.test/base/rpc')
  })
})
