"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  CheckCircle2,
  RotateCcw,
  Settings,
  Moon,
  Sun,
} from "lucide-react"
import { syllabusData } from "./data/syllabus"
import { ProgressStats } from "./components/progress-stats"
import { Footer } from "./components/footer"
import { useSimpleProgress } from "./hooks/use-simple-progress"
import { useTheme } from "./hooks/use-theme"
import { CustomizableTimer } from "./components/customizable-timer"

export default function JEEPrepMeter() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedTag, setSelectedTag] = useState("all")
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

  const {
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
  } = useSimpleProgress()

  const { theme, toggleTheme } = useTheme()

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const getUnderstandingColor = (level: number) => {
    const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6"]
    return colors[level - 1] || "#6B7280"
  }

  const getUnderstandingLabel = (level: number) => {
    const labels = ["Bad", "Moderate", "Good", "Genius", "PhD-level"]
    return labels[level - 1] || "Not Set"
  }

  const filteredData = syllabusData.filter((subject) => {
    if (selectedSubject !== "all" && subject.name.toLowerCase() !== selectedSubject) return false
    return subject.classes.some((classData) => {
      if (selectedClass !== "all" && classData.class !== Number.parseInt(selectedClass)) return false
      return classData.chapters.some((chapter) => {
        const matchesSearch =
          chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chapter.subtopics.some((subtopic) => subtopic.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesTag = selectedTag === "all" || chapter.priority.toLowerCase() === selectedTag
        return matchesSearch && matchesTag
      })
    })
  })

  const overallProgress = getOverallProgress()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">JEE Prep Meter</h1>
              <Badge variant="secondary" className="text-xs">
                Local Storage
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Stats */}
          <ProgressStats
            overallProgress={overallProgress}
            totalChapters={getTotalChapters()}
            completedChapters={getCompletedChapters()}
            importantChapters={getImportantChapters()}
            onExport={exportProgress}
            onImport={importProgress}
            onReset={resetProgress}
          />

          {/* Timer */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Study Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomizableTimer />
            </CardContent>
          </Card>

          {/* Subject Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["Physics", "Chemistry", "Mathematics", "Biology"].map((subject) => {
                  const subjectProgress = getSubjectProgress(subject)
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{subject}</span>
                        <span className="text-sm text-gray-500">{subjectProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${subjectProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search chapters and topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Subjects</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="biology">Biology</option>
                  </select>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Classes</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Priority</option>
                    <option value="must do">Must Do</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Syllabus Content */}
          <Tabs defaultValue="physics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="physics">Physics</TabsTrigger>
              <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
              <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
              <TabsTrigger value="biology">Biology</TabsTrigger>
            </TabsList>

            {filteredData.map((subject) => (
              <TabsContent key={subject.name} value={subject.name.toLowerCase()}>
                <div className="space-y-4">
                  {subject.classes.map((classData) => (
                    <div key={classData.class}>
                      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Class {classData.class}
                      </h2>
                      <div className="space-y-3">
                        {classData.chapters.map((chapter) => {
                          const chapterId = `${subject.name}-${classData.class}-${chapter.id}`
                          const isExpanded = expandedChapters.has(chapterId)
                          const chapterProgress = progress[chapterId] || {
                            completed: false,
                            revised: false,
                            understanding: 0,
                            important: false,
                            subtopics: {},
                          }

                          return (
                            <Card key={chapter.id} className="overflow-hidden">
                              <CardHeader
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => toggleChapter(chapterId)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <div>
                                      <CardTitle className="text-lg">{chapter.name}</CardTitle>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant={chapter.priority === "Must Do" ? "default" : "secondary"}>
                                          {chapter.priority}
                                        </Badge>
                                        <span className="text-sm text-gray-500">{chapter.estimatedTime}</span>
                                        <span className="text-sm text-gray-500">
                                          IIT: {chapter.weightage.iit} | NEET: {chapter.weightage.neet}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateProgress(chapterId, { important: !chapterProgress.important })
                                      }}
                                    >
                                      <Star
                                        className={`h-4 w-4 ${chapterProgress.important ? "fill-yellow-400 text-yellow-400" : ""}`}
                                      />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateProgress(chapterId, { revised: !chapterProgress.revised })
                                      }}
                                    >
                                      <RotateCcw
                                        className={`h-4 w-4 ${chapterProgress.revised ? "text-blue-600" : ""}`}
                                      />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateProgress(chapterId, { completed: !chapterProgress.completed })
                                      }}
                                    >
                                      <CheckCircle2
                                        className={`h-4 w-4 ${chapterProgress.completed ? "text-green-600" : ""}`}
                                      />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>

                              {isExpanded && (
                                <CardContent className="pt-0">
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-4">
                                      <span className="text-sm font-medium">Understanding Level:</span>
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                          <Button
                                            key={level}
                                            variant="ghost"
                                            size="sm"
                                            className="w-8 h-8 p-0"
                                            style={{
                                              backgroundColor:
                                                chapterProgress.understanding >= level
                                                  ? getUnderstandingColor(level)
                                                  : "transparent",
                                              color:
                                                chapterProgress.understanding >= level
                                                  ? "white"
                                                  : getUnderstandingColor(level),
                                            }}
                                            onClick={() => updateProgress(chapterId, { understanding: level })}
                                          >
                                            {level}
                                          </Button>
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {getUnderstandingLabel(chapterProgress.understanding)}
                                      </span>
                                    </div>

                                    <div className="space-y-2">
                                      <h4 className="font-medium text-gray-900 dark:text-white">Subtopics:</h4>
                                      <div className="space-y-1">
                                        {chapter.subtopics.map((subtopic, index) => {
                                          const subtopicKey = `subtopic-${index}`
                                          const isSubtopicCompleted = chapterProgress.subtopics[subtopicKey] || false

                                          return (
                                            <div key={index} className="flex items-center space-x-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-0 h-auto"
                                                onClick={() => {
                                                  const newSubtopics = { ...chapterProgress.subtopics }
                                                  newSubtopics[subtopicKey] = !isSubtopicCompleted
                                                  updateProgress(chapterId, { subtopics: newSubtopics })
                                                }}
                                              >
                                                <CheckCircle2
                                                  className={`h-4 w-4 ${isSubtopicCompleted ? "text-green-600" : "text-gray-300"}`}
                                                />
                                              </Button>
                                              <span
                                                className={`text-sm ${isSubtopicCompleted ? "line-through text-gray-500" : "text-gray-700 dark:text-gray-300"}`}
                                              >
                                                {subtopic}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
