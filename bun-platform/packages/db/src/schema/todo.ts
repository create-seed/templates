import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { organization } from './auth'

export const todo = sqliteTable(
  'todo',
  {
    completed: integer('completed', { mode: 'boolean' }).default(false).notNull(),
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizationId: text('organization_id').references(() => organization.id, {
      onDelete: 'cascade',
    }),
    text: text('text').notNull(),
  },
  (table) => [index('todo_organizationId_idx').on(table.organizationId)],
)

export const todoRelations = relations(todo, ({ one }) => ({
  organization: one(organization, {
    fields: [todo.organizationId],
    references: [organization.id],
  }),
}))
