"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Message } from "@/components/chat/message"
import { ChatInput } from "@/components/chat/chat-input"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { getChatHistory, sendChatMessage, type ChatHistoryItem } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type DisplayMessage = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date | string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState("")
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Load chat history when component mounts
    const loadChatHistory = async () => {
      try {
        const response = await getChatHistory()

        // Transform API response to our message format
        const historyMessages = response.data.flatMap((item: ChatHistoryItem) => [
          {
            id: `${item._id}-user`,
            content: item.user,
            isUser: true,
            timestamp: item.timestamp,
          },
          {
            id: `${item._id}-assistant`,
            content: item.assistant,
            isUser: false,
            timestamp: item.timestamp,
          },
        ])

        setMessages(historyMessages)
      } catch (err: any) {
        console.error("Failed to load chat history:", err)
        setError("Failed to load chat history. Please try refreshing the page.")
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
  }, [])

  const handleSendMessage = async (content: string) => {
    setError("")

    // Add user message immediately for better UX
    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send message to API
      const response = await sendChatMessage(content)

      // Add bot response
      const botMessage: DisplayMessage = {
        id: `assistant-${Date.now()}`,
        content: response.data,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err: any) {
      console.error("Failed to send message:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-xl font-bold">Chat Bot</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Logged in as {user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            {isLoadingHistory ? (
              <div className="flex justify-center my-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No messages yet. Start a conversation!</div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))
            )}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="border-t p-6">
          <div className="mx-auto max-w-3xl">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

