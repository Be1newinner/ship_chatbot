"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Message } from "@/components/chat/message"
import { ChatInput } from "@/components/chat/chat-input"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import apiClient from "@/lib/api-client"
import Link from "next/link"

type ChatMessage = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Fetch or create a chat session on component mount
  useEffect(() => {
    const fetchOrCreateSession = async () => {
      try {
        // Try to get an existing session from localStorage
        const storedSessionId = localStorage.getItem('chatSessionId');

        if (storedSessionId) {
          setSessionId(storedSessionId);
          // Fetch messages for this session
          await fetchMessages(storedSessionId);
        } else {
          // Add welcome message
          setMessages([
            {
              id: "welcome",
              content: "Hello! How can I help you today?",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        // Fallback to a local session
        setMessages([
          {
            id: "welcome",
            content: "Hello! How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    };

    if (user) {
      fetchOrCreateSession();
    }
  }, [user]);

  // Fetch messages for a session
  const fetchMessages = async (sid: string) => {
    try {
      const response = await apiClient.get(`/chat/${sid}`);
      const fetchedMessages = response.data.data.map((msg: any) => ({
        id: msg.id || Date.now().toString(),
        content: msg.message,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.timestamp),
      }));

      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;
  
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);  // ✅ Ensuring state updates
    setIsLoading(true);
    
    try {
      const response = await apiClient.post(`/chat/`, { input: content });
  
      console.log("API Response:", response.data); // ✅ Debugging API response
  
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.assistant || "Sorry, I couldn't process your request.",
        isUser: false,
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botMessage]); // ✅ Ensuring state updates
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleLogout = () => {
    // Clear chat session
    localStorage.removeItem('chatSessionId');
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-xl font-bold">Chat Bot</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Logged in as {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                ADMIN
              </Button>
            </Link>
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
  );
}

