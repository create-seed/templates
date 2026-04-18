import { useState } from 'react'

import { Button } from '@/core/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/core/ui/field'
import { Input } from '@/core/ui/input'
import { Spinner } from '@/core/ui/spinner'

export function CounterUiSetForm({
  disabled,
  initialValue,
  isLoading,
  onSubmit,
}: {
  disabled: boolean
  initialValue: bigint | null
  isLoading: boolean
  onSubmit(value: bigint): Promise<null | string>
}) {
  const [error, setError] = useState<null | string>(null)
  const [nextValue, setNextValue] = useState(initialValue?.toString() ?? '0')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!/^\d+$/.test(nextValue)) {
      setError('Enter a whole number greater than or equal to 0.')
      return
    }

    setError(null)
    await onSubmit(BigInt(nextValue))
  }

  return (
    <form className="space-y-2" onSubmit={(event) => void handleSubmit(event)}>
      <Field>
        <FieldLabel htmlFor="counter-set-value">Set value</FieldLabel>
        <FieldContent>
          <Input
            disabled={disabled}
            id="counter-set-value"
            inputMode="numeric"
            onChange={(event) => {
              setError(null)
              setNextValue(event.currentTarget.value)
            }}
            placeholder="0"
            value={nextValue}
          />
          <FieldDescription>Writes an exact `u64` value to the counter account.</FieldDescription>
          <FieldError>{error}</FieldError>
        </FieldContent>
      </Field>
      <Button className="w-full" disabled={disabled} type="submit" variant="outline">
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Sending set...' : 'Set value'}
      </Button>
    </form>
  )
}
