import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from '@bun-platform/auth'
import { env } from '@bun-platform/env/api'

import { createContext } from './context'
import { appRouter } from './router'

function mergeHeaders(target: Headers, source?: Headers | null) {
  if (!source) {
    return target
  }

  source.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      target.append(key, value)
      return
    }

    target.set(key, value)
  })

  return target
}

function mergeResponseHeaders(response: Response, responseHeaders: Headers) {
  const headers = mergeHeaders(new Headers(response.headers), responseHeaders)

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

export function createApiApp() {
  const app = new Hono()
  const apiHandler = new OpenAPIHandler(appRouter, {
    interceptors: [
      onError((error) => {
        console.error(error)
      }),
    ],
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
      }),
    ],
  })
  const rpcHandler = new RPCHandler(appRouter, {
    interceptors: [
      onError((error) => {
        console.error(error)
      }),
    ],
  })

  app.use(logger())
  app.use(
    '/*',
    cors({
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      origin: env.CORS_ORIGINS,
    }),
  )

  app.on(['POST', 'GET'], '/api/auth/*', (context) => auth.handler(context.req.raw))

  app.use('/*', async (context, next) => {
    const requestContext = await createContext({ context })
    const rpcResult = await rpcHandler.handle(context.req.raw, {
      context: requestContext,
      prefix: '/rpc',
    })

    if (rpcResult.matched) {
      return mergeResponseHeaders(rpcResult.response, requestContext.responseHeaders)
    }

    const apiResult = await apiHandler.handle(context.req.raw, {
      context: requestContext,
      prefix: '/api-reference',
    })

    if (apiResult.matched) {
      return mergeResponseHeaders(apiResult.response, requestContext.responseHeaders)
    }

    await next()
  })

  return app
}
