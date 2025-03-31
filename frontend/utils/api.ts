// Utility function for making authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // In a real app, you would get the token from your auth system
  // For this demo, we'll simulate it
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const token = user?.role === "admin" ? "admin_token" : "user_token"

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

export const API_URL = "http://localhost:8000"
