"use client"

import { useState, useEffect } from "react"

interface ChapterProgress {
  completed: boolean
  revised: boolean
  understanding: number
  important: boolean
  subtopics: Record<string, boolean>
}

export function useDatabaseProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<Record<string, ChapterProgress>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseClient, setSupabaseClient] = useState<any>(null)

  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try to load Supabase client
        const { supabase } = await import("@/lib/supabase")
        setSupabaseClient(supabase)

        if (!userId) {
          setIsLoading(false)
          return
        }

        // Fetch progress from Supabase
        const { data, error } = await supabase.from("progress").select("*").eq("user_id", userId)

        if (error) throw error

        const progressMap: Record<string, ChapterProgress> = {}
        data?.forEach((item: any) => {
          progressMap[item.chapter_id] = {
            completed: item.completed,
            revised: item.revised,
            understanding: item.understanding,
            important: item.important,
            subtopics: item.subtopics,
          }
        })

        setProgress(progressMap)
      } catch (error) {
        console.error("Supabase not configured, using local storage:", error)
        // Fall back to local storage
        const savedProgress = localStorage.getItem("jee-prep-progress")
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress))
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [userId])

  const updateProgress = async (chapterId: string, updates: Partial<ChapterProgress>) => {
    const currentProgress = progress[chapterId] || {
      completed: false,
      revised: false,
      understanding: 0,
      important: false,
      subtopics: {},
    }

    const newProgress = { ...currentProgress, ...updates }

    try {
      if (supabaseClient && userId) {
        // Update in Supabase
        const { error } = await supabaseClient.from("progress").upsert({
          user_id: userId,
          chapter_id: chapterId,
          completed: newProgress.completed,
          revised: newProgress.revised,
          understanding: newProgress.understanding,
          important: newProgress.important,
          subtopics: newProgress.subtopics,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }
    } catch (error) {
      console.error("Error updating progress in Supabase:", error)
    }

    // Always update local state and localStorage as fallback
    const updatedProgress = {
      ...progress,
      [chapterId]: newProgress,
    }

    setProgress(updatedProgress)
    localStorage.setItem("jee-prep-progress", JSON.stringify(updatedProgress))
  }

  const getOverallProgress = () => {
    const chapters = Object.values(progress)
    if (chapters.length === 0) return 0

    const completedChapters = chapters.filter((chapter) => chapter.completed).length
    return (completedChapters / chapters.length) * 100
  }

  return {
    progress,
    updateProgress,
    getOverallProgress,
    isLoading,
    hasSupabase: !!supabaseClient,
  }
}
