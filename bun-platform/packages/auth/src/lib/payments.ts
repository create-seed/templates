import { Polar } from '@polar-sh/sdk'
import { env } from '@bun-platform/env/api'

const polarAccessToken = env.POLAR_ACCESS_TOKEN
const polarSuccessUrl = env.POLAR_SUCCESS_URL ?? null

export const isPolarEnabled = Boolean(polarAccessToken)

if (isPolarEnabled && !polarSuccessUrl) {
  throw new Error('POLAR_SUCCESS_URL must be set when POLAR_ACCESS_TOKEN is configured.')
}

export const polarClient = polarAccessToken
  ? new Polar({
      accessToken: polarAccessToken,
      server: env.POLAR_SERVER,
    })
  : null

export const resolvedPolarSuccessUrl = polarSuccessUrl
