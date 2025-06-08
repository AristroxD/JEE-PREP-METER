"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Target, BookOpen, Star, Download, Upload, RotateCcw } from "lucide-react"

interface ProgressStatsProps {
  overallProgress: number
  totalChapters: number
  completedChapters: number
  importantChapters: string[]
  onExport: () => void
  onImport: (file: File) => void
  onReset: () => void
}

export function ProgressStats({
  overallProgress,
  totalChapters,
  completedChapters,
  importantChapters,
  onExport,
  onImport,
  onReset,
}: ProgressStatsProps) {
  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onImport(file)
      }
    }
    input.click()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallProgress.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <Progress value={overallProgress} className="mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chapters Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedChapters}/{totalChapters}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Important Chapters</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{importantChapters.length}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress Tools</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={onExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={onReset} className="w-full text-red-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
