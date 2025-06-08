"\"use client"

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

export function useSimpleProgress() {
  const [progress, setProgress] = useState<Progress>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("jee-prep-progress")
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        setProgress(parsed)
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("jee-prep-progress", JSON.stringify(progress))
      } catch (error) {
        console.error("Error saving progress:", error)
      }
    }
  }, [progress, isLoaded])

  const updateProgress = (chapterId: string, updates: Partial<ChapterProgress>) => {
    setProgress((prev) => {
      const currentProgress = prev[chapterId] || {
        completed: false,
        revised: false,
        understanding: 0,
        important: false,
        subtopics: {},
      }

      return {
        ...prev,
        [chapterId]: {
          ...currentProgress,
          ...updates,
        },
      }
    })
  }

  const getOverallProgress = () => {
    const chapters = Object.values(progress)
    if (chapters.length === 0) return 0

    const completedChapters = chapters.filter((chapter) => chapter.completed).length
    return (completedChapters / chapters.length) * 100
  }

  const getSubjectProgress = (subjectName: string) => {
    const subjectChapters = Object.entries(progress).filter(([chapterId]) =>
      chapterId.toLowerCase().startsWith(subjectName.toLowerCase()),
    )

    if (subjectChapters.length === 0) return 0

    const completedChapters = subjectChapters.filter(([, chapter]) => chapter.completed).length
    return (completedChapters / subjectChapters.length) * 100
  }

  const getTotalChapters = () => {
    return Object.keys(progress).length
  }

  const getCompletedChapters = () => {
    return Object.values(progress).filter((chapter) => chapter.completed).length
  }

  const getImportantChapters = () => {
    return Object.entries(progress)
      .filter(([, chapter]) => chapter.important)
      .map(([chapterId]) => chapterId)
  }

  const exportProgress = () => {
    const dataStr = JSON.stringify(progress, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "jee-prep-progress.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importProgress = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedProgress = JSON.parse(e.target?.result as string)
        setProgress(importedProgress)
      } catch (error) {
        console.error("Error importing progress:", error)
        alert("Error importing progress file. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      setProgress({})
      localStorage.removeItem("jee-prep-progress")
    }
  }

  return {
    progress,
    updateProgress,
    getOverallProgress,
    getSubjectProgress,
    getTotalChapters,
    getCompletedChapters,
    getImportantChapters,
    exportProgress,
    importProgress,
    resetProgress,
    isLoaded,
  }
}
