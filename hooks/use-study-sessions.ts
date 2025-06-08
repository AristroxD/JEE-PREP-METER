"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { StudySession } from "@/lib/supabase"

export function useStudySessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    fetchSessions()
  }, [userId])

  const fetchSessions = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("session_date", { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error("Error fetching study sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSession = async (subject: string, duration: number) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          subject,
          duration,
          session_date: new Date().toISOString().split("T")[0],
        })
        .select()

      if (error) throw error

      if (data) {
        setSessions((prev) => [data[0], ...prev])
      }
    } catch (error) {
      console.error("Error adding study session:", error)
    }
  }

  const getTodayStudyTime = () => {
    const today = new Date().toISOString().split("T")[0]
    const todaySessions = sessions.filter((session) => session.session_date === today)
    return todaySessions.reduce((total, session) => total + session.duration, 0)
  }

  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const daySessions = sessions.filter((session) => session.session_date === date)
      const subjects = ["physics", "chemistry", "mathematics", "biology"]

      const dayData: any = {
        day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      }

      subjects.forEach((subject) => {
        const subjectSessions = daySessions.filter((session) => session.subject.toLowerCase() === subject)
        dayData[subject] = subjectSessions.reduce((total, session) => total + session.duration, 0)
      })

      return dayData
    })
  }

  return {
    sessions,
    addSession,
    getTodayStudyTime,
    getWeeklyData,
    isLoading,
    refetch: fetchSessions,
  }
}
