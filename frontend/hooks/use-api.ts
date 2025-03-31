import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { getOfflineData, isOfflineMode } from "@/lib/offline-data"

// Generic fetch function that handles offline mode
async function fetchData<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  // Check if we're in offline mode
  if (isOfflineMode()) {
    const offlineData = getOfflineData(endpoint, params)
    if (offlineData) {
      return offlineData as T
    }
  }

  // If not in offline mode or no offline data available, make the API call
  const response = await apiClient.get<T>(endpoint, { params })
  return response.data
}

// Hook for fetching users (admin)
export function useUsers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => fetchData("/admin/all-users", { page, page_size: pageSize }),
  })
}

// Hook for fetching chat sessions (admin)
export function useChatSessions(page = 1, pageSize = 5) {
  return useQuery({
    queryKey: ["sessions", page, pageSize],
    queryFn: () => fetchData("/admin/all-sessions", { page, page_size: pageSize }),
  })
}

// Hook for fetching chat details for a session (admin)
export function useChatDetails(sessionId: string, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["adminChat", sessionId, page, pageSize],
    queryFn: () => fetchData(`/admin/chat/${sessionId}`, { page, page_size: pageSize }),
    enabled: !!sessionId,
  })
}

// Hook for fetching chat history (user)
export function useChatHistory(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["chatHistory", page, pageSize],
    queryFn: () => fetchData("/chat/", { page, page_size: pageSize }),
  })
}

// Hook for fetching user count (admin)
export function useUserCount() {
  return useQuery({
    queryKey: ["userCount"],
    queryFn: () => fetchData("/admin/count/users"),
  })
}

// Hook for fetching session count (admin)
export function useSessionCount() {
  return useQuery({
    queryKey: ["sessionCount"],
    queryFn: () => fetchData("/admin/count/sessions"),
  })
}

// Hook for sending a chat message (user)
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (message: string) => {
      const response = await apiClient.post("/chat/", null, {
        params: { input: message },
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate chat history query to refresh the chat
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] })
    },
  })
}

