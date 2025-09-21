"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import TaskCard from "@/components/task-card"
import { useApiTasks, useApiCategories } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain } from "lucide-react"
import Link from "next/link"

type Task = {
  id: string
  user_id: string
  date: string
  focus_area: string
  title: string
  details: string
  time_estimate: string
  status: 'todo' | 'in-progress' | 'completed' | 'skipped'
  notes: string | null
  links: string[] | null
  code: string | null
  code_language: string | null
  is_dsa: boolean
  completed_at: string | null
  audio_path: string | null
  audio_duration: number | null
  created_at: string
  updated_at: string
}

export default function TaskPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const { tasks, loading: tasksLoading, updateTask, uploadAudio } = useApiTasks()
  const { categories, loading: categoriesLoading } = useApiCategories()

  const [task, setTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!tasksLoading && tasks.length > 0) {
      const foundTask = tasks.find((t) => t.id === taskId)
      if (foundTask) {
        setTask(foundTask)
      } else {
        // Task not found, redirect to home
        router.push("/app")
      }
    }
  }, [tasks, tasksLoading, taskId, router])

  const loading = tasksLoading || categoriesLoading

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-muted-foreground text-lg">Task not found</p>
          <Link href="/app">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Convert API task to TaskCard format
  const mapTaskForComponent = (apiTask: Task) => ({
    ...apiTask,
    focusArea: apiTask.focus_area,
    timeEstimate: apiTask.time_estimate,
    isDSA: apiTask.is_dsa,
    completedAt: apiTask.completed_at,
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
    codeLanguage: apiTask.code_language,
    notes: apiTask.notes,
    links: apiTask.links,
    code: apiTask.code,
    audio_path: apiTask.audio_path,
    audio_duration: apiTask.audio_duration,
  })

  // Convert API categories to TaskCard format
  const mapCategoriesForComponent = (apiCategories: any[]) => 
    apiCategories.map(cat => ({
      ...cat,
      createdAt: cat.created_at,
    }))

  // Convert component updates back to API format
  const mapUpdatesForAPI = (updates: any): Partial<Task> => {
    const apiUpdates: any = { ...updates }
    if (updates.focusArea) {
      apiUpdates.focus_area = updates.focusArea
      delete apiUpdates.focusArea
    }
    if (updates.timeEstimate) {
      apiUpdates.time_estimate = updates.timeEstimate
      delete apiUpdates.timeEstimate
    }
    if (updates.isDSA !== undefined) {
      apiUpdates.is_dsa = updates.isDSA
      delete apiUpdates.isDSA
    }
    if (updates.completedAt) {
      apiUpdates.completed_at = updates.completedAt
      delete apiUpdates.completedAt
    }
    if (updates.codeLanguage) {
      apiUpdates.code_language = updates.codeLanguage
      delete apiUpdates.codeLanguage
    }
    return apiUpdates
  }

  const handleTaskUpdate = async (id: string, updates: any): Promise<void> => {
    const apiUpdates = mapUpdatesForAPI(updates)
    await updateTask(id, apiUpdates)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button and Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link href="/app">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline sm:ml-2">Back</span>
                </Button>
              </Link>

              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Task Details</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block truncate">{task.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col">
          <TaskCard task={mapTaskForComponent(task)} categories={mapCategoriesForComponent(categories)} onUpdate={handleTaskUpdate} onUploadAudio={uploadAudio} />
        </div>
      </main>
    </div>
  )
}
