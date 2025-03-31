import usersData from "@/data/users.json"
import chatsData from "@/data/chats.json"
import chatDetailData from "@/data/chat-detail.json"
import userCountData from "@/data/user-count.json"
import sessionCountData from "@/data/session-count.json"

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"
const useOfflineMode = process.env.NEXT_PUBLIC_USE_OFFLINE_MODE === "true" && isDevelopment

export function getOfflineData(endpoint: string, params: Record<string, any> = {}) {
  if (!useOfflineMode) return null

  // Parse the endpoint to determine which data to return
  if (endpoint.startsWith("/all-users")) {
    return usersData
  }

  if (endpoint.startsWith("/all-chats")) {
    return chatsData
  }

  if (endpoint.startsWith("/chat/")) {
    return chatDetailData
  }

  if (endpoint === "/count/users") {
    return userCountData
  }

  if (endpoint === "/count/sessions") {
    return sessionCountData
  }

  return null
}

export function isOfflineMode() {
  return useOfflineMode
}

