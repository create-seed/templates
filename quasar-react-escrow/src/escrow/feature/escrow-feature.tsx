import { address } from '@solana/kit'
import { type SolanaCluster, type UiWallet, type UiWalletAccount, WalletUiIcon } from '@wallet-ui/react'
import { type FormEvent, type ReactNode, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/core/ui/alert'
import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/core/ui/field'
import { Input } from '@/core/ui/input'
import { Spinner } from '@/core/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs'
import { Textarea } from '@/core/ui/textarea'
import { useEscrowAccountQuery } from '@/escrow/data-access/use-escrow-account-query'
import { type EscrowOfferPayload, useEscrowProgramMutation } from '@/escrow/data-access/use-escrow-program-mutation'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiExplorerLink } from '@/solana/ui/solana-ui-explorer-link'
import { SolanaUiWalletGuard } from '@/solana/ui/solana-ui-wallet-guard'
import { TOKEN_PROGRAM_ADDRESS, type WalletTokenAccount } from '@/wallet/data-access/get-token-accounts-by-owner'
import {
  useWalletTokenAccountsQuery,
  type WalletTokenAccountsState,
} from '@/wallet/data-access/use-wallet-token-accounts-query'

const CIRCLE_DEVNET_EURC_MINT = 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'
const CIRCLE_DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
const CIRCLE_FAUCET_URL = 'https://faucet.circle.com'
const USD_PER_EUR_DENOMINATOR = 10n
const USD_PER_EUR_NUMERATOR = 12n
const ESCROW_ACTIVE_TAB_STORAGE_KEY = 'quasar-react-escrow:active-tab'
const ESCROW_SAVED_OFFERS_STORAGE_KEY = 'quasar-react-escrow:saved-offers'

const CIRCLE_DEVNET_MINT_PRESETS = [
  {
    label: 'Circle Devnet EURC',
    mint: CIRCLE_DEVNET_EURC_MINT,
    symbol: 'EURC',
  },
  {
    label: 'Circle Devnet USDC',
    mint: CIRCLE_DEVNET_USDC_MINT,
    symbol: 'USDC',
  },
] as const

type EscrowTab = 'latest' | 'make' | 'saved' | 'use'

interface MintOption {
  label: string
  mint: string
  source: 'preset' | 'wallet'
}

interface SavedEscrowOffer {
  clusterId: string
  createdAt: string
  offerPayload: EscrowOfferPayload
}

export function EscrowFeature() {
  return (
    <SolanaUiWalletGuard
      render={({ account, cluster, wallet }) => (
        <EscrowFeatureConnected account={account} cluster={cluster} wallet={wallet} />
      )}
    />
  )
}

function AddressField({
  description,
  label,
  onChange,
  picker,
  placeholder,
  value,
}: {
  description: string
  label: string
  onChange: (value: string) => void
  picker?: ReactNode
  placeholder: string
  value: string
}) {
  const id = label.toLowerCase().replaceAll(/\s+/g, '-')

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        {picker}
        <Input
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          value={value}
        />
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  )
}

function AmountField({
  description,
  label,
  onChange,
  placeholder,
  value,
}: {
  description: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  const id = label.toLowerCase().replaceAll(/\s+/g, '-')

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={id}
          inputMode="numeric"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  )
}

function calculateCircleDemoReceiveAmount({
  depositAmount,
  depositMint,
  requestedMint,
}: {
  depositAmount: string
  depositMint: string
  requestedMint: string
}) {
  const trimmedDepositAmount = depositAmount.trim()

  if (!trimmedDepositAmount || !/^\d+$/.test(trimmedDepositAmount)) {
    return null
  }

  const amount = BigInt(trimmedDepositAmount)

  if (depositMint === CIRCLE_DEVNET_USDC_MINT && requestedMint === CIRCLE_DEVNET_EURC_MINT) {
    return ((amount * USD_PER_EUR_DENOMINATOR) / USD_PER_EUR_NUMERATOR).toString()
  }

  if (depositMint === CIRCLE_DEVNET_EURC_MINT && requestedMint === CIRCLE_DEVNET_USDC_MINT) {
    return ((amount * USD_PER_EUR_NUMERATOR) / USD_PER_EUR_DENOMINATOR).toString()
  }

  return null
}

