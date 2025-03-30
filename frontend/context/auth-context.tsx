"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { login as apiLogin, register as apiRegister } from "@/lib/api"

type User = {
  id: string
  email: string
  role: "user" | "admin"
  token: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, phone: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser)
        setUser({ ...userData, token })
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      const response = await apiLogin(email, password)

      const userData = {
        id: response.data._id,
        email,
        // Assuming role is included in the token and decoded on the client
        // In a real app, you might want to decode the JWT or have the role in the response
        role: email.includes("admin") ? ("admin" as const) : ("user" as const),
        token: response.data.accessToken,
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", response.data.accessToken)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, phone: string) => {
    setLoading(true)

    try {
      await apiRegister(username, email, password, phone)
      // After registration, log the user in
      await login(email, password)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

