"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "user" | "hospital" | "admin" | "guest"
  medicalInfo?: {
    age: number
    gender: string
    bloodGroup: string
    genotype: string
    medicalHistory: string
    emergencyContact: string
  }
}

interface GuestData {
  firstName: string
  lastName: string
  age: number
  gender: string
  bloodGroup: string
  genotype: string
  medicalHistory: string
  emergencyContact: string
  emergencyContactPhone: string
  simulationMode?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signInAsGuest: (guestData: GuestData) => Promise<void>
  createAnonymousSession: (guestData: GuestData) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = await apiClient.getToken()
      if (token) {
        const userData = await apiClient.getUser()
        setUser(userData)
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error)
      // Clear any invalid tokens
      await apiClient.setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: userData, token } = await apiClient.login({ email, password })
      await apiClient.setToken(token)
      setUser(userData)
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true)
      const { user: userData, token } = await apiClient.register({
        email,
        password,
        firstName,
        lastName,
      })
      await apiClient.setToken(token)
      setUser(userData)
    } catch (error) {
      console.error("Sign up failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInAsGuest = async (guestData: GuestData) => {
    try {
      setLoading(true)
      const { user: userData, token } = await apiClient.createAnonymousUser(guestData)
      await apiClient.setToken(token)
      setUser(userData)
    } catch (error) {
      console.error("Guest sign in failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createAnonymousSession = async (guestData: GuestData) => {
    // Alias for signInAsGuest for backward compatibility
    return signInAsGuest(guestData)
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await apiClient.logout()
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true)
      const updatedUser = await apiClient.updateUser(updates)
      setUser(updatedUser)
    } catch (error) {
      console.error("Profile update failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInAsGuest,
    createAnonymousSession,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
