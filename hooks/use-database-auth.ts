"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"

// Fallback auth hook that works without Supabase
export function useDatabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseClient, setSupabaseClient] = useState<any>(null)

  useEffect(() => {
    // Try to load Supabase client
    const loadSupabase = async () => {
      try {
        const { supabase } = await import("@/lib/supabase")
        setSupabaseClient(supabase)

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
        })

        setIsLoading(false)
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Supabase not configured:", error)
        // Fall back to local storage auth
        const savedUser = localStorage.getItem("jee-prep-user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        setIsLoading(false)
      }
    }

    loadSupabase()
  }, [])

  const signOut = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut()
    } else {
      // Fallback to local storage
      setUser(null)
      localStorage.removeItem("jee-prep-user")
    }
  }

  const signIn = async (email: string, password: string) => {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    } else {
      // Fallback to local storage
      const user = {
        id: "local-user",
        email,
        user_metadata: { name: email.split("@")[0] },
      }
      setUser(user as any)
      localStorage.setItem("jee-prep-user", JSON.stringify(user))
      return { user }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })
      if (error) throw error
      return data
    } else {
      // Fallback to local storage
      const user = {
        id: "local-user",
        email,
        user_metadata: { name },
      }
      setUser(user as any)
      localStorage.setItem("jee-prep-user", JSON.stringify(user))
      return { user }
    }
  }

  return {
    user,
    isLoading,
    signOut,
    signIn,
    signUp,
    hasSupabase: !!supabaseClient,
  }
}
