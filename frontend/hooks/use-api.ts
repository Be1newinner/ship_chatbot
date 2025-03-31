import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { getOfflineData, isOfflineMode } from '@/lib/offline-data';

// Generic fetch function that handles offline mode
async function fetchData<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  // Check if we're in offline mode
  if (isOfflineMode()) {
    const offlineData = getOfflineData(endpoint, params);
    if (offlineData) {
      return offlineData as T;
    }
  }
  
  // If not in offline mode or no offline data available, make the API call
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  const response = await apiClient.get<T>(url);
  return response.data;
}

// Hook for fetching users
export function useUsers(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => fetchData('/all-users', { page, page_size: pageSize }),
  });
}

// Hook for fetching chat sessions
export function useChatSessions(page: number = 1, pageSize: number = 5) {
  return useQuery({
    queryKey: ['chats', page, pageSize],
    queryFn: () => fetchData('/all-chats', { page, page_size: pageSize }),
  });
}

// Hook for fetching chat details
export function useChatDetails(sessionId: string, page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ['chat', sessionId, page, pageSize],
    queryFn: () => fetchData(`/chat/${sessionId}`, { page, page_size: pageSize }),
    enabled: !!sessionId,
  });
}

// Hook for fetching user count
export function useUserCount() {
  return useQuery({
    queryKey: ['userCount'],
    queryFn: () => fetchData('/count/users'),
  });
}

// Hook for fetching session count
export function useSessionCount() {
  return useQuery({
    queryKey: ['sessionCount'],
    queryFn: () => fetchData('/count/sessions'),
  });
}

// Hook for sending a chat message
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string, message: string }) => {
      const response = await apiClient.post(`/chat/${sessionId}`, { message });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate chat details query to refresh the chat
      queryClient.invalidateQueries({ queryKey: ['chat', variables.sessionId] });
    },
  });
}

