"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"

export function StudyTimer() {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"study" | "break">("study")
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1)
      }, 1000)
    } else if (time === 0) {
      // Timer finished
      setIsRunning(false)
      if (mode === "study") {
        setSessions((prev) => prev + 1)
        setMode("break")
        setTime(5 * 60) // 5 minute break
      } else {
        setMode("study")
        setTime(25 * 60) // 25 minute study session
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time, mode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(25 * 60)
    setMode("study")
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Clock className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {mode === "study" ? "Study Time" : "Break Time"}
        </span>
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatTime(time)}</div>

      <div className="flex justify-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={resetTimer}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-500">Sessions: {sessions}</div>
    </div>
  )
}
