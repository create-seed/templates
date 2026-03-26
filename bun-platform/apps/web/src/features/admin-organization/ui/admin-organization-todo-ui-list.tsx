import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@bun-platform/ui/components/button'
import { Checkbox } from '@bun-platform/ui/components/checkbox'

import type { AdminOrganizationTodo } from '../data-access/use-admin-organization-todo-list-query'

interface AdminOrganizationTodoUiListProps {
  isError: boolean
  isPending: boolean
  onTodoDelete: (id: number) => Promise<boolean>
  onTodoToggle: (id: number, completed: boolean) => Promise<boolean>
  todos: AdminOrganizationTodo[]
}

export function AdminOrganizationTodoUiList(props: AdminOrganizationTodoUiListProps) {
  const { isError, isPending, onTodoDelete, onTodoToggle, todos } = props

  if (isPending) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        We couldn&apos;t load this organization&apos;s todos right now.
      </p>
    )
  }

  if (todos.length === 0) {
    return <p className="py-4 text-center">No todos yet. Add one above!</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <li className="flex items-center justify-between rounded-md border p-2" key={todo.id}>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={todo.completed}
              id={`admin-todo-${todo.id}`}
              onCheckedChange={(checked) => {
                if (typeof checked !== 'boolean') {
                  return
                }

                void onTodoToggle(todo.id, checked)
              }}
            />
            <label className={todo.completed ? 'line-through' : undefined} htmlFor={`admin-todo-${todo.id}`}>
              {todo.text}
            </label>
          </div>
          <Button aria-label="Delete todo" onClick={() => void onTodoDelete(todo.id)} size="icon" variant="ghost">
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
