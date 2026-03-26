import type { RouterClient } from '@orpc/server'
import { env } from '@bun-platform/env/api'

import { protectedProcedure, publicProcedure } from '../index'
import { adminOrganizationRouter } from './admin-organization'
import { adminTodoRouter } from './admin-todo'
import { organizationRouter } from './organization'
import { todoRouter } from './todo'

export const appRouter = {
  adminOrganization: adminOrganizationRouter,
  adminTodo: adminTodoRouter,
  billing: {
    getState: protectedProcedure.handler(() => {
      return {
        billingEnabled: Boolean(env.POLAR_ACCESS_TOKEN),
      }
    }),
  },
  healthCheck: publicProcedure.handler(() => {
    return 'OK'
  }),
  organization: organizationRouter,
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: 'This is private',
      user: context.session?.user,
    }
  }),
  todo: todoRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
