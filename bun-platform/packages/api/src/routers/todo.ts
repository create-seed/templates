import { ORPCError } from '@orpc/server'
import { and, asc, eq, isNull, or } from 'drizzle-orm'
import z from 'zod'
import { db } from '@bun-platform/db'
import { todo } from '@bun-platform/db/schema/todo'

import { protectedProcedure } from '../index'

function getRequiredActiveOrganizationId(activeOrganizationId: string | null) {
  if (!activeOrganizationId) {
    throw new ORPCError('BAD_REQUEST', {
      message: 'No active organization selected.',
    })
  }

  return activeOrganizationId
}

function getTodoVisibilityFilter(activeOrganizationId: string) {
  return or(eq(todo.organizationId, activeOrganizationId), isNull(todo.organizationId))
}

async function getTodoRecord(id: number, organizationId: string) {
  const [record] = await db
    .select({
      id: todo.id,
    })
    .from(todo)
    .where(and(eq(todo.id, id), getTodoVisibilityFilter(organizationId)))
    .limit(1)

  return record ?? null
}

function throwTodoNotFound() {
  throw new ORPCError('NOT_FOUND', {
    message: 'Todo not found.',
  })
}

export const todoRouter = {
  create: protectedProcedure.input(z.object({ text: z.string().min(1) })).handler(async ({ context, input }) => {
    const activeOrganizationId = getRequiredActiveOrganizationId(context.session.session.activeOrganizationId ?? null)

    return await db.insert(todo).values({
      organizationId: activeOrganizationId,
      text: input.text,
    })
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).handler(async ({ context, input }) => {
    const activeOrganizationId = getRequiredActiveOrganizationId(context.session.session.activeOrganizationId ?? null)
    const existingTodo = await getTodoRecord(input.id, activeOrganizationId)

    if (!existingTodo) {
      throwTodoNotFound()
    }

    return await db.delete(todo).where(and(eq(todo.id, input.id), getTodoVisibilityFilter(activeOrganizationId)))
  }),

  getAll: protectedProcedure.handler(async ({ context }) => {
    const activeOrganizationId = context.session.session.activeOrganizationId ?? null

    if (!activeOrganizationId) {
      return []
    }

    return await db
      .select({
        completed: todo.completed,
        id: todo.id,
        text: todo.text,
      })
      .from(todo)
      .where(getTodoVisibilityFilter(activeOrganizationId))
      .orderBy(asc(todo.id))
  }),

  toggle: protectedProcedure
    .input(z.object({ completed: z.boolean(), id: z.number() }))
    .handler(async ({ context, input }) => {
      const activeOrganizationId = getRequiredActiveOrganizationId(context.session.session.activeOrganizationId ?? null)
      const existingTodo = await getTodoRecord(input.id, activeOrganizationId)

      if (!existingTodo) {
        throwTodoNotFound()
      }

      return await db
        .update(todo)
        .set({ completed: input.completed })
        .where(and(eq(todo.id, input.id), getTodoVisibilityFilter(activeOrganizationId)))
    }),
}
