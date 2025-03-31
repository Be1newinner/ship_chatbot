"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { jwtDecode, type JwtPayload } from "jwt-decode"
import apiClient from "@/lib/api-client"

type User = {
  id: string
  email: string
  role: string
  token: string
  tokenExpiry: number
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isTokenExpired: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      // Check if token is expired
      if (parsedUser.token) {
        try {
          const decodedToken = jwtDecode(parsedUser.token)
          const currentTime = Date.now() / 1000

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            // Token is expired, log out
            localStorage.removeItem("user")
            setUser(null)
          } else {
            setUser(parsedUser)
          }
        } catch (error) {
          // Invalid token, log out
          localStorage.removeItem("user")
          setUser(null)
        }
      } else {
        setUser(parsedUser)
      }
    }
    setLoading(false)
  }, [])

  const isTokenExpired = () => {
    if (!user || !user.token) return true

    try {
      const decodedToken = jwtDecode(user.token)
      const currentTime = Date.now() / 1000

      return decodedToken.exp ? decodedToken.exp < currentTime : true
    } catch (error) {
      return true
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Make API call to login endpoint
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      })

      // Process the response based on new structure
      const { token, data } = response.data

      // Decode token to get expiry and role
      const decodedToken = jwtDecode<JwtPayload & { role?: string; user_id?: string }>(token)
      const tokenExpiry = decodedToken.exp || 0
      const role = decodedToken.role || "user"

      // Create user object with token
      const userWithToken = {
        id: data.id || decodedToken.user_id || "",
        email: data.email,
        role,
        token,
        tokenExpiry,
      }

      // Save to state and localStorage
      setUser(userWithToken)
      localStorage.setItem("user", JSON.stringify(userWithToken))
    } catch (error) {
      console.error("Login failed:", error)
      throw new Error("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setLoading(true)

    try {
      // Make API call to register endpoint with updated structure
      await apiClient.post("/auth/register", {
        username,
        email,
        password,
      })

      // Registration successful, now login with the same credentials
      await login(email, password)
    } catch (error) {
      console.error("Registration failed:", error)
      throw new Error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isTokenExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

