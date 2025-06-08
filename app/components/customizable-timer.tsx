"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play, Pause, RotateCcw, Settings, Clock, Volume2, VolumeX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface TimerSettings {
  studyTime: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
  autoStart: boolean
  soundEnabled: boolean
  theme: "pomodoro" | "custom"
}

export function CustomizableTimer() {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"study" | "shortBreak" | "longBreak">("study")
  const [sessions, setSessions] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [settings, setSettings] = useState<TimerSettings>({
    studyTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStart: false,
    soundEnabled: true,
    theme: "pomodoro",
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("timer-settings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      setTime(parsed.studyTime * 60)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings)
    localStorage.setItem("timer-settings", JSON.stringify(newSettings))

    // Reset timer with new settings
    if (mode === "study") {
      setTime(newSettings.studyTime * 60)
    } else if (mode === "shortBreak") {
      setTime(newSettings.shortBreak * 60)
    } else {
      setTime(newSettings.longBreak * 60)
    }
    setIsRunning(false)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1)
      }, 1000)
    } else if (time === 0) {
      // Timer finished
      setIsRunning(false)

      // Play notification sound if enabled
      if (settings.soundEnabled) {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      }

      if (mode === "study") {
        setSessions((prev) => prev + 1)
        const newCycles = sessions + 1

        // Determine next mode based on cycles
        if (newCycles % settings.longBreakInterval === 0) {
          setMode("longBreak")
          setTime(settings.longBreak * 60)
          setCycles((prev) => prev + 1)
        } else {
          setMode("shortBreak")
          setTime(settings.shortBreak * 60)
        }
      } else {
        setMode("study")
        setTime(settings.studyTime * 60)
      }

      // Auto-start next session if enabled
      if (settings.autoStart) {
        setTimeout(() => setIsRunning(true), 1000)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time, mode, sessions, settings])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetTimer = () => {
    setIsRunning(false)
    setMode("study")
    setTime(settings.studyTime * 60)
    setSessions(0)
    setCycles(0)
  }

  const getModeLabel = () => {
    switch (mode) {
      case "study":
        return "Study Time"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
      default:
        return "Study Time"
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case "study":
        return "text-blue-600"
      case "shortBreak":
        return "text-green-600"
      case "longBreak":
        return "text-purple-600"
      default:
        return "text-blue-600"
    }
  }

  const getProgressPercentage = () => {
    let totalTime: number
    switch (mode) {
      case "study":
        totalTime = settings.studyTime * 60
        break
      case "shortBreak":
        totalTime = settings.shortBreak * 60
        break
      case "longBreak":
        totalTime = settings.longBreak * 60
        break
      default:
        totalTime = settings.studyTime * 60
    }
    return ((totalTime - time) / totalTime) * 100
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Focus Timer</CardTitle>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Timer Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: "pomodoro" | "custom") => {
                      if (value === "pomodoro") {
                        saveSettings({
                          ...settings,
                          theme: value,
                          studyTime: 25,
                          shortBreak: 5,
                          longBreak: 15,
                          longBreakInterval: 4,
                        })
                      } else {
                        saveSettings({ ...settings, theme: value })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pomodoro">Pomodoro (25/5/15)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.theme === "custom" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studyTime">Study Time (min)</Label>
                        <Input
                          id="studyTime"
                          type="number"
                          min="1"
                          max="120"
                          value={settings.studyTime}
                          onChange={(e) =>
                            saveSettings({ ...settings, studyTime: Number.parseInt(e.target.value) || 25 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shortBreak">Short Break (min)</Label>
                        <Input
                          id="shortBreak"
                          type="number"
                          min="1"
                          max="30"
                          value={settings.shortBreak}
                          onChange={(e) =>
                            saveSettings({ ...settings, shortBreak: Number.parseInt(e.target.value) || 5 })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="longBreak">Long Break (min)</Label>
                        <Input
                          id="longBreak"
                          type="number"
                          min="1"
                          max="60"
                          value={settings.longBreak}
                          onChange={(e) =>
                            saveSettings({ ...settings, longBreak: Number.parseInt(e.target.value) || 15 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longBreakInterval">Long Break After</Label>
                        <Input
                          id="longBreakInterval"
                          type="number"
                          min="2"
                          max="10"
                          value={settings.longBreakInterval}
                          onChange={(e) =>
                            saveSettings({ ...settings, longBreakInterval: Number.parseInt(e.target.value) || 4 })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoStart">Auto-start next session</Label>
                  <Switch
                    id="autoStart"
                    checked={settings.autoStart}
                    onCheckedChange={(checked) => saveSettings({ ...settings, autoStart: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="soundEnabled">Sound notifications</Label>
                  <Switch
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => saveSettings({ ...settings, soundEnabled: checked })}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="text-center space-y-6">
        <div className="space-y-2">
          <div className={`flex items-center justify-center space-x-2 ${getModeColor()}`}>
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">{getModeLabel()}</span>
            {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </div>

          <div className="text-4xl font-bold text-gray-900 dark:text-white font-mono">{formatTime(time)}</div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                mode === "study" ? "bg-blue-600" : mode === "shortBreak" ? "bg-green-600" : "bg-purple-600"
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center space-x-2"
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span>{isRunning ? "Pause" : "Start"}</span>
          </Button>
          <Button variant="outline" size="lg" onClick={resetTimer}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{sessions}</div>
            <div className="text-xs text-gray-500">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{cycles}</div>
            <div className="text-xs text-gray-500">Cycles</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{Math.floor((sessions * settings.studyTime) / 60)}h</div>
            <div className="text-xs text-gray-500">Total Time</div>
          </div>
        </div>

        {settings.theme === "pomodoro" && (
          <div className="text-xs text-gray-500">
            Next:{" "}
            {sessions % settings.longBreakInterval === settings.longBreakInterval - 1 ? "Long Break" : "Short Break"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