function EscrowFeatureConnected({
  account,
  cluster,
  wallet,
}: {
  account: UiWalletAccount
  cluster: SolanaCluster
  wallet: UiWallet
}) {
  const isDevnet = cluster.id === 'solana:devnet'
  const client = useSolanaClient()
  const mutation = useEscrowProgramMutation({
    account,
    client,
  })
  const walletTokenAccounts = useWalletTokenAccountsQuery({
    account,
    client,
    cluster: cluster.id,
  })
  const currentEscrow = useEscrowAccountQuery({
    client,
    cluster: cluster.id,
    makerAddress: account.address,
  })
  const [activeTab, setActiveTab] = useState<EscrowTab>(() => readActiveTabFromStorage())
  const [lookupError, setLookupError] = useState<null | string>(null)
  const [lookupMakerAddress, setLookupMakerAddress] = useState<null | string>(null)
  const [lookupMakerInput, setLookupMakerInput] = useState('')
  const [lookupVaultTaAInput, setLookupVaultTaAInput] = useState('')
  const lookedUpEscrow = useEscrowAccountQuery({
    client,
    cluster: cluster.id,
    enabled: !!lookupMakerAddress,
    makerAddress: lookupMakerAddress,
  })
  const [makeDepositInput, setMakeDepositInput] = useState('1337')
  const [makeMakerTaAInput, setMakeMakerTaAInput] = useState('')
  const [makeMakerTaBInput, setMakeMakerTaBInput] = useState('')
  const [makeMintAInput, setMakeMintAInput] = useState('')
  const [makeMintBInput, setMakeMintBInput] = useState('')
  const [makeReceiveInput, setMakeReceiveInput] = useState('733')
  const [makeVaultTaAInput, setMakeVaultTaAInput] = useState('')
  const [refundMakerTaAInput, setRefundMakerTaAInput] = useState('')
  const [savedOffers, setSavedOffers] = useState<SavedEscrowOffer[]>(() => readSavedOffersFromStorage())
  const [takeTakerTaAInput, setTakeTakerTaAInput] = useState('')
  const [takeTakerTaBInput, setTakeTakerTaBInput] = useState('')
  const connectedTokenAccounts =
    walletTokenAccounts.state.status === 'success' ? walletTokenAccounts.state.tokenAccounts : []
  const classicTokenAccounts = connectedTokenAccounts.filter(
    (tokenAccount) => tokenAccount.programId === TOKEN_PROGRAM_ADDRESS,
  )
  const connectedMintOptions = getConnectedMintOptions(classicTokenAccounts)
  const makeMintOptions = getMakeMintOptions(connectedMintOptions, isDevnet)
  const token2022Accounts = connectedTokenAccounts.filter(
    (tokenAccount) => tokenAccount.programId !== TOKEN_PROGRAM_ADDRESS,
  )
  const makeDepositTokenAccounts = filterTokenAccountsByMint(classicTokenAccounts, makeMintAInput)
  const makeReceiveTokenAccounts = filterTokenAccountsByMint(classicTokenAccounts, makeMintBInput)
  const refundTokenAccounts = filterTokenAccountsByMint(classicTokenAccounts, lookedUpEscrow.escrow?.mint_a ?? '')
  const savedOffersForCluster = savedOffers.filter((savedOffer) => savedOffer.clusterId === cluster.id)
  const selectedDepositTokenAccount =
    classicTokenAccounts.find((tokenAccount) => tokenAccount.address === makeMakerTaAInput) ?? null
  const selectedMakerReceiveTokenAccount =
    classicTokenAccounts.find((tokenAccount) => tokenAccount.address === makeMakerTaBInput) ?? null
  const takeReceiveTokenAccounts = filterTokenAccountsByMint(classicTokenAccounts, lookedUpEscrow.escrow?.mint_a ?? '')
  const takePaymentTokenAccounts = filterTokenAccountsByMint(classicTokenAccounts, lookedUpEscrow.escrow?.mint_b ?? '')
  const lookedUpRequestedMint = lookedUpEscrow.escrow?.mint_b ?? ''
  const requestedCirclePreset = lookedUpRequestedMint
    ? (CIRCLE_DEVNET_MINT_PRESETS.find((preset) => preset.mint === lookedUpRequestedMint) ?? null)
    : null
  const currentEscrowDecodeError =
    currentEscrow.programStatus === 'deployed' && !!currentEscrow.programMessage && !currentEscrow.escrow
  const lookedUpEscrowDecodeError =
    lookedUpEscrow.programStatus === 'deployed' && !!lookedUpEscrow.programMessage && !lookedUpEscrow.escrow
  const takePaymentAccountMissing =
    lookedUpEscrow.programStatus === 'deployed' && !!lookedUpEscrow.escrow && !takeTakerTaBInput.trim()
  const latestAction = formatActionLabel(mutation.lastAction)
  const canMake =
    currentEscrow.programStatus === 'deployed' &&
    currentEscrow.escrow === null &&
    !currentEscrowDecodeError &&
    !mutation.isLoading
  const canRefund =
    lookedUpEscrow.programStatus === 'deployed' &&
    !!lookedUpEscrow.escrow &&
    !!lookupVaultTaAInput.trim() &&
    !!refundMakerTaAInput.trim() &&
    lookupMakerAddress === account.address &&
    !mutation.isLoading
  const canTake =
    lookedUpEscrow.programStatus === 'deployed' &&
    !!lookedUpEscrow.escrow &&
    !!lookupVaultTaAInput.trim() &&
    !!takeTakerTaBInput.trim() &&
    !mutation.isLoading
  const currentStatusLabel = currentEscrow.isLoading
    ? 'Loading'
    : currentEscrow.programStatus !== 'deployed'
      ? 'Unavailable'
      : currentEscrowDecodeError
        ? 'Unreadable'
        : currentEscrow.escrow
          ? 'Open'
          : 'Ready'
  const currentStatusVariant = currentEscrow.isLoading
    ? 'secondary'
    : currentEscrow.programStatus !== 'deployed'
      ? 'destructive'
      : currentEscrowDecodeError
        ? 'destructive'
        : currentEscrow.escrow
          ? 'default'
          : 'outline'
  const lookupStatusLabel = !lookupMakerAddress
    ? 'Idle'
    : lookedUpEscrow.isLoading
      ? 'Loading'
      : lookedUpEscrow.programStatus !== 'deployed'
        ? 'Unavailable'
        : lookedUpEscrowDecodeError
          ? 'Unreadable'
          : lookedUpEscrow.escrow
            ? 'Loaded'
            : 'Not found'
  const lookupStatusVariant = !lookupMakerAddress
    ? 'outline'
    : lookedUpEscrow.isLoading
      ? 'secondary'
      : lookedUpEscrow.programStatus !== 'deployed'
        ? 'destructive'
        : lookedUpEscrowDecodeError
          ? 'destructive'
          : lookedUpEscrow.escrow
            ? 'default'
            : 'outline'

  function setAndPersistActiveTab(nextTab: EscrowTab) {
    setActiveTab(nextTab)
    writeActiveTabToStorage(nextTab)
  }

  function setAndPersistSavedOffers(nextSavedOffers: SavedEscrowOffer[]) {
    setSavedOffers(nextSavedOffers)
    writeSavedOffersToStorage(nextSavedOffers)
  }

  function handleLookupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLookupError(null)

    const trimmed = lookupMakerInput.trim()

    if (!trimmed) {
      setLookupError('Maker address is required to load an escrow offer.')
      return
    }

    try {
      setLookupMakerAddress(address(trimmed))
    } catch {
      setLookupError('Maker address must be a valid Solana address.')
    }
  }

  async function handleMakeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await mutation.makeOffer({
      deposit: makeDepositInput,
      makerTaA: makeMakerTaAInput,
      makerTaB: makeMakerTaBInput,
      mintA: makeMintAInput,
      mintB: makeMintBInput,
      receive: makeReceiveInput,
      vaultTaA: makeVaultTaAInput,
    })

    if (result?.details.offerPayload) {
      saveOfferToBrowser(result.details.offerPayload)
    }
  }

  function handleRefundSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lookupMakerAddress || !lookedUpEscrow.escrow) {
      return
    }

    void mutation.refundOffer({
      maker: lookupMakerAddress,
      makerTaA: refundMakerTaAInput,
      mintA: lookedUpEscrow.escrow.mint_a,
      vaultTaA: lookupVaultTaAInput,
    })
  }

  function handleTakeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lookupMakerAddress || !lookedUpEscrow.escrow) {
      return
    }

    void mutation.takeOffer({
      maker: lookupMakerAddress,
      makerTaB: lookedUpEscrow.escrow.maker_ta_b,
      mintA: lookedUpEscrow.escrow.mint_a,
      mintB: lookedUpEscrow.escrow.mint_b,
      takerTaA: takeTakerTaAInput,
      takerTaB: takeTakerTaBInput,
      vaultTaA: lookupVaultTaAInput,
    })
  }

  async function handleCopyPayload() {
    if (!mutation.details?.offerPayload || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(formatOfferPayload(mutation.details.offerPayload))
    } catch {
      // Ignore clipboard failures in non-secure contexts.
    }
  }

  async function handleCopySavedOffer(savedOffer: SavedEscrowOffer) {
    if (!navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(formatOfferPayload(savedOffer.offerPayload))
    } catch {
      // Ignore clipboard failures in non-secure contexts.
    }
  }

  function handleLoadSavedOffer(savedOffer: SavedEscrowOffer) {
    setLookupError(null)
    setLookupMakerInput(savedOffer.offerPayload.maker)
    setLookupVaultTaAInput(savedOffer.offerPayload.vaultTaA)
    setRefundMakerTaAInput('')
    setTakeTakerTaAInput('')
    setTakeTakerTaBInput('')

    try {
      setLookupMakerAddress(address(savedOffer.offerPayload.maker))
      setAndPersistActiveTab('use')
    } catch {
      setLookupError('The saved offer contains an invalid maker address.')
    }
  }

  function handleRemoveSavedOffer(savedOffer: SavedEscrowOffer) {
    setAndPersistSavedOffers(
      savedOffers.filter(
        (existingOffer) =>
          !(
            existingOffer.clusterId === savedOffer.clusterId &&
            existingOffer.offerPayload.escrow === savedOffer.offerPayload.escrow
          ),
      ),
    )
  }

  function handleClearSavedOffersForCluster() {
    setAndPersistSavedOffers(savedOffers.filter((savedOffer) => savedOffer.clusterId !== cluster.id))
  }

  function applyCircleDemoPair({ depositMint, requestedMint }: { depositMint: string; requestedMint: string }) {
    const depositTokenAccount = findPreferredTokenAccount(classicTokenAccounts, depositMint)
    const makerReceiveTokenAccount = findPreferredTokenAccount(classicTokenAccounts, requestedMint)
    const nextDepositAmount = depositTokenAccount?.rawAmount ?? makeDepositInput
    const nextReceiveAmount = calculateCircleDemoReceiveAmount({
      depositAmount: nextDepositAmount,
      depositMint,
      requestedMint,
    })

    setMakeMakerTaAInput(depositTokenAccount?.address ?? '')
    setMakeMakerTaBInput(makerReceiveTokenAccount?.address ?? '')
    setMakeMintAInput(depositMint)
    setMakeMintBInput(requestedMint)

    if (depositTokenAccount) {
      setMakeDepositInput(depositTokenAccount.rawAmount)
    }

    if (nextReceiveAmount) {
      setMakeReceiveInput(nextReceiveAmount)
    }
  }

  function handleTabChange(nextTab: string) {
    if (!isEscrowTab(nextTab)) {
      return
    }

    setAndPersistActiveTab(nextTab)
  }

  function saveOfferToBrowser(offerPayload: EscrowOfferPayload) {
    const nextSavedOffer: SavedEscrowOffer = {
      clusterId: cluster.id,
      createdAt: new Date().toISOString(),
      offerPayload,
    }

    setAndPersistSavedOffers([
      nextSavedOffer,
      ...savedOffers.filter(
        (savedOffer) =>
          !(savedOffer.clusterId === cluster.id && savedOffer.offerPayload.escrow === offerPayload.escrow),
      ),
    ])
    setAndPersistActiveTab('saved')
  }

  return (
    <div className="mx-auto my-4 max-w-6xl space-y-4 px-4">
      <Card className="border-border/60">
        <CardHeader className="gap-2">
          <CardTitle className="flex gap-2 text-xl font-semibold tracking-tight">
            <WalletUiIcon className="size-6" wallet={wallet} />
            {wallet.name}
          </CardTitle>
          <CardDescription className="max-w-3xl text-sm/6">
            Connected as {account.address}. The escrow forms can pull from the connected wallet&apos;s parsed token
            accounts, so selecting a token account can fill the address and matching mint for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertTitle>Classic SPL Token only</AlertTitle>
            <AlertDescription>
              This escrow example currently supports only classic SPL Token accounts and mints owned by{' '}
              <span className="font-mono">{TOKEN_PROGRAM_ADDRESS}</span>. Token-2022 inputs are filtered out of the
              dropdowns and pasted Token-2022 addresses will be rejected before submit.
            </AlertDescription>
          </Alert>
          {currentEscrow.programMessage ? (
            <Alert variant={currentEscrowDecodeError ? 'destructive' : 'default'}>
              <AlertTitle>
                {currentEscrowDecodeError
                  ? 'Connected maker escrow is unreadable'
                  : 'Program unavailable on this cluster'}
              </AlertTitle>
              <AlertDescription>{currentEscrow.programMessage}</AlertDescription>
            </Alert>
          ) : null}
          {token2022Accounts.length ? (
            <Alert>
              <AlertTitle>Token-2022 accounts detected</AlertTitle>
              <AlertDescription>
                {token2022Accounts.length} connected token account{token2022Accounts.length === 1 ? '' : 's'} use
                Token-2022 and cannot be used with this escrow example.
              </AlertDescription>
            </Alert>
          ) : null}
          {currentEscrow.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load the connected maker state</AlertTitle>
              <AlertDescription>{formatUnknownError(currentEscrow.error)}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Program</div>
                <Badge variant={currentStatusVariant}>{currentStatusLabel}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="font-medium">Cluster</div>
                <div className="font-mono text-muted-foreground">{cluster.label}</div>
                <div className="font-medium">Program address</div>
                <SolanaUiExplorerLink
                  className="inline-flex gap-1 font-mono text-xs"
                  label={formatAddress(currentEscrow.programAddress)}
                  path={`/address/${currentEscrow.programAddress}`}
                />
                <div className="font-medium">Your escrow PDA</div>
                {currentEscrow.escrowAddress ? (
                  <SolanaUiExplorerLink
                    className="inline-flex gap-1 font-mono text-xs"
                    label={formatAddress(currentEscrow.escrowAddress)}
                    path={`/address/${currentEscrow.escrowAddress}`}
                  />
                ) : (
                  <div className="text-muted-foreground">Deriving escrow PDA...</div>
                )}
                <div className="text-xs/relaxed text-muted-foreground">
                  {currentEscrow.isRefreshing
                    ? 'Refreshing on-chain state...'
                    : 'The connected maker can hold one open escrow PDA at a time.'}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="text-sm font-medium">Connected maker state</div>
              <div className="mt-1 text-xs/relaxed text-muted-foreground">
                {currentEscrow.escrow
                  ? 'This wallet already has an open escrow offer. Refund or complete it before opening another one.'
                  : 'No open escrow was found for the connected maker PDA on this cluster.'}
              </div>
              {currentEscrow.escrow ? (
                <EscrowSummary escrow={currentEscrow.escrow} escrowAddress={currentEscrow.escrowAddress} />
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border/60 p-3 text-xs/relaxed text-muted-foreground">
                  A successful `make` transaction will populate this card with the on-chain offer data and the derived
                  escrow PDA.
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="text-sm font-medium">Offer payload</div>
              <div className="mt-1 text-xs/relaxed text-muted-foreground">
                The escrow vault token account is not recoverable from the on-chain escrow account, so the maker needs
                to share it alongside the escrow PDA and mint addresses. Successful `make` transactions are also saved
                in this browser for demo use.
              </div>
              {mutation.details?.offerPayload ? (
                <div className="mt-4 space-y-3">
                  <Textarea
                    className="min-h-40 font-mono text-xs"
                    readOnly
                    value={formatOfferPayload(mutation.details.offerPayload)}
                  />
                  <Button className="w-full" onClick={() => void handleCopyPayload()} type="button" variant="secondary">
                    Copy offer payload
                  </Button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border/60 p-3 text-xs/relaxed text-muted-foreground">
                  Submit a `make` transaction to generate the shareable payload for takers.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs className="space-y-4" onValueChange={handleTabChange} value={activeTab}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto p-1" variant="line">
          <TabsTrigger value="make">Make offer</TabsTrigger>
          <TabsTrigger value="use">Use offer</TabsTrigger>
          <TabsTrigger value="saved">
            Saved offers
            {savedOffersForCluster.length ? ` (${savedOffersForCluster.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="latest">Latest result</TabsTrigger>
        </TabsList>

        <TabsContent value="make">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Make Offer</CardTitle>
              <CardDescription>
                Choose existing token accounts from the connected wallet dropdowns or paste addresses manually. Leave
                the maker receive token account or escrow vault token account blank to generate a fresh signer-backed
                account in the browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleMakeSubmit}>
                {isDevnet ? (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Demo</Badge>
                      <div className="text-sm font-medium">Circle Devnet presets</div>
                    </div>
                    <div className="mt-1 text-xs/relaxed text-muted-foreground">
                      Get devnet USDC or EURC from{' '}
                      <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href={CIRCLE_FAUCET_URL}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Circle&apos;s Testnet Faucet
                      </a>{' '}
                      and use the preset pairs below for a faster demo. The default demo rate is 1 EUR = 1.2 USD.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          applyCircleDemoPair({
                            depositMint: CIRCLE_DEVNET_USDC_MINT,
                            requestedMint: CIRCLE_DEVNET_EURC_MINT,
                          })
                        }
                        type="button"
                        variant="outline"
                      >
                        Use USDC → EURC
                      </Button>
                      <Button
                        onClick={() =>
                          applyCircleDemoPair({
                            depositMint: CIRCLE_DEVNET_EURC_MINT,
                            requestedMint: CIRCLE_DEVNET_USDC_MINT,
                          })
                        }
                        type="button"
                        variant="outline"
                      >
                        Use EURC → USDC
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <SolanaUiExplorerLink
                        className="inline-flex gap-1"
                        label="Devnet EURC mint"
                        path={`/address/${CIRCLE_DEVNET_EURC_MINT}`}
                      />
                      <SolanaUiExplorerLink
                        className="inline-flex gap-1"
                        label="Devnet USDC mint"
                        path={`/address/${CIRCLE_DEVNET_USDC_MINT}`}
                      />
                    </div>
                  </div>
                ) : null}
                <FormStep
                  description="Pick the token account that already holds the deposit. Choosing from the connected wallet also fills the deposit mint and the full raw balance."
                  step="Step 1"
                  title="Choose what to deposit"
                />
                <FieldGroup>
                  <AddressField
                    description="Choose a deposit account from the connected wallet or paste one manually. Picking from the list also fills the deposit mint and raw deposit amount."
                    label="Deposit token account"
                    onChange={setMakeMakerTaAInput}
                    picker={
                      <TokenAccountPicker
                        accounts={makeDepositTokenAccounts}
                        label="deposit token account"
                        onSelect={(tokenAccount) => {
                          setMakeMakerTaAInput(tokenAccount.address)
                          setMakeMintAInput(tokenAccount.mint)

                          const nextReceiveAmount = calculateCircleDemoReceiveAmount({
                            depositAmount: tokenAccount.rawAmount,
                            depositMint: tokenAccount.mint,
                            requestedMint: makeMintBInput,
                          })

                          setMakeDepositInput(tokenAccount.rawAmount)

                          if (nextReceiveAmount) {
                            setMakeReceiveInput(nextReceiveAmount)
                          }
                        }}
                        selectedAddress={makeMakerTaAInput}
                        state={walletTokenAccounts.state}
                      />
                    }
                    placeholder="Existing deposit token account"
                    value={makeMakerTaAInput}
                  />
                  <AddressField
                    description="Mint the maker is depositing into the escrow vault. This fills automatically when you pick a deposit token account."
                    label="Deposit mint"
                    onChange={setMakeMintAInput}
                    picker={
                      <MintPicker
                        label="deposit mint"
                        onSelect={(mint) => {
                          setMakeMintAInput(mint)

                          if (selectedDepositTokenAccount && selectedDepositTokenAccount.mint !== mint) {
                            setMakeMakerTaAInput('')
                          }

                          const nextReceiveAmount = calculateCircleDemoReceiveAmount({
                            depositAmount: makeDepositInput,
                            depositMint: mint,
                            requestedMint: makeMintBInput,
                          })

                          if (nextReceiveAmount) {
                            setMakeReceiveInput(nextReceiveAmount)
                          }
                        }}
                        options={makeMintOptions}
                        selectedMint={makeMintAInput}
                      />
                    }
                    placeholder="Deposit mint"
                    value={makeMintAInput}
                  />
                  <AmountField
                    description={
                      selectedDepositTokenAccount
                        ? `Prefilled from the selected account balance: ${selectedDepositTokenAccount.uiAmountString} tokens, raw ${selectedDepositTokenAccount.rawAmount}. Edit this if you want to escrow less than the full balance.`
                        : 'Raw u64 amount of deposit mint tokens to escrow. Choose a deposit account above to prefill this from its raw balance.'
                    }
                    label="Deposit amount"
                    onChange={(value) => {
                      setMakeDepositInput(value)

                      const nextReceiveAmount = calculateCircleDemoReceiveAmount({
                        depositAmount: value,
                        depositMint: makeMintAInput,
                        requestedMint: makeMintBInput,
                      })

                      if (nextReceiveAmount) {
                        setMakeReceiveInput(nextReceiveAmount)
                      }
                    }}
                    placeholder="1337"
                    value={makeDepositInput}
                  />
                </FieldGroup>
                <FormStep
                  description="Define what the maker wants back when the taker completes the escrow."
                  step="Step 2"
                  title="Choose what you want in return"
                />
                <FieldGroup>
                  <AddressField
                    description="Mint the maker expects to receive from the taker. This fills automatically when you pick a maker receive token account."
                    label="Requested mint"
                    onChange={setMakeMintBInput}
                    picker={
                      <MintPicker
                        label="requested mint"
                        onSelect={(mint) => {
                          setMakeMintBInput(mint)

                          if (selectedMakerReceiveTokenAccount && selectedMakerReceiveTokenAccount.mint !== mint) {
                            setMakeMakerTaBInput('')
                          }

                          const nextReceiveAmount = calculateCircleDemoReceiveAmount({
                            depositAmount: makeDepositInput,
                            depositMint: makeMintAInput,
                            requestedMint: mint,
                          })

                          if (nextReceiveAmount) {
                            setMakeReceiveInput(nextReceiveAmount)
                          }
                        }}
                        options={makeMintOptions}
                        selectedMint={makeMintBInput}
                      />
                    }
                    placeholder="Requested mint"
                    value={makeMintBInput}
                  />
                  <AmountField
                    description={
                      calculateCircleDemoReceiveAmount({
                        depositAmount: makeDepositInput,
                        depositMint: makeMintAInput,
                        requestedMint: makeMintBInput,
                      })
                        ? 'Auto-calculated with the Circle demo rate of 1 EUR = 1.2 USD. You can still edit this manually.'
                        : 'Raw u64 amount of requested mint tokens the taker must send.'
                    }
                    label="Receive amount"
                    onChange={setMakeReceiveInput}
                    placeholder="733"
                    value={makeReceiveInput}
                  />
                </FieldGroup>
                <FormStep
                  description="Use existing destination accounts if you have them, or let the browser generate fresh signer-backed accounts for the maker receive account and escrow vault."
                  step="Step 3"
                  title="Choose destination accounts"
                />
                <FieldGroup>
                  <AddressField
                    description="Optional. Pick an existing receive account from the connected wallet or leave this blank to create a fresh maker-side receive account."
                    label="Maker receive token account"
                    onChange={setMakeMakerTaBInput}
                    picker={
                      <TokenAccountPicker
                        accounts={makeReceiveTokenAccounts}
                        label="maker receive token account"
                        onSelect={(tokenAccount) => {
                          setMakeMakerTaBInput(tokenAccount.address)
                          setMakeMintBInput(tokenAccount.mint)
                        }}
                        selectedAddress={makeMakerTaBInput}
                        state={walletTokenAccounts.state}
                      />
                    }
                    placeholder="Optional existing maker receive token account"
                    value={makeMakerTaBInput}
                  />
                  <AddressField
                    description="Optional. Leave blank to create a fresh vault token account signer."
                    label="Escrow vault token account"
                    onChange={setMakeVaultTaAInput}
                    placeholder="Optional existing escrow vault token account"
                    value={makeVaultTaAInput}
                  />
                </FieldGroup>
                <FormStep
                  description="Submit the make transaction. Once it confirms, the payload card will show the shareable offer details for takers and save them in this browser."
                  step="Step 4"
                  title="Create the offer"
                />
                <Button className="w-full" disabled={!canMake} type="submit">
                  {mutation.isLoading && mutation.lastAction === 'make' ? <Spinner /> : null}
                  {mutation.isLoading && mutation.lastAction === 'make' ? 'Sending make...' : 'Create escrow offer'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="use">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Lookup, Take, or Refund</CardTitle>
              <CardDescription>
                Load the maker PDA first, then supply the escrow vault token account from the shared offer so the taker
                or maker can complete the flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-4" onSubmit={handleLookupSubmit}>
                <FormStep
                  description="Start with the maker wallet and the escrow vault token account from the shared offer payload."
                  step="Step 1"
                  title="Load the existing offer"
                />
                <FieldGroup>
                  <AddressField
                    description="Maker wallet address used to derive the escrow PDA."
                    label="Maker address"
                    onChange={setLookupMakerInput}
                    placeholder="Maker wallet address"
                    value={lookupMakerInput}
                  />
                  <AddressField
                    description="Required off-chain because the escrow state does not store the vault token account."
                    label="Escrow vault token account"
                    onChange={setLookupVaultTaAInput}
                    placeholder="Escrow vault token account from the offer payload"
                    value={lookupVaultTaAInput}
                  />
                </FieldGroup>
                <Button className="w-full" type="submit" variant="outline">
                  Load offer
                </Button>
              </form>

              {lookupError ? (
                <Alert variant="destructive">
                  <AlertTitle>Lookup error</AlertTitle>
                  <AlertDescription>{lookupError}</AlertDescription>
                </Alert>
              ) : null}
              {lookedUpEscrow.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to load the requested escrow</AlertTitle>
                  <AlertDescription>{formatUnknownError(lookedUpEscrow.error)}</AlertDescription>
                </Alert>
              ) : null}
              {lookedUpEscrow.programMessage ? (
                <Alert variant={lookedUpEscrowDecodeError ? 'destructive' : 'default'}>
                  <AlertTitle>
                    {lookedUpEscrowDecodeError ? 'Loaded escrow is unreadable' : 'Program unavailable on this cluster'}
                  </AlertTitle>
                  <AlertDescription>{lookedUpEscrow.programMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Loaded offer</div>
                  <Badge variant={lookupStatusVariant}>{lookupStatusLabel}</Badge>
                </div>
                <div className="mt-1 text-xs/relaxed text-muted-foreground">
                  {lookedUpEscrow.escrow
                    ? 'Maker, mint, and receive fields come from the decoded escrow account. Only taker-side accounts remain editable.'
                    : 'Enter a maker address to derive the PDA and inspect whether an escrow is currently open.'}
                </div>
                {lookedUpEscrow.escrow ? (
                  <EscrowSummary escrow={lookedUpEscrow.escrow} escrowAddress={lookedUpEscrow.escrowAddress} />
                ) : null}
              </div>

              <form className="space-y-4 rounded-lg border border-border/60 p-4" onSubmit={handleTakeSubmit}>
                <FormStep
                  description="Pick the connected wallet accounts that will pay the requested mint and receive the deposited mint."
                  step="Step 2"
                  title="Take the offer"
                />
                {takePaymentAccountMissing ? (
                  <Alert>
                    <AlertTitle>Payment account required</AlertTitle>
                    <AlertDescription>
                      The connected taker wallet needs a classic SPL Token payment account for the requested mint before
                      this offer can be taken.
                      {isDevnet && requestedCirclePreset ? (
                        <>
                          {' '}
                          Get devnet {requestedCirclePreset.symbol} from{' '}
                          <a
                            className="underline underline-offset-4 hover:text-foreground"
                            href={CIRCLE_FAUCET_URL}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Circle&apos;s Testnet Faucet
                          </a>{' '}
                          and then select the funded account here.
                        </>
                      ) : null}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <FieldGroup>
                  <AddressField
                    description="Optional. Pick an existing receive account from the connected wallet or leave this blank to generate a fresh taker-side receive account."
                    label="Taker receive token account"
                    onChange={setTakeTakerTaAInput}
                    picker={
                      <TokenAccountPicker
                        accounts={takeReceiveTokenAccounts}
                        defaultLabel="Choose classic SPL Token account (optional)"
                        emptyLabel="No matching classic SPL Token accounts"
                        label="taker receive token account"
                        onSelect={(tokenAccount) => setTakeTakerTaAInput(tokenAccount.address)}
                        selectedAddress={takeTakerTaAInput}
                        state={walletTokenAccounts.state}
                      />
                    }
                    placeholder="Optional existing taker receive token account"
                    value={takeTakerTaAInput}
                  />
                  <AddressField
                    description="Existing payment account in the connected wallet that holds the requested mint."
                    label="Taker payment token account"
                    onChange={setTakeTakerTaBInput}
                    picker={
                      <TokenAccountPicker
                        accounts={takePaymentTokenAccounts}
                        defaultLabel="Choose classic SPL Token account (required)"
                        emptyLabel="No matching classic SPL Token accounts for requested mint"
                        label="taker payment token account"
                        onSelect={(tokenAccount) => setTakeTakerTaBInput(tokenAccount.address)}
                        selectedAddress={takeTakerTaBInput}
                        state={walletTokenAccounts.state}
                      />
                    }
                    placeholder="Existing taker payment token account"
                    value={takeTakerTaBInput}
                  />
                </FieldGroup>
                <Button className="w-full" disabled={!canTake} type="submit">
                  {mutation.isLoading && mutation.lastAction === 'take' ? <Spinner /> : null}
                  {mutation.isLoading && mutation.lastAction === 'take' ? 'Sending take...' : 'Take escrow offer'}
                </Button>
              </form>

              <form className="space-y-4 rounded-lg border border-border/60 p-4" onSubmit={handleRefundSubmit}>
                <FormStep
                  description="If you are the maker, choose where the deposited tokens should go back when you refund the escrow."
                  step="Step 3"
                  title="Refund the offer"
                />
                {lookupMakerAddress && lookupMakerAddress !== account.address ? (
                  <Alert>
                    <AlertTitle>Maker-only action</AlertTitle>
                    <AlertDescription>
                      The connected wallet must match the loaded maker address to refund this escrow.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <FieldGroup>
                  <AddressField
                    description="Existing deposit-mint token account in the connected wallet that should receive the refunded balance."
                    label="Refund destination token account"
                    onChange={setRefundMakerTaAInput}
                    picker={
                      <TokenAccountPicker
                        accounts={refundTokenAccounts}
                        label="refund destination token account"
                        onSelect={(tokenAccount) => setRefundMakerTaAInput(tokenAccount.address)}
                        selectedAddress={refundMakerTaAInput}
                        state={walletTokenAccounts.state}
                      />
                    }
                    placeholder="Refund destination token account"
                    value={refundMakerTaAInput}
                  />
                </FieldGroup>
                <Button className="w-full" disabled={!canRefund} type="submit" variant="destructive">
                  {mutation.isLoading && mutation.lastAction === 'refund' ? <Spinner /> : null}
                  {mutation.isLoading && mutation.lastAction === 'refund' ? 'Sending refund...' : 'Refund escrow offer'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Saved Offers</CardTitle>
              <CardDescription>
                Successful `make` transactions are saved in this browser so the maker address and escrow vault token
                account stay easy to reload during the demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedOffersForCluster.length ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs/relaxed text-muted-foreground">
                    Showing {savedOffersForCluster.length} saved offer{savedOffersForCluster.length === 1 ? '' : 's'}{' '}
                    for {cluster.label}.
                  </div>
                  <Button onClick={handleClearSavedOffersForCluster} type="button" variant="outline">
                    Clear saved offers
                  </Button>
                </div>
              ) : null}
              {savedOffersForCluster.length ? (
                <div className="space-y-3">
                  {savedOffersForCluster.map((savedOffer) => (
                    <div
                      className="rounded-lg border border-border/60 bg-muted/20 p-4"
                      key={`${savedOffer.clusterId}:${savedOffer.offerPayload.escrow}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-medium">Saved offer</div>
                          <div className="text-xs/relaxed text-muted-foreground">
                            Saved {formatSavedOfferCreatedAt(savedOffer.createdAt)}
                          </div>
                        </div>
                        <SolanaUiExplorerLink
                          className="inline-flex gap-1 font-mono text-xs"
                          label={formatAddress(savedOffer.offerPayload.escrow)}
                          path={`/address/${savedOffer.offerPayload.escrow}`}
                        />
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">Maker address</div>
                          <div className="font-mono text-muted-foreground">{savedOffer.offerPayload.maker}</div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">Escrow vault token account</div>
                          <div className="font-mono text-muted-foreground">{savedOffer.offerPayload.vaultTaA}</div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">Deposit side</div>
                          <div className="font-mono text-muted-foreground">
                            {savedOffer.offerPayload.deposit} of {savedOffer.offerPayload.mintA}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">Requested side</div>
                          <div className="font-mono text-muted-foreground">
                            {savedOffer.offerPayload.receive} of {savedOffer.offerPayload.mintB}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button onClick={() => handleLoadSavedOffer(savedOffer)} type="button">
                          Load into use flow
                        </Button>
                        <Button onClick={() => void handleCopySavedOffer(savedOffer)} type="button" variant="secondary">
                          Copy payload
                        </Button>
                        <Button onClick={() => handleRemoveSavedOffer(savedOffer)} type="button" variant="outline">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-xs/relaxed text-muted-foreground">
                  Successful `make` transactions will save their off-chain payload here so you can load the maker
                  address and escrow vault token account again after switching wallets or refreshing the page.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="latest">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Latest Result</CardTitle>
              <CardDescription>
                Tracks the last escrow action from this screen, including any fresh token account signers generated in
                the browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{latestAction ? `${latestAction} status` : 'Action status'}</div>
                <Badge
                  variant={
                    mutation.errorMessage
                      ? 'destructive'
                      : mutation.isLoading
                        ? 'secondary'
                        : mutation.signature
                          ? 'default'
                          : 'outline'
                  }
                >
                  {mutation.errorMessage
                    ? 'Failed'
                    : mutation.isLoading
                      ? 'Sending'
                      : mutation.signature
                        ? 'Confirmed'
                        : 'Ready'}
                </Badge>
              </div>
              {mutation.errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>{latestAction ? `${latestAction} failed` : 'Transaction failed'}</AlertTitle>
                  <AlertDescription>{mutation.errorMessage}</AlertDescription>
                </Alert>
              ) : null}
              {mutation.signature ? (
                <div className="space-y-2 text-xs">
                  <div className="font-medium">Latest signature</div>
                  <SolanaUiExplorerLink
                    className="inline-flex gap-1 font-mono text-xs"
                    label={formatAddress(mutation.signature)}
                    path={`/tx/${mutation.signature}`}
                  />
                </div>
              ) : null}
              {mutation.details?.generatedAccounts.length ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Generated signer accounts</div>
                  <div className="flex flex-wrap gap-2">
                    {mutation.details.generatedAccounts.map((generatedAccount) => (
                      <Badge key={`${generatedAccount.label}:${generatedAccount.address}`} variant="outline">
                        {generatedAccount.label}: {formatAddress(generatedAccount.address)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EscrowSummary({
  escrow,
  escrowAddress,
}: {
  escrow: {
    maker: string
    maker_ta_b: string
    mint_a: string
    mint_b: string
    receive: bigint
  }
  escrowAddress: null | string
}) {
  return (
    <div className="mt-4 space-y-2 text-xs">
      <div className="font-medium">Escrow PDA</div>
      {escrowAddress ? (
        <SolanaUiExplorerLink
          className="inline-flex gap-1 font-mono text-xs"
          label={formatAddress(escrowAddress)}
          path={`/address/${escrowAddress}`}
        />
      ) : (
        <div className="font-mono text-muted-foreground">Deriving...</div>
      )}
      <div className="font-medium">Maker</div>
      <div className="font-mono text-muted-foreground">{escrow.maker}</div>
      <div className="font-medium">Maker receive token account</div>
      <div className="font-mono text-muted-foreground">{escrow.maker_ta_b}</div>
      <div className="font-medium">Deposit mint</div>
      <div className="font-mono text-muted-foreground">{escrow.mint_a}</div>
      <div className="font-medium">Requested mint</div>
      <div className="font-mono text-muted-foreground">{escrow.mint_b}</div>
      <div className="font-medium">Receive amount</div>
      <div className="font-mono text-muted-foreground">{escrow.receive.toString()}</div>
    </div>
  )
}

function filterTokenAccountsByMint(tokenAccounts: WalletTokenAccount[], mint: string) {
  const trimmedMint = mint.trim()

  if (!trimmedMint) {
    return tokenAccounts
  }

  return tokenAccounts.filter((tokenAccount) => tokenAccount.mint === trimmedMint)
}

function findPreferredTokenAccount(tokenAccounts: WalletTokenAccount[], mint: string) {
  return [...tokenAccounts]
    .filter((tokenAccount) => tokenAccount.mint === mint)
    .sort((left, right) => {
      const leftAmount = BigInt(left.rawAmount)
      const rightAmount = BigInt(right.rawAmount)

      if (leftAmount === rightAmount) {
        return left.address.localeCompare(right.address)
      }

      return rightAmount > leftAmount ? 1 : -1
    })[0]
}

function formatActionLabel(action: null | string) {
  switch (action) {
    case 'make':
      return 'Make'
    case 'refund':
      return 'Refund'
    case 'take':
      return 'Take'
    default:
      return null
  }
}

function formatAddress(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-8)}`
}

function formatOfferPayload(offerPayload: EscrowOfferPayload) {
  return JSON.stringify(
    {
      depositAmount: offerPayload.deposit,
      depositMint: offerPayload.mintA,
      escrowPda: offerPayload.escrow,
      escrowVaultTokenAccount: offerPayload.vaultTaA,
      makerAddress: offerPayload.maker,
      makerReceiveTokenAccount: offerPayload.makerTaB,
      receiveAmount: offerPayload.receive,
      requestedMint: offerPayload.mintB,
    },
    null,
    2,
  )
}

function formatSavedOfferCreatedAt(createdAt: string) {
  return createdAt.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
}

function formatTokenAccountOption(tokenAccount: WalletTokenAccount) {
  return `${tokenAccount.uiAmountString} ${tokenAccount.programLabel} | mint ${formatAddress(tokenAccount.mint)} | acct ${formatAddress(tokenAccount.address)}`
}

function formatUnknownError(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error occurred'
}

function FormStep({ description, step, title }: { description: string; step: string; title: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{step}</Badge>
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="mt-1 text-xs/relaxed text-muted-foreground">{description}</div>
    </div>
  )
}

function getConnectedMintOptions(tokenAccounts: WalletTokenAccount[]): MintOption[] {
  return [...new Map(tokenAccounts.map((tokenAccount) => [tokenAccount.mint, tokenAccount])).values()]
    .map((tokenAccount) => ({
      label: `Connected wallet mint | ${formatAddress(tokenAccount.mint)}`,
      mint: tokenAccount.mint,
      source: 'wallet' as const,
    }))
    .sort((left, right) => left.mint.localeCompare(right.mint))
}

function getLocalStorage(): null | Storage {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getMakeMintOptions(connectedMintOptions: MintOption[], isDevnet: boolean) {
  const presetMints = new Set<string>(CIRCLE_DEVNET_MINT_PRESETS.map((preset) => preset.mint))

  return [
    ...(isDevnet
      ? CIRCLE_DEVNET_MINT_PRESETS.map((preset) => ({
          label: `${preset.label} | ${formatAddress(preset.mint)}`,
          mint: preset.mint,
          source: 'preset' as const,
        }))
      : []),
    ...connectedMintOptions.filter((option) => !presetMints.has(option.mint)),
  ]
}

function getTokenAccountPickerLabel(
  accounts: WalletTokenAccount[],
  defaultLabel: string | undefined,
  emptyLabel: string | undefined,
  state: WalletTokenAccountsState,
) {
  switch (state.status) {
    case 'error':
      return 'Unable to load connected token accounts'
    case 'loading':
      return 'Loading connected token accounts...'
    case 'success':
      return accounts.length > 0
        ? (defaultLabel ?? 'Choose classic SPL Token account (optional)')
        : (emptyLabel ?? 'No matching classic SPL Token accounts')
  }
}

function isEscrowOfferPayload(value: unknown): value is EscrowOfferPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Record<string, unknown>

  return (
    typeof payload.deposit === 'string' &&
    typeof payload.escrow === 'string' &&
    typeof payload.maker === 'string' &&
    typeof payload.makerTaB === 'string' &&
    typeof payload.mintA === 'string' &&
    typeof payload.mintB === 'string' &&
    typeof payload.receive === 'string' &&
    typeof payload.vaultTaA === 'string'
  )
}

function isEscrowTab(value: string): value is EscrowTab {
  return value === 'latest' || value === 'make' || value === 'saved' || value === 'use'
}

function isSavedEscrowOffer(value: unknown): value is SavedEscrowOffer {
  if (!value || typeof value !== 'object') {
    return false
  }

  const savedOffer = value as Record<string, unknown>

  return (
    typeof savedOffer.clusterId === 'string' &&
    typeof savedOffer.createdAt === 'string' &&
    isEscrowOfferPayload(savedOffer.offerPayload)
  )
}

function MintPicker({
  label,
  onSelect,
  options,
  selectedMint,
}: {
  label: string
  onSelect: (mint: string) => void
  options: MintOption[]
  selectedMint: string
}) {
  const presetOptions = options.filter((option) => option.source === 'preset')
  const selectedValue = options.some((option) => option.mint === selectedMint) ? selectedMint : '__manual__'
  const walletOptions = options.filter((option) => option.source === 'wallet')

  return (
    <select
      aria-label={`Choose ${label}`}
      className="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      onChange={(event) => {
        if (event.target.value === '__manual__') {
          return
        }

        onSelect(event.target.value)
      }}
      value={selectedValue}
    >
      <option value="__manual__">Choose preset or connected wallet mint (optional)</option>
      {presetOptions.length ? (
        <optgroup label="Circle Devnet presets">
          {presetOptions.map((option) => (
            <option key={`preset:${option.mint}`} value={option.mint}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ) : null}
      {walletOptions.length ? (
        <optgroup label="Connected wallet mints">
          {walletOptions.map((option) => (
            <option key={`wallet:${option.mint}`} value={option.mint}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  )
}

function readActiveTabFromStorage(): EscrowTab {
  const localStorage = getLocalStorage()

  if (!localStorage) {
    return 'make'
  }

  try {
    const value = localStorage.getItem(ESCROW_ACTIVE_TAB_STORAGE_KEY)

    return value && isEscrowTab(value) ? value : 'make'
  } catch {
    return 'make'
  }
}

function readSavedOffersFromStorage(): SavedEscrowOffer[] {
  const localStorage = getLocalStorage()

  if (!localStorage) {
    return []
  }

  try {
    const value = localStorage.getItem(ESCROW_SAVED_OFFERS_STORAGE_KEY)

    if (!value) {
      return []
    }

    const parsed = JSON.parse(value)

    return Array.isArray(parsed)
      ? parsed.filter(isSavedEscrowOffer).sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      : []
  } catch {
    return []
  }
}

function TokenAccountPicker({
  accounts,
  defaultLabel,
  emptyLabel,
  label,
  onSelect,
  selectedAddress,
  state,
}: {
  accounts: WalletTokenAccount[]
  defaultLabel?: string
  emptyLabel?: string
  label: string
  onSelect: (tokenAccount: WalletTokenAccount) => void
  selectedAddress: string
  state: WalletTokenAccountsState
}) {
  const isSelectable = state.status === 'success' && accounts.length > 0
  const selectedValue =
    state.status === 'success' && accounts.some((tokenAccount) => tokenAccount.address === selectedAddress)
      ? selectedAddress
      : '__manual__'

  return (
    <select
      aria-label={`Choose ${label} from connected wallet`}
      className="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      disabled={!isSelectable}
      onChange={(event) => {
        if (event.target.value === '__manual__') {
          return
        }

        const tokenAccount = accounts.find((account) => account.address === event.target.value)

        if (tokenAccount) {
          onSelect(tokenAccount)
        }
      }}
      value={selectedValue}
    >
      <option value="__manual__">{getTokenAccountPickerLabel(accounts, defaultLabel, emptyLabel, state)}</option>
      {accounts.map((tokenAccount) => (
        <option key={tokenAccount.address} value={tokenAccount.address}>
          {formatTokenAccountOption(tokenAccount)}
        </option>
      ))}
    </select>
  )
}

function writeActiveTabToStorage(value: EscrowTab) {
  const localStorage = getLocalStorage()

  if (!localStorage) {
    return
  }

  try {
    localStorage.setItem(ESCROW_ACTIVE_TAB_STORAGE_KEY, value)
  } catch {
    // Ignore storage write failures.
  }
}

function writeSavedOffersToStorage(savedOffers: SavedEscrowOffer[]) {
  const localStorage = getLocalStorage()

  if (!localStorage) {
    return
  }

  try {
    localStorage.setItem(ESCROW_SAVED_OFFERS_STORAGE_KEY, JSON.stringify(savedOffers))
  } catch {
    // Ignore storage write failures.
  }
}

export { EscrowFeature as Component }
