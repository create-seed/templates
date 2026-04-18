import type { ClusterUrl } from '@solana/kit'

import { type createSolanaClient } from './create-solana-client'

export type SolanaClient<T extends ClusterUrl = string> = ReturnType<typeof createSolanaClient<T>>
