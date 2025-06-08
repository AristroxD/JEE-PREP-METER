"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { day: "Mon", physics: 65, chemistry: 45, mathematics: 70, biology: 55 },
  { day: "Tue", physics: 70, chemistry: 50, mathematics: 75, biology: 60 },
  { day: "Wed", physics: 75, chemistry: 55, mathematics: 80, biology: 65 },
  { day: "Thu", physics: 80, chemistry: 60, mathematics: 85, biology: 70 },
  { day: "Fri", physics: 85, chemistry: 65, mathematics: 90, biology: 75 },
  { day: "Sat", physics: 90, chemistry: 70, mathematics: 95, biology: 80 },
  { day: "Sun", physics: 95, chemistry: 75, mathematics: 100, biology: 85 },
]

export function ProgressChart() {
  return (
    <ChartContainer
      config={{
        physics: {
          label: "Physics",
          color: "#3B82F6",
        },
        chemistry: {
          label: "Chemistry",
          color: "#10B981",
        },
        mathematics: {
          label: "Mathematics",
          color: "#F59E0B",
        },
        biology: {
          label: "Biology",
          color: "#EF4444",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="physics"
            stroke="var(--color-physics)"
            strokeWidth={2}
            dot={{ fill: "var(--color-physics)" }}
          />
          <Line
            type="monotone"
            dataKey="chemistry"
            stroke="var(--color-chemistry)"
            strokeWidth={2}
            dot={{ fill: "var(--color-chemistry)" }}
          />
          <Line
            type="monotone"
            dataKey="mathematics"
            stroke="var(--color-mathematics)"
            strokeWidth={2}
            dot={{ fill: "var(--color-mathematics)" }}
          />
          <Line
            type="monotone"
            dataKey="biology"
            stroke="var(--color-biology)"
            strokeWidth={2}
            dot={{ fill: "var(--color-biology)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
