"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Task, Category } from "@/lib/db"
import { TrendingUp, Target, Calendar, Clock, CheckCircle2, SkipForward, Play, BookOpen } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"

interface ProgressDashboardProps {
  tasks: Task[]
  categories: Category[]
}

const VIBRANT_COLORS = {
  completed: "#00ff88", // bright green
  "in-progress": "#ffaa00", // bright orange
  todo: "#6366f1", // vibrant indigo
  skipped: "#ff6b35", // bright red-orange
  primary: "#00d4ff", // bright cyan
  secondary: "#ff00aa", // bright magenta
  accent1: "#88ff00", // bright lime
  accent2: "#ff4400", // bright red
  accent3: "#aa00ff", // bright purple
  accent4: "#ffff00", // bright yellow
  chartColors: [
    "#00ff88", // electric green
    "#ff00aa", // hot pink
    "#00d4ff", // electric blue
    "#ffaa00", // bright orange
    "#aa00ff", // electric purple
    "#88ff00", // lime green
    "#ff4400", // bright red
    "#ffff00", // electric yellow
    "#ff6b35", // coral
    "#00ffaa", // mint green
  ],
}

export function ProgressDashboard({ tasks, categories }: ProgressDashboardProps) {
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === "completed").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const skipped = tasks.filter((t) => t.status === "skipped").length
    const todo = tasks.filter((t) => t.status === "todo").length

    // Focus area breakdown with dynamic categories
    const focusAreaStats = tasks.reduce(
      (acc, task) => {
        if (!acc[task.focusArea]) {
          acc[task.focusArea] = { total: 0, completed: 0, inProgress: 0, todo: 0, skipped: 0 }
        }
        acc[task.focusArea].total++
        acc[task.focusArea][task.status.replace("-", "") as keyof (typeof acc)[typeof task.focusArea]]++
        return acc
      },
      {} as Record<string, { total: number; completed: number; inProgress: number; todo: number; skipped: number }>,
    )

    // Weekly progress
    const weeklyProgress = tasks.reduce(
      (acc, task) => {
        const week = new Date(task.date).toISOString().slice(0, 10)
        if (!acc[week]) {
          acc[week] = { date: week, completed: 0, total: 0 }
        }
        acc[week].total++
        if (task.status === "completed") {
          acc[week].completed++
        }
        return acc
      },
      {} as Record<string, { date: string; completed: number; total: number }>,
    )

    // Streak calculation
    const completedDates = [...new Set(tasks.filter((t) => t.status === "completed").map((t) => t.date))].sort()

    let currentStreak = 0
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split("T")[0]

      if (completedDates.includes(dateStr)) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }

    // Time estimates
    const totalTimeEstimate = tasks.reduce((acc, task) => {
      const time = Number.parseInt(task.timeEstimate.replace(/[^\d]/g, "")) || 0
      return acc + time
    }, 0)

    const completedTimeEstimate = tasks
      .filter((t) => t.status === "completed")
      .reduce((acc, task) => {
        const time = Number.parseInt(task.timeEstimate.replace(/[^\d]/g, "")) || 0
        return acc + time
      }, 0)

    return {
      total,
      completed,
      inProgress,
      skipped,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      focusAreaStats,
      weeklyProgress: Object.values(weeklyProgress).sort((a, b) => a.date.localeCompare(b.date)),
      currentStreak,
      totalTimeEstimate,
      completedTimeEstimate,
    }
  }, [tasks])

  const focusAreaChartData = Object.entries(stats.focusAreaStats).map(([area, data]) => ({
    name: area,
    completed: data.completed,
    total: data.total,
    completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }))

  const statusChartData = [
    { name: "Completed", value: stats.completed, color: VIBRANT_COLORS.chartColors[0] },
    { name: "In Progress", value: stats.inProgress, color: VIBRANT_COLORS.chartColors[1] },
    { name: "To Do", value: stats.todo, color: VIBRANT_COLORS.chartColors[2] },
    { name: "Skipped", value: stats.skipped, color: VIBRANT_COLORS.chartColors[3] },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: VIBRANT_COLORS.primary }}>
              {stats.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} of {stats.total} tasks completed
            </p>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: VIBRANT_COLORS.accent1 }}>
              {stats.currentStreak}
            </div>
            <p className="text-xs text-muted-foreground">{stats.currentStreak === 1 ? "day" : "days"} in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: VIBRANT_COLORS.secondary }}>
              {stats.completedTimeEstimate}m
            </div>
            <p className="text-xs text-muted-foreground">of {stats.totalTimeEstimate}m total planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: VIBRANT_COLORS.chartColors[1] }}>
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">currently in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={VIBRANT_COLORS.chartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Tasks"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {statusChartData.map((item, index) => (
                <Badge key={item.name} variant="outline" className="text-xs">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: VIBRANT_COLORS.chartColors[index] }}
                  />
                  {item.name}: {item.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Focus Area Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Focus Area Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={focusAreaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="#ffffff" fontSize={12} />
                  <YAxis stroke="#ffffff" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="completed" fill={VIBRANT_COLORS.chartColors[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill={VIBRANT_COLORS.chartColors[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focus Area Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats.focusAreaStats).map(([area, data], index) => {
          const category = categories.find((cat) => cat.name === area)
          const categoryColor = category?.color || VIBRANT_COLORS.primary
          const vibrantColors = [
            VIBRANT_COLORS.primary,
            VIBRANT_COLORS.secondary,
            VIBRANT_COLORS.accent1,
            VIBRANT_COLORS.accent2,
            VIBRANT_COLORS.accent3,
          ]
          const vibrantColor = vibrantColors[index % vibrantColors.length]

          return (
            <Card key={area}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {area}
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      backgroundColor: `${categoryColor}20`,
                      borderColor: `${categoryColor}50`,
                      color: categoryColor,
                    }}
                  >
                    {data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={data.total > 0 ? (data.completed / data.total) * 100 : 0} className="h-2" />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" style={{ color: VIBRANT_COLORS.chartColors[0] }} />
                    <span>{data.completed} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" style={{ color: VIBRANT_COLORS.chartColors[1] }} />
                    <span>{data.inProgress} active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{data.todo} pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SkipForward className="h-4 w-4" style={{ color: VIBRANT_COLORS.chartColors[3] }} />
                    <span>{data.skipped} skipped</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Weekly Progress Trend */}
      {stats.weeklyProgress.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#ffffff" fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={VIBRANT_COLORS.chartColors[0]}
                    strokeWidth={3}
                    dot={{ fill: VIBRANT_COLORS.chartColors[0], strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
