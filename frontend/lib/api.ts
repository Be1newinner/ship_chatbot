const API_BASE_URL = "https://api.shipsar.com/chatbot"

export type ApiResponse<T> = {
  message: string
  data: T
}

export type LoginResponse = {
  _id: string
  accessToken: string
}

export type RegisterResponse = {
  _id: string
}

export type ChatHistoryItem = {
  _id: string
  user: string
  assistant: string
  timestamp: string
}

export type ChatResponse = {
  data: string
}

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "An error occurred")
  }

  return response.json()
}

// Auth API calls
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return fetchApi<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function register(
  username: string,
  email: string,
  password: string,
  phone: string,
  role: "user" | "admin" = "user",
): Promise<ApiResponse<RegisterResponse>> {
  return fetchApi<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, phone, role }),
  })
}

// Chat API calls
export async function getChatHistory(): Promise<ApiResponse<ChatHistoryItem[]>> {
  const token = localStorage.getItem("token")

  return fetchApi<ChatHistoryItem[]>("/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function sendChatMessage(input: string): Promise<ApiResponse<string>> {
  const token = localStorage.getItem("token")

  return fetchApi<string>("/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ input }),
  })
}

