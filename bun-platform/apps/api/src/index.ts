import { devToolsMiddleware } from '@ai-sdk/devtools'
import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText, wrapLanguageModel } from 'ai'
import { createApiApp } from '@bun-platform/api/app'
import { auth } from '@bun-platform/auth'

const app = createApiApp()

app.post('/ai', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  if (!session.session.activeOrganizationId) {
    return c.json({ error: 'No active organization selected.' }, 403)
  }

  const body = await c.req.json()
  const uiMessages = body.messages || []
  const model = wrapLanguageModel({
    middleware: devToolsMiddleware(),
    model: google('gemini-2.5-flash'),
  })
  const result = streamText({
    messages: await convertToModelMessages(uiMessages),
    model,
  })

  return result.toUIMessageStreamResponse()
})

app.get('/', (c) => {
  return c.text('OK')
})

export default app
