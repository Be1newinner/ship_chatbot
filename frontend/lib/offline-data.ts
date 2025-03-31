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
  if (endpoint.startsWith("/admin/all-users")) {
    return usersData
  }

  if (endpoint.startsWith("/admin/all-sessions")) {
    return chatsData
  }

  if (endpoint.startsWith("/admin/chat/")) {
    return chatDetailData
  }

  if (endpoint === "/admin/count/users") {
    return userCountData
  }

  if (endpoint === "/admin/count/sessions") {
    return sessionCountData
  }

  if (endpoint.startsWith("/chat/")) {
    return chatDetailData
  }

  return null
}

export function isOfflineMode() {
  return useOfflineMode
}

