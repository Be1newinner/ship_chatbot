"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Message } from "@/components/chat/message"
import { ChatInput } from "@/components/chat/chat-input"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import apiClient from "@/lib/api-client"
import Link from "next/link"

type ChatMessage = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatHistoryItem {
  _id: string
  session_id: string
  user_id: string
  message: string
  response: string
  timestamp: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get("/chat/", {
          params: {
            page: 1,
            page_size: 50, // Get a reasonable number of messages
          },
        })

        if (response.data.data && response.data.data.length > 0) {
          // Convert the history items to our message format
          const historyMessages: ChatMessage[] = []

          response.data.data.forEach((item: ChatHistoryItem) => {
            // Add user message
            historyMessages.push({
              id: `${item._id}-user`,
              content: item.message,
              isUser: true,
              timestamp: new Date(item.timestamp),
            })

            // Add assistant response
            historyMessages.push({
              id: `${item._id}-assistant`,
              content: item.response,
              isUser: false,
              timestamp: new Date(item.timestamp),
            })
          })

          setMessages(historyMessages)
        } else {
          // No history, add welcome message
          setMessages([
            {
              id: "welcome",
              content: "Hello! How can I help you today?",
              isUser: false,
              timestamp: new Date(),
            },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error)
        // Fallback to a welcome message
        setMessages([
          {
            id: "welcome",
            content: "Hello! How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchChatHistory()
    }
  }, [user])

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send message to API using the new structure
      const response = await apiClient.post("/chat/", null, {
        params: {
          input: content,
        },
      })

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.assistant || "Sorry, I couldn't process your request.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Failed to send message:", error)

      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your message. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
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
            {user?.role === "admin" && (
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  ADMIN
                </Button>
              </Link>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            {messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
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

