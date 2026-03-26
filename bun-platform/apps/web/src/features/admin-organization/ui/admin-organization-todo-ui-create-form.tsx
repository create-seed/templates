import { Loader2 } from 'lucide-react'
import { type SubmitEvent, useState } from 'react'
import { Button } from '@bun-platform/ui/components/button'
import { Input } from '@bun-platform/ui/components/input'

interface AdminOrganizationTodoUiCreateFormProps {
  isPending: boolean
  onCreate: (text: string) => Promise<boolean>
}

export function AdminOrganizationTodoUiCreateForm(props: AdminOrganizationTodoUiCreateFormProps) {
  const { isPending, onCreate } = props
  const [newTodoText, setNewTodoText] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedTodoText = newTodoText.trim()

    if (!normalizedTodoText) {
      return
    }

    const didCreateTodo = await onCreate(normalizedTodoText)

    if (didCreateTodo) {
      setNewTodoText('')
    }
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <Input
        disabled={isPending}
        onChange={(event) => setNewTodoText(event.target.value)}
        placeholder="Add a new task..."
        value={newTodoText}
      />
      <Button disabled={isPending || !newTodoText.trim()} type="submit">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Add'}
      </Button>
    </form>
  )
}
