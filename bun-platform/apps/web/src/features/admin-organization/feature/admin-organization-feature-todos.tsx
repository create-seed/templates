import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import type { AdminOrganizationGetResult } from '../data-access/use-admin-organization-get-query'

import { useAdminOrganizationTodoCreate } from '../data-access/use-admin-organization-todo-create'
import { useAdminOrganizationTodoDelete } from '../data-access/use-admin-organization-todo-delete'
import { useAdminOrganizationTodoListQuery } from '../data-access/use-admin-organization-todo-list-query'
import { useAdminOrganizationTodoToggle } from '../data-access/use-admin-organization-todo-toggle'
import { AdminOrganizationTodoUiCreateForm } from '../ui/admin-organization-todo-ui-create-form'
import { AdminOrganizationTodoUiList } from '../ui/admin-organization-todo-ui-list'

interface AdminOrganizationFeatureTodosProps {
  initialOrganization: AdminOrganizationGetResult
}

export function AdminOrganizationFeatureTodos(props: AdminOrganizationFeatureTodosProps) {
  const { initialOrganization } = props
  const createTodo = useAdminOrganizationTodoCreate(initialOrganization.id)
  const deleteTodo = useAdminOrganizationTodoDelete(initialOrganization.id)
  const toggleTodo = useAdminOrganizationTodoToggle(initialOrganization.id)
  const todos = useAdminOrganizationTodoListQuery(initialOrganization.id)

  async function handleTodoCreate(text: string) {
    return await createTodo
      .mutateAsync({
        organizationId: initialOrganization.id,
        text,
      })
      .then(() => true)
      .catch(() => false)
  }

  async function handleTodoDelete(id: number) {
    return await deleteTodo
      .mutateAsync({
        id,
        organizationId: initialOrganization.id,
      })
      .then(() => true)
      .catch(() => false)
  }

  async function handleTodoToggle(id: number, completed: boolean) {
    return await toggleTodo
      .mutateAsync({
        completed,
        id,
        organizationId: initialOrganization.id,
      })
      .then(() => true)
      .catch(() => false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
        <CardDescription>Manage tasks for this organization from the admin dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AdminOrganizationTodoUiCreateForm isPending={createTodo.isPending} onCreate={handleTodoCreate} />
        <AdminOrganizationTodoUiList
          isError={todos.isError}
          isPending={todos.isPending}
          onTodoDelete={handleTodoDelete}
          onTodoToggle={handleTodoToggle}
          todos={todos.data ?? []}
        />
      </CardContent>
    </Card>
  )
}
