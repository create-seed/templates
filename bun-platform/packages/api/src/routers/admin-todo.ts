import { ORPCError } from '@orpc/server'
import { and, asc, eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '@bun-platform/db'
import { organization } from '@bun-platform/db/schema/auth'
import { todo } from '@bun-platform/db/schema/todo'

import { adminProcedure } from '../index'

const adminTodoTextSchema = z.string().trim().min(1)

function throwOrganizationNotFound() {
  throw new ORPCError('NOT_FOUND', {
    message: 'Organization not found.',
  })
}

function throwTodoNotFound() {
  throw new ORPCError('NOT_FOUND', {
    message: 'Todo not found.',
  })
}

async function assertOrganizationExists(organizationId: string) {
  const [record] = await db
    .select({
      id: organization.id,
    })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1)

  if (!record) {
    throwOrganizationNotFound()
  }
}

async function getOrganizationTodoRecord(id: number, organizationId: string) {
  const [record] = await db
    .select({
      completed: todo.completed,
      id: todo.id,
      text: todo.text,
    })
    .from(todo)
    .where(and(eq(todo.id, id), eq(todo.organizationId, organizationId)))
    .limit(1)

  return record ?? null
}

export const adminTodoRouter = {
  create: adminProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        text: adminTodoTextSchema,
      }),
    )
    .handler(async ({ input }) => {
      await assertOrganizationExists(input.organizationId)

      const [createdTodo] = await db
        .insert(todo)
        .values({
          organizationId: input.organizationId,
          text: input.text,
        })
        .returning({
          completed: todo.completed,
          id: todo.id,
          text: todo.text,
        })

      if (!createdTodo) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Todo was created but could not be loaded.',
        })
      }

      return createdTodo
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.number(),
        organizationId: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      await assertOrganizationExists(input.organizationId)

      const existingTodo = await getOrganizationTodoRecord(input.id, input.organizationId)

      if (!existingTodo) {
        throwTodoNotFound()
      }

      await db.delete(todo).where(and(eq(todo.id, input.id), eq(todo.organizationId, input.organizationId)))

      return {
        id: input.id,
        organizationId: input.organizationId,
      }
    }),

  list: adminProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      await assertOrganizationExists(input.organizationId)

      return await db
        .select({
          completed: todo.completed,
          id: todo.id,
          text: todo.text,
        })
        .from(todo)
        .where(eq(todo.organizationId, input.organizationId))
        .orderBy(asc(todo.id))
    }),

  toggle: adminProcedure
    .input(
      z.object({
        completed: z.boolean(),
        id: z.number(),
        organizationId: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      await assertOrganizationExists(input.organizationId)

      const existingTodo = await getOrganizationTodoRecord(input.id, input.organizationId)

      if (!existingTodo) {
        throwTodoNotFound()
      }

      const [updatedTodo] = await db
        .update(todo)
        .set({
          completed: input.completed,
        })
        .where(and(eq(todo.id, input.id), eq(todo.organizationId, input.organizationId)))
        .returning({
          completed: todo.completed,
          id: todo.id,
          text: todo.text,
        })

      if (!updatedTodo) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Todo was updated but could not be loaded.',
        })
      }

      return updatedTodo
    }),
}
