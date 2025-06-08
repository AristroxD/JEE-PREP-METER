"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("jee-prep-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = {
      id: "1",
      email,
      name: email.split("@")[0],
    }

    setUser(user)
    localStorage.setItem("jee-prep-user", JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("jee-prep-user")
    localStorage.removeItem("jee-prep-progress")
  }

  return {
    user,
    login,
    logout,
    isLoading,
  }
}
