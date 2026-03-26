import { useChat } from '@ai-sdk/react'
import { createFileRoute } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { Send } from 'lucide-react'
import { type SubmitEvent, useLayoutEffect, useRef, useState } from 'react'
import { Streamdown } from 'streamdown'
import { env } from '@bun-platform/env/web'
import { Button } from '@bun-platform/ui/components/button'
import { Input } from '@bun-platform/ui/components/input'

import { getUser } from '@/features/auth/data-access/get-user'
import { requireActiveOrganization } from '@/features/organization/feature/organization-feature-active-access'

export const Route = createFileRoute('/ai')({
  beforeLoad: async () => {
    const session = await getUser()
    requireActiveOrganization(session)
    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${env.VITE_API_URL}/ai`,
      credentials: 'include',
    }),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: status === 'streaming' ? 'auto' : 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [messages, status])

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 overflow-hidden px-4 py-6">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl min-w-0 flex-col gap-4 pb-24">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="text-muted-foreground mt-8 px-6 text-center">Ask me anything to get started!</div>
          ) : (
            <div className="flex flex-col gap-4 pb-2">
              {messages.map((message) => (
                <div
                  className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  key={message.id}
                >
                  <div
                    className={`w-fit max-w-[85%] min-w-[10rem] rounded-2xl border px-4 py-3 break-words shadow-sm ${
                      message.role === 'user' ? 'border-primary/20 bg-primary/10' : 'border-border bg-secondary/20'
                    }`}
                  >
                    <p className="mb-1 text-sm font-semibold">{message.role === 'user' ? 'You' : 'AI Assistant'}</p>
                    {message.parts?.map((part, index) => {
                      if (part.type === 'text') {
                        return (
                          <Streamdown isAnimating={status === 'streaming' && message.role === 'assistant'} key={index}>
                            {part.text}
                          </Streamdown>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="h-1" ref={messagesEndRef} />
        </div>

        <form
          className="bg-background/95 supports-[backdrop-filter]:bg-background/80 flex w-full items-center gap-2 rounded-2xl border p-3 shadow-sm backdrop-blur"
          onSubmit={handleSubmit}
        >
          <Input
            autoComplete="off"
            autoFocus
            className="flex-1"
            name="prompt"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            value={input}
          />
          <Button size="icon" type="submit">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  )
}
