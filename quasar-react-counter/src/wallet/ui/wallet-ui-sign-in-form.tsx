import { type SolanaSignInInput } from '@wallet-ui/react'
import { LucideChevronDown, LucideKey } from 'lucide-react'
import { type SyntheticEvent, useState } from 'react'

import { Button } from '@/core/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/core/ui/collapsible'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/core/ui/input-group'
import { Spinner } from '@/core/ui/spinner'
import { cn } from '@/core/util/utils'

import { WalletUiPayload } from './wallet-ui-payload'

export function WalletUiSignInForm({
  getPayload,
  isLoading,
  onSubmit,
}: {
  getPayload(statement: string): SolanaSignInInput
  isLoading: boolean
  onSubmit(statement: string): Promise<boolean>
}) {
  const [payloadOpen, setPayloadOpen] = useState(false)
  const [text, setText] = useState<string>('We hope you enjoy your stay!')
  const payload = getPayload(text)

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        if (isLoading) {
          return
        }

        await onSubmit(text)
      }}
    >
      <Collapsible onOpenChange={setPayloadOpen} open={payloadOpen}>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Test the Sign In feature</CardDescription>
            <CardAction>
              <CollapsibleTrigger
                render={<Button className="cursor-pointer" size="sm" type="button" variant="outline" />}
              >
                <LucideChevronDown className={cn('transition-transform', payloadOpen ? 'rotate-180' : '')} />
                {payloadOpen ? 'Hide payload' : 'Show payload'}
              </CollapsibleTrigger>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <CollapsibleContent>
              <WalletUiPayload data={payload} label="Sign In Payload" />
            </CollapsibleContent>
            <InputGroup>
              <InputGroupInput
                onChange={(event: SyntheticEvent<HTMLInputElement>) => setText(event.currentTarget.value)}
                placeholder="Write the sign in statement"
                value={text}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton className="cursor-pointer" disabled={isLoading} type="submit" variant="outline">
                  {isLoading ? <Spinner /> : <LucideKey />}
                  Sign in
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </CardContent>
        </Card>
      </Collapsible>
    </form>
  )
}
