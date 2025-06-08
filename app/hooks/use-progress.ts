"use client"

import { useState, useEffect } from "react"

interface SubtopicProgress {
  [key: string]: boolean
}

interface ChapterProgress {
  completed: boolean
  revised: boolean
  understanding: number
  important: boolean
  subtopics: SubtopicProgress
}

interface Progress {
  [chapterId: string]: ChapterProgress
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({})

  useEffect(() => {
    const savedProgress = localStorage.getItem("jee-prep-progress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const updateProgress = (chapterId: string, updates: Partial<ChapterProgress>) => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        [chapterId]: {
          completed: false,
          revised: false,
          understanding: 0,
          important: false,
          subtopics: {},
          ...prev[chapterId],
          ...updates,
        },
      }
      localStorage.setItem("jee-prep-progress", JSON.stringify(newProgress))
      return newProgress
    })
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
  }
}
