import { LucideKey } from 'lucide-react'
import { type SyntheticEvent, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/core/ui/input-group'
import { Spinner } from '@/core/ui/spinner'

export function WalletUiSignMessageForm({
  isLoading,
  onSubmit,
}: {
  isLoading: boolean
  onSubmit(text: string): Promise<boolean>
}) {
  const [text, setText] = useState<string>('Hello Solana!')
  const submitDisabled = !text.trim() || isLoading

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const value = text.trim()
        if (!value || isLoading) {
          return
        }

        await onSubmit(value)
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign Message</CardTitle>
          <CardDescription>Sign a Message with this text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputGroup>
            <InputGroupInput
              onChange={(event: SyntheticEvent<HTMLInputElement>) => setText(event.currentTarget.value)}
              placeholder="Write a message to sign"
              value={text}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton className="cursor-pointer" disabled={submitDisabled} type="submit" variant="outline">
                {isLoading ? <Spinner /> : <LucideKey />}
                Sign Message
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </CardContent>
      </Card>
    </form>
  )
}
